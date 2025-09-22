import React from 'react';
import { Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage';
import DisplayPage from './pages/DisplayPage';
import './App.css';

function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/display" element={<DisplayPage />} />
    </Routes>
  );
}

export default App;