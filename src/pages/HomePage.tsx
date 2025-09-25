import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Container, Row, Col, Tabs, Tab, Form, Button, Card, InputGroup, Image } from 'react-bootstrap';
import { QRCodeCanvas as QRCode } from 'qrcode.react';
import { toPng } from 'html-to-image';
import { supabase } from '../supabaseClient';

// Reusable Memo Customizer Component
const MemoCustomizer = ({ memo, setMemo, color, setColor, size, setSize }: any) => (
  <Form.Group className="mt-3 p-3 border rounded bg-light">
    <Form.Label className="fw-bold">QR 코드 메모 꾸미기 (선택 사항)</Form.Label>
    <Form.Control 
      type="text" 
      placeholder="예: 내 명함, 회사 와이파이" 
      value={memo} 
      onChange={(e) => setMemo(e.target.value)} 
      className="mb-2"
    />
    <Row>
      <Col>
        <Form.Label>텍스트 색상</Form.Label>
        <Form.Control type="color" value={color} onChange={(e) => setColor(e.target.value)} title="Choose your color" />
      </Col>
      <Col>
        <Form.Label>텍스트 크기</Form.Label>
        <Form.Select value={size} onChange={(e) => setSize(e.target.value)}>
          <option value="1rem">작게</option>
          <option value="1.25rem">보통</option>
          <option value="1.5rem">크게</option>
        </Form.Select>
      </Col>
    </Row>
  </Form.Group>
);

// Sub-component for template selection
const TemplateSelector = ({ selected, onChange }: { selected: string, onChange: (val: string) => void }) => (
  <Form.Group className="mt-4">
    <Form.Label>표시 템플릿 선택</Form.Label>
    <div className="d-flex flex-wrap gap-3">
      <Form.Check type="radio" label="계좌 정보" name="template" value="bank-info-card" checked={selected === 'bank-info-card'} onChange={(e) => onChange(e.target.value)} />
      <Form.Check type="radio" label="메모" name="template" value="memo" checked={selected === 'memo'} onChange={(e) => onChange(e.target.value)} />
      <Form.Check type="radio" label="포스트잇" name="template" value="sticky-note" checked={selected === 'sticky-note'} onChange={(e) => onChange(e.target.value)} />
      <Form.Check type="radio" label="영수증" name="template" value="receipt" checked={selected === 'receipt'} onChange={(e) => onChange(e.target.value)} />
    </div>
  </Form.Group>
);

const MenuForm = ({ menuData, setMenuData }: any) => {
  
  const handleShopInfoChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setMenuData({ ...menuData, [name]: value });
  };

  const handleCategoryChange = (catIndex: number, value: string) => {
    const newCategories = [...menuData.categories];
    newCategories[catIndex].name = value;
    setMenuData({ ...menuData, categories: newCategories });
  };

  const handleItemChange = (catIndex: number, itemIndex: number, e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    const newCategories = [...menuData.categories];
    newCategories[catIndex].items[itemIndex] = { ...newCategories[catIndex].items[itemIndex], [name]: value };
    setMenuData({ ...menuData, categories: newCategories });
  };

  const addCategory = () => {
    setMenuData({
      ...menuData,
      categories: [...menuData.categories, { name: '', items: [{ name: '', dineInPrice: '', takeoutPrice: '', description: '' }] }]
    });
  };

  const removeCategory = (catIndex: number) => {
    const newCategories = [...menuData.categories];
    newCategories.splice(catIndex, 1);
    setMenuData({ ...menuData, categories: newCategories });
  };

  const addItem = (catIndex: number) => {
    const newCategories = [...menuData.categories];
    newCategories[catIndex].items.push({ name: '', dineInPrice: '', takeoutPrice: '', description: '' });
    setMenuData({ ...menuData, categories: newCategories });
  };

  const removeItem = (catIndex: number, itemIndex: number) => {
    const newCategories = [...menuData.categories];
    newCategories[catIndex].items.splice(itemIndex, 1);
    setMenuData({ ...menuData, categories: newCategories });
  };

  return (
    <div className="p-2">
        <Row>
            <Col md={8}>
                <Form.Group className="mb-3">
                    <Form.Label>가게 이름</Form.Label>
                    <Form.Control 
                    type="text" 
                    name="shopName"
                    placeholder="예: Gemini's Coffee" 
                    value={menuData.shopName} 
                    onChange={handleShopInfoChange} 
                    />
                </Form.Group>
                <Form.Group className="mb-3">
                    <div className="d-flex justify-content-between align-items-center">
                      <Form.Label>가게 설명 (선택 사항)</Form.Label>
                      <Link to="/list" className="btn btn-primary">메뉴 불러오기</Link>
                    </div>
                    <Form.Control 
                    as="textarea"
                    rows={2}
                    name="shopDescription"
                    placeholder="손님들께 전하고 싶은 말을 적어보세요." 
                    value={menuData.shopDescription} 
                    onChange={handleShopInfoChange} 
                    />
                </Form.Group>
            </Col>
            <Col md={4}>
                <Form.Group className="mb-3">
                    <Form.Label>로고 이미지 주소 (URL)</Form.Label>
                    <Form.Control type="url" name="shopLogoUrl" placeholder="https://example.com/logo.png" value={menuData.shopLogoUrl} onChange={handleShopInfoChange} />
                    {menuData.shopLogoUrl && <Image src={menuData.shopLogoUrl} thumbnail className="mt-2" style={{ maxHeight: '100px' }}/>}
                </Form.Group>
            </Col>
        </Row>

      {menuData.categories.map((category: any, catIndex: number) => (
        <Card key={catIndex} className="mb-4">
          <Card.Header>
            <InputGroup>
              <InputGroup.Text>카테고리</InputGroup.Text>
              <Form.Control 
                type="text" 
                placeholder="예: 커피, 에이드" 
                value={category.name} 
                onChange={(e) => handleCategoryChange(catIndex, e.target.value)}
              />
              <Button variant="outline-danger" onClick={() => removeCategory(catIndex)}>X</Button>
            </InputGroup>
          </Card.Header>
          <Card.Body>
            {category.items.map((item: any, itemIndex: number) => (
              <Row key={itemIndex} className="mb-3 align-items-center">
                <Col xs={12} md={3} className="mb-2 mb-md-0">
                  <Form.Control name="name" placeholder="메뉴 이름" value={item.name} onChange={(e) => handleItemChange(catIndex, itemIndex, e)} />
                </Col>
                <Col xs={6} md={2}>
                  <Form.Control name="dineInPrice" placeholder="매장 가격" value={item.dineInPrice} onChange={(e) => handleItemChange(catIndex, itemIndex, e)} />
                </Col>
                <Col xs={6} md={2}>
                  <Form.Control name="takeoutPrice" placeholder="포장 가격" value={item.takeoutPrice} onChange={(e) => handleItemChange(catIndex, itemIndex, e)} />
                </Col>
                <Col xs={12} md={4} className="mb-2 mb-md-0">
                  <Form.Control name="description" placeholder="설명 (선택)" value={item.description} onChange={(e) => handleItemChange(catIndex, itemIndex, e)} />
                </Col>
                <Col xs={12} md={1} className="text-end">
                  <Button variant="outline-secondary" size="sm" onClick={() => removeItem(catIndex, itemIndex)}>–</Button>
                </Col>
              </Row>
            ))}
            <Button variant="secondary" onClick={() => addItem(catIndex)}>+ 메뉴 항목 추가</Button>
          </Card.Body>
        </Card>
      ))}
      <Button variant="primary" onClick={addCategory} className="w-100 mb-4">+ 카테고리 추가</Button>
    </div>
  );
};

export default function HomePage() {
  const [activeTab, setActiveTab] = useState('url');
  const [finalQrValue, setFinalQrValue] = useState('');
  const qrRef = useRef<any>(null);

  // Form states
  const [url, setUrl] = useState('');
  const [text, setText] = useState('');
  const [vCard, setVCard] = useState({ 
    name: '', 
    title: '', 
    org: '', 
    phone: '', // Mobile
    workPhone: '', // Work
    fax: '', 
    email: '', 
    website: '',
    address: '' 
  });
  const [wifi, setWifi] = useState({ ssid: '', password: '', encryption: 'WPA' });
  const [payment, setPayment] = useState({ bank: '', accountNumber: '', accountHolder: '', amount: '' });
  const [sms, setSms] = useState({ phone: '', message: '' });
  const [template, setTemplate] = useState('memo');
  const [menuData, setMenuData] = useState({
    shopName: '',
    shopDescription: '',
    shopLogoUrl: '',
    categories: [{ name: '커피', items: [{ name: '아메리카노', dineInPrice: '5,000원', takeoutPrice: '4,500원', description: '신선한 원두의 깊은 풍미' }] }]
  });
  
  // Memo states
  const [memo, setMemo] = useState('');
  const [memoColor, setMemoColor] = useState('#000000');
  const [memoSize, setMemoSize] = useState('1.25rem');
  const [displayMemo, setDisplayMemo] = useState({ text: '', color: '', size: '' });
  const [editId, setEditId] = useState<string | null>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const editIdParam = params.get('edit_id');
    if (editIdParam) {
      setEditId(editIdParam);
      setActiveTab('menu');
      const fetchMenu = async () => {
        const { data, error } = await supabase
          .from('menus')
          .select('data')
          .eq('id', editIdParam)
          .single();
        
        if (error) {
          console.error('Error fetching menu:', error);
          alert('메뉴 정보를 불러오는 데 실패했습니다.');
        } else if (data) {
          setMenuData(data.data);
        }
      };
      fetchMenu();
    }
  }, []);

  const handleVCardChange = (e: any) => {
    const { name, value } = e.target;
    setVCard({ ...vCard, [name]: value });
  };

  const handleTabSelect = (k: string | null) => {
    const newTab = k || 'url';
    setActiveTab(newTab);
    setFinalQrValue('');
    setMemo('');
    setDisplayMemo({ text: '', color: '', size: '' });
    setMemoColor('#000000');
    setMemoSize('1.25rem');
    if (newTab === 'payment') {
      setTemplate('bank-info-card');
    } else {
      setTemplate('memo');
    }
  };

  const handleDownload = () => {
    if (qrRef.current) {
      toPng(qrRef.current, { cacheBust: true })
        .then((dataUrl) => {
          const link = document.createElement('a');
          link.download = 'qr-code-with-memo.png';
          link.href = dataUrl;
          link.click();
        })
        .catch((err) => {
          console.error('oops, something went wrong!', err);
        });
    }
  };

  const handleGenerate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setDisplayMemo({ text: memo, color: memoColor, size: memoSize });
    const baseUrl = window.location.origin;
    const displayUrl = `${baseUrl}/display`;

    switch (activeTab) {
      case 'url':
        setFinalQrValue(url);
        break;
      case 'text': {
        if (!text) return;
        const params = new URLSearchParams({ type: 'text', template, text });
        setFinalQrValue(`${displayUrl}?${params.toString()}`);
        break;
      }
      case 'vcard': {
        if (Object.values(vCard).every(field => field === '')) return;
        const params = new URLSearchParams({ type: 'vcard'});
        Object.entries(vCard).forEach(([key, value]) => {
          if (value) {
            params.set(key, value);
          }
        });
        setFinalQrValue(`${displayUrl}?${params.toString()}`);
        break;
      }
      case 'wifi': {
        if (!wifi.ssid) return;
        const escapedSsid = wifi.ssid.replace(/([\\;,"'])/g, '\\$1');
        const escapedPassword = wifi.password.replace(/([\\;,"'])/g, '\\$1');
        setFinalQrValue(`WIFI:T:${wifi.encryption};S:${escapedSsid};P:${escapedPassword};;`);
        break;
      }
      case 'payment': {
        if (!payment.bank && !payment.accountNumber) return;
        const params = new URLSearchParams({ type: 'payment', template, bank: payment.bank, accountNumber: payment.accountNumber });
        if (payment.accountHolder) params.set('accountHolder', payment.accountHolder);
        if (payment.amount) params.set('amount', payment.amount);
        setFinalQrValue(`${displayUrl}?${params.toString()}`);
        break;
      }
      case 'sms': {
        if (!sms.phone) return;
        setFinalQrValue(`SMSTO:${sms.phone}:${sms.message}`);
        break;
      }
      case 'menu': {
        const filteredMenuData = {
          ...menuData,
          categories: menuData.categories
            .map(cat => ({
              ...cat,
              items: cat.items.filter(item => item.name.trim() !== '')
            }))
            .filter(cat => cat.name.trim() !== '' && cat.items.length > 0)
        };
        if (filteredMenuData.shopName.trim() === '' || filteredMenuData.categories.length === 0) {
            alert('가게 이름과 하나 이상의 메뉴 항목을 입력해주세요.');
            return;
        };
        
        // Save or Update in Supabase
        if (editId) {
          // Update existing menu
          const { error } = await supabase
            .from('menus')
            .update({ data: filteredMenuData })
            .eq('id', editId);

          if (error) {
            console.error('Error updating menu data:', error);
            alert('메뉴 수정 중 오류가 발생했습니다.');
            return;
          }

          alert('메뉴가 성공적으로 수정되었습니다.');
          const params = new URLSearchParams({ type: 'menu', id: editId });
          setFinalQrValue(`${displayUrl}?${params.toString()}`);

        } else {
          // Create new menu
          const { data, error } = await supabase
            .from('menus')
            .insert([
              { data: filteredMenuData },
            ])
            .select();

          if (error) {
            console.error('Error inserting menu data:', error);
            alert('메뉴 저장 중 오류가 발생했습니다.');
            return;
          }

          if (data) {
            const menuId = data[0].id;
            const params = new URLSearchParams({ type: 'menu', id: menuId });
            setFinalQrValue(`${displayUrl}?${params.toString()}`);
          }
        }
        break;
      }
      default:
        setFinalQrValue('');
    }
  };

  return (
    <Container className="main-container">
      <Row>
        <Col><h1 className="text-center main-header">QR 코드 생성기</h1></Col>
      </Row>
      <Row>
        <Col md={7}>
          <Tabs activeKey={activeTab} onSelect={handleTabSelect} id="qr-code-tabs" className="mb-4 custom-tabs">
            <Tab eventKey="url" title="URL">
              <Form onSubmit={handleGenerate} className="p-2">
                <Form.Group controlId="formUrl"><Form.Label>웹사이트 URL</Form.Label><Form.Control type="text" placeholder="https://example.com" value={url} onChange={(e) => setUrl(e.target.value)} /></Form.Group>
                <MemoCustomizer memo={memo} setMemo={setMemo} color={memoColor} setColor={setMemoColor} size={memoSize} setSize={setMemoSize} />
                <Button variant="primary" type="submit" className="mt-4 w-100">QR 코드 생성</Button>
              </Form>
            </Tab>
            <Tab eventKey="text" title="텍스트">
              <Form onSubmit={handleGenerate} className="p-2">
                <Form.Group controlId="formText"><Form.Label>내용</Form.Label><Form.Control as="textarea" rows={3} placeholder="QR 코드로 만들 텍스트를 입력하세요." value={text} onChange={(e) => setText(e.target.value)} /></Form.Group>
                <TemplateSelector selected={template} onChange={setTemplate} />
                <MemoCustomizer memo={memo} setMemo={setMemo} color={memoColor} setColor={setMemoColor} size={memoSize} setSize={setMemoSize} />
                <Button variant="primary" type="submit" className="mt-4 w-100">QR 코드 생성</Button>
              </Form>
            </Tab>
            <Tab eventKey="menu" title="메뉴">
              <Form onSubmit={handleGenerate}>
                <MenuForm menuData={menuData} setMenuData={setMenuData} />
                <div className="p-2">
                    <MemoCustomizer memo={memo} setMemo={setMemo} color={memoColor} setColor={setMemoColor} size={memoSize} setSize={setMemoSize} />
                    <Button variant="primary" type="submit" className="mt-4 w-100">{editId ? '메뉴 수정' : 'QR 코드 생성'}</Button>
                </div>
              </Form>
            </Tab>
            <Tab eventKey="sms" title="SMS">
              <Form onSubmit={handleGenerate} className="p-2">
                <Form.Group className="mb-2"><Form.Label>전화번호</Form.Label><Form.Control type="tel" placeholder="010-1234-5678" value={sms.phone} onChange={(e) => setSms({...sms, phone: e.target.value})} /></Form.Group>
                <Form.Group className="mb-2"><Form.Label>메시지 내용</Form.Label><Form.Control as="textarea" rows={3} placeholder="보낼 메시지를 입력하세요." value={sms.message} onChange={(e) => setSms({...sms, message: e.target.value})} /></Form.Group>
                <MemoCustomizer memo={memo} setMemo={setMemo} color={memoColor} setColor={setMemoColor} size={memoSize} setSize={setMemoSize} />
                <Button variant="primary" type="submit" className="mt-4 w-100">QR 코드 생성</Button>
              </Form>
            </Tab>
            <Tab eventKey="vcard" title="명함">
              <Form onSubmit={handleGenerate} className="p-2">
                <Form.Group className="mb-2"><Form.Label>이름</Form.Label><Form.Control type="text" name="name" placeholder="홍길동" value={vCard.name} onChange={handleVCardChange} /></Form.Group>
                <Form.Group className="mb-2"><Form.Label>회사</Form.Label><Form.Control type="text" name="org" placeholder="주식회사 홍길동" value={vCard.org} onChange={handleVCardChange} /></Form.Group>
                <Form.Group className="mb-2"><Form.Label>직책</Form.Label><Form.Control type="text" name="title" placeholder="대표" value={vCard.title} onChange={handleVCardChange} /></Form.Group>
                <Form.Group className="mb-2"><Form.Label>핸드폰</Form.Label><Form.Control type="tel" name="phone" placeholder="010-1234-5678" value={vCard.phone} onChange={handleVCardChange} /></Form.Group>
                <Form.Group className="mb-2"><Form.Label>일반전화</Form.Label><Form.Control type="tel" name="workPhone" placeholder="02-123-4567" value={vCard.workPhone} onChange={handleVCardChange} /></Form.Group>
                <Form.Group className="mb-2"><Form.Label>팩스</Form.Label><Form.Control type="tel" name="fax" placeholder="02-123-4568" value={vCard.fax} onChange={handleVCardChange} /></Form.Group>
                <Form.Group className="mb-2"><Form.Label>이메일</Form.Label><Form.Control type="email" name="email" placeholder="hong@example.com" value={vCard.email} onChange={handleVCardChange} /></Form.Group>
                <Form.Group className="mb-2"><Form.Label>홈페이지</Form.Label><Form.Control type="text" name="website" placeholder="https://example.com" value={vCard.website} onChange={handleVCardChange} /></Form.Group>
                <Form.Group className="mb-2"><Form.Label>주소</Form.Label><Form.Control type="text" name="address" placeholder="서울시 강남구 테헤란로" value={vCard.address} onChange={handleVCardChange} /></Form.Group>
                <MemoCustomizer memo={memo} setMemo={setMemo} color={memoColor} setColor={setMemoColor} size={memoSize} setSize={setMemoSize} />
                <Button variant="primary" type="submit" className="mt-4 w-100">QR 코드 생성</Button>
              </Form>
            </Tab>
            <Tab eventKey="wifi" title="Wi-Fi">
              <Form onSubmit={handleGenerate} className="p-2">
                <Form.Group className="mb-2"><Form.Label>네트워크 이름 (SSID)</Form.Label><Form.Control type="text" name="ssid" placeholder="MyWiFi" value={wifi.ssid} onChange={(e) => setWifi({...wifi, ssid: e.target.value})} /></Form.Group>
                <Form.Group className="mb-2"><Form.Label>비밀번호</Form.Label><Form.Control type="password" name="password" placeholder="비밀번호" value={wifi.password} onChange={(e) => setWifi({...wifi, password: e.target.value})} /></Form.Group>
                <Form.Group className="mb-2"><Form.Label>암호화 방식</Form.Label><Form.Select name="encryption" value={wifi.encryption} onChange={(e) => setWifi({...wifi, encryption: e.target.value})}><option value="WPA">WPA/WPA2</option><option value="WEP">WEP</option><option value="nopass">없음</option></Form.Select></Form.Group>
                <MemoCustomizer memo={memo} setMemo={setMemo} color={memoColor} setColor={setMemoColor} size={memoSize} setSize={setMemoSize} />
                <Button variant="primary" type="submit" className="mt-4 w-100">QR 코드 생성</Button>
              </Form>
            </Tab>
            <Tab eventKey="payment" title="계좌이체">
              <Form onSubmit={handleGenerate} className="p-2">
                <Form.Group className="mb-2"><Form.Label>은행</Form.Label><Form.Control type="text" name="bank" placeholder="예: 신한은행" value={payment.bank} onChange={(e) => setPayment({...payment, bank: e.target.value})} /></Form.Group>
                <Form.Group className="mb-2"><Form.Label>계좌번호</Form.Label><Form.Control type="text" name="accountNumber" placeholder="110-XXX-XXXXXX" value={payment.accountNumber} onChange={(e) => setPayment({...payment, accountNumber: e.target.value})} /></Form.Group>
                <Form.Group className="mb-2"><Form.Label>예금주</Form.Label><Form.Control type="text" name="accountHolder" placeholder="홍길동" value={payment.accountHolder} onChange={(e) => setPayment({...payment, accountHolder: e.target.value})} /></Form.Group>
                <Form.Group className="mb-2"><Form.Label>금액 (선택 사항)</Form.Label><Form.Control type="number" name="amount" placeholder="10000" value={payment.amount} onChange={(e) => setPayment({...payment, amount: e.target.value})} /></Form.Group>
                <TemplateSelector selected={template} onChange={setTemplate} />
                <MemoCustomizer memo={memo} setMemo={setMemo} color={memoColor} setColor={setMemoColor} size={memoSize} setSize={setMemoSize} />
                <Button variant="primary" type="submit" className="mt-4 w-100">QR 코드 생성</Button>
              </Form>
            </Tab>
          </Tabs>
        </Col>
        <Col md={5} className="text-center">
          <div className="qr-code-container d-flex justify-content-center align-items-center">
            <div className="text-center">
              <h4 className="mb-3">생성된 QR 코드</h4>
              {finalQrValue ? 
                <> 
                  <div ref={qrRef} className="qr-code-wrapper p-3 d-inline-block bg-white">
                    {displayMemo.text && <p className="qr-memo mb-2" style={{ color: displayMemo.color, fontSize: displayMemo.size }}>{displayMemo.text}</p>}
                    <QRCode value={finalQrValue} size={256} />
                  </div>
                  <br />
                  <Button variant="secondary" onClick={handleDownload} className="mt-3">다운로드</Button>
                </>
                : 
                <p className="qr-code-placeholder">내용 입력 후 'QR 코드 생성' 버튼을 눌러주세요.</p>
              }
            </div>
          </div>
        </Col>
      </Row>
    </Container>
  );
}