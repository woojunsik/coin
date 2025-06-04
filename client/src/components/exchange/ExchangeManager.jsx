import React, { useState, useEffect, Fragment } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import UpbitRegisterForm from './UpbitRegisterForm';
import BinanceRegisterForm from './BinanceRegisterForm';
import BithumbRegisterForm from './BithumbRegisterForm';
import BybitRegisterForm from './BybitRegisterForm';
import CoinoneRegisterForm from './CoinoneRegisterForm';
import axios from 'axios';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { formatDistanceToNow, differenceInMinutes } from 'date-fns';
import { ko } from 'date-fns/locale';
import UpbitGuide from '@/components/exchange/guides/UpbitGuide';
import BinanceGuide from '@/components/exchange/guides/BinanceGuide';
import BithumbGuide from '@/components/exchange/guides/BithumbGuide';
import BybitGuide from '@/components/exchange/guides/BybitGuide';
import CoinoneGuide from '@/components/exchange/guides/CoinoneGuide';

// 거래소 구분: 국내 / 해외
const domesticExchanges = [
  { id: 'upbit', name: 'Upbit', logo: '/images/logos/upbit-logo.png' },
  { id: 'bithumb', name: 'Bithumb', logo: '/images/logos/bithumb-logo.png' },
  { id: 'coinone', name: 'Coinone', logo: '/images/logos/coinone-logo.png' },
];

const globalExchanges = [
  { id: 'binance', name: 'Binance', logo: '/images/logos/binance-logo.png' },
  { id: 'bybit', name: 'Bybit', logo: '/images/logos/bybit-logo.png' },
];

// 거래소 id → 한글 이름 매핑
const exchangeNameMap = {
  upbit: '업비트',
  binance: '바이낸스',
  bithumb: '빗썸',
  bybit: '바이비트',
  coinone: '코인원',
};

// 거래소별 가이드 컴포넌트
const guideComponents = {
  upbit: UpbitGuide,
  binance: BinanceGuide,
  bithumb: BithumbGuide,
  bybit: BybitGuide,
  coinone: CoinoneGuide,
};

// 최근 시간 표시 (몇 분 전 등)
const getRelativeTime = (isoString) => {
  if (!isoString) return '정보 없음';
  const date = new Date(isoString);
  const minutes = differenceInMinutes(new Date(), date);
  if (minutes < 1) return '방금';
  return formatDistanceToNow(date, { addSuffix: true, locale: ko });
};

export default function ExchangeManager({ onUpdate }) {

  const [wallets, setWallets] = useState({});
  const [activeExchange, setActiveExchange] = useState(null);
  const [highlighted, setHighlighted] = useState(null);
  const [confirmTarget, setConfirmTarget] = useState(null);
  const [guideOpen, setGuideOpen] = useState(false);

  // 카드 렌더링 함수
  const renderExchangeCard = ({ id, name, logo }) => {
    const registered = wallets[id]?.registered;

    return (
      <div key={id} className={`border rounded-xl p-4 bg-white shadow transition-all ${highlighted === id ? 'ring-2 ring-green-400' : ''}`}>
        <div className="flex items-center justify-center h-12 mb-4">
          <img src={logo} alt={name} className="h-7 w-full object-contain" />
        </div>
        {registered ? (
          <div className="rounded-2xl bg-white shadow-md p-4 space-y-3 border border-gray-100">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-green-600">✅ 등록 완료</span>
              <button onClick={() => setConfirmTarget(id)} className="text-xs text-red-500 hover:underline">해제</button>
            </div>
            <div className="space-y-1">
              <div className="text-xs text-gray-500">총 보유 자산</div>
              <div className="text-xl font-semibold text-gray-900 tracking-tight">
                ₩{Math.floor(wallets[id]?.totalKRW || 0).toLocaleString()}
              </div>
              <div className="text-xs text-gray-400 pt-2 border-t border-dashed">
                등록된 API 키를 통해 자산 정보가 자동으로 업데이트됩니다.
              </div>
            </div>
            <div className="pt-2 border-t border-dashed text-xs text-gray-400">
              마지막 갱신: {getRelativeTime(wallets[id]?.updatedAt)}
            </div>
          </div>
        ) : (
          <button onClick={() => setActiveExchange(id)} className="mt-2 px-3 py-1 bg-indigo-600 text-white text-sm rounded hover:bg-indigo-700">
            등록하기
          </button>
        )}
      </div>
    );
  };

  // 거래소 지갑 정보 불러오기
  useEffect(() => {
    const token = localStorage.getItem('token');
    const fetchAllWallets = async () => {
      const newState = {};
      const allExchanges = [...domesticExchanges, ...globalExchanges];
      for (const { id } of allExchanges) {
        try {
          const res = await axios.get(`/api/wallets/${id}`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          newState[id] = { registered: true, ...res.data };
        } catch (err) {
          newState[id] = { registered: false };
        }
      }
      setWallets(newState);
    };
    fetchAllWallets();
  }, []);

  // 등록 성공 시 처리
  const handleRegisterSuccess = (exchangeId, data) => {
    const name = exchangeNameMap[exchangeId] || exchangeId;
    toast.success(`${name} 등록 완료 ✅`);
    setWallets(prev => ({ ...prev, [exchangeId]: { registered: true, ...data } }));
    setActiveExchange(null);
    setHighlighted(exchangeId);
    setTimeout(() => setHighlighted(null), 3000);
        if (onUpdate) onUpdate();
  };

  // 등록 해제 처리
  const handleRemove = async (exchangeId) => {
    const name = exchangeNameMap[exchangeId] || exchangeId;
    const token = localStorage.getItem('token');
    try {
      await axios.delete(`/api/wallets/${exchangeId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setWallets(prev => {
        const updated = { ...prev };
        delete updated[exchangeId];
        return updated;
      });
      toast.info(`${name} 해제 완료`);
       if (onUpdate) onUpdate();
    } catch (err) {
      toast.error(`[❌ ${name} 삭제 실패]`);
    }
  };

  // 등록 폼 선택 렌더링
  const renderForm = () => {
    switch (activeExchange) {
      case 'upbit': return <UpbitRegisterForm onSuccess={(data) => handleRegisterSuccess('upbit', data)} />;
      case 'binance': return <BinanceRegisterForm onSuccess={(data) => handleRegisterSuccess('binance', data)} />;
      case 'bithumb': return <BithumbRegisterForm onSuccess={(data) => handleRegisterSuccess('bithumb', data)} />;
      case 'bybit': return <BybitRegisterForm onSuccess={(data) => handleRegisterSuccess('bybit', data)} />;
      case 'coinone': return <CoinoneRegisterForm onSuccess={(data) => handleRegisterSuccess('coinone', data)} />;
      default: return null;
    }
  };

  return (
    <div className="space-y-8">
      <ToastContainer position="bottom-center" autoClose={2000} hideProgressBar />
      <h2 className="text-2xl font-bold text-gray-800">거래소 API 등록 관리</h2>

{/* 국내 거래소 먼저 정렬 */}
<h3 className="text-lg font-bold text-gray-700">📌 국내 거래소</h3>
<div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 items-start">

  {domesticExchanges
    .slice()
    .sort((a, b) => (wallets[b.id]?.registered ? 1 : 0) - (wallets[a.id]?.registered ? 1 : 0))
    .map(renderExchangeCard)}
</div>

{/* 해외 거래소도 정렬 */}
<h3 className="text-lg font-bold text-gray-700 mt-8">🌐 해외 거래소</h3>
<div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 items-start">

  {globalExchanges
    .slice()
    .sort((a, b) => (wallets[b.id]?.registered ? 1 : 0) - (wallets[a.id]?.registered ? 1 : 0))
    .map(renderExchangeCard)}
</div>


      {/* ✅ 등록 모달 */}
      {activeExchange && (
        <div className="fixed inset-0 z-40 bg-black bg-opacity-40 flex items-center justify-center">
          <div className="bg-white p-6 rounded-xl shadow-xl relative w-full max-w-md">
            <button className="absolute top-3 right-3 text-gray-500 hover:text-gray-700" onClick={() => setActiveExchange(null)}>✕</button>
            <div className="flex justify-center items-center h-14 mb-4">
              <img src={domesticExchanges.concat(globalExchanges).find(e => e.id === activeExchange)?.logo} alt="로고" className="h-8 object-contain" />
            </div>
            {guideComponents[activeExchange] && (
              <div className="flex justify-end mb-2">
                <button onClick={() => setGuideOpen(true)} className="text-xs text-blue-600 underline hover:text-blue-800">
                  📘 API 발급 방법 보기
                </button>
              </div>
            )}
            {renderForm()}
          </div>
        </div>
      )}

      {/* ✅ 등록 해제 확인 모달 */}
      <Transition appear show={!!confirmTarget} as={Fragment}>
        <Dialog as="div" className="relative z-50" onClose={() => setConfirmTarget(null)}>
          <Transition.Child as={Fragment} enter="ease-out duration-300" enterFrom="opacity-0" enterTo="opacity-100" leave="ease-in duration-200" leaveFrom="opacity-100" leaveTo="opacity-0">
            <div className="fixed inset-0 bg-black bg-opacity-25" />
          </Transition.Child>
          <div className="fixed inset-0 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4 text-center">
              <Transition.Child as={Fragment} enter="ease-out duration-300" enterFrom="opacity-0 scale-95" enterTo="opacity-100 scale-100" leave="ease-in duration-200" leaveFrom="opacity-100 scale-100" leaveTo="opacity-0 scale-95">
                <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                  <Dialog.Title as="h3" className="text-lg font-medium leading-6 text-gray-900">
                    등록 해제 확인
                  </Dialog.Title>
                  <div className="mt-2">
                    <p className="text-sm text-gray-500">
                      {exchangeNameMap[confirmTarget] || confirmTarget} 등록을 정말 해제하시겠습니까?
                    </p>
                  </div>
                  <div className="mt-4 flex justify-end gap-2">
                    <button type="button" className="inline-flex justify-center rounded-md border border-transparent bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700" onClick={() => { handleRemove(confirmTarget); setConfirmTarget(null); }}>해제</button>
                    <button type="button" className="inline-flex justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100" onClick={() => setConfirmTarget(null)}>취소</button>
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>

      {/* ✅ 가이드 모달 */}
      {guideOpen && (
        <Dialog open={guideOpen} onClose={() => setGuideOpen(false)} className="relative z-50">
          <div className="fixed inset-0 bg-black bg-opacity-30" aria-hidden="true" />
          <div className="fixed inset-0 flex items-center justify-center p-4">
            <Dialog.Panel className="w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-white rounded-2xl shadow-xl">
              <div className="sticky top-0 z-10 bg-white px-6 pt-4 pb-3 border-b shadow-sm flex items-center justify-between">
                <h2 className="text-lg font-bold text-gray-800">API 발급 가이드</h2>
                <button onClick={() => setGuideOpen(false)} className="text-gray-400 hover:text-gray-600 text-xl">✕</button>
              </div>
              <div className="px-6 py-4 space-y-4">
                {React.createElement(guideComponents[activeExchange])}
              </div>
            </Dialog.Panel>
          </div>
        </Dialog>
      )}
    </div>
  );
}
