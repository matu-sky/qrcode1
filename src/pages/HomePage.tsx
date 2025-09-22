import React, { useState } from 'react';
import { Container, Row, Col, Tabs, Tab, Form } from 'react-bootstrap';
import { QRCodeCanvas as QRCode } from 'qrcode.react';

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
    accountHolder: '', // Added field
    amount: '',
  });

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
    if (Object.values(vCard).every(field => field === '')) {
      return '';
    }
    return `BEGIN:VCARD
VERSION:3.0
FN:${vCard.name}
ORG:${vCard.org}
TITLE:${vCard.title}
TEL;TYPE=WORK,VOICE:${vCard.phone}
EMAIL:${vCard.email}
END:VCARD`;
  };

  const formatWifi = () => {
    if (!wifi.ssid) {
      return '';
    }
    const escapedSsid = wifi.ssid.replace(/([\\;,"'])/g, '\\$1');
    const escapedPassword = wifi.password.replace(/([\\;,"'])/g, '\\$1');
    return `WIFI:T:${wifi.encryption};S:${escapedSsid};P:${escapedPassword};;`;
  };

  const formatPayment = () => {
    if (!payment.bank && !payment.accountNumber) {
      return '';
    }
    let paymentInfo = `은행: ${payment.bank}\n계좌번호: ${payment.accountNumber}`;
    if (payment.accountHolder) { // Added line
      paymentInfo += `\n예금주: ${payment.accountHolder}`;
    }
    if (payment.amount) {
      paymentInfo += `\n금액: ${payment.amount}원`;
    }
    return paymentInfo;
  };

  const getQrValue = () => {
    switch (activeTab) {
      case 'url':
        return url;
      case 'text':
        return text;
      case 'vcard':
        return formatVCard();
      case 'wifi':
        return formatWifi();
      case 'payment':
        return formatPayment();
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