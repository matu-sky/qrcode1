import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../supabaseClient';
import { Navbar, Nav, Button, Container } from 'react-bootstrap';

export default function AppNavbar() {
  const { session } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/');
  };

  return (
    <Navbar expand="lg" className="app-navbar" variant="light" sticky="top">
      <Container>
        <Navbar.Brand as={Link} to="/" className="navbar-brand-custom">
          <span className="brand-icon">◻</span>
          QR 코드 생성기
        </Navbar.Brand>
        <Navbar.Toggle aria-controls="basic-navbar-nav" className="navbar-toggle-custom" />
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="me-auto">
            <Nav.Link
              as={Link}
              to="/"
              className={`nav-link-custom ${location.pathname === '/' ? 'nav-active' : ''}`}
            >
              QR 생성
            </Nav.Link>
            <Nav.Link
              as={Link}
              to="/menu"
              className={`nav-link-custom ${location.pathname === '/menu' ? 'nav-active' : ''}`}
            >
              메뉴판 생성
            </Nav.Link>
            {session && (
              <Nav.Link
                as={Link}
                to="/list"
                className={`nav-link-custom ${location.pathname === '/list' ? 'nav-active' : ''}`}
              >
                내 메뉴
              </Nav.Link>
            )}
          </Nav>
          <Nav className="nav-right">
            {session ? (
              <>
                <span className="nav-user-email">{session.user.email}</span>
                <Button className="nav-btn-logout" onClick={handleLogout}>로그아웃</Button>
              </>
            ) : (
              <Link to="/auth">
                <Button className="nav-btn-login">로그인</Button>
              </Link>
            )}
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
}
