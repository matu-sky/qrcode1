import React, { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Button } from 'react-bootstrap';
import './DisplayPage.css'; // Import the CSS

export default function DisplayPage() {
  const [searchParams] = useSearchParams();
  const [copied, setCopied] = useState(false);
  const [priceType, setPriceType] = useState('dineIn'); // 'dineIn' or 'takeout'
  const [view, setView] = useState('welcome'); // 'welcome' or 'menu'

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
    // ... (same as before)
  };

  const handlePriceSelection = (type: string) => {
    setPriceType(type);
    setView('menu');
  }

  const renderContent = () => {
    if (type === 'menu') {
      try {
        const menuData = JSON.parse(data || '{}');
        if (!menuData.shopName) return <div>메뉴 정보가 올바르지 않습니다.</div>;

        if (view === 'welcome') {
          return (
            <div className="welcome-container">
                <header className="menu-header">
                    <h1>{menuData.shopName}</h1>
                    {menuData.shopDescription && <p>{menuData.shopDescription}</p>}
                </header>
                <div className="choice-buttons">
                    <Button variant="primary" size="lg" onClick={() => handlePriceSelection('dineIn')}>매장에서 먹고 갈래요</Button>
                    <Button variant="outline-primary" size="lg" onClick={() => handlePriceSelection('takeout')}>포장해서 갈래요</Button>
                </div>
            </div>
          );
        }

        // view === 'menu'
        return (
          <div className="menu-content">
            <header className="menu-header">
              <a href="#" onClick={(e) => { e.preventDefault(); setView('welcome'); }} className="back-link">← 뒤로가기</a>
              <h1>{menuData.shopName}</h1>
              <p>({priceType === 'dineIn' ? '매장' : '포장'} 가격)</p>
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

    // ... (vcard and payment render blocks remain the same)
    if (type === 'vcard') {
        // ...
    }
    if (type === 'payment') {
        // ...
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
