const mongoose = require('mongoose');

const WalletSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  exchange: { type: String, required: true }, // upbit, binance 등
  accessKey: { type: String },
  secretKey: { type: String },
  totalUSD: { type: Number, default: 0 },  // 기존 USD
  totalKRW: { type: Number, default: 0 },  // ✅ 추가: 원화 기준 총 자산
  assets: { type: Array, default: [] },
  updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Wallet', WalletSchema);
