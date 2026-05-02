const { DEFAULT_SYMBOLS } = require("../services/symbols");
const { getAll, get } = require("../services/priceStore");

async function listStocks(req, res, next) {
  try {
    const q = String(req.query.q || "").toLowerCase().trim();
    const list = getAll().filter(Boolean);

    const filtered = !q
      ? list
      : list.filter((s) => s.symbol.toLowerCase().includes(q) || s.name.toLowerCase().includes(q));

    const withChange = filtered.map((s) => {
      const changePct = s.prevClose ? ((s.price - s.prevClose) / s.prevClose) * 100 : 0;
      return { ...s, changePct: Math.round(changePct * 100) / 100 };
    });

    res.json({ ok: true, stocks: withChange, symbols: DEFAULT_SYMBOLS });
  } catch (err) {
    next(err);
  }
}

async function getStock(req, res, next) {
  try {
    const symbol = String(req.params.symbol || "").toUpperCase().trim();
    const snap = get(symbol);
    if (!snap) return next(Object.assign(new Error("Unknown symbol"), { status: 404 }));

    const changePct = snap.prevClose ? ((snap.price - snap.prevClose) / snap.prevClose) * 100 : 0;
    res.json({
      ok: true,
      stock: { ...snap, changePct: Math.round(changePct * 100) / 100 },
    });
  } catch (err) {
    next(err);
  }
}

module.exports = { listStocks, getStock };

