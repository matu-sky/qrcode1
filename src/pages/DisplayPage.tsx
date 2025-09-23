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
  const data = searchParams.get('data');

  // Payment data
  const bank = searchParams.get('bank');
  const accountNumber = searchParams.get('accountNumber');
  const accountHolder = searchParams.get('accountHolder');

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
    if (type === 'menu') {
      try {
        const menuData = JSON.parse(data || '{}');
        if (!menuData.shopName) return <div>메뉴 정보가 올바르지 않습니다.</div>;

        return (
          <div className="menu-content">
            <header className="menu-header">
              <h1>{menuData.shopName}</h1>
              {menuData.shopDescription && <p>{menuData.shopDescription}</p>}
            </header>
            {menuData.categories.map((category: any, index: number) => (
              <section key={index} className="menu-category">
                <h2>{category.name}</h2>
                <div className="menu-items-container">
                  {category.items.map((item: any, itemIndex: number) => (
                    <div key={itemIndex} className="menu-item">
                      <div className="item-info">
                        <span className="item-name">{item.name}</span>
                        {item.description && <span className="item-description">{item.description}</span>}
                      </div>
                      <span className="item-price">{item.price}</span>
                    </div>
                  ))}
                </div>
              </section>
            ))}
          </div>
        );
      } catch (error) {
        console.error("Failed to parse menu data:", error);
        return <div>메뉴 정보를 불러오는 데 실패했습니다.</div>;
      }
    }

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
          <div className="items-grid-container">
            <div className="item-vertical">
              <span className="label">은행</span>
              <span className="value">{bank}</span>
            </div>
            <div className="item-vertical">
              <span className="label">예금주</span>
              <span className="value">{accountHolder}</span>
            </div>
            <div className="item-vertical full-width">
              <span className="label">계좌번호</span>
              <span className="value account-number">{accountNumber}</span>
              <Button size="sm" variant={copied ? "success" : "primary"} onClick={() => handleCopy(accountNumber)} className="copy-btn-full">
                {copied ? '계좌번호 복사됨!' : '계좌번호 복사'}
              </Button>
            </div>
          </div>
          <p className="transfer-notice">송금후 이름을 말해주세요</p>
        </>
      );
    }
    
    return <p>{text || '내용이 없습니다.'}</p>;
  };

  const getContainerClass = () => {
    if (type === 'vcard') return 'business-card';
    if (type === 'menu') return 'menu-template';
    return template;
  };

  return (
    <div className="template-container">
      <div className={getContainerClass()}>
        {renderContent()}
      </div>
    </div>
  );
}