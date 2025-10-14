import React from 'react';
import { Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage';
import DisplayPage from './pages/DisplayPage';
import ListPage from './pages/ListPage'; // 추가
import AuthPage from './pages/AuthPage';
import MenuPage from './pages/MenuPage';
import './App.css';

function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/display" element={<DisplayPage />} />
      <Route path="/list" element={<ListPage />} /> {/* 추가 */}
      <Route path="/auth" element={<AuthPage />} />
      <Route path="/menu" element={<MenuPage />} />
    </Routes>
  );
}

export default App;