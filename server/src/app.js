const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const morgan = require("morgan");

const { notFound } = require("./middleware/notFound");
const { errorHandler } = require("./middleware/errorHandler");

const authRoutes = require("./routes/authRoutes");
const stockRoutes = require("./routes/stockRoutes");
const favoriteRoutes = require("./routes/favoriteRoutes");
const tradeRoutes = require("./routes/tradeRoutes");

function createApp() {
  const app = express();

  app.disable("x-powered-by");
  app.use(helmet());
  app.use(
    cors({
      origin: process.env.CLIENT_ORIGIN?.split(",").map((s) => s.trim()) || true,
      credentials: true,
    })
  );
  app.use(express.json({ limit: "200kb" }));
  app.use(morgan("dev"));

  app.use(
    rateLimit({
      windowMs: 60_000,
      limit: 120,
      standardHeaders: "draft-7",
      legacyHeaders: false,
    })
  );

  app.get("/health", (req, res) => res.json({ ok: true }));

  app.use("/api/auth", authRoutes);
  app.use("/api/stocks", stockRoutes);
  app.use("/api/favorites", favoriteRoutes);
  app.use("/api/trade", tradeRoutes);

  app.use(notFound);
  app.use(errorHandler);

  return app;
}

module.exports = { createApp };

