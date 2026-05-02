const Favorite = require("../models/Favorite");

async function listFavorites(req, res, next) {
  try {
    const rows = await Favorite.find({ userId: req.user.id }).sort({ createdAt: -1 }).lean();
    res.json({ ok: true, favorites: rows.map((r) => r.symbol) });
  } catch (err) {
    next(err);
  }
}

async function addFavorite(req, res, next) {
  try {
    const symbol = req.validated.body.symbol.toUpperCase().trim();
    await Favorite.updateOne(
      { userId: req.user.id, symbol },
      { $setOnInsert: { userId: req.user.id, symbol } },
      { upsert: true }
    );
    res.status(201).json({ ok: true });
  } catch (err) {
    if (err?.code === 11000) return res.status(201).json({ ok: true });
    next(err);
  }
}

async function removeFavorite(req, res, next) {
  try {
    const symbol = req.validated.params.symbol.toUpperCase().trim();
    await Favorite.deleteOne({ userId: req.user.id, symbol });
    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
}

module.exports = { listFavorites, addFavorite, removeFavorite };

