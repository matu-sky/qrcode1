import React, { useState } from 'react';
import { Container, Row, Col, Tabs, Tab, Form } from 'react-bootstrap';
import { QRCodeCanvas as QRCode } from 'qrcode.react';

function App() {
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

  const handleVCardChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setVCard({ ...vCard, [name]: value });
  };

  const formatVCard = () => {
    // Only generate QR code if at least one field is filled
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

  const getQrValue = () => {
    switch (activeTab) {
      case 'url':
        return url;
      case 'text':
        return text;
      case 'vcard':
        return formatVCard();
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
              {/* Wi-Fi 입력 폼 (추후 구현) */}
            </Tab>
            <Tab eventKey="payment" title="계좌이체">
              {/* 계좌이체 입력 폼 (추후 구현) */}
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

export default App;