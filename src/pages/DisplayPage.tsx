import React from 'react';
import { useSearchParams } from 'react-router-dom';
import './DisplayPage.css'; // Import the CSS

export default function DisplayPage() {
  const [searchParams] = useSearchParams();

  // Get template and content type from URL
  const template = searchParams.get('template') || 'memo'; // default to 'memo'
  const type = searchParams.get('type') || 'text'; // 'text' or 'payment'

  // Get data from URL
  const text = searchParams.get('text');
  const bank = searchParams.get('bank');
  const accountNumber = searchParams.get('accountNumber');
  const accountHolder = searchParams.get('accountHolder');
  const amount = searchParams.get('amount');

  const renderContent = () => {
    if (type === 'payment') {
      return (
        <>
          {template === 'receipt' ? <h2>송금 정보</h2> : null}
          <div className="item">
            <span className="label">은행</span>
            <span>{bank}</span>
          </div>
          <div className="item">
            <span className="label">계좌번호</span>
            <span>{accountNumber}</span>
          </div>
          {accountHolder && (
            <div className="item">
              <span className="label">예금주</span>
              <span>{accountHolder}</span>
            </div>
          )}
          {amount && (
            <div className="item">
              <span className="label">금액</span>
              <span>{amount}원</span>
            </div>
          )}
        </>
      );
    }
    // Default to text content
    return <p>{text || '내용이 없습니다.'}</p>;
  };

  return (
    <div className="template-container">
      <div className={template}>
        {renderContent()}
      </div>
    </div>
  );
}