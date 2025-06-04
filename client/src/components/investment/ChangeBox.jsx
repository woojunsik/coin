const ChangeBox = ({ diff, percent }) => (
  <div className={`p-4 rounded-xl text-sm font-medium text-center border ${
    diff > 0
      ? 'bg-green-50 text-green-700 border-green-200'
      : diff < 0
      ? 'bg-red-50 text-red-600 border-red-200'
      : 'bg-gray-50 text-gray-500 border-gray-200'
  }`}>
    {diff === 0
      ? '변화 없음'
      : diff > 0
      ? `📈 전일 대비 +${diff.toLocaleString()}원 (+${percent}%)`
      : `📉 전일 대비 -${Math.abs(diff).toLocaleString()}원 (${percent}%)`}
  </div>
);

export default ChangeBox;
