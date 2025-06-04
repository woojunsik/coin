// server/src/models/RankingCache.js
const mongoose = require("mongoose");

const RankingCacheSchema = new mongoose.Schema({
  exchange: { type: String, required: true, unique: true },
  rankings: { type: Array, default: [] },
  updatedAt: { type: Date, default: Date.now },
});

module.exports = mongoose.models.RankingCache ||
  mongoose.model("RankingCache", RankingCacheSchema);
