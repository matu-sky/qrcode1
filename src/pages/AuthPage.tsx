import React, { useState } from 'react';
import { supabase } from '../supabaseClient';
import { Form, Button, Alert } from 'react-bootstrap';
import { useNavigate, Link } from 'react-router-dom';

export default function AuthPage() {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setMessage(null);

    try {
      if (isSignUp) {
        const { error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;
        setMessage('회원가입이 완료되었습니다. 이메일을 확인하여 계정을 활성화해주세요.');
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        navigate('/');
      }
    } catch (error: any) {
      setError(error.error_description || error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-bg-pattern"></div>
      
      <div className="auth-container">
        {/* 왼쪽: 브랜드 영역 */}
        <div className="auth-brand">
          <Link to="/" className="auth-brand-link">
            <div className="auth-brand-icon">◻</div>
            <h1>QR 코드 생성기</h1>
          </Link>
          <p className="auth-brand-desc">
            URL, 명함, Wi-Fi, 계좌이체, 메뉴판까지<br />
            다양한 QR 코드를 무료로 만들어 보세요.
          </p>
          <div className="auth-brand-features">
            <div className="auth-feature-item">
              <span className="auth-feature-icon">✨</span>
              <span>12가지 디자인 프리셋</span>
            </div>
            <div className="auth-feature-item">
              <span className="auth-feature-icon">🍽️</span>
              <span>디지털 메뉴판 생성</span>
            </div>
            <div className="auth-feature-item">
              <span className="auth-feature-icon">💾</span>
              <span>메뉴 저장 및 관리</span>
            </div>
          </div>
        </div>

        {/* 오른쪽: 로그인 폼 */}
        <div className="auth-form-wrapper">
          <h2 className="auth-form-title">{isSignUp ? '회원가입' : '로그인'}</h2>
          <p className="auth-form-subtitle">
            {isSignUp ? '계정을 만들어 메뉴판을 저장하세요.' : '계정에 로그인하여 메뉴를 관리하세요.'}
          </p>

          {error && <Alert variant="danger" className="auth-alert">{error}</Alert>}
          {message && <Alert variant="success" className="auth-alert">{message}</Alert>}

          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-3">
              <Form.Label className="auth-label">이메일 주소</Form.Label>
              <Form.Control
                type="email"
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="auth-input"
              />
            </Form.Group>

            <Form.Group className="mb-4">
              <Form.Label className="auth-label">비밀번호</Form.Label>
              <Form.Control
                type="password"
                placeholder="6자 이상 입력하세요"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="auth-input"
              />
            </Form.Group>

            <Button disabled={loading} className="auth-submit-btn" type="submit">
              {loading ? '처리 중...' : (isSignUp ? '회원가입' : '로그인')}
            </Button>
          </Form>

          <div className="auth-switch">
            <span className="auth-switch-text">
              {isSignUp ? '이미 계정이 있으신가요?' : '계정이 없으신가요?'}
            </span>
            <button className="auth-switch-btn" onClick={() => { setIsSignUp(!isSignUp); setError(null); setMessage(null); }}>
              {isSignUp ? '로그인' : '회원가입'}
            </button>
          </div>

          <Link to="/" className="auth-home-link">← 홈으로 돌아가기</Link>
        </div>
      </div>
    </div>
  );
}
