import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';

export default function LanguageSelection() {
  const { setLangCode, t } = useLanguage();
  const navigate = useNavigate();

  const handleSelect = (lang) => {
    setLangCode(lang);
    navigate('/register');
  };

  return (
    <div className="page-container fade-in">
      <div className="glass-panel content-box">
        <h1 className="gradient-text">{t.selectLanguage}</h1>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '32px' }}>
          <button className="btn-primary" onClick={() => handleSelect('uz')}>
            {t.uzbek}
          </button>
          <button className="btn-primary" onClick={() => handleSelect('ru')}>
            {t.russian}
          </button>
        </div>
      </div>
    </div>
  );
}
