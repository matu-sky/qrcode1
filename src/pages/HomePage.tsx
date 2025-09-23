import React, { useState, useRef } from 'react';
import { Container, Row, Col, Tabs, Tab, Form, Button } from 'react-bootstrap';
import { QRCodeCanvas as QRCode } from 'qrcode.react';
import { toPng } from 'html-to-image';

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
    <div className="d-flex gap-3">
      <Form.Check type="radio" label="메모" name="template" value="memo" checked={selected === 'memo'} onChange={(e) => onChange(e.target.value)} />
      <Form.Check type="radio" label="포스트잇" name="template" value="sticky-note" checked={selected === 'sticky-note'} onChange={(e) => onChange(e.target.value)} />
      <Form.Check type="radio" label="영수증" name="template" value="receipt" checked={selected === 'receipt'} onChange={(e) => onChange(e.target.value)} />
    </div>
  </Form.Group>
);

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
  
  // Memo states
  const [memo, setMemo] = useState('');
  const [memoColor, setMemoColor] = useState('#000000');
  const [memoSize, setMemoSize] = useState('1.25rem');
  const [displayMemo, setDisplayMemo] = useState({ text: '', color: '', size: '' });

  const handleVCardChange = (e: any) => {
    const { name, value } = e.target;
    setVCard({ ...vCard, [name]: value });
  };

  const handleTabSelect = (k: string | null) => {
    setActiveTab(k || 'url');
    setFinalQrValue('');
    setMemo('');
    setDisplayMemo({ text: '', color: '', size: '' });
    setMemoColor('#000000');
    setMemoSize('1.25rem');
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

  const handleGenerate = (e: React.FormEvent<HTMLFormElement>) => {
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
        // Manually append non-empty fields to avoid sending empty params
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