import React, { useEffect, useState } from 'react';
import axios from 'axios';

const ExchangeSummaryCard = () => {
  const [rate, setRate] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchLatestRate = async () => {
        try {
          const res = await axios.get('https://api.exchangerate.host/latest', {
            params: {
              base: 'USD',
              symbols: 'KRW',
            },
          });
      
          if (!res.data || !res.data.success || !res.data.rates || !res.data.rates.KRW) {
            console.warn('⚠ 환율 데이터 없음:', {
              success: res.data?.success,
              error: res.data?.error,
              base: res.data?.base,
              url: res.config?.url,
            });
            return;
          }
      
          const krw = res.data.rates.KRW;
      
          setRate({
            value: krw.toFixed(2),
            change: '+0.00',
            percent: '+0.00%',
            date: new Date(res.data.date + 'T00:00:00').toLocaleString('ko-KR', {
              dateStyle: 'short',
              timeStyle: 'short',
            }),
          });
      
        } catch (err) {
          console.error('❌ API 실패:', {
            message: err.message,
            status: err.response?.status,
            statusText: err.response?.statusText,
            url: err.config?.url,
            data: err.response?.data,
          });
        }
      };
      

    fetchLatestRate();
  }, []);

  if (error) return <div className="text-sm text-red-500">🚫 {error}</div>;
  if (!rate) return <div className="text-sm text-gray-400">⏳ 환율 불러오는 중...</div>;

  return (
    <div className="bg-white rounded shadow p-4 w-full max-w-sm">
      <div className="flex justify-between text-sm text-gray-500 mb-1">
        <span>💱 환율 USD</span>
        <span>{rate.date}</span>
      </div>

      <div className="text-2xl font-bold text-gray-900">{rate.value}</div>

      <div className="text-sm font-semibold text-red-500">
        ▲ {rate.change} ({rate.percent})
      </div>

      <div className="mt-4 text-xs text-gray-400 border-t pt-2">기준가 (1 USD)</div>
    </div>
  );
};

export default ExchangeSummaryCard;
