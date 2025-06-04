const express = require('express');
const crypto = require('crypto');
const axios = require('axios');
const verifyToken = require('../middleware/verifyToken');
const Wallet = require('../models/Wallet');

const router = express.Router();

// ✅ 코인원 자산 조회
router.post('/balance', verifyToken, async (req, res) => {
  const { accessToken, secretKey } = req.body;

  if (!accessToken || !secretKey) {
    return res.status(400).json({ message: 'accessToken과 secretKey가 필요합니다.' });
  }

  try {

        // ✅ 중복 등록 방지
    const existing = await Wallet.findOne({ exchange: 'coinone', accessKey: accessToken.trim() });

    if (existing && existing.user.toString() !== req.user._id.toString()) {
      return res.status(400).json({
        message: '❌ 이 API 키는 이미 다른 계정에서 사용 중입니다.',
      });
    }

    const nonce = Date.now();
    const payload = {
      access_token: accessToken.trim(),
      nonce,
    };

    const payloadBase64 = Buffer.from(JSON.stringify(payload)).toString('base64');
    const signature = crypto
      .createHmac('sha512', secretKey.trim())
      .update(payloadBase64)
      .digest('hex');

    const headers = {
      'Content-Type': 'application/json',
      'X-COINONE-PAYLOAD': payloadBase64,
      'X-COINONE-SIGNATURE': signature,
    };

    const response = await axios.post('https://api.coinone.co.kr/v2/account/balance/', {}, { headers });

    console.log('[🟡 Coinone 응답]', response.data);

    if (response.data?.result !== 'success') {
      return res.status(400).json({ message: '코인원 자산 조회 실패', error: response.data?.errorMsg });
    }

    const assets = [];
    let totalKRW = 0;

    for (const [coin, value] of Object.entries(response.data)) {
      if (!coin.endsWith('_balance') || coin === 'krw_balance') continue;

      const symbol = coin.replace('_balance', '');
      const amount = parseFloat(value);
      if (!amount || amount === 0) continue;

      // 시세 가져오기 (업비트 기준 환산)
      let priceKRW = 0;
      try {
        const tickerRes = await axios.get(`https://api.upbit.com/v1/ticker?markets=KRW-${symbol.toUpperCase()}`);
        priceKRW = tickerRes.data[0]?.trade_price || 0;
      } catch {
        priceKRW = 0;
      }

      const krw = Math.floor(amount * priceKRW);
      totalKRW += krw;

      assets.push({ currency: symbol.toUpperCase(), balance: amount, krw, exchange: 'coinone' });
    }

    // KRW 직접 보유 자산 추가
    if (response.data.krw) {
      const krwValue = parseFloat(response.data.krw);
      if (krwValue > 0) {
        const krwDirect = Math.floor(krwValue);
assets.push({ currency: 'KRW', balance: krwValue, krw: krwDirect });
totalKRW += krwDirect;
      }
    }

    // 저장
    await Wallet.findOneAndUpdate(
      { user: req.user._id, exchange: 'coinone' },
      {
        user: req.user._id,
        exchange: 'coinone',
        accessKey: accessToken,
        secretKey,
        assets,
        totalKRW,
        updatedAt: new Date(),
      },
      { upsert: true, new: true }
    );

    res.json({ message: 'Coinone 자산 조회 성공', totalKRW, assets });

  } catch (err) {
    console.error('[Coinone 에러]', err.response?.data || err.message);
    res.status(500).json({
      message: 'Coinone 자산 조회 실패',
      error: err.response?.data || { message: err.message },
    });
  }
});

module.exports = router;
