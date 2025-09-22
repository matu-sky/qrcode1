import React, { useState, useRef } from 'react';
import { Container, Row, Col, Tabs, Tab, Form, Button } from 'react-bootstrap';
import { QRCodeCanvas as QRCode } from 'qrcode.react';

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
        <Form.Control type="color" value={color} onChange={(e) => setColor(e.target.value)} />
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
  const [vCard, setVCard] = useState({ name: '', phone: '', email: '', org: '', title: '' });
  const [wifi, setWifi] = useState({ ssid: '', password: '', encryption: 'WPA' });
  const [payment, setPayment] = useState({ bank: '', accountNumber: '', accountHolder: '', amount: '' });
  const [sms, setSms] = useState({ phone: '', message: '' });
  const [template, setTemplate] = useState('memo');
  
  // Memo states
  const [memo, setMemo] = useState('');
  const [memoColor, setMemoColor] = useState('#000000');
  const [memoSize, setMemoSize] = useState('1.25rem');
  const [displayMemo, setDisplayMemo] = useState({ text: '', color: '', size: '' });

  const handleTabSelect = (k: string | null) => {
    setActiveTab(k || 'url');
    setFinalQrValue('');
    setMemo('');
    setDisplayMemo({ text: '', color: '', size: '' });
    setMemoColor('#000000');
    setMemoSize('1.25rem');
  };

  const handleDownload = () => { /* ... */ };

  const handleGenerate = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setDisplayMemo({ text: memo, color: memoColor, size: memoSize });
    // ... (rest of the generate logic)
  };

  return (
    <Container className="main-container">
      <Row>
        <Col><h1 className="text-center main-header">QR 코드 생성기</h1></Col>
      </Row>
      <Row>
        <Col md={7}>
          <Tabs activeKey={activeTab} onSelect={handleTabSelect} id="qr-code-tabs" className="mb-4 custom-tabs">
            {/* URL Tab */}
            <Tab eventKey="url" title="URL">
              <Form onSubmit={handleGenerate} className="p-2">
                <Form.Group controlId="formUrl"><Form.Label>웹사이트 URL</Form.Label><Form.Control type="text" placeholder="https://example.com" value={url} onChange={(e) => setUrl(e.target.value)} /></Form.Group>
                <MemoCustomizer memo={memo} setMemo={setMemo} color={memoColor} setColor={setMemoColor} size={memoSize} setSize={setMemoSize} />
                <Button variant="primary" type="submit" className="mt-4 w-100">QR 코드 생성</Button>
              </Form>
            </Tab>
            {/* Other Tabs with MemoCustomizer... */}
          </Tabs>
        </Col>
        <Col md={5} className="text-center">
          <div className="qr-code-container d-flex justify-content-center align-items-center">
            <div ref={qrRef} className="text-center">
              <h4 className="mb-3">생성된 QR 코드</h4>
              {finalQrValue ? 
                <>
                  {displayMemo.text && <p className="qr-memo mb-2" style={{ color: displayMemo.color, fontSize: displayMemo.size }}>{displayMemo.text}</p>}
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
