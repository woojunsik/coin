const RankBox = ({ rank, activeExchange }) => (
  <div className="flex items-center bg-indigo-50 border border-indigo-200 p-4 rounded-xl text-sm text-indigo-700 shadow-sm">
    <span className="text-xl mr-2">🏅</span>
    현재 내 순위는 <strong className="mx-1 text-indigo-600">{rank ?? '-'}</strong>위
    {activeExchange !== 'all' && (
      <span className="text-xs text-gray-500 ml-2">
        ({activeExchange.toUpperCase()} 기준)
      </span>
    )}
  </div>
);

export default RankBox;
