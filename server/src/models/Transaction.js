const mongoose = require("mongoose");

const TransactionSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    requestId: { type: String, required: true },
    symbol: { type: String, required: true, uppercase: true, trim: true },
    side: { type: String, enum: ["BUY", "SELL"], required: true },
    quantity: { type: Number, required: true, min: 1 },
    price: { type: Number, required: true, min: 0 },
    total: { type: Number, required: true, min: 0 },
    createdAt: { type: Date, default: Date.now },
  },
  { versionKey: false }
);

TransactionSchema.index({ userId: 1, requestId: 1 }, { unique: true });

module.exports = mongoose.model("Transaction", TransactionSchema);

