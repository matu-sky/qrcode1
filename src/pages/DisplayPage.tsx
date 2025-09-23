import React, { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Button, ButtonGroup } from 'react-bootstrap';
import './DisplayPage.css'; // Import the CSS

export default function DisplayPage() {
  const [searchParams] = useSearchParams();
  const [copied, setCopied] = useState(false);
  const [priceType, setPriceType] = useState('dineIn'); // 'dineIn' or 'takeout'

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

            <div className="price-toggle-container">
              <ButtonGroup>
                <Button variant={priceType === 'dineIn' ? 'primary' : 'outline-primary'} onClick={() => setPriceType('dineIn')}>매장</Button>
                <Button variant={priceType === 'takeout' ? 'primary' : 'outline-primary'} onClick={() => setPriceType('takeout')}>포장</Button>
              </ButtonGroup>
            </div>

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
                      <span className="item-price">{priceType === 'dineIn' ? item.dineInPrice : item.takeoutPrice}</span>
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
      // ... vcard content
    }

    if (type === 'payment') {
      // ... payment content
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
