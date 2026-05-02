const NodeCache = require("node-cache");
const { DEFAULT_SYMBOLS } = require("./symbols");

const cache = new NodeCache({ stdTTL: 0, checkperiod: 0, useClones: true });

function seedIfEmpty() {
  for (const s of DEFAULT_SYMBOLS) {
    const key = `px:${s.symbol}`;
    if (!cache.get(key)) {
      const base = 80 + Math.random() * 250;
      cache.set(key, {
        symbol: s.symbol,
        name: s.name,
        price: round2(base),
        prevClose: round2(base * (0.99 + Math.random() * 0.02)),
        dayHigh: round2(base * (1.01 + Math.random() * 0.015)),
        dayLow: round2(base * (0.985 - Math.random() * 0.01)),
        volume: Math.floor(2_000_000 + Math.random() * 20_000_000),
        updatedAt: Date.now(),
      });
    }
  }
}

function round2(n) {
  return Math.round(n * 100) / 100;
}

function getAll() {
  seedIfEmpty();
  return DEFAULT_SYMBOLS.map((s) => cache.get(`px:${s.symbol}`));
}

function get(symbol) {
  seedIfEmpty();
  return cache.get(`px:${symbol.toUpperCase()}`);
}

function set(symbol, snapshot) {
  cache.set(`px:${symbol.toUpperCase()}`, snapshot);
}

module.exports = { getAll, get, set, round2, seedIfEmpty };

