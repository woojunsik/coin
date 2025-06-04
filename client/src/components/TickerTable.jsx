import React, { useEffect, useState } from 'react';
import axios from 'axios';
import '@/styles/TickerTable.css';

const exchanges = ['upbit', 'bithumb', 'coinone', 'binance', 'bybit'];
const exchangeLabels = {
  upbit: '업비트',
  bithumb: '빗썸',
  coinone: '코인원',
  binance: '바이낸스',
  bybit: '바이비트',
};
const coins = ['BTC', 'ETH', 'XRP', 'SOL', 'DOGE', 'ADA'];

const TickerTable = () => {
  const [selected, setSelected] = useState('upbit');
  const [data, setData] = useState([]);
  const [prevData, setPrevData] = useState([]);
  const [binanceRef, setBinanceRef] = useState({});
  const exchangeRate = 1350;

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await axios.get(`http://localhost:4000/api/ticker?exchange=${selected}`);
        setPrevData(data);
        setData(res.data || []);
      } catch (e) {
        console.error('시세 가져오기 실패', e);
      }
    };
    fetch();
    const interval = setInterval(fetch, 1000);
    return () => clearInterval(interval);
  }, [selected]);

  useEffect(() => {
    const fetchBinance = async () => {
      try {
        const res = await axios.get(`http://localhost:4000/api/ticker?exchange=binance`);
        const map = {};
        res.data.forEach((c) => {
          map[c.symbol] = c.price * exchangeRate;
        });
        setBinanceRef(map);
      } catch (e) {
        console.error('바이낸스 기준 시세 실패', e);
      }
    };
    fetchBinance();
    const interval = setInterval(fetchBinance, 10000);
    return () => clearInterval(interval);
  }, []);

  const getBlink = (symbol, price) => {
    const prev = prevData.find((c) => c.symbol === symbol);
    if (!prev) return '';
    if (price > prev.price) return 'blink-up';
    if (price < prev.price) return 'blink-down';
    return '';
  };

  const getColor = (change) => {
    return change > 0 ? 'text-red-500' : change < 0 ? 'text-blue-500' : 'text-gray-800';
  };

  const getKimchi = (symbol, price) => {
    const base = binanceRef[symbol];
    if (!base || !price) return '-';
    const gap = ((price - base) / base) * 100;
    return `${gap.toFixed(2)}%`;
  };

  const getIcon = (symbol) =>
    `https://cryptoicon-api.pages.dev/api/color/${symbol.toLowerCase()}`;

  const isKRW = ['upbit', 'bithumb', 'coinone'].includes(selected);
  const unit = isKRW ? 'KRW' : 'USD';

  return (
    <div className="w-full p-3 bg-white shadow rounded text-xs">
      <div className="flex gap-2 mb-3">
        {exchanges.map((ex) => (
          <button
            key={ex}
            onClick={() => setSelected(ex)}
            className={`px-3 py-1 rounded ${
              selected === ex ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600'
            }`}
          >
            {exchangeLabels[ex]}
          </button>
        ))}
      </div>

      <table className="w-full text-center border-t">
        <thead className="bg-gray-100 text-[11px]">
          <tr>
            <th className="py-1">코인</th>
            <th>현재가 ({unit})</th>
            <th>변동률</th>
            <th>거래량</th>
            <th>김프</th>
          </tr>
        </thead>
        <tbody>
          {data
            .filter((c) => coins.includes(c.symbol))
            .map((coin) => {
              const price = coin.price;
              const change = coin.changeRate * 100;
              const volume =
                coin.volume !== undefined
                  ? `${Math.floor(coin.volume).toLocaleString()} ${coin.symbol}`
                  : '-';
              const kimchi = isKRW ? getKimchi(coin.symbol, price) : '-';

              return (
                <tr key={coin.symbol} className="border-b hover:bg-gray-50">
                  <td className="flex items-center gap-1 justify-center py-1 font-medium">
                    <img src={getIcon(coin.symbol)} alt="" className="w-4 h-4" />
                    {coin.symbol}
                  </td>
                  <td className={`${getBlink(coin.symbol, price)} font-bold`}>
                    {price.toLocaleString()} {unit}
                  </td>
                  <td className={getColor(change)}>
                    {change > 0
                      ? `▲ ${change.toFixed(2)}%`
                      : change < 0
                      ? `▼ ${change.toFixed(2)}%`
                      : '0.00%'}
                  </td>
                  <td>{volume}</td>
                  <td>{kimchi}</td>
                </tr>
              );
            })}
        </tbody>
      </table>
    </div>
  );
};

export default TickerTable;
