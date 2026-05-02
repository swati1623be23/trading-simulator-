const mongoose = require("mongoose");

const HoldingSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    symbol: { type: String, required: true, uppercase: true, trim: true, index: true },
    quantity: { type: Number, required: true, min: 0 },
    avgPrice: { type: Number, required: true, min: 0 },
    updatedAt: { type: Date, default: Date.now },
  },
  { versionKey: false }
);

HoldingSchema.index({ userId: 1, symbol: 1 }, { unique: true });

module.exports = mongoose.model("Holding", HoldingSchema);

