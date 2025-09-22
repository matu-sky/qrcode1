import React, { useState, useRef } from 'react';
import { Container, Row, Col, Tabs, Tab, Form, Button } from 'react-bootstrap';
import { QRCodeCanvas as QRCode } from 'qrcode.react';

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
  const [vCard, setVCard] = useState({ name: '', phone: '', email: '', org: '', title: '' });
  const [wifi, setWifi] = useState({ ssid: '', password: '', encryption: 'WPA' });
  const [payment, setPayment] = useState({ bank: '', accountNumber: '', accountHolder: '', amount: '' });
  const [sms, setSms] = useState({ phone: '', message: '' });
  const [template, setTemplate] = useState('memo');

  const handleTabSelect = (k: string | null) => {
    setActiveTab(k || 'url');
    setFinalQrValue(''); // Clear QR code when switching tabs
  };

  const handleDownload = () => {
    if (qrRef.current) {
      const canvas = qrRef.current.querySelector('canvas');
      if (canvas) {
        const image = canvas.toDataURL('image/png');
        const link = document.createElement('a');
        link.href = image;
        link.download = 'qr-code.png';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }
    }
  };

  const handleGenerate = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
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
        const vCardString = `BEGIN:VCARD\nVERSION:3.0\nFN:${vCard.name}\nORG:${vCard.org}\nTITLE:${vCard.title}\nTEL;TYPE=WORK,VOICE:${vCard.phone}\nEMAIL:${vCard.email}\nEND:VCARD`;
        setFinalQrValue(vCardString);
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
                <Form.Group controlId="formUrl">
                  <Form.Label>웹사이트 URL</Form.Label>
                  <Form.Control type="text" placeholder="https://example.com" value={url} onChange={(e) => setUrl(e.target.value)} />
                </Form.Group>
                <Button variant="primary" type="submit" className="mt-4 w-100">QR 코드 생성</Button>
              </Form>
            </Tab>
            <Tab eventKey="text" title="텍스트">
              <Form onSubmit={handleGenerate} className="p-2">
                <Form.Group controlId="formText">
                  <Form.Label>내용</Form.Label>
                  <Form.Control as="textarea" rows={4} placeholder="QR 코드로 만들 텍스트를 입력하세요." value={text} onChange={(e) => setText(e.target.value)} />
                </Form.Group>
                <TemplateSelector selected={template} onChange={setTemplate} />
                <Button variant="primary" type="submit" className="mt-3 w-100">QR 코드 생성</Button>
              </Form>
            </Tab>
            <Tab eventKey="sms" title="SMS">
              <Form onSubmit={handleGenerate} className="p-2">
                <Form.Group className="mb-2"><Form.Label>전화번호</Form.Label><Form.Control type="tel" placeholder="010-1234-5678" value={sms.phone} onChange={(e) => setSms({...sms, phone: e.target.value})} /></Form.Group>
                <Form.Group className="mb-2"><Form.Label>메시지 내용</Form.Label><Form.Control as="textarea" rows={4} placeholder="보낼 메시지를 입력하세요." value={sms.message} onChange={(e) => setSms({...sms, message: e.target.value})} /></Form.Group>
                <Button variant="primary" type="submit" className="mt-3 w-100">QR 코드 생성</Button>
              </Form>
            </Tab>
            <Tab eventKey="vcard" title="명함">
              <Form onSubmit={handleGenerate} className="p-2">
                <Form.Group className="mb-2"><Form.Label>이름</Form.Label><Form.Control type="text" name="name" placeholder="홍길동" value={vCard.name} onChange={(e) => setVCard({...vCard, name: e.target.value})} /></Form.Group>
                <Form.Group className="mb-2"><Form.Label>연락처</Form.Label><Form.Control type="tel" name="phone" placeholder="010-1234-5678" value={vCard.phone} onChange={(e) => setVCard({...vCard, phone: e.target.value})} /></Form.Group>
                <Form.Group className="mb-2"><Form.Label>이메일</Form.Label><Form.Control type="email" name="email" placeholder="hong@example.com" value={vCard.email} onChange={(e) => setVCard({...vCard, email: e.target.value})} /></Form.Group>
                <Form.Group className="mb-2"><Form.Label>회사</Form.Label><Form.Control type="text" name="org" placeholder="주식회사 홍길동" value={vCard.org} onChange={(e) => setVCard({...vCard, org: e.target.value})} /></Form.Group>
                <Form.Group className="mb-2"><Form.Label>직책</Form.Label><Form.Control type="text" name="title" placeholder="대표" value={vCard.title} onChange={(e) => setVCard({...vCard, title: e.target.value})} /></Form.Group>
                <Button variant="primary" type="submit" className="mt-3 w-100">QR 코드 생성</Button>
              </Form>
            </Tab>
            <Tab eventKey="wifi" title="Wi-Fi">
              <Form onSubmit={handleGenerate} className="p-2">
                <Form.Group className="mb-2"><Form.Label>네트워크 이름 (SSID)</Form.Label><Form.Control type="text" name="ssid" placeholder="MyWiFi" value={wifi.ssid} onChange={(e) => setWifi({...wifi, ssid: e.target.value})} /></Form.Group>
                <Form.Group className="mb-2"><Form.Label>비밀번호</Form.Label><Form.Control type="password" name="password" placeholder="비밀번호" value={wifi.password} onChange={(e) => setWifi({...wifi, password: e.target.value})} /></Form.Group>
                <Form.Group className="mb-2"><Form.Label>암호화 방식</Form.Label><Form.Select name="encryption" value={wifi.encryption} onChange={(e) => setWifi({...wifi, encryption: e.target.value})}><option value="WPA">WPA/WPA2</option><option value="WEP">WEP</option><option value="nopass">없음</option></Form.Select></Form.Group>
                <Button variant="primary" type="submit" className="mt-3 w-100">QR 코드 생성</Button>
              </Form>
            </Tab>
            <Tab eventKey="payment" title="계좌이체">
              <Form onSubmit={handleGenerate} className="p-2">
                <Form.Group className="mb-2"><Form.Label>은행</Form.Label><Form.Control type="text" name="bank" placeholder="예: 신한은행" value={payment.bank} onChange={(e) => setPayment({...payment, bank: e.target.value})} /></Form.Group>
                <Form.Group className="mb-2"><Form.Label>계좌번호</Form.Label><Form.Control type="text" name="accountNumber" placeholder="110-XXX-XXXXXX" value={payment.accountNumber} onChange={(e) => setPayment({...payment, accountNumber: e.target.value})} /></Form.Group>
                <Form.Group className="mb-2"><Form.Label>예금주</Form.Label><Form.Control type="text" name="accountHolder" placeholder="홍길동" value={payment.accountHolder} onChange={(e) => setPayment({...payment, accountHolder: e.target.value})} /></Form.Group>
                <Form.Group className="mb-2"><Form.Label>금액 (선택 사항)</Form.Label><Form.Control type="number" name="amount" placeholder="10000" value={payment.amount} onChange={(e) => setPayment({...payment, amount: e.target.value})} /></Form.Group>
                <TemplateSelector selected={template} onChange={setTemplate} />
                <Button variant="primary" type="submit" className="mt-3 w-100">QR 코드 생성</Button>
              </Form>
            </Tab>
          </Tabs>
        </Col>
        <Col md={5} className="text-center">
          <div className="qr-code-container d-flex justify-content-center align-items-center">
            <div ref={qrRef}>
              <h4 className="mb-4">생성된 QR 코드</h4>
              {finalQrValue ? 
                <>
                  <QRCode value={finalQrValue} size={256} />
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