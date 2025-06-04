import React from "react";

const BybitGuide = () => {
  return (
    <div className="space-y-4">

      {/* 1단계 */}
      <div className="p-4 bg-gray-50 rounded border">
        <h5 className="text-lg font-bold mb-1">1단계. API 메뉴 이동</h5>
        <p>
          Bybit 로그인 후 우측 상단 프로필 클릭 → <strong>API</strong> 메뉴 선택
        </p>
        <img src="/images/guides/bybit-step1.png" alt="1단계" className="rounded mt-2" />
      </div>

      {/* 2단계 */}
      <div className="p-4 bg-gray-50 rounded border">
        <h5 className="text-lg font-bold mb-1">2단계. 새 키 생성</h5>
        <p>
          <strong>Create New Key</strong> 버튼을 클릭
        </p>
        <img src="/images/guides/bybit-step2.png" alt="2단계" className="rounded mt-2" />
      </div>

      {/* 3단계 */}
      <div className="p-4 bg-gray-50 rounded border">
        <h5 className="text-lg font-bold mb-1">3단계. 키 생성 방식 선택</h5>
        <p>
          <strong>System-generated API Keys</strong> 선택
        </p>
        <img src="/images/guides/bybit-step3.png" alt="3단계" className="rounded mt-2" />
      </div>

      {/* 4단계 */}
      <div className="p-4 bg-gray-50 rounded border">
        <h5 className="text-lg font-bold mb-1">4단계. 기본 설정</h5>
        <ul className="list-disc pl-5 text-sm space-y-1">
          <li><strong>API Usage</strong>: API Transaction 선택</li>
          <li><strong>권한</strong>: Read-Only 선택</li>
          <li><strong>IP 제한</strong>: Only IPs with permission → 공인 IP 주소 입력</li>
        </ul>
        <img src="/images/guides/bybit-step4.png" alt="4단계" className="rounded mt-2" />
      </div>

      {/* 5단계 */}
      <div className="p-4 bg-gray-50 rounded border">
        <h5 className="text-lg font-bold mb-1">5단계. 권한 항목 선택</h5>
        <p>아래 항목만 체크합니다:</p>
        <ul className="list-disc pl-5 text-sm mt-1 space-y-1">
          <li>Trade → SPOT → Trade</li>
          <li>Assets → Wallet → Account Transfer</li>
          <li>Assets → Wallet → Subaccount Transfer</li>
          <li>Assets → Exchange → Convert, Exchange History</li>
        </ul>
        <img src="/images/guides/bybit-step5.png" alt="5단계" className="rounded mt-2" />
      </div>

      {/* 6단계 */}
      <div className="p-4 bg-gray-50 rounded border">
        <h5 className="text-lg font-bold mb-1">6단계. 키 복사</h5>
        <p>
          생성된 <strong>API Key</strong>와 <strong>Secret Key</strong>를 복사하여<br />
          알파드롭 등록창에 붙여넣습니다.
        </p>
        <img src="/images/guides/bybit-step6.png" alt="6단계" className="rounded mt-2" />
      </div>

    </div>
  );
};

export default BybitGuide;
