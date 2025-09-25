import React from 'react';
import { Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage';
import DisplayPage from './pages/DisplayPage';
import ListPage from './pages/ListPage'; // 추가
import './App.css';

function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/display" element={<DisplayPage />} />
      <Route path="/list" element={<ListPage />} /> {/* 추가 */}
    </Routes>
  );
}

export default App;