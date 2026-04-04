import React, { useState, useRef } from 'react';
import { Container, Button } from 'react-bootstrap';
import { Html5Qrcode, Html5QrcodeSupportedFormats } from 'html5-qrcode';
import AppNavbar from '../components/Navbar';

type ResultType = 'url' | 'text' | 'wifi' | 'vcard' | 'payment' | 'phone' | 'email';

interface ScanResult {
  raw: string;
  type: ResultType;
  parsed: Record<string, string>;
}

function detectType(text: string): ScanResult {
  const trimmed = text.trim();

  if (/^https?:\/\//i.test(trimmed)) {
    return { raw: trimmed, type: 'url', parsed: { url: trimmed } };
  }
  if (trimmed.startsWith('WIFI:')) {
    const ssid = trimmed.match(/S:(.*?);/)?.[1] || '';
    const pass = trimmed.match(/P:(.*?);/)?.[1] || '';
    const type = trimmed.match(/T:(.*?);/)?.[1] || '';
    return { raw: trimmed, type: 'wifi', parsed: { ssid, password: pass, encryption: type } };
  }
  if (trimmed.startsWith('BEGIN:VCARD')) {
    const name = trimmed.match(/FN:(.*)/m)?.[1] || '';
    const tel = trimmed.match(/TEL.*?:(.*)/m)?.[1] || '';
    const email = trimmed.match(/EMAIL.*?:(.*)/m)?.[1] || '';
    const org = trimmed.match(/ORG:(.*)/m)?.[1] || '';
    return { raw: trimmed, type: 'vcard', parsed: { name, tel, email, org } };
  }
  if (trimmed.includes('bank=') && trimmed.includes('account=')) {
    const params = new URLSearchParams(trimmed.includes('?') ? trimmed.split('?')[1] : trimmed);
    return {
      raw: trimmed,
      type: 'payment',
      parsed: {
        bank: params.get('bank') || '',
        account: params.get('account') || '',
        holder: params.get('holder') || '',
        amount: params.get('amount') || '',
      },
    };
  }
  if (/^tel:/i.test(trimmed)) {
    return { raw: trimmed, type: 'phone', parsed: { phone: trimmed.replace(/^tel:/i, '') } };
  }
  if (/^mailto:/i.test(trimmed)) {
    return { raw: trimmed, type: 'email', parsed: { email: trimmed.replace(/^mailto:/i, '') } };
  }
  return { raw: trimmed, type: 'text', parsed: { text: trimmed } };
}

export default function ScanPage() {
  const [result, setResult] = useState<ScanResult | null>(null);
  const [error, setError] = useState<string>('');
  const [copied, setCopied] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setError('');
    setResult(null);
    setIsProcessing(true);

    try {
      const html5QrCode = new Html5Qrcode('qr-file-reader', {
        formatsToSupport: [Html5QrcodeSupportedFormats.QR_CODE],
        verbose: false,
      });
      const decoded = await html5QrCode.scanFile(file, true);
      const scanResult = detectType(decoded);
      setResult(scanResult);
      html5QrCode.clear();
    } catch (err) {
      setError('QR코드를 인식할 수 없습니다. 다른 이미지로 시도해 주세요.');
    } finally {
      setIsProcessing(false);
    }

    e.target.value = '';
  };

  const handleCopy = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      const textarea = document.createElement('textarea');
      textarea.value = text;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const resetScan = () => {
    setResult(null);
    setError('');
  };

  const renderResult = () => {
    if (!result) return null;

    return (
      <>
        {/* URL일 때 위쪽에 열기 버튼 크게 */}
        {result.type === 'url' && (
          <div className="scan-tab-content">
            <Button
              className="scan-btn-primary scan-btn-large w-100"
              onClick={() => window.open(result.parsed.url, '_blank')}
            >
              열기
            </Button>
          </div>
        )}

        <div className="scan-result-card">
          <h5 className="scan-result-title">
            {result.type === 'url' && '🔗 URL'}
            {result.type === 'text' && '📝 텍스트'}
            {result.type === 'wifi' && '📶 Wi-Fi'}
            {result.type === 'vcard' && '👤 명함'}
            {result.type === 'payment' && '💰 계좌이체'}
            {result.type === 'phone' && '📞 전화번호'}
            {result.type === 'email' && '📧 이메일'}
          </h5>

          {result.type === 'url' && (
            <div className="scan-result-body">
              <p className="scan-result-text">{result.parsed.url}</p>
              <Button className="scan-btn-secondary w-100" onClick={() => handleCopy(result.parsed.url)}>
                {copied ? '✓ 복사됨' : '복사'}
              </Button>
            </div>
          )}

          {result.type === 'text' && (
            <div className="scan-result-body">
              <p className="scan-result-text">{result.parsed.text}</p>
              <Button className="scan-btn-secondary w-100" onClick={() => handleCopy(result.parsed.text)}>
                {copied ? '✓ 복사됨' : '복사'}
              </Button>
            </div>
          )}

          {result.type === 'wifi' && (
            <div className="scan-result-body">
              <div className="scan-info-grid">
                <span className="scan-info-label">네트워크</span>
                <span className="scan-info-value">{result.parsed.ssid}</span>
                <span className="scan-info-label">비밀번호</span>
                <span className="scan-info-value">{result.parsed.password || '없음'}</span>
                <span className="scan-info-label">보안</span>
                <span className="scan-info-value">{result.parsed.encryption || 'None'}</span>
              </div>
              <Button className="scan-btn-secondary w-100 mt-3" onClick={() => handleCopy(result.parsed.password || '')}>
                {copied ? '✓ 복사됨' : '비밀번호 복사'}
              </Button>
            </div>
          )}

          {result.type === 'vcard' && (
            <div className="scan-result-body">
              <div className="scan-info-grid">
                {result.parsed.name && (
                  <><span className="scan-info-label">이름</span><span className="scan-info-value">{result.parsed.name}</span></>
                )}
                {result.parsed.org && (
                  <><span className="scan-info-label">회사</span><span className="scan-info-value">{result.parsed.org}</span></>
                )}
                {result.parsed.tel && (
                  <><span className="scan-info-label">전화</span><span className="scan-info-value">{result.parsed.tel}</span></>
                )}
                {result.parsed.email && (
                  <><span className="scan-info-label">이메일</span><span className="scan-info-value">{result.parsed.email}</span></>
                )}
              </div>
              <div className="scan-result-actions mt-3">
                {result.parsed.tel && (
                  <Button className="scan-btn-primary" onClick={() => window.open(`tel:${result.parsed.tel}`)}>전화걸기</Button>
                )}
                <Button className="scan-btn-secondary" onClick={() => handleCopy(result.raw)}>
                  {copied ? '✓ 복사됨' : '전체 복사'}
                </Button>
              </div>
            </div>
          )}

          {result.type === 'payment' && (
            <div className="scan-result-body">
              <div className="scan-info-grid">
                <span className="scan-info-label">은행</span>
                <span className="scan-info-value">{result.parsed.bank}</span>
                <span className="scan-info-label">계좌번호</span>
                <span className="scan-info-value">{result.parsed.account}</span>
                {result.parsed.holder && (
                  <><span className="scan-info-label">예금주</span><span className="scan-info-value">{result.parsed.holder}</span></>
                )}
                {result.parsed.amount && (
                  <><span className="scan-info-label">금액</span><span className="scan-info-value">{Number(result.parsed.amount).toLocaleString()}원</span></>
                )}
              </div>
              <Button className="scan-btn-secondary w-100 mt-3" onClick={() => handleCopy(result.parsed.account)}>
                {copied ? '✓ 복사됨' : '계좌번호 복사'}
              </Button>
            </div>
          )}

          {result.type === 'phone' && (
            <div className="scan-result-body">
              <p className="scan-result-text">{result.parsed.phone}</p>
              <div className="scan-result-actions">
                <Button className="scan-btn-primary" onClick={() => window.open(`tel:${result.parsed.phone}`)}>전화걸기</Button>
                <Button className="scan-btn-secondary" onClick={() => handleCopy(result.parsed.phone)}>
                  {copied ? '✓ 복사됨' : '복사'}
                </Button>
              </div>
            </div>
          )}

          {result.type === 'email' && (
            <div className="scan-result-body">
              <p className="scan-result-text">{result.parsed.email}</p>
              <div className="scan-result-actions">
                <Button className="scan-btn-primary" onClick={() => window.open(`mailto:${result.parsed.email}`)}>메일 보내기</Button>
                <Button className="scan-btn-secondary" onClick={() => handleCopy(result.parsed.email)}>
                  {copied ? '✓ 복사됨' : '복사'}
                </Button>
              </div>
            </div>
          )}

          <div className="scan-again-wrapper">
            <Button className="scan-btn-outline" onClick={resetScan}>
              다시 스캔하기
            </Button>
          </div>
        </div>
      </>
    );
  };

  return (
    <>
      <AppNavbar />
      <section className="scan-page-section">
        <Container>
          <div className="scan-page-header">
            <h2 className="scan-page-title">QR코드 이미지스캔</h2>
            <p className="scan-page-subtitle">갤러리에서 QR코드 이미지를 선택하면 내용을 읽어드립니다</p>
          </div>

          <div className="scan-card">
            {/* 스캔 전: 사진 선택 / 스캔 후: 결과에 따라 다름 */}
            {!result ? (
              <div className="scan-tab-content">
                <div className="scan-start-area">
                  <div className="scan-icon-large">🖼️</div>
                  <p className="scan-guide-text">
                    갤러리에서 QR코드 이미지를 선택하세요.<br />
                    카톡이나 문자로 받은 QR 이미지도 가능합니다.
                  </p>
                  <Button
                    className="scan-btn-primary scan-btn-large"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isProcessing}
                  >
                    {isProcessing ? '인식 중...' : '사진 선택'}
                  </Button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    style={{ display: 'none' }}
                    onChange={handleFileSelect}
                  />
                </div>
              </div>
            ) : (
              renderResult()
            )}

            <div id="qr-file-reader" style={{ display: 'none' }} />

            {error && (
              <div className="scan-error">
                <span className="scan-error-icon">⚠️</span>
                <span>{error}</span>
              </div>
            )}
          </div>
        </Container>
      </section>

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
