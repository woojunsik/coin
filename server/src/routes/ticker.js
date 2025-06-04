const express = require('express');
const router = express.Router();
const axios = require('axios');

// ✅ 거래소별 API 주소
const sources = {
  upbit: 'https://api.upbit.com/v1/ticker?markets=KRW-BTC,KRW-ETH,KRW-XRP,KRW-SOL,KRW-DOGE,KRW-ADA',
  binance: 'https://api.binance.com/api/v3/ticker/24hr?symbols=["BTCUSDT","ETHUSDT","XRPUSDT","SOLUSDT","DOGEUSDT","ADAUSDT"]',
  bybit: 'https://api.bybit.com/v5/market/tickers?category=linear',
  bithumb: 'https://api.bithumb.com/public/ticker/BTC,ETH,XRP,SOL,DOGE,ADA',
  coinone: 'https://api.coinone.co.kr/ticker?currency=all',
};

// ✅ 코인 순서 기준
const coinOrder = ['BTC', 'ETH', 'XRP', 'SOL', 'DOGE', 'ADA'];

router.get('/', async (req, res) => {
  const { exchange } = req.query;

  if (!exchange || !sources[exchange]) {
    return res.status(400).json({ message: '유효한 거래소(exchange)가 필요합니다.' });
  }

  try {
    const response = await axios.get(sources[exchange]);
    const data = response.data;
    let formatted = [];

    // ✅ 업비트
    if (exchange === 'upbit') {
      formatted = data.map((item) => ({
        exchange: 'upbit',
        symbol: item.market.replace('KRW-', ''),
        price: item.trade_price,
        changeRate: item.signed_change_rate,
        volume: item.acc_trade_volume_24h,
        unit: 'krw',
      }));
    }

    // ✅ 바이낸스
    if (exchange === 'binance') {
      formatted = data.map((item) => ({
        exchange: 'binance',
        symbol: item.symbol.replace('USDT', ''),
        price: parseFloat(item.lastPrice),
        changeRate: parseFloat(item.priceChangePercent) / 100,
        volume: parseFloat(item.volume),
        unit: 'usd',
      }));
    }

    // ✅ 바이비트 (v5 API)
    if (exchange === 'bybit') {
      const symbols = ['BTCUSDT', 'ETHUSDT', 'XRPUSDT', 'SOLUSDT', 'DOGEUSDT', 'ADAUSDT'];
      const list = data.result?.list || [];

      formatted = list
        .filter((item) => symbols.includes(item.symbol))
        .map((item) => ({
          exchange: 'bybit',
          symbol: item.symbol.replace('USDT', ''),
          price: parseFloat(item.lastPrice),
          changeRate: parseFloat(item.price24hPcnt),
          volume: parseFloat(item.turnover24h),
          unit: 'usd',
        }));
    }

    // ✅ 빗썸 (종목별 요청)
    if (exchange === 'bithumb') {
      const symbols = ['BTC', 'ETH', 'XRP', 'SOL', 'DOGE', 'ADA'];
      const responses = await Promise.all(
        symbols.map(async (sym) => {
          const res = await axios.get(`https://api.bithumb.com/public/ticker/${sym}`);
          return { sym, data: res.data.data };
        })
      );

      formatted = responses.map(({ sym, data }) => ({
        exchange: 'bithumb',
        symbol: sym,
        price: parseFloat(data.closing_price),
        changeRate: parseFloat(data.fluctate_rate_24H) / 100,
        volume: parseFloat(data.units_traded_24H),
        unit: 'krw',
      }));
    }

// ✅ 코인원
if (exchange === 'coinone') {
  const raw = data;
  const symbols = ['btc', 'eth', 'xrp', 'sol', 'doge', 'ada'];
  formatted = symbols.map((sym) => {
    const ticker = raw[sym];
    const last = parseFloat(ticker.last);
    const yesterday = parseFloat(ticker.yesterday_last);
    const volume = parseFloat(ticker.volume);
    const changeRate =
      last && yesterday ? (last - yesterday) / yesterday : 0; // 🔥 변동률 수동 계산

    return {
      exchange: 'coinone',
      symbol: sym.toUpperCase(),
      price: last,
      changeRate: changeRate,
      volume: volume,
      unit: 'krw',
    };
  });
}

    // ✅ 코인 순서 통일 (BTC → ETH → ...)
    formatted.sort((a, b) => {
      return coinOrder.indexOf(a.symbol) - coinOrder.indexOf(b.symbol);
    });

    return res.json(formatted);
  } catch (error) {
    console.error('📉 시세 요청 실패:', error.message);
    return res.status(500).json({ message: '시세 조회 실패', error: error.message });
  }
});

module.exports = router;
