/* ============================
   AUTH PAGE (로그인/회원가입)
   ============================ */
.auth-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, var(--dark) 0%, var(--dark-secondary) 100%);
  position: relative;
  overflow: hidden;
  padding: 2rem;
}

.auth-bg-pattern {
  position: absolute;
  inset: 0;
  background-image:
    radial-gradient(circle at 20% 50%, rgba(59,130,246,0.15) 0%, transparent 50%),
    radial-gradient(circle at 80% 20%, rgba(139,92,246,0.1) 0%, transparent 50%);
  pointer-events: none;
}

.auth-container {
  position: relative;
  display: flex;
  background: var(--bg-white);
  border-radius: 20px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  overflow: hidden;
  max-width: 880px;
  width: 100%;
}

.auth-brand {
  background: linear-gradient(135deg, var(--primary), var(--primary-dark));
  padding: 3rem;
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  color: #fff;
}

.auth-brand-link {
  text-decoration: none;
  color: #fff;
  display: flex;
  align-items: center;
  gap: 0.7rem;
  margin-bottom: 1.5rem;
}

.auth-brand-icon {
  width: 36px;
  height: 36px;
  background: rgba(255,255,255,0.2);
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1rem;
  font-weight: 700;
}

.auth-brand h1 {
  font-size: 1.4rem;
  font-weight: 700;
  margin: 0;
}

.auth-brand-desc {
  font-size: 0.92rem;
  color: rgba(255,255,255,0.8);
  line-height: 1.6;
  margin-bottom: 2rem;
}

.auth-brand-features {
  display: flex;
  flex-direction: column;
  gap: 0.8rem;
}

.auth-feature-item {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  font-size: 0.9rem;
  color: rgba(255,255,255,0.9);
}

.auth-feature-icon {
  font-size: 1.1rem;
}

.auth-form-wrapper {
  flex: 1;
  padding: 3rem;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.auth-form-title {
  font-size: 1.6rem;
  font-weight: 700;
  color: var(--text-primary);
  margin-bottom: 0.3rem;
}

.auth-form-subtitle {
  font-size: 0.9rem;
  color: var(--text-muted);
  margin-bottom: 1.8rem;
}

.auth-alert {
  font-size: 0.85rem;
  border-radius: var(--radius-sm);
}

.auth-label {
  font-size: 0.88rem;
  font-weight: 600;
  color: var(--text-primary);
}

.auth-input {
  padding: 0.7rem 0.9rem !important;
  border-radius: var(--radius-sm) !important;
  font-size: 0.92rem !important;
  border: 1.5px solid var(--border) !important;
  transition: var(--transition);
}

.auth-input:focus {
  border-color: var(--primary) !important;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.12) !important;
}

.auth-submit-btn {
  width: 100%;
  padding: 0.75rem !important;
  font-size: 1rem !important;
  font-weight: 600 !important;
  background: var(--primary) !important;
  border: none !important;
  border-radius: var(--radius-sm) !important;
  transition: var(--transition) !important;
}

.auth-submit-btn:hover {
  background: var(--primary-dark) !important;
  transform: translateY(-1px);
  box-shadow: var(--shadow-primary);
}

.auth-submit-btn:disabled {
  opacity: 0.7;
  transform: none !important;
}

.auth-switch {
  text-align: center;
  margin-top: 1.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.4rem;
}

.auth-switch-text {
  font-size: 0.88rem;
  color: var(--text-muted);
}

.auth-switch-btn {
  background: none;
  border: none;
  color: var(--primary);
  font-weight: 600;
  font-size: 0.88rem;
  cursor: pointer;
  padding: 0;
  transition: var(--transition);
}

.auth-switch-btn:hover {
  color: var(--primary-dark);
  text-decoration: underline;
}

.auth-home-link {
  display: block;
  text-align: center;
  margin-top: 1.2rem;
  font-size: 0.85rem;
  color: var(--text-muted);
  text-decoration: none;
  transition: var(--transition);
}

.auth-home-link:hover {
  color: var(--primary);
}

@media (max-width: 768px) {
  .auth-page { padding: 1rem; }
  .auth-container {
    flex-direction: column;
    max-width: 440px;
  }
  .auth-brand {
    padding: 2rem;
    text-align: center;
    align-items: center;
  }
  .auth-brand-link { justify-content: center; }
  .auth-brand-desc { text-align: center; }
  .auth-brand-features {
    flex-direction: row;
    flex-wrap: wrap;
    justify-content: center;
    gap: 0.5rem;
  }
  .auth-feature-item {
    font-size: 0.8rem;
    background: rgba(255,255,255,0.1);
    padding: 0.3rem 0.7rem;
    border-radius: 20px;
  }
  .auth-form-wrapper { padding: 2rem; }
  .auth-form-title { font-size: 1.3rem; }
}

@media (max-width: 480px) {
  .auth-brand { padding: 1.5rem; }
  .auth-brand h1 { font-size: 1.2rem; }
  .auth-brand-desc { font-size: 0.82rem; margin-bottom: 1rem; }
  .auth-form-wrapper { padding: 1.5rem; }
}
