const express = require("express");
const { z, validate } = require("../lib/validation");
const { requireAuth } = require("../middleware/auth");
const { getPortfolio, placeOrder } = require("../controllers/tradeController");

const router = express.Router();

router.use(requireAuth);

router.get("/portfolio", getPortfolio);

router.post(
  "/order",
  validate(
    z.object({
      body: z.object({
        requestId: z.string().min(8).max(80),
        symbol: z.string().min(1).max(10),
        side: z.enum(["BUY", "SELL"]),
        quantity: z.number().int().min(1).max(1_000_000),
      }),
      params: z.object({}).passthrough(),
      query: z.object({}).passthrough(),
    })
  ),
  placeOrder
);

module.exports = router;

