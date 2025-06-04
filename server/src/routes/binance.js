const express = require("express");
const axios = require("axios");
const crypto = require("crypto");
const verifyToken = require("../middleware/verifyToken");
const Wallet = require("../models/Wallet");

const router = express.Router();

// ✅ Binance 자산 조회 API
router.post("/balance", verifyToken, async (req, res) => {
  const { accessKey, secretKey } = req.body;

  if (!accessKey || !secretKey) {
    return res
      .status(400)
      .json({ message: "accessKey와 secretKey가 필요합니다." });
  }

  try {
    // ✅ 중복 등록 방지
    const existing = await Wallet.findOne({
      exchange: "binance",
      accessKey: accessKey.trim(),
    });
    if (existing && existing.user.toString() !== req.user._id.toString()) {
      return res.status(400).json({
        message: "❌ 이 API 키는 이미 다른 계정에서 사용 중입니다.",
      });
    }

    const timestamp = Date.now();
    const query = `timestamp=${timestamp}`;
    const signature = crypto
      .createHmac("sha256", secretKey)
      .update(query)
      .digest("hex");

    const resBinance = await axios.get(
      `https://api.binance.com/api/v3/account?${query}&signature=${signature}`,
      {
        headers: { "X-MBX-APIKEY": accessKey },
      }
    );

    const balances = resBinance.data.balances.filter(
      (b) => parseFloat(b.free) > 0 || parseFloat(b.locked) > 0
    );

    // ✅ 실시간 시세 조회 (USDT 기준)
    const tickersRes = await axios.get(
      "https://api.binance.com/api/v3/ticker/price"
    );
    const tickers = tickersRes.data;
    const priceMap = {};
    tickers.forEach((t) => (priceMap[t.symbol] = parseFloat(t.price)));

    // ✅ 원화 환산을 위한 USDT→KRW 환율 (업비트 기준)
    const usdtKrwRes = await axios.get(
      "https://api.upbit.com/v1/ticker?markets=KRW-USDT"
    );
    const USDT_KRW = usdtKrwRes.data[0]?.trade_price || 1350;

    let totalKRW = 0;
    const assets = [];

    for (const b of balances) {
      const symbol = b.asset;
      const amount = parseFloat(b.free) + parseFloat(b.locked);
      if (amount === 0) continue;

      const priceInUSDT = priceMap[symbol + "USDT"] || 0;
      const krw = Math.floor(amount * priceInUSDT * USDT_KRW);

      totalKRW += krw;
      assets.push({
        currency: symbol,
        balance: amount,
        krw,
        exchange: "binance",
      });
    }

    // ✅ DB 저장
    await Wallet.findOneAndUpdate(
      { user: req.user._id, exchange: "binance" },
      {
        user: req.user._id,
        exchange: "binance",
        accessKey,
        secretKey,
        assets,
        totalKRW,
        updatedAt: new Date(),
      },
      { upsert: true, new: true }
    );

    res.json({ message: "바이낸스 자산 조회 성공", totalKRW, assets });
  } catch (err) {
    console.error("[🔴 Binance 에러]", err.response?.data || err.message);
    res.status(500).json({ message: "자산 조회 실패", error: err.message });
  }
});

module.exports = router;
