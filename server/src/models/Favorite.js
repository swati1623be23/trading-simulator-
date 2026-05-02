const mongoose = require("mongoose");

const FavoriteSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    symbol: { type: String, required: true, uppercase: true, trim: true },
    createdAt: { type: Date, default: Date.now },
  },
  { versionKey: false }
);

FavoriteSchema.index({ userId: 1, symbol: 1 }, { unique: true });

module.exports = mongoose.model("Favorite", FavoriteSchema);

