const SummaryCard = ({ title, value, highlight }) => (
  <div className={`rounded-xl p-4 text-center border text-sm ${
    highlight
      ? 'bg-blue-50 border-blue-200 text-blue-700 font-semibold'
      : 'bg-gray-50 border-gray-200 text-gray-700'
  }`}>
    <div>{title}</div>
    <div className="text-lg mt-1">{value}</div>
  </div>
);

export default SummaryCard;
