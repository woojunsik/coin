const ExchangeTabs = ({
  mergedExchanges,
  activeExchange,
  setActiveExchange,
  connectedExchanges,
}) => (
  <div className="flex gap-4 border-b pb-2 overflow-x-auto">
    {mergedExchanges.map((ex) => {
      const isDisconnected = !connectedExchanges.includes(ex);
      return (
        <button
          key={ex}
          onClick={() => setActiveExchange(ex)}
          className={`text-sm whitespace-nowrap font-medium px-3 py-1 border-b-2 transition-all ${
            activeExchange === ex
              ? "border-blue-500 text-blue-600"
              : "border-transparent text-gray-500"
          }`}
          title={isDisconnected ? "해제된 거래소입니다." : ""}
        >
          {ex === "all"
            ? "전체"
            : isDisconnected
            ? `${ex.toUpperCase()} (해제됨)`
            : ex.toUpperCase()}
        </button>
      );
    })}
  </div>
);

export default ExchangeTabs;
