import React, { useState } from 'react';
import { Container, Row, Col, Tabs, Tab, Form } from 'react-bootstrap';
import { QRCodeCanvas as QRCode } from 'qrcode.react';

// Sub-component for template selection
const TemplateSelector = ({ selected, onChange }: { selected: string, onChange: (val: string) => void }) => (
  <Form.Group className="mt-4">
    <Form.Label>표시 템플릿 선택</Form.Label>
    <div className="d-flex gap-3">
      <Form.Check
        type="radio"
        label="메모"
        name="template"
        value="memo"
        checked={selected === 'memo'}
        onChange={(e) => onChange(e.target.value)}
      />
      <Form.Check
        type="radio"
        label="포스트잇"
        name="template"
        value="sticky-note"
        checked={selected === 'sticky-note'}
        onChange={(e) => onChange(e.target.value)}
      />
      <Form.Check
        type="radio"
        label="영수증"
        name="template"
        value="receipt"
        checked={selected === 'receipt'}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  </Form.Group>
);

export default function HomePage() {
  const [activeTab, setActiveTab] = useState('url');
  const [url, setUrl] = useState('');
  const [text, setText] = useState('');
  const [vCard, setVCard] = useState({
    name: '',
    phone: '',
    email: '',
    org: '',
    title: '',
  });
  const [wifi, setWifi] = useState({
    ssid: '',
    password: '',
    encryption: 'WPA',
  });
  const [payment, setPayment] = useState({
    bank: '',
    accountNumber: '',
    accountHolder: '',
    amount: '',
  });
  const [template, setTemplate] = useState('memo');

  const handleVCardChange = (e: any) => {
    const { name, value } = e.target;
    setVCard({ ...vCard, [name]: value });
  };

  const handleWifiChange = (e: any) => {
    const { name, value } = e.target;
    setWifi({ ...wifi, [name]: value });
  };

  const handlePaymentChange = (e: any) => {
    const { name, value } = e.target;
    setPayment({ ...payment, [name]: value });
  };

  const formatVCard = () => {
    if (Object.values(vCard).every(field => field === '')) return '';
    return `BEGIN:VCARD\nVERSION:3.0\nFN:${vCard.name}\nORG:${vCard.org}\nTITLE:${vCard.title}\nTEL;TYPE=WORK,VOICE:${vCard.phone}\nEMAIL:${vCard.email}\nEND:VCARD`;
  };

  const formatWifi = () => {
    if (!wifi.ssid) return '';
    const escapedSsid = wifi.ssid.replace(/([\\;,"'])/g, '\\$1');
    const escapedPassword = wifi.password.replace(/([\\;,"'])/g, '\\$1');
    return `WIFI:T:${wifi.encryption};S:${escapedSsid};P:${escapedPassword};;`;
  };

  const getQrValue = () => {
    const baseUrl = window.location.origin;
    const displayUrl = `${baseUrl}/display`;

    switch (activeTab) {
      case 'url':
        return url;
      case 'text': {
        if (!text) return '';
        const params = new URLSearchParams();
        params.set('type', 'text');
        params.set('template', template);
        params.set('text', text);
        return `${displayUrl}?${params.toString()}`;
      }
      case 'vcard':
        return formatVCard();
      case 'wifi':
        return formatWifi();
      case 'payment': {
        if (!payment.bank && !payment.accountNumber) return '';
        const params = new URLSearchParams();
        params.set('type', 'payment');
        params.set('template', template);
        params.set('bank', payment.bank);
        params.set('accountNumber', payment.accountNumber);
        if (payment.accountHolder) params.set('accountHolder', payment.accountHolder);
        if (payment.amount) params.set('amount', payment.amount);
        return `${displayUrl}?${params.toString()}`;
      }
      default:
        return '';
    }
  };

  const qrValue = getQrValue();

  return (
    <Container className="mt-5">
      <Row>
        <Col>
          <h1 className="text-center mb-4">QR 코드 생성기</h1>
        </Col>
      </Row>
      <Row>
        <Col md={7}>
          <Tabs
            activeKey={activeTab}
            onSelect={(k) => setActiveTab(k || 'url')}
            id="qr-code-tabs"
            className="mb-3"
          >
            <Tab eventKey="url" title="URL">
              <Form>
                <Form.Group controlId="formUrl">
                  <Form.Label>웹사이트 URL</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="https://example.com"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                  />
                </Form.Group>
              </Form>
            </Tab>
            <Tab eventKey="text" title="텍스트">
              <Form>
                <Form.Group controlId="formText">
                  <Form.Label>내용</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={4}
                    placeholder="QR 코드로 만들 텍스트를 입력하세요."
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                  />
                </Form.Group>
                <TemplateSelector selected={template} onChange={setTemplate} />
              </Form>
            </Tab>
            <Tab eventKey="vcard" title="명함">
              <Form>
                <Form.Group controlId="formVCardName" className="mb-2">
                  <Form.Label>이름</Form.Label>
                  <Form.Control type="text" name="name" placeholder="홍길동" value={vCard.name} onChange={handleVCardChange} />
                </Form.Group>
                <Form.Group controlId="formVCardPhone" className="mb-2">
                  <Form.Label>연락처</Form.Label>
                  <Form.Control type="tel" name="phone" placeholder="010-1234-5678" value={vCard.phone} onChange={handleVCardChange} />
                </Form.Group>
                <Form.Group controlId="formVCardEmail" className="mb-2">
                  <Form.Label>이메일</Form.Label>
                  <Form.Control type="email" name="email" placeholder="hong@example.com" value={vCard.email} onChange={handleVCardChange} />
                </Form.Group>
                <Form.Group controlId="formVCardOrg" className="mb-2">
                  <Form.Label>회사</Form.Label>
                  <Form.Control type="text" name="org" placeholder="주식회사 홍길동" value={vCard.org} onChange={handleVCardChange} />
                </Form.Group>
                <Form.Group controlId="formVCardTitle" className="mb-2">
                  <Form.Label>직책</Form.Label>
                  <Form.Control type="text" name="title" placeholder="대표" value={vCard.title} onChange={handleVCardChange} />
                </Form.Group>
              </Form>
            </Tab>
            <Tab eventKey="wifi" title="Wi-Fi">
              <Form>
                <Form.Group controlId="formWifiSsid" className="mb-2">
                  <Form.Label>네트워크 이름 (SSID)</Form.Label>
                  <Form.Control type="text" name="ssid" placeholder="MyWiFi" value={wifi.ssid} onChange={handleWifiChange} />
                </Form.Group>
                <Form.Group controlId="formWifiPassword" className="mb-2">
                  <Form.Label>비밀번호</Form.Label>
                  <Form.Control type="password" name="password" placeholder="비밀번호" value={wifi.password} onChange={handleWifiChange} />
                </Form.Group>
                <Form.Group controlId="formWifiEncryption" className="mb-2">
                  <Form.Label>암호화 방식</Form.Label>
                  <Form.Select name="encryption" value={wifi.encryption} onChange={handleWifiChange}>
                    <option value="WPA">WPA/WPA2</option>
                    <option value="WEP">WEP</option>
                    <option value="nopass">없음</option>
                  </Form.Select>
                </Form.Group>
              </Form>
            </Tab>
            <Tab eventKey="payment" title="계좌이체">
              <Form>
                <Form.Group controlId="formPaymentBank" className="mb-2">
                  <Form.Label>은행</Form.Label>
                  <Form.Control type="text" name="bank" placeholder="예: 신한은행" value={payment.bank} onChange={handlePaymentChange} />
                </Form.Group>
                <Form.Group controlId="formPaymentAccount" className="mb-2">
                  <Form.Label>계좌번호</Form.Label>
                  <Form.Control type="text" name="accountNumber" placeholder="110-XXX-XXXXXX" value={payment.accountNumber} onChange={handlePaymentChange} />
                </Form.Group>
                <Form.Group controlId="formPaymentAccountHolder" className="mb-2">
                  <Form.Label>예금주</Form.Label>
                  <Form.Control type="text" name="accountHolder" placeholder="홍길동" value={payment.accountHolder} onChange={handlePaymentChange} />
                </Form.Group>
                <Form.Group controlId="formPaymentAmount" className="mb-2">
                  <Form.Label>금액 (선택 사항)</Form.Label>
                  <Form.Control type="number" name="amount" placeholder="10000" value={payment.amount} onChange={handlePaymentChange} />
                </Form.Group>
                <TemplateSelector selected={template} onChange={setTemplate} />
              </Form>
            </Tab>
          </Tabs>
        </Col>
        <Col md={5} className="text-center">
          <h4>생성된 QR 코드</h4>
          <div className="p-3 border rounded">
            {qrValue && <QRCode value={qrValue} size={256} />}
          </div>
        </Col>
      </Row>
    </Container>
  );
}