// src/routes/settings.js
const express = require("express");
const router = express.Router();
const settings = require("../config/settings");

router.get("/", (req, res) => {
  res.json({
    assetRatioUpdateInterval: settings.assetRatioUpdateInterval,
    assetTrendUpdateInterval: settings.assetTrendUpdateInterval,
    assetBalanceCron: settings.assetBalanceCron,
    assetDailyCron: settings.assetDailyCron,
  });
});

module.exports = router;
