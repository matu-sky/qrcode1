import React from 'react';
import { useSearchParams } from 'react-router-dom';
import { Button } from 'react-bootstrap';
import './DisplayPage.css'; // Import the CSS

export default function DisplayPage() {
  const [searchParams] = useSearchParams();

  // Get template and content type from URL
  const template = searchParams.get('template') || 'memo';
  const type = searchParams.get('type') || 'text';

  // Get data from URL
  const text = searchParams.get('text');
  const bank = searchParams.get('bank');
  const accountNumber = searchParams.get('accountNumber');
  const accountHolder = searchParams.get('accountHolder');
  const amount = searchParams.get('amount');
  const vCardData = {
    name: searchParams.get('name'),
    title: searchParams.get('title'),
    org: searchParams.get('org'),
    phone: searchParams.get('phone'),
    email: searchParams.get('email'),
  };

  const handleSaveVCard = () => {
    const vCardString = `BEGIN:VCARD
VERSION:3.0
FN:${vCardData.name}
ORG:${vCardData.org}
TITLE:${vCardData.title}
TEL;TYPE=WORK,VOICE:${vCardData.phone}
EMAIL:${vCardData.email}
END:VCARD`;
    const blob = new Blob([vCardString], { type: 'text/vcard;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${vCardData.name || 'contact'}.vcf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const renderContent = () => {
    if (type === 'vcard') {
      return (
        <>
          <div className="name">{vCardData.name}</div>
          <div className="title">{vCardData.title}</div>
          <div className="org">{vCardData.org}</div>
          <div className="contact-item">
            <span className="icon">📞</span>
            <span>{vCardData.phone}</span>
          </div>
          <div className="contact-item">
            <span className="icon">✉️</span>
            <span>{vCardData.email}</span>
          </div>
          <Button variant="primary" onClick={handleSaveVCard} className="w-100 mt-4">연락처 저장</Button>
        </>
      );
    }

    if (type === 'payment') {
      return (
        <>
          {template === 'receipt' ? <h2>송금 정보</h2> : null}
          <div className="item"><span className="label">은행</span><span>{bank}</span></div>
          <div className="item"><span className="label">계좌번호</span><span>{accountNumber}</span></div>
          {accountHolder && <div className="item"><span className="label">예금주</span><span>{accountHolder}</span></div>}
          {amount && <div className="item"><span className="label">금액</span><span>{amount}원</span></div>}
        </>
      );
    }
    
    return <p>{text || '내용이 없습니다.'}</p>;
  };

  return (
    <div className="template-container">
      <div className={type === 'vcard' ? 'business-card' : template}>
        {renderContent()}
      </div>
    </div>
  );
}
