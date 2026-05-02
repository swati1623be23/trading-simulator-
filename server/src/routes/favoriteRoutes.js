const express = require("express");
const { z, validate } = require("../lib/validation");
const { requireAuth } = require("../middleware/auth");
const { listFavorites, addFavorite, removeFavorite } = require("../controllers/favoriteController");

const router = express.Router();

router.use(requireAuth);

router.get("/", listFavorites);

router.post(
  "/",
  validate(
    z.object({
      body: z.object({ symbol: z.string().min(1).max(10) }),
      params: z.object({}).passthrough(),
      query: z.object({}).passthrough(),
    })
  ),
  addFavorite
);

router.delete(
  "/:symbol",
  validate(
    z.object({
      body: z.object({}).passthrough(),
      params: z.object({ symbol: z.string().min(1).max(10) }),
      query: z.object({}).passthrough(),
    })
  ),
  removeFavorite
);

module.exports = router;

