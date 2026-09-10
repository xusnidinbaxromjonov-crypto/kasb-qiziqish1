import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { LanguageProvider } from './context/LanguageContext';
import LanguageSelection from './pages/LanguageSelection';
import Registration from './pages/Registration';
import Test from './pages/Test';
import Result from './pages/Result';
import AdminLogin from './pages/AdminLogin';
import AdminDashboard from './pages/AdminDashboard';
import './index.css';

function App() {
  return (
    <LanguageProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<LanguageSelection />} />
          <Route path="/register" element={<Registration />} />
          <Route path="/test" element={<Test />} />
          <Route path="/result" element={<Result />} />
          
          {/* Admin Routes */}
          <Route path="/admin" element={<AdminLogin />} />
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
        </Routes>
      </BrowserRouter>
    </LanguageProvider>
  );
}

export default App;
