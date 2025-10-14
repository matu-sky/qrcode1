

import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Button, Spinner, Accordion } from 'react-bootstrap';
import { supabase } from '../supabaseClient';
import './DisplayPage.css'; // Import the CSS

const bankApps = [
  {
    name: '토스',
    logo: 'https://logo.clearbit.com/toss.im',
    scheme: 'supertoss://'
  },
  {
    name: '카카오뱅크',
    logo: 'https://logo.clearbit.com/kakaobank.com',
    scheme: 'kakaobank://'
  },
  {
    name: 'NH농협',
    logo: 'https://www.nhbank.com/nh/images/common/logo_nh.png',
    scheme: 'newnhsmartbanking://'
  },
  {
    name: 'IBK기업',
    logo: 'https://www.ibk.co.kr/img/logo/logo_ibk.png',
    scheme: 'ibk-one-bank://'
  },
  {
    name: '우리은행',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/17/%EC%9A%B0%EB%A6%AC%EC%9D%80%ED%96%89_%EB%A1%9C%EA%B3%A0.svg/2560px-%EC%9A%B0%EB%A6%AC%EC%9D%80%ED%96%89_%EB%A1%9C%EA%B3%A0.svg.png',
    scheme: 'wooriwon://' // Common guess
  },
  {
    name: '하나은행',
    logo: 'https://logo.clearbit.com/hanabank.com',
    scheme: 'hanawonq://' // Common guess
  },
];

export default function DisplayPage() {
  const [searchParams] = useSearchParams();
  const [copied, setCopied] = useState(false);
  const [priceType, setPriceType] = useState('dineIn'); // 'dineIn' or 'takeout'
  const [view, setView] = useState('welcome'); // 'welcome' or 'menu'
  
  const [menuData, setMenuData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Get template and content type from URL
  const template = searchParams.get('template') || 'memo';
  const type = searchParams.get('type') || 'text';
  const menuId = searchParams.get('id');

  // Common data
  const text = searchParams.get('text');

  // Payment data
  const bank = searchParams.get('bank');
  const accountNumber = searchParams.get('accountNumber');
  const accountHolder = searchParams.get('accountHolder');
  const backgroundUrl = searchParams.get('bg');

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

  useEffect(() => {
    if (type === 'menu' && menuId) {
      const fetchMenuData = async () => {
        setLoading(true);
        const { data, error } = await supabase
          .from('menus')
          .select('data')
          .eq('id', menuId)
          .single();

        if (error) {
          console.error('Error fetching menu data:', error);
          setError('메뉴 정보를 불러오는 데 실패했습니다.');
          setMenuData(null);
        } else if (data) {
          setMenuData(data.data); // The menu content is in the 'data' jsonb column
        } else {
          setError('해당 메뉴를 찾을 수 없습니다.');
        }
        setLoading(false);
      };

      fetchMenuData();
    } else if (type !== 'menu') {
      setLoading(false);
    }
  }, [type, menuId]);

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
    let vCardString = `BEGIN:VCARD\nVERSION:3.0\n`;
    if(vCardData.name) vCardString += `FN:${vCardData.name}\n`;
    if(vCardData.org) vCardString += `ORG:${vCardData.org}\n`;
    if(vCardData.title) vCardString += `TITLE:${vCardData.title}\n`;
    if(vCardData.phone) vCardString += `TEL;TYPE=CELL:${vCardData.phone}\n`;
    if(vCardData.workPhone) vCardString += `TEL;TYPE=WORK,VOICE:${vCardData.workPhone}\n`;
    if(vCardData.fax) vCardString += `TEL;TYPE=FAX:${vCardData.fax}\n`;
    if(vCardData.email) vCardString += `EMAIL:${vCardData.email}\n`;
    if(vCardData.website) vCardString += `URL:${vCardData.website}\n`;
    if(vCardData.address) vCardString += `ADR;TYPE=WORK:;;${vCardData.address}\n`;
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

  const handlePriceSelection = (type: string) => {
    setPriceType(type);
    setView('menu');
  }

  const renderWebPaymentPage = () => {
    const fullAccountNumber = `${bank} ${accountNumber}`;
    return (
        <div className="web-payment">
            <div 
                className="header-image" 
                style={{ backgroundImage: `url(${backgroundUrl || 'https://images.pexels.com/photos/3184454/pexels-photo-3184454.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1'})` }}
            ></div>
            <div className="content">
                <div className="account-info">
                    <h2>예금주</h2>
                    <p className="bank-name">{accountHolder}</p>
                    <h2>계좌번호</h2>
                    <p className="account-number">{fullAccountNumber}</p>
                </div>
                <button className="copy-button" onClick={() => handleCopy(fullAccountNumber)}>
                    {copied ? '복사 완료!' : '계좌번호 복사하기'}
                </button>

                <div className="divider">앱으로 송금하기</div>

                <div className="app-grid">
                    {bankApps.map(app => (
                        <a href={app.scheme} className="app-link" key={app.name}>
                            <div className="app-icon">
                                {app.logo ? <img src={app.logo} alt={app.name} /> : <strong>{app.name}</strong>}
                            </div>
                            <span>{app.name}</span>
                        </a>
                    ))}
                </div>
            </div>
        </div>
    );
  }

  const renderContent = () => {
    if (loading) {
      return <div className="text-center p-5"><Spinner animation="border" /></div>;
    }

    if (error) {
      return <div className="text-center p-5 text-danger">{error}</div>;
    }

    if (type === 'payment' && template === 'web-payment') {
        return renderWebPaymentPage();
    }

    if (type === 'menu') {
      if (!menuData || !menuData.shopName) return <div className="text-center p-5 text-danger">메뉴 정보가 올바르지 않습니다.</div>;

      if (view === 'welcome') {
        return (
          <div className="welcome-container">
              <header className="menu-header welcome-header">
                  {menuData.shopLogoUrl && <img src={menuData.shopLogoUrl} alt={`${menuData.shopName} Logo`} className="shop-logo" />} 
                  <h1>{menuData.shopName}</h1>
                  {menuData.shopDescription && <p>{menuData.shopDescription}</p>}
              </header>
              <div className="choice-buttons d-grid gap-2">
                  <Button style={{borderRadius: 0}} variant="primary" size="lg" onClick={() => handlePriceSelection('dineIn')}>매장에서 먹고 갈래요</Button>
                  <Button style={{borderRadius: 0}} variant="outline-primary" size="lg" onClick={() => handlePriceSelection('takeout')}>포장해서 갈래요</Button>
              </div>
          </div>
        );
      }

      // view === 'menu'
      return (
        <div className="menu-content">
          <header className="menu-header menu-view-header">
            <button onClick={() => setView('welcome')} className="back-link-btn" style={{borderRadius: 0}}>← 뒤로가기</button>
            <div className="header-center-content">
              {menuData.shopLogoUrl && <img src={menuData.shopLogoUrl} alt={`${menuData.shopName} Logo`} className="shop-logo small" />} 
              <h1>{menuData.shopName}</h1>
            </div>
            <p className="price-type-subtitle" style={{borderRadius: 0}}>({
              priceType === 'dineIn' ? '매장' : '포장'
            } 가격)</p>
          </header>

          <Accordion flush>
            {menuData.categories.map((category: any, index: number) => (
              <Accordion.Item eventKey={index.toString()} key={index}>
                <Accordion.Header>{category.name}</Accordion.Header>
                <Accordion.Body>
                  {category.items.map((item: any, itemIndex: number) => (
                    <div key={itemIndex} className="menu-item">
                      <div className="item-info">
                        <span className="item-name">{item.name}</span>
                        {item.description && <span className="item-description">{item.description}</span>}
                      </div>
                      <span className="item-price">{priceType === 'dineIn' ? item.dineInPrice : item.takeoutPrice}</span>
                    </div>
                  ))}
                </Accordion.Body>
              </Accordion.Item>
            ))}
          </Accordion>
        </div>
      );
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

          <Button style={{borderRadius: 0}} variant="primary" onClick={handleSaveVCard} className="w-100 mt-4">연락처 저장</Button>
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
              <Button style={{borderRadius: 0}} size="sm" variant={copied ? "success" : "primary"} onClick={() => handleCopy(accountNumber)} className="copy-btn-full">
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
    if (type === 'payment' && template === 'web-payment') return 'web-payment-container';
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