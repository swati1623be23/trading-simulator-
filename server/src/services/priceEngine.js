const { getAll, set, round2, seedIfEmpty } = require("./priceStore");

function tickOne(snap) {
  // Gradual move: ±1–3% with a soft clamp to avoid spikes.
  const dir = Math.random() < 0.5 ? -1 : 1;
  const pct = (1 + Math.random() * 2) / 100;
  const next = snap.price * (1 + dir * pct);

  const price = round2(Math.max(1, next));
  const dayHigh = Math.max(snap.dayHigh, price);
  const dayLow = Math.min(snap.dayLow, price);
  const volume = snap.volume + Math.floor(10_000 + Math.random() * 200_000);

  return {
    ...snap,
    price,
    dayHigh: round2(dayHigh),
    dayLow: round2(dayLow),
    volume,
    updatedAt: Date.now(),
  };
}

function startPriceEngine({ io }) {
  seedIfEmpty();
  const seconds = Number(process.env.PRICE_TICK_SECONDS || 12);

  setInterval(() => {
    const all = getAll().filter(Boolean);
    const updates = [];
    for (const snap of all) {
      const updated = tickOne(snap);
      set(updated.symbol, updated);
      updates.push(updated);
    }
    if (io) io.emit("prices:update", { prices: updates });
  }, Math.max(5, seconds) * 1000);
}

module.exports = { startPriceEngine };

