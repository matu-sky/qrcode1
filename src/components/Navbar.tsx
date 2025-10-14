
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../supabaseClient';
import { Navbar, Nav, Button, Container } from 'react-bootstrap';

export default function AppNavbar() {
  const { session } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/');
  };

  return (
    <Navbar bg="white" expand="lg" className="mb-4 border-bottom">
      <Container>
        <Navbar.Brand as={Link} to="/" className="text-primary fw-bold">QR Code Generator</Navbar.Brand>
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="me-auto">
            <Nav.Link as={Link} to="/">QR 생성</Nav.Link>
            <Nav.Link as={Link} to="/menu">메뉴판 생성</Nav.Link>
            {session && <Nav.Link as={Link} to="/list">내 메뉴</Nav.Link>}
          </Nav>
          <Nav>
            {session ? (
              <>
                <Navbar.Text className="me-3">Signed in as: {session.user.email}</Navbar.Text>
                <Button variant="outline-secondary" onClick={handleLogout}>Logout</Button>
              </>
            ) : (
              <Link to="/auth"><Button>Login</Button></Link>
            )}
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
}
