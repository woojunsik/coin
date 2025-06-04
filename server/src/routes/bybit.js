const express = require("express");
const crypto = require("crypto");
const axios = require("axios");
const verifyToken = require("../middleware/verifyToken");
const Wallet = require("../models/Wallet");

const router = express.Router();

// ✅ Bybit 자산 조회 및 환산
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
      exchange: "bybit",
      accessKey: accessKey.trim(),
    });
    if (existing && existing.user.toString() !== req.user._id.toString()) {
      return res.status(400).json({
        message: "❌ 이 API 키는 이미 다른 계정에서 사용 중입니다.",
      });
    }

    // ✅ 파라미터 구성 + 서명 대상 문자열 생성
    const timestamp = Date.now().toString();
    const recvWindow = "5000";

    const queryObject = {
      api_key: accessKey.trim(),
      timestamp,
      recvWindow,
      accountType: "UNIFIED", // ✅ 핵심 수정
    };

    const queryString = Object.entries(queryObject)
      .sort()
      .map(([key, val]) => `${key}=${val}`)
      .join("&");

    const signature = crypto
      .createHmac("sha256", secretKey.trim())
      .update(queryString)
      .digest("hex");

    const url = `https://api.bybit.com/v5/account/wallet-balance?${queryString}&sign=${signature}`;
    const response = await axios.get(url);

    console.log("[🐍 Bybit 원시 응답]", response.data);

    // ✅ 응답 유효성 체크
    const list = response.data?.result?.list;
    if (!Array.isArray(list) || list.length === 0) {
      console.warn("❌ Bybit 응답 구조 이상 또는 자산 없음:", response.data);
      return res
        .status(400)
        .json({ message: "Bybit 자산 정보 없음 또는 API 키 오류" });
    }

    const result = list[0].coin;
    const assets = [];
    let totalKRW = 0;

    // ✅ USDT → KRW 환율 조회
    let USDT_KRW = 1350;
    try {
      const usdtKrwRes = await axios.get(
        "https://api.upbit.com/v1/ticker?markets=KRW-USDT"
      );
      console.log("[🟡 업비트 환율 응답]", usdtKrwRes.data);
      if (Array.isArray(usdtKrwRes.data) && usdtKrwRes.data[0]?.trade_price) {
        USDT_KRW = usdtKrwRes.data[0].trade_price;
      }
    } catch (e) {
      console.warn("⚠️ 환율 조회 실패, 기본값 사용:", e.message);
    }

    // ✅ 자산 계산 및 정리
    for (const coin of result) {
      const amount = parseFloat(coin.walletBalance);
      if (!amount || amount === 0) continue;

      const usdtValue = parseFloat(coin.walletBalance); // USDT 기준 평가액
const krw = Math.floor(usdtValue * USDT_KRW);
      totalKRW += krw;

      assets.push({
        currency: coin.coin,
        balance: amount,
        krw,
        exchange: "bybit",
      });
    }

    // ✅ DB 저장
    await Wallet.findOneAndUpdate(
      { user: req.user._id, exchange: "bybit" },
      {
        user: req.user._id,
        exchange: "bybit",
        accessKey,
        secretKey,
        assets,
        totalKRW,
        updatedAt: new Date(),
      },
      { upsert: true, new: true }
    );

    res.json({ message: "Bybit 자산 조회 성공", totalKRW, assets });
  } catch (err) {
    console.error("[Bybit 에러]", err.response?.data || err.message);
    res.status(500).json({
      message: "Bybit 자산 조회 실패",
      error: err.response?.data || { message: err.message },
    });
  }
});

module.exports = router;
