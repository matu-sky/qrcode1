// Force re-deploy
import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Button, Spinner, Accordion } from 'react-bootstrap';
import { supabase } from '../supabaseClient';
import './DisplayPage.css';

const bankApps = [
  {
    name: '토스',
    logo: 'https://static.toss.im/logos/svg/logo-toss-blue.svg',
    scheme: 'supertoss://',
    androidPackage: 'viva.republica.toss',
    iosId: '839333328',
  },
  {
    name: '카카오뱅크',
    logo: 'https://www.kakaobank.com/static/images/web/logo_black.svg',
    scheme: 'kakaobank://',
    androidPackage: 'com.kakaobank.channel',
    iosId: '1258016944',
  },
  {
    name: 'NH농협',
    logo: 'https://top2020.dothome.co.kr/builder/summernote/1760429603_80d243fc05826e1c0269.png',
    scheme: 'nhallonebank://',
    androidPackage: 'com.nonghyup.nhallonebank',
    iosId: '1177327498',
  },
];

export default function DisplayPage() {
  const [searchParams] = useSearchParams();
  const [copied, setCopied] = useState(false);
  const [priceType, setPriceType] = useState('dineIn');
  const [view, setView] = useState('welcome');
  
  const [menuData, setMenuData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const handleOpenBankApp = (app: typeof bankApps[0]) => {
    const isAndroid = /android/i.test(navigator.userAgent);
    const isIOS = /iphone|ipad|ipod/i.test(navigator.userAgent);

    if (isAndroid) {
      const intentUrl = `intent://#Intent;scheme=${app.scheme.replace('://', '')};package=${app.androidPackage};S.browser_fallback_url=https://play.google.com/store/apps/details?id=${app.androidPackage};end`;
      window.location.href = intentUrl;
    } else if (isIOS) {
      const appStoreUrl = `https://apps.apple.com/kr/app/id${app.iosId}`;
      const now = Date.now();
      window.location.href = app.scheme;
      setTimeout(() => {
        if (Date.now() - now < 2000) {
          window.location.href = appStoreUrl;
        }
      }, 1000);
    } else {
      window.location.href = app.scheme;
    }
  };

  const template = searchParams.get('template') || 'memo';
  const type = searchParams.get('type') || 'text';
  const menuId = searchParams.get('id');
  const text = searchParams.get('text');
  const bank = searchParams.get('bank');
  const accountNumber = searchParams.get('accountNumber');
  const accountHolder = searchParams.get('accountHolder');
  const backgroundUrl = searchParams.get('bg');

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
          setMenuData(data.data);
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
      setTimeout(() => { setCopied(false); }, 2000);
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
  };

// ===== 계좌이체 웹 템플릿 렌더링 =====
  const renderBankAppGrid = () => (
    <>
      <div className="divider">앱으로 송금하기</div>
      <div className="app-grid">
        {bankApps.map(app => (
          <div className="app-link" key={app.name} onClick={() => handleOpenBankApp(app)} style={{ cursor: 'pointer' }}>
            <div className="app-icon">
              {app.logo ? <img src={app.logo} alt={app.name} /> : <strong>{app.name}</strong>}
            </div>
            <span>{app.name}</span>
          </div>
        ))}
      </div>
    </>
  );

  const renderWebPaymentPage = () => {
    const fullAccountNumber = `${bank} ${accountNumber}`;
    return (
      <div className="web-payment">
        <div 
          className="header-image" 
          style={{ backgroundImage: `url(${backgroundUrl || '/payment-header.png'})` }}
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
          <p style={{ fontSize: '0.85rem', color: '#e74c3c', marginTop: '0.5rem', textAlign: 'center', fontWeight: 600 }}>
            계좌번호 복사 후 앱을 이용하세요
          </p>
          {renderBankAppGrid()}
        </div>
      </div>
    );
  };

  const renderSimplePaymentPage = () => {
    const fullAccountNumber = `${bank} ${accountNumber}`;
    return (
      <div className="web-payment-simple">
        <div className="simple-header">
          <div className="simple-icon">💸</div>
          <h1>송금 안내</h1>
        </div>
        <div className="simple-body">
          <div className="simple-info-row">
            <span className="simple-label">예금주</span>
            <span className="simple-value">{accountHolder}</span>
          </div>
          <div className="simple-info-row">
            <span className="simple-label">은행</span>
            <span className="simple-value">{bank}</span>
          </div>
          <div className="simple-account-box">
            <span className="simple-account-label">계좌번호</span>
            <span className="simple-account-number">{accountNumber}</span>
          </div>
          <button className="simple-copy-btn" onClick={() => handleCopy(fullAccountNumber)}>
            {copied ? '✅ 복사 완료!' : '📋 계좌번호 복사하기'}
          </button>
          <p style={{ fontSize: '0.82rem', color: '#e74c3c', marginTop: '0.5rem', textAlign: 'center', fontWeight: 600 }}>
            계좌번호 복사 후 앱을 이용하세요
          </p>
          {renderBankAppGrid()}
        </div>
      </div>
    );
  };

  const renderDarkPaymentPage = () => {
    const fullAccountNumber = `${bank} ${accountNumber}`;
    return (
      <div className="web-payment-dark">
        <div className="dark-header">
          <div className="dark-glow"></div>
          <h1>PAYMENT</h1>
          <p className="dark-subtitle">송금 정보</p>
        </div>
        <div className="dark-body">
          <div className="dark-card">
            <div className="dark-info-group">
              <span className="dark-label">예금주</span>
              <span className="dark-value">{accountHolder}</span>
            </div>
            <div className="dark-divider"></div>
            <div className="dark-info-group">
              <span className="dark-label">은행</span>
              <span className="dark-value">{bank}</span>
            </div>
            <div className="dark-divider"></div>
            <div className="dark-info-group">
              <span className="dark-label">계좌번호</span>
              <span className="dark-value dark-account">{accountNumber}</span>
            </div>
          </div>
          <button className="dark-copy-btn" onClick={() => handleCopy(fullAccountNumber)}>
            {copied ? '복사 완료!' : '계좌번호 복사하기'}
          </button>
          <p style={{ fontSize: '0.82rem', color: '#ff6b6b', marginTop: '0.5rem', textAlign: 'center', fontWeight: 600 }}>
            계좌번호 복사 후 앱을 이용하세요
          </p>
          <div className="dark-app-section">
            <div className="divider" style={{ color: '#888' }}>앱으로 송금하기</div>
            <div className="app-grid">
              {bankApps.map(app => (
                <div className="app-link" key={app.name} onClick={() => handleOpenBankApp(app)} style={{ cursor: 'pointer' }}>
                  <div className="app-icon dark-app-icon">
                    {app.logo ? <img src={app.logo} alt={app.name} /> : <strong>{app.name}</strong>}
                  </div>
                  <span style={{ color: '#ccc' }}>{app.name}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  };

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

    if (type === 'payment' && template === 'web-payment-simple') {
      return renderSimplePaymentPage();
    }

    if (type === 'payment' && template === 'web-payment-dark') {
      return renderDarkPaymentPage();
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

      return (
        <div className="menu-content">
          <header className="menu-header menu-view-header">
            <button onClick={() => setView('welcome')} className="back-link-btn" style={{borderRadius: 0}}>← 뒤로가기</button>
            <div className="header-center-content">
              {menuData.shopLogoUrl && <img src={menuData.shopLogoUrl} alt={`${menuData.shopName} Logo`} className="shop-logo small" />} 
              <h1>{menuData.shopName}</h1>
            </div>
            <p className="price-type-subtitle" style={{borderRadius: 0}}>({priceType === 'dineIn' ? '매장' : '포장'} 가격)</p>
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
        <div className="business-card">
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
        </div>
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
    if (type === 'payment' && (template === 'web-payment' || template === 'web-payment-simple' || template === 'web-payment-dark')) return 'web-payment-container';
    if (type === 'menu') return 'menu-template';
    return template;
  };

  return (
    <div className="template-container">
      {type === 'vcard' ? (
        renderContent()
      ) : (
        <div className={getContainerClass()}>
          {renderContent()}
        </div>
      )}
    </div>
  );
}
