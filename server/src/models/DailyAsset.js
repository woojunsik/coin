const mongoose = require("mongoose");

const DailyAssetSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    date: { type: Date, required: true },
    totalKRW: { type: Number, required: true },
    assets: [
      {
        currency: { type: String, enum: ["BTC", "ETH", "XRP", "KRW"] },
        balance: { type: Number },
        krw: { type: Number },
        exchange: { type: String, enum: ["upbit", "bithumb", "binance"] },
      },
    ],
  },
  { timestamps: true }
);

DailyAssetSchema.index({ user: 1, date: 1 }, { unique: true });

module.exports = mongoose.model("DailyAsset", DailyAssetSchema);
