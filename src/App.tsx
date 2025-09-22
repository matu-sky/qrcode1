import React, { useState } from 'react';
import { Container, Row, Col, Tabs, Tab, Form } from 'react-bootstrap';
import { QRCodeCanvas as QRCode } from 'qrcode.react';

function App() {
  const [url, setUrl] = useState('');

  return (
    <Container className="mt-5">
      <Row>
        <Col>
          <h1 className="text-center mb-4">QR 코드 생성기</h1>
        </Col>
      </Row>
      <Row>
        <Col md={7}>
          <Tabs defaultActiveKey="url" id="qr-code-tabs" className="mb-3">
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
              {/* 텍스트 입력 폼 (추후 구현) */}
            </Tab>
            <Tab eventKey="vcard" title="명함">
              {/* 명함 입력 폼 (추후 구현) */}
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
            {url && <QRCode value={url} size={256} />}
          </div>
        </Col>
      </Row>
    </Container>
  );
}

export default App;