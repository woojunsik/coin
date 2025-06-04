const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const jwt = require('jsonwebtoken');
const axios = require('axios');
const verifyToken = require('../middleware/verifyToken');
const Wallet = require('../models/Wallet');
const DailyAsset = require('../models/DailyAsset');



// ✅ Upbit 자산 조회 및 Wallet 저장
router.post('/balance', verifyToken, async (req, res) => {
  const { accessKey, secretKey } = req.body;

  if (!accessKey || !secretKey) {
    return res.status(400).json({ message: 'accessKey와 secretKey가 필요합니다.' });
  }

  try {

        // ✅ 중복 등록 방지
    const existing = await Wallet.findOne({ exchange: 'upbit', accessKey: accessKey.trim() });
    if (existing && existing.user.toString() !== req.user._id.toString()) {
      return res.status(400).json({
        message: '❌ 해당 API 키는 이미 다른 계정에서 사용 중입니다.',
      });
    }
    const nonce = uuidv4();

    const payload = {
      access_key: accessKey.trim(),
      nonce,
    };

    const token = jwt.sign(payload, secretKey.trim(), {
      algorithm: 'HS256',
      header: { typ: 'JWT', alg: 'HS256' },
    });

    const headers = {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
      Accept: 'application/json',
      'User-Agent': 'curl/7.64.1',
    };

    // 🔍 자산 조회
    const accountRes = await axios.get('https://api.upbit.com/v1/accounts', {
      headers,
      timeout: 5000,
      validateStatus: () => true,
    });

    if (accountRes.status !== 200) {
      throw new Error(accountRes.data?.error?.message || 'Upbit 요청 실패');
    }

    const accounts = accountRes.data;
    let totalKRW = 0;
    const assets = [];

    // 🔍 마켓 확인 및 가격 조회
    const marketListRes = await axios.get('https://api.upbit.com/v1/market/all');
    const validMarkets = marketListRes.data
      .filter((m) => m.market.startsWith('KRW-'))
      .map((m) => m.market);

    const coinMarkets = accounts
      .filter((acc) => acc.currency !== 'KRW')
      .map((acc) => `KRW-${acc.currency}`)
      .filter((m) => validMarkets.includes(m));

    const prices = {};
    if (coinMarkets.length > 0) {
      const tickerRes = await axios.get('https://api.upbit.com/v1/ticker', {
        params: { markets: coinMarkets.join(',') },
      });

      tickerRes.data.forEach((item) => {
        const symbol = item.market.split('-')[1];
        prices[symbol] = item.trade_price;
      });
    }

    for (const acc of accounts) {
      const balance = parseFloat(acc.balance);
      let krw = 0;

      if (acc.currency === 'KRW') {
        krw = Math.floor(balance);
      } else {
        const price = prices[acc.currency] || 0;
        krw = Math.floor(balance * price);
      }

      totalKRW += krw;
      assets.push({ currency: acc.currency, balance, krw, exchange: 'upbit' });
    }

    console.log('[💰 totalKRW]', totalKRW);

    // ✅ Wallet 모델에 저장
    await Wallet.findOneAndUpdate(
      { user: req.user._id, exchange: 'upbit' },
      {
        user: req.user._id,
        exchange: 'upbit',
        accessKey,
        secretKey,
        assets,
        totalKRW,
        updatedAt: new Date(),
      },
      { upsert: true, new: true }
    );

    

    res.status(200).json({
      message: '자산 조회 성공',
      totalKRW,
      assets,
    });
  } catch (error) {
    console.error('[🔴 Upbit 에러]', error.response?.data || error.message);
    res.status(500).json({
      message: '자산 조회 실패',
      error: error.response?.data || { name: 'unknown', message: error.message },
    });
  }
});




module.exports = router;
