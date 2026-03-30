import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Container, Row, Col, Tabs, Tab, Form, Button } from 'react-bootstrap';
import QRCodeStyling, { DotType, CornerSquareType, CornerDotType } from 'qr-code-styling';
import { toPng } from 'html-to-image';
import AppNavbar from '../components/Navbar';

// ===== PRESET DEFINITIONS =====
const QR_PRESETS = [
  { name: '기본', dotType: 'square' as DotType, cornerSquareType: 'square' as CornerSquareType, cornerDotType: 'square' as CornerDotType, fgColor: '#000000', bgColor: '#ffffff', useGradient: false, gradientColor: '#000000' },
  { name: '모던', dotType: 'rounded' as DotType, cornerSquareType: 'extra-rounded' as CornerSquareType, cornerDotType: 'dot' as CornerDotType, fgColor: '#1a1a2e', bgColor: '#ffffff', useGradient: false, gradientColor: '#1a1a2e' },
  { name: '서클', dotType: 'dots' as DotType, cornerSquareType: 'dot' as CornerSquareType, cornerDotType: 'dot' as CornerDotType, fgColor: '#2d3436', bgColor: '#ffffff', useGradient: false, gradientColor: '#2d3436' },
  { name: '클래식', dotType: 'classy' as DotType, cornerSquareType: 'square' as CornerSquareType, cornerDotType: 'square' as CornerDotType, fgColor: '#2c3e50', bgColor: '#ecf0f1', useGradient: false, gradientColor: '#2c3e50' },
  { name: '블루 그라데이션', dotType: 'rounded' as DotType, cornerSquareType: 'extra-rounded' as CornerSquareType, cornerDotType: 'dot' as CornerDotType, fgColor: '#0061ff', bgColor: '#ffffff', useGradient: true, gradientColor: '#60efff' },
  { name: '퍼플 네온', dotType: 'dots' as DotType, cornerSquareType: 'dot' as CornerSquareType, cornerDotType: 'dot' as CornerDotType, fgColor: '#7b2ff7', bgColor: '#ffffff', useGradient: true, gradientColor: '#c471f5' },
  { name: '선셋', dotType: 'extra-rounded' as DotType, cornerSquareType: 'extra-rounded' as CornerSquareType, cornerDotType: 'dot' as CornerDotType, fgColor: '#ff6b6b', bgColor: '#ffffff', useGradient: true, gradientColor: '#ffd93d' },
  { name: '포레스트', dotType: 'classy-rounded' as DotType, cornerSquareType: 'extra-rounded' as CornerSquareType, cornerDotType: 'dot' as CornerDotType, fgColor: '#0b8457', bgColor: '#ffffff', useGradient: true, gradientColor: '#6fffe9' },
  { name: '다크모드', dotType: 'rounded' as DotType, cornerSquareType: 'extra-rounded' as CornerSquareType, cornerDotType: 'dot' as CornerDotType, fgColor: '#e0e0e0', bgColor: '#1a1a2e', useGradient: false, gradientColor: '#e0e0e0' },
  { name: '로즈골드', dotType: 'extra-rounded' as DotType, cornerSquareType: 'dot' as CornerSquareType, cornerDotType: 'dot' as CornerDotType, fgColor: '#b76e79', bgColor: '#fff5f5', useGradient: true, gradientColor: '#ebc4c8' },
  { name: '오션', dotType: 'dots' as DotType, cornerSquareType: 'extra-rounded' as CornerSquareType, cornerDotType: 'dot' as CornerDotType, fgColor: '#0077b6', bgColor: '#ffffff', useGradient: true, gradientColor: '#00b4d8' },
  { name: '미니멀', dotType: 'square' as DotType, cornerSquareType: 'square' as CornerSquareType, cornerDotType: 'square' as CornerDotType, fgColor: '#555555', bgColor: '#fafafa', useGradient: false, gradientColor: '#555555' },
];

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

// QR Code Style Customizer Component
const QrStyleCustomizer = ({
  qrFgColor, setQrFgColor, qrBgColor, setQrBgColor, qrSize, setQrSize,
  qrLogoUrl, setQrLogoUrl, dotType, setDotType, cornerSquareType, setCornerSquareType,
  cornerDotType, setCornerDotType, useGradient, setUseGradient, gradientColor, setGradientColor
}: any) => (
  <Form.Group className="mt-3 p-3 border rounded" style={{ backgroundColor: '#f0f4ff' }}>
    <Form.Label className="fw-bold">세부 디자인 조정</Form.Label>
    <Row className="mb-2">
      <Col>
        <Form.Label>QR 색상</Form.Label>
        <Form.Control type="color" value={qrFgColor} onChange={(e) => setQrFgColor(e.target.value)} />
      </Col>
      <Col>
        <Form.Label>배경 색상</Form.Label>
        <Form.Control type="color" value={qrBgColor} onChange={(e) => setQrBgColor(e.target.value)} />
      </Col>
      <Col>
        <Form.Label>크기</Form.Label>
        <Form.Select value={qrSize} onChange={(e) => setQrSize(Number(e.target.value))}>
          <option value={128}>작게 (128)</option>
          <option value={192}>중간 (192)</option>
          <option value={256}>기본 (256)</option>
          <option value={320}>크게 (320)</option>
          <option value={400}>매우 크게 (400)</option>
        </Form.Select>
      </Col>
    </Row>
    <Row className="mb-2">
      <Col>
        <Form.Label>도트 스타일</Form.Label>
        <Form.Select value={dotType} onChange={(e) => setDotType(e.target.value)}>
          <option value="square">사각형</option>
          <option value="dots">원형</option>
          <option value="rounded">둥근 사각</option>
          <option value="extra-rounded">매우 둥근</option>
          <option value="classy">클래식</option>
          <option value="classy-rounded">클래식 둥근</option>
        </Form.Select>
      </Col>
      <Col>
        <Form.Label>코너 스타일</Form.Label>
        <Form.Select value={cornerSquareType} onChange={(e) => setCornerSquareType(e.target.value)}>
          <option value="square">사각형</option>
          <option value="dot">원형</option>
          <option value="extra-rounded">둥근</option>
        </Form.Select>
      </Col>
      <Col>
        <Form.Label>코너 도트</Form.Label>
        <Form.Select value={cornerDotType} onChange={(e) => setCornerDotType(e.target.value)}>
          <option value="square">사각형</option>
          <option value="dot">원형</option>
        </Form.Select>
      </Col>
    </Row>
    <Row className="mb-2">
      <Col>
        <Form.Check
          type="switch"
          label="그라데이션 사용"
          checked={useGradient}
          onChange={(e) => setUseGradient(e.target.checked)}
        />
      </Col>
      {useGradient && (
        <Col>
          <Form.Label>그라데이션 끝 색상</Form.Label>
          <Form.Control type="color" value={gradientColor} onChange={(e) => setGradientColor(e.target.value)} />
        </Col>
      )}
    </Row>
    <Form.Group>
      <Form.Label>중앙 로고 URL (선택 사항)</Form.Label>
      <Form.Control
        type="url"
        placeholder="https://example.com/logo.png"
        value={qrLogoUrl}
        onChange={(e) => setQrLogoUrl(e.target.value)}
      />
      <Form.Text className="text-muted">로고 이미지 URL을 입력하면 QR 코드 가운데에 표시됩니다.</Form.Text>
    </Form.Group>
  </Form.Group>
);

// Sub-component for template selection
const TemplateSelector = ({ selected, onChange, type }: { selected: string, onChange: (val: string) => void, type?: string }) => (
  <Form.Group className="mt-4">
    <Form.Label>표시 템플릿 선택</Form.Label>
    <div className="d-flex flex-wrap gap-3">
      {type === 'payment' ? (
        <>
          <Form.Check type="radio" label="모던 카드" name="template" value="web-payment" checked={selected === 'web-payment'} onChange={(e) => onChange(e.target.value)} />
          <Form.Check type="radio" label="심플 화이트" name="template" value="web-payment-simple" checked={selected === 'web-payment-simple'} onChange={(e) => onChange(e.target.value)} />
          <Form.Check type="radio" label="프리미엄 다크" name="template" value="web-payment-dark" checked={selected === 'web-payment-dark'} onChange={(e) => onChange(e.target.value)} />
          <Form.Check type="radio" label="계좌 정보" name="template" value="bank-info-card" checked={selected === 'bank-info-card'} onChange={(e) => onChange(e.target.value)} />
          <Form.Check type="radio" label="영수증" name="template" value="receipt" checked={selected === 'receipt'} onChange={(e) => onChange(e.target.value)} />
        </>
      ) : (
        <>
          <Form.Check type="radio" label="웹 페이지" name="template" value="web-payment" checked={selected === 'web-payment'} onChange={(e) => onChange(e.target.value)} />
          <Form.Check type="radio" label="계좌 정보" name="template" value="bank-info-card" checked={selected === 'bank-info-card'} onChange={(e) => onChange(e.target.value)} />
          <Form.Check type="radio" label="메모" name="template" value="memo" checked={selected === 'memo'} onChange={(e) => onChange(e.target.value)} />
          <Form.Check type="radio" label="포스트잇" name="template" value="sticky-note" checked={selected === 'sticky-note'} onChange={(e) => onChange(e.target.value)} />
          <Form.Check type="radio" label="영수증" name="template" value="receipt" checked={selected === 'receipt'} onChange={(e) => onChange(e.target.value)} />
        </>
      )}
    </div>
  </Form.Group>
);

// Feature Card Component
const FeatureCard = ({ icon, title, description, onClick }: { icon: string, title: string, description: string, onClick?: () => void }) => (
  <div className="feature-card" onClick={onClick} style={{ cursor: onClick ? 'pointer' : 'default' }}>
    <div className="feature-icon">{icon}</div>
    <h3 className="feature-title">{title}</h3>
    <p className="feature-desc">{description}</p>
  </div>
);

export default function HomePage() {
  const [activeTab, setActiveTab] = useState('url');
  const [finalQrValue, setFinalQrValue] = useState('');
  const qrRef = useRef<HTMLDivElement>(null);
  const qrCanvasRef = useRef<HTMLDivElement>(null);
  const generatorRef = useRef<HTMLDivElement>(null);
  const qrCodeInstance = useRef<QRCodeStyling | null>(null);
  const previewRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});

  // Form states
  const [url, setUrl] = useState('');
  const [text, setText] = useState('');
  const [vCard, setVCard] = useState({
    name: '', title: '', org: '', phone: '', workPhone: '', fax: '', email: '', website: '', address: ''
  });
  const [wifi, setWifi] = useState({ ssid: '', password: '', encryption: 'WPA' });
  const [payment, setPayment] = useState({ bank: '', accountNumber: '', accountHolder: '', amount: '' });
  const [sms, setSms] = useState({ phone: '', message: '' });
  const [template, setTemplate] = useState('memo');
  const [backgroundUrl, setBackgroundUrl] = useState('');

  // Memo states
  const [memo, setMemo] = useState('');
  const [memoColor, setMemoColor] = useState('#000000');
  const [memoSize, setMemoSize] = useState('1.25rem');
  const [displayMemo, setDisplayMemo] = useState({ text: '', color: '', size: '' });

  // QR style states
  const [qrFgColor, setQrFgColor] = useState('#000000');
  const [qrBgColor, setQrBgColor] = useState('#ffffff');
  const [qrSize, setQrSize] = useState(256);
  const [qrLogoUrl, setQrLogoUrl] = useState('');
  const [dotType, setDotType] = useState<DotType>('square');
  const [cornerSquareType, setCornerSquareType] = useState<CornerSquareType>('square');
  const [cornerDotType, setCornerDotType] = useState<CornerDotType>('square');
  const [useGradient, setUseGradient] = useState(false);
  const [gradientColor, setGradientColor] = useState('#0000ff');
  const [selectedPreset, setSelectedPreset] = useState('기본');

  // Preset preview rendering
  useEffect(() => {
    QR_PRESETS.forEach((preset) => {
      const container = previewRefs.current[preset.name];
      if (!container || container.childNodes.length > 0) return;

      const dotsOptions: any = { type: preset.dotType };
      if (preset.useGradient) {
        dotsOptions.gradient = {
          type: 'linear', rotation: Math.PI / 4,
          colorStops: [{ offset: 0, color: preset.fgColor }, { offset: 1, color: preset.gradientColor }],
        };
      } else {
        dotsOptions.color = preset.fgColor;
      }

      const qr = new QRCodeStyling({
        width: 80, height: 80, data: 'https://example.com',
        dotsOptions,
        backgroundOptions: { color: preset.bgColor },
        cornersSquareOptions: { type: preset.cornerSquareType, color: preset.fgColor },
        cornersDotOptions: { type: preset.cornerDotType, color: preset.fgColor },
        qrOptions: { errorCorrectionLevel: 'M' },
      });
      qr.append(container);
    });
  }, []);

  const applyPreset = (preset: typeof QR_PRESETS[0]) => {
    setSelectedPreset(preset.name);
    setQrFgColor(preset.fgColor);
    setQrBgColor(preset.bgColor);
    setDotType(preset.dotType);
    setCornerSquareType(preset.cornerSquareType);
    setCornerDotType(preset.cornerDotType);
    setUseGradient(preset.useGradient);
    setGradientColor(preset.gradientColor);
  };

  const getQrOptions = useCallback(() => {
    const dotsOptions: any = { type: dotType };
    if (useGradient) {
      dotsOptions.gradient = {
        type: 'linear', rotation: Math.PI / 4,
        colorStops: [{ offset: 0, color: qrFgColor }, { offset: 1, color: gradientColor }],
      };
    } else {
      dotsOptions.color = qrFgColor;
    }

    return {
      width: qrSize, height: qrSize,
      data: finalQrValue || 'https://example.com',
      dotsOptions,
      backgroundOptions: { color: qrBgColor },
      cornersSquareOptions: { type: cornerSquareType, color: qrFgColor },
      cornersDotOptions: { type: cornerDotType, color: qrFgColor },
      imageOptions: { crossOrigin: 'anonymous' as const, margin: 5, imageSize: 0.4 },
      ...(qrLogoUrl ? { image: qrLogoUrl } : {}),
      qrOptions: { errorCorrectionLevel: qrLogoUrl ? 'H' as const : 'M' as const },
    };
  }, [finalQrValue, qrFgColor, qrBgColor, qrSize, dotType, cornerSquareType, cornerDotType, useGradient, gradientColor, qrLogoUrl]);

  useEffect(() => {
    if (!finalQrValue || !qrCanvasRef.current) return;
    const options = getQrOptions();
    if (!qrCodeInstance.current) {
      qrCodeInstance.current = new QRCodeStyling(options);
      qrCanvasRef.current.innerHTML = '';
      qrCodeInstance.current.append(qrCanvasRef.current);
    } else {
      qrCodeInstance.current.update(options);
    }
  }, [finalQrValue, getQrOptions]);

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
    qrCodeInstance.current = null;
    if (newTab === 'payment') { setTemplate('web-payment'); } else { setTemplate('memo'); }
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
        .catch((err) => { console.error('oops, something went wrong!', err); });
    }
  };

  const handleGenerate = () => {
    setDisplayMemo({ text: memo, color: memoColor, size: memoSize });
    qrCodeInstance.current = null;
    if (qrCanvasRef.current) qrCanvasRef.current.innerHTML = '';
    const baseUrl = window.location.origin;
    const displayUrl = `${baseUrl}/display`;

    switch (activeTab) {
      case 'url': setFinalQrValue(url); break;
      case 'text': {
        if (!text) return;
        const params = new URLSearchParams();
        params.set('type', 'text'); params.set('template', template); params.set('text', text);
        setFinalQrValue(`${displayUrl}?${params.toString()}`); break;
      }
      case 'vcard': {
        if (Object.values(vCard).every(field => field === '')) return;
        const params = new URLSearchParams();
        params.set('type', 'vcard');
        if (vCard.name) params.set('name', vCard.name);
        if (vCard.org) params.set('org', vCard.org);
        if (vCard.title) params.set('title', vCard.title);
        if (vCard.phone) params.set('phone', vCard.phone);
        if (vCard.workPhone) params.set('workPhone', vCard.workPhone);
        if (vCard.fax) params.set('fax', vCard.fax);
        if (vCard.email) params.set('email', vCard.email);
        if (vCard.website) params.set('website', vCard.website);
        if (vCard.address) params.set('address', vCard.address);
        setFinalQrValue(`${displayUrl}?${params.toString()}`); break;
      }
      case 'wifi': {
        if (!wifi.ssid) return;
        const escapedSsid = wifi.ssid.replace(/([\\;,"'])/g, '\\$1');
        const escapedPassword = wifi.password.replace(/([\\;,"'])/g, '\\$1');
        setFinalQrValue(`WIFI:T:${wifi.encryption};S:${escapedSsid};P:${escapedPassword};;`); break;
      }
      case 'payment': {
        if (!payment.bank && !payment.accountNumber) return;
        const params = new URLSearchParams();
        params.set('type', 'payment'); params.set('template', template);
        params.set('bank', payment.bank); params.set('accountNumber', payment.accountNumber);
        if (payment.accountHolder) params.set('accountHolder', payment.accountHolder);
        if (payment.amount) params.set('amount', payment.amount);
        if ((template === 'web-payment' || template === 'web-payment-simple' || template === 'web-payment-dark') && backgroundUrl) { params.set('bg', backgroundUrl); }
        setFinalQrValue(`${displayUrl}?${params.toString()}`); break;
      }
      case 'sms': {
        if (!sms.phone) return;
        setFinalQrValue(`SMSTO:${sms.phone}:${sms.message}`); break;
      }
      default: setFinalQrValue('');
    }
  };

  const scrollToGenerator = () => {
    generatorRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const goToTab = (tabKey: string) => {
    setActiveTab(tabKey);
    setFinalQrValue('');
    setMemo('');
    setDisplayMemo({ text: '', color: '', size: '' });
    setMemoColor('#000000');
    setMemoSize('1.25rem');
    qrCodeInstance.current = null;
    if (tabKey === 'payment') { setTemplate('web-payment'); } else { setTemplate('memo'); }
    setTimeout(() => {
      generatorRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

return (
    <>
      <AppNavbar />

      {/* ===== HERO SECTION ===== */}
      <section className="hero-section">
        <div className="hero-bg-pattern"></div>
        <Container className="hero-content">
          <div className="hero-badge">무료 QR 코드 생성기</div>
          <h1 className="hero-title">
            모든 것을 <span className="hero-highlight">QR 코드</span>로
          </h1>
          <p className="hero-subtitle">
            URL, 명함, Wi-Fi, 계좌이체, 메뉴판까지<br />
            몇 초 만에 전문적인 QR 코드를 만들어 보세요.
          </p>
          <div className="hero-buttons">
            <Button className="hero-cta-primary" onClick={scrollToGenerator}>
              지금 만들기
              <span className="cta-arrow">↓</span>
            </Button>
            <Button className="hero-cta-secondary" href="/menu">
              메뉴판 만들기
            </Button>
          </div>
          <div className="hero-stats">
            <div className="stat-item">
              <span className="stat-number">6가지</span>
              <span className="stat-label">QR 유형 지원</span>
            </div>
            <div className="stat-divider"></div>
            <div className="stat-item">
              <span className="stat-number">100%</span>
              <span className="stat-label">무료 사용</span>
            </div>
            <div className="stat-divider"></div>
            <div className="stat-item">
              <span className="stat-number">즉시</span>
              <span className="stat-label">다운로드</span>
            </div>
          </div>
        </Container>
      </section>

      {/* ===== FEATURES SECTION ===== */}
      <section className="features-section">
        <Container>
          <h2 className="section-title">다양한 QR 코드를 한 곳에서</h2>
          <p className="section-subtitle">필요한 모든 QR 코드 유형을 지원합니다</p>
          <div className="features-grid">
            <FeatureCard icon="🔗" title="URL" description="웹사이트, SNS, 블로그 등 모든 링크를 QR로 변환하세요." onClick={() => goToTab('url')} />
            <FeatureCard icon="💳" title="계좌이체" description="은행 계좌 정보를 담아 간편 송금 QR을 만드세요." onClick={() => goToTab('payment')} />
            <FeatureCard icon="📇" title="명함 (vCard)" description="이름, 연락처, 이메일 등 명함 정보를 담은 QR을 만드세요." onClick={() => goToTab('vcard')} />
            <FeatureCard icon="📶" title="Wi-Fi" description="Wi-Fi 비밀번호를 QR로 만들어 손님에게 공유하세요." onClick={() => goToTab('wifi')} />
            <FeatureCard icon="💬" title="SMS" description="전화번호와 메시지를 담은 문자 발송 QR을 만드세요." onClick={() => goToTab('sms')} />
            <FeatureCard icon="🍽️" title="메뉴판" description="매장/포장 가격이 분리된 디지털 메뉴판을 만드세요." onClick={() => window.location.href = '/menu'} />
          </div>
        </Container>
      </section>

      {/* ===== QR GENERATOR SECTION ===== */}
      <section className="generator-section" ref={generatorRef}>
        <Container className="main-container">
          <Row>
            <Col><h2 className="text-center main-header">QR 코드 생성하기</h2></Col>
          </Row>

          {/* STEP 1: 내용 입력 */}
          <Row>
            <Col md={7}>
              <h5 className="mb-3" style={{ fontWeight: 600, color: '#2c3e50' }}>① 내용 입력</h5>
              <Tabs activeKey={activeTab} onSelect={handleTabSelect} id="qr-code-tabs" className="mb-4 custom-tabs">
                <Tab eventKey="url" title="URL">
                  <div className="p-2">
                    <Form.Group controlId="formUrl"><Form.Label>웹사이트 URL</Form.Label><Form.Control type="text" placeholder="https://example.com" value={url} onChange={(e) => setUrl(e.target.value)} /></Form.Group>
                    <MemoCustomizer memo={memo} setMemo={setMemo} color={memoColor} setColor={setMemoColor} size={memoSize} setSize={setMemoSize} />
                  </div>
                </Tab>
                <Tab eventKey="text" title="텍스트">
                  <div className="p-2">
                    <Form.Group controlId="formText"><Form.Label>내용</Form.Label><Form.Control as="textarea" rows={3} placeholder="QR 코드로 만들 텍스트를 입력하세요." value={text} onChange={(e) => setText(e.target.value)} /></Form.Group>
                    <TemplateSelector selected={template} onChange={setTemplate} />
                    <MemoCustomizer memo={memo} setMemo={setMemo} color={memoColor} setColor={setMemoColor} size={memoSize} setSize={setMemoSize} />
                  </div>
                </Tab>
                <Tab eventKey="sms" title="SMS">
                  <div className="p-2">
                    <Form.Group className="mb-2"><Form.Label>전화번호</Form.Label><Form.Control type="tel" placeholder="010-1234-5678" value={sms.phone} onChange={(e) => setSms({...sms, phone: e.target.value})} /></Form.Group>
                    <Form.Group className="mb-2"><Form.Label>메시지 내용</Form.Label><Form.Control as="textarea" rows={3} placeholder="보낼 메시지를 입력하세요." value={sms.message} onChange={(e) => setSms({...sms, message: e.target.value})} /></Form.Group>
                    <MemoCustomizer memo={memo} setMemo={setMemo} color={memoColor} setColor={setMemoColor} size={memoSize} setSize={setMemoSize} />
                  </div>
                </Tab>
                <Tab eventKey="vcard" title="명함">
                  <div className="p-2">
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
                  </div>
                </Tab>
                <Tab eventKey="wifi" title="Wi-Fi">
                  <div className="p-2">
                    <Form.Group className="mb-2"><Form.Label>네트워크 이름 (SSID)</Form.Label><Form.Control type="text" name="ssid" placeholder="MyWiFi" value={wifi.ssid} onChange={(e) => setWifi({...wifi, ssid: e.target.value})} /></Form.Group>
                    <Form.Group className="mb-2"><Form.Label>비밀번호</Form.Label><Form.Control type="password" name="password" placeholder="비밀번호" value={wifi.password} onChange={(e) => setWifi({...wifi, password: e.target.value})} /></Form.Group>
                    <Form.Group className="mb-2"><Form.Label>암호화 방식</Form.Label><Form.Select name="encryption" value={wifi.encryption} onChange={(e) => setWifi({...wifi, encryption: e.target.value})}><option value="WPA">WPA/WPA2</option><option value="WEP">WEP</option><option value="nopass">없음</option></Form.Select></Form.Group>
                    <MemoCustomizer memo={memo} setMemo={setMemo} color={memoColor} setColor={setMemoColor} size={memoSize} setSize={setMemoSize} />
                  </div>
                </Tab>
                <Tab eventKey="payment" title="계좌이체">
                  <div className="p-2">
                    <Form.Group className="mb-2"><Form.Label>은행</Form.Label><Form.Control type="text" name="bank" placeholder="예: 신한은행" value={payment.bank} onChange={(e) => setPayment({...payment, bank: e.target.value})} /></Form.Group>
                    <Form.Group className="mb-2"><Form.Label>계좌번호</Form.Label><Form.Control type="text" name="accountNumber" placeholder="110-XXX-XXXXXX" value={payment.accountNumber} onChange={(e) => setPayment({...payment, accountNumber: e.target.value})} /></Form.Group>
                    <Form.Group className="mb-2"><Form.Label>예금주</Form.Label><Form.Control type="text" name="accountHolder" placeholder="홍길동" value={payment.accountHolder} onChange={(e) => setPayment({...payment, accountHolder: e.target.value})} /></Form.Group>
                    <Form.Group className="mb-2"><Form.Label>금액 (선택 사항)</Form.Label><Form.Control type="number" name="amount" placeholder="10000" value={payment.amount} onChange={(e) => setPayment({...payment, amount: e.target.value})} /></Form.Group>
                    <TemplateSelector selected={template} onChange={setTemplate} type="payment" />
                    {(template === 'web-payment' || template === 'web-payment-simple' || template === 'web-payment-dark') && 
                      <Form.Group className="mt-3"><Form.Label>배경 이미지 URL (선택 사항)</Form.Label><Form.Control type="url" placeholder="https://example.com/image.png" value={backgroundUrl} onChange={(e) => setBackgroundUrl(e.target.value)} /></Form.Group>
                    }
                    <MemoCustomizer memo={memo} setMemo={setMemo} color={memoColor} setColor={setMemoColor} size={memoSize} setSize={setMemoSize} />
                  </div>
                </Tab>
              </Tabs>

              {/* STEP 2: 디자인 선택 */}
              <h5 className="mb-3 mt-4" style={{ fontWeight: 600, color: '#2c3e50' }}>② 디자인 선택</h5>
              <div className="preset-grid">
                {QR_PRESETS.map((preset) => (
                  <div
                    key={preset.name}
                    className={`preset-card ${selectedPreset === preset.name ? 'preset-active' : ''}`}
                    onClick={() => applyPreset(preset)}
                  >
                    <div
                      className="preset-preview"
                      style={{ backgroundColor: preset.bgColor }}
                      ref={(el) => { previewRefs.current[preset.name] = el; }}
                    ></div>
                    <span className="preset-name">{preset.name}</span>
                  </div>
                ))}
              </div>

              {/* 세부 조정 */}
              <QrStyleCustomizer
                qrFgColor={qrFgColor} setQrFgColor={setQrFgColor}
                qrBgColor={qrBgColor} setQrBgColor={setQrBgColor}
                qrSize={qrSize} setQrSize={setQrSize}
                qrLogoUrl={qrLogoUrl} setQrLogoUrl={setQrLogoUrl}
                dotType={dotType} setDotType={setDotType}
                cornerSquareType={cornerSquareType} setCornerSquareType={setCornerSquareType}
                cornerDotType={cornerDotType} setCornerDotType={setCornerDotType}
                useGradient={useGradient} setUseGradient={setUseGradient}
                gradientColor={gradientColor} setGradientColor={setGradientColor}
              />

              {/* STEP 3: 생성 버튼 */}
              <Button
                style={{ borderRadius: 0, fontSize: '1.1rem', padding: '0.9rem' }}
                variant="primary"
                className="mt-4 w-100"
                onClick={handleGenerate}
              >
                QR 코드 생성하기
              </Button>
            </Col>

            <Col md={5} className="text-center">
              <div className="qr-code-container d-flex justify-content-center align-items-center">
                <div className="text-center">
                  <h4 className="mb-3">생성된 QR 코드</h4>
                  {finalQrValue ?
                    <>
                      <div ref={qrRef} className="qr-code-wrapper p-3 d-inline-block" style={{ backgroundColor: qrBgColor }}>
                        {displayMemo.text && <p className="qr-memo mb-2" style={{ color: displayMemo.color, fontSize: displayMemo.size }}>{displayMemo.text}</p>}
                        <div ref={qrCanvasRef}></div>
                      </div>
                      <br />
                      <Button style={{borderRadius: 0}} variant="secondary" onClick={handleDownload} className="mt-3">다운로드</Button>
                    </>
                    :
                    <p className="qr-code-placeholder">내용 입력 후 'QR 코드 생성하기' 버튼을 눌러주세요.</p>
                  }
                </div>
              </div>
            </Col>
          </Row>
        </Container>
      </section>

      {/* ===== FOOTER ===== */}
      <footer className="site-footer">
        <Container>
          <div className="footer-content">
            <p className="footer-brand">QR Code Generator</p>
            <p className="footer-copy">&copy; {new Date().getFullYear()} All rights reserved.</p>
          </div>
        </Container>
      </footer>
    </>
  );
}
