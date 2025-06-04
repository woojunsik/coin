import React from 'react';

const HotBoardPreview = () => {
  return (
    <div className="bg-white border rounded p-4 text-sm shadow-sm">
      <h3 className="font-semibold border-b pb-2 mb-2 text-red-600">🔥 실시간 인기글</h3>
      <ul className="space-y-1">
        <li className="truncate hover:underline cursor-pointer">비트 갑자기 왜 오름?</li>
        <li className="truncate hover:underline cursor-pointer">이더 250 근접ㅋㅋ</li>
        <li className="truncate hover:underline cursor-pointer">김프 오지는데??</li>
      </ul>
    </div>
  );
};

export default HotBoardPreview;
