const mongoose = require("mongoose");
const Holding = require("../models/Holding");
const Wallet = require("../models/Wallet");
const Transaction = require("../models/Transaction");
const { get: getPrice } = require("../services/priceStore");

async function getPortfolio(req, res, next) {
  try {
    const [wallet, holdings] = await Promise.all([
      Wallet.findOne({ userId: req.user.id }).lean(),
      Holding.find({ userId: req.user.id }).lean(),
    ]);
    if (!wallet) return next(Object.assign(new Error("Wallet missing"), { status: 500 }));

    const priced = holdings.map((h) => {
      const snap = getPrice(h.symbol);
      const current = snap?.price ?? h.avgPrice;
      const invested = h.quantity * h.avgPrice;
      const value = h.quantity * current;
      const pl = value - invested;
      return { ...h, currentPrice: current, value, pl };
    });

    const investedTotal = priced.reduce((sum, h) => sum + h.quantity * h.avgPrice, 0);
    const valueTotal = priced.reduce((sum, h) => sum + h.value, 0);
    const plTotal = valueTotal - investedTotal;

    res.json({
      ok: true,
      wallet: { cash: wallet.cash },
      holdings: priced,
      summary: { invested: investedTotal, value: valueTotal, pl: plTotal },
    });
  } catch (err) {
    next(err);
  }
}

async function placeOrder(req, res, next) {
  const session = await mongoose.startSession();
  try {
    const { symbol, side, quantity, requestId } = req.validated.body;
    const sym = symbol.toUpperCase().trim();
    const qty = Number(quantity);

    const snap = getPrice(sym);
    if (!snap) return next(Object.assign(new Error("Unknown symbol"), { status: 404 }));

    const lockedPrice = snap.price;
    const total = Math.round(lockedPrice * qty * 100) / 100;

    let tx;
    await session.withTransaction(async () => {
      const existing = await Transaction.findOne({ userId: req.user.id, requestId }).session(session);
      if (existing) {
        tx = existing;
        return;
      }

      const wallet = await Wallet.findOne({ userId: req.user.id }).session(session);
      if (!wallet) throw Object.assign(new Error("Wallet missing"), { status: 500 });

      const holding = await Holding.findOne({ userId: req.user.id, symbol: sym }).session(session);
      const currentQty = holding?.quantity || 0;
      const currentAvg = holding?.avgPrice || 0;

      if (side === "BUY") {
        if (wallet.cash < total) throw Object.assign(new Error("Insufficient balance"), { status: 400 });
        wallet.cash = Math.round((wallet.cash - total) * 100) / 100;
        wallet.updatedAt = new Date();
        await wallet.save({ session });

        const newQty = currentQty + qty;
        const newAvg =
          newQty === 0 ? 0 : (currentQty * currentAvg + qty * lockedPrice) / newQty;

        await Holding.updateOne(
          { userId: req.user.id, symbol: sym },
          { $set: { userId: req.user.id, symbol: sym, quantity: newQty, avgPrice: newAvg, updatedAt: new Date() } },
          { upsert: true, session }
        );
      } else {
        if (currentQty < qty) throw Object.assign(new Error("Insufficient quantity"), { status: 400 });

        wallet.cash = Math.round((wallet.cash + total) * 100) / 100;
        wallet.updatedAt = new Date();
        await wallet.save({ session });

        const newQty = currentQty - qty;
        if (newQty === 0) {
          await Holding.deleteOne({ userId: req.user.id, symbol: sym }).session(session);
        } else {
          await Holding.updateOne(
            { userId: req.user.id, symbol: sym },
            { $set: { quantity: newQty, updatedAt: new Date() } },
            { session }
          );
        }
      }

      tx = await Transaction.create(
        [
          {
            userId: req.user.id,
            requestId,
            symbol: sym,
            side,
            quantity: qty,
            price: lockedPrice,
            total,
          },
        ],
        { session }
      ).then((rows) => rows[0]);
    });

    res.status(201).json({ ok: true, transaction: tx });

    const io = req.app.get("io");
    if (io) {
      io.to(`user:${req.user.id}`).emit("portfolio:update", { userId: req.user.id });
    }
  } catch (err) {
    if (err?.code === 11000) {
      const existing = await Transaction.findOne({ userId: req.user.id, requestId: req.body.requestId });
      return res.status(201).json({ ok: true, transaction: existing });
    }
    next(err);
  } finally {
    session.endSession();
  }
}

module.exports = { getPortfolio, placeOrder };

