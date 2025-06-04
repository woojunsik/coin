// src/components/exchange/guides/UpbitGuide.jsx

import React from "react";

const UpbitGuide = () => {
  return (
    <div className="space-y-4">
      <div className="p-4 bg-gray-50 rounded border">
        <h5 className="text-lg font-bold mb-1">1단계</h5>
        <p>상단 <strong>고객센터</strong> → <strong>Open API 안내</strong> 클릭</p>
        <img src="/images/guides/upbit-step1.png" alt="1단계 이미지" className="rounded mt-2" />
      </div>
      <div className="p-4 bg-gray-50 rounded border">
        <h5 className="text-lg font-bold mb-1">2단계</h5>
        <p><strong>Open API 사용하기</strong> 클릭 → 키 발급받기</p>
        <img src="/images/guides/upbit-step2.png" alt="2단계 이미지" className="rounded mt-2" />
      </div>
      <div className="p-4 bg-gray-50 rounded border">
        <h5 className="text-lg font-bold mb-1">3단계</h5>
        <p>
          <strong>자산조회 체크</strong>, <strong>IP 주소 입력</strong><br />
          <strong>개인정보 수집 및 이용 동의</strong> 체크 후 <strong>Open API Key 발급</strong> 클릭
        </p>
        <img src="/images/guides/upbit-step3.png" alt="3단계 이미지" className="rounded mt-2" />
      </div>
      <div className="p-4 bg-gray-50 rounded border">
        <h5 className="text-lg font-bold mb-1">4단계</h5>
        <p><strong>Access Key</strong> 및 <strong>Secret Key</strong> 복사 후 등록창에 붙여넣기</p>
        <img src="/images/guides/upbit-step4.png" alt="4단계 이미지" className="rounded mt-2" />
      </div>
    </div>
  );
};

export default UpbitGuide;
