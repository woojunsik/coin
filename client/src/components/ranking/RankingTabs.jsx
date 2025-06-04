import React from 'react';

const exchanges = [
  { key: 'all', label: '전체' },
  { key: 'upbit', label: '업비트' },
  { key: 'coinone', label: '코인원' },
  { key: 'bithumb', label: '빗썸' },
  { key: 'binance', label: '바이낸스' },
  { key: 'bybit', label: '바이비트' },
];

const RankingTabs = ({ selected, onChange }) => {
  return (
    <div className="flex gap-4 mb-6 border-b">
      {exchanges.map((tab) => (
        <button
          key={tab.key}
          onClick={() => onChange(tab.key)}
          className={`px-4 py-2 font-semibold text-sm border-b-2 transition-all ${
            selected === tab.key
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-gray-500 hover:text-black'
          }`}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
};

export default RankingTabs;
