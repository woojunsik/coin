const express = require("express");
const axios = require("axios");
const crypto = require("crypto");
const querystring = require("querystring");
const { v4: uuidv4 } = require("uuid");
const verifyToken = require("../middleware/verifyToken");
const Wallet = require("../models/Wallet");

const router = express.Router();

// ✅ Bithumb 자산 조회
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
      exchange: "bithumb",
      accessKey: accessKey.trim(),
    });
    if (existing && existing.user.toString() !== req.user._id.toString()) {
      return res.status(400).json({
        message: "❌ 이 API 키는 이미 다른 계정에서 사용 중입니다.",
      });
    }

    const endpoint = "/info/balance";
    const apiUrl = `https://api.bithumb.com${endpoint}`;
    const nonce = Date.now().toString();
    const params = { currency: "ALL" };
    const qs = querystring.stringify(params);
    const str = `${endpoint}\0${qs}\0${nonce}`;
    const sign = crypto
      .createHmac("sha512", secretKey)
      .update(str)
      .digest("hex");

    const headers = {
      "Api-Key": accessKey,
      "Api-Sign": sign,
      "Api-Nonce": nonce,
      "Content-Type": "application/x-www-form-urlencoded",
    };

    const response = await axios.post(apiUrl, qs, { headers });

    if (response.data.status !== "0000") throw new Error(response.data.message);

    const balanceData = response.data.data;
    const assets = [];
    let totalKRW = 0;

    // 실시간 시세 조회
    const priceRes = await axios.get(
      "https://api.bithumb.com/public/ticker/ALL_KRW"
    );
    const prices = priceRes.data.data;

    for (const key in balanceData) {
      if (!key.endsWith("_balance")) continue;
      const coin = key.replace("_balance", "");
      const amount = parseFloat(balanceData[key]);
      if (!amount || amount === 0) continue;

      const price =
        coin === "KRW" ? 1 : parseFloat(prices[coin]?.closing_price || 0);
      const krw = Math.floor(amount * price);
      assets.push({
        currency: coin,
        balance: amount,
        krw,
        exchange: "bithumb",
      });
      totalKRW += krw;
    }

    // DB 저장
    await Wallet.findOneAndUpdate(
      { user: req.user._id, exchange: "bithumb" },
      {
        user: req.user._id,
        exchange: "bithumb",
        accessKey,
        secretKey,
        assets,
        totalKRW,
        updatedAt: new Date(),
      },
      { upsert: true, new: true }
    );

    res.json({ message: "빗썸 자산 조회 성공", totalKRW, assets });
  } catch (err) {
    console.error("[🔴 Bithumb 에러]", err.response?.data || err.message);
    res
      .status(500)
      .json({ message: "빗썸 자산 조회 실패", error: err.message });
  }
});

module.exports = router;
