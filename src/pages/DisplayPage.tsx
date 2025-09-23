import React, { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Button } from 'react-bootstrap';
import './DisplayPage.css'; // Import the CSS

export default function DisplayPage() {
  const [searchParams] = useSearchParams();
  const [copied, setCopied] = useState(false);

  // Get template and content type from URL
  const template = searchParams.get('template') || 'memo';
  const type = searchParams.get('type') || 'text';

  // Common data
  const text = searchParams.get('text');

  // Payment data
  const bank = searchParams.get('bank');
  const accountNumber = searchParams.get('accountNumber');
  const accountHolder = searchParams.get('accountHolder');
  const amount = searchParams.get('amount');

  // vCard data
  const vCardData = {
    name: searchParams.get('name'),
    title: searchParams.get('title'),
    org: searchParams.get('org'),
    phone: searchParams.get('phone'),
    workPhone: searchParams.get('workPhone'),
    fax: searchParams.get('fax'),
    email: searchParams.get('email'),
    website: searchParams.get('website'),
    address: searchParams.get('address'),
  };

  const handleCopy = (copyText: string | null) => {
    if (!copyText) return;
    navigator.clipboard.writeText(copyText).then(() => {
        setCopied(true);
        setTimeout(() => {
            setCopied(false);
        }, 2000);
    }).catch(err => {
        console.error('Failed to copy: ', err);
    });
  };

  const handleSaveVCard = () => {
    let vCardString = `BEGIN:VCARD
VERSION:3.0
`;
    if(vCardData.name) vCardString += `FN:${vCardData.name}
`;
    if(vCardData.org) vCardString += `ORG:${vCardData.org}
`;
    if(vCardData.title) vCardString += `TITLE:${vCardData.title}
`;
    if(vCardData.phone) vCardString += `TEL;TYPE=CELL:${vCardData.phone}
`;
    if(vCardData.workPhone) vCardString += `TEL;TYPE=WORK,VOICE:${vCardData.workPhone}
`;
    if(vCardData.fax) vCardString += `TEL;TYPE=FAX:${vCardData.fax}
`;
    if(vCardData.email) vCardString += `EMAIL:${vCardData.email}
`;
    if(vCardData.website) vCardString += `URL:${vCardData.website}
`;
    if(vCardData.address) vCardString += `ADR;TYPE=WORK:;;${vCardData.address}
`;
    vCardString += `END:VCARD`;

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
          {vCardData.name && <div className="name">{vCardData.name}</div>}
          {vCardData.title && <div className="title">{vCardData.title}</div>}
          {vCardData.org && <div className="org">{vCardData.org}</div>}
          
          {vCardData.phone && <div className="contact-item"><span className="icon">📱</span> <span>{vCardData.phone}</span></div>}
          {vCardData.workPhone && <div className="contact-item"><span className="icon">📞</span> <span>{vCardData.workPhone}</span></div>}
          {vCardData.fax && <div className="contact-item"><span className="icon">📠</span> <span>{vCardData.fax}</span></div>}
          {vCardData.email && <div className="contact-item"><span className="icon">✉️</span> <span>{vCardData.email}</span></div>}
          {vCardData.website && <div className="contact-item"><span className="icon">🌐</span> <span><a href={vCardData.website} target="_blank" rel="noopener noreferrer">{vCardData.website}</a></span></div>}
          {vCardData.address && <div className="contact-item"><span className="icon">📍</span> <span>{vCardData.address}</span></div>}

          <Button variant="primary" onClick={handleSaveVCard} className="w-100 mt-4">연락처 저장</Button>
        </>
      );
    }

    if (type === 'payment') {
      return (
        <>
          {template === 'receipt' || template === 'bank-info-card' ? <h2>송금 정보</h2> : null}
          <div className="item">
            <span className="label">은행</span>
            <span className="value">{bank}</span>
          </div>
          <div className="item">
            <span className="label">계좌번호</span>
            <div className="value-container">
                <span className="value account-number">{accountNumber}</span>
                {template === 'bank-info-card' && accountNumber &&
                <Button size="sm" variant={copied ? "success" : "outline-primary"} onClick={() => handleCopy(accountNumber)} className="copy-btn">
                    {copied ? '복사됨!' : '복사'}
                </Button>
                }
            </div>
          </div>
          {accountHolder && (
            <div className="item">
              <span className="label">예금주</span>
              <span className="value">{accountHolder}</span>
            </div>
          )}
          {amount && (
            <div className="item">
              <span className="label">금액</span>
              <span className="value">{amount}원</span>
            </div>
          )}
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
