import React from 'react';

const ExchangeTabs = ({ selected, onSelect, exchanges = ['Upbit', 'Binance', 'Bybit', 'Bithumb', 'Coinone'] }) => {
  return (
    <div className="flex justify-center space-x-4 mb-4">
      {exchanges.map((name) => (
        <button
          key={name}
          onClick={() => onSelect(name)}
          aria-selected={selected === name}
          className={`px-4 py-1 rounded-full text-sm font-medium transition ${
            selected === name
              ? 'bg-blue-600 text-white'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          {name}
        </button>
      ))}
    </div>
  );
};


export default ExchangeTabs;
