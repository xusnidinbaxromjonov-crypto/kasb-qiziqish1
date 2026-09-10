import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { careers } from '../data/careers';

export default function Result() {
  const { t, langCode } = useLanguage();
  const navigate = useNavigate();
  const [career, setCareer] = useState(null);
  
  const isUz = langCode === 'uz';

  useEffect(() => {
    const rId = localStorage.getItem('resultCareerId');
    if (!rId) {
      navigate('/');
      return;
    }
    const c = careers.find(c => c.id === parseInt(rId));
    setCareer(c);
  }, [navigate]);

  if (!career) return null;

  return (
    <div className="page-container fade-in">
      <div className="glass-panel content-box" style={{ maxWidth: '600px', textAlign: 'center' }}>
        <h1 className="gradient-text" style={{ fontSize: '2.5rem' }}>{t.testCompleted}</h1>
        <p style={{ fontSize: '1.2rem', marginBottom: '16px', color: 'var(--text-muted)' }}>
          {t.strongestInterest}
        </p>
        
        <div style={{ 
          background: 'rgba(99, 102, 241, 0.1)', 
          padding: '24px', 
          borderRadius: '16px',
          marginBottom: '24px'
        }}>
          <div style={{ fontSize: '4rem', marginBottom: '8px' }}>{career.icon}</div>
          <h2 style={{ fontSize: '1.75rem', color: 'var(--primary)', marginBottom: '16px' }}>
            {isUz ? career.nameUz : career.nameRu}
          </h2>
          <div style={{ textAlign: 'left' }}>
            <h4 style={{ color: 'var(--text-main)', marginBottom: '8px' }}>{t.descriptionLabel}</h4>
            <p style={{ color: 'var(--text-muted)', lineHeight: '1.6' }}>
              {isUz ? career.descriptionUz : career.descriptionRu}
            </p>
          </div>
        </div>

        <button className="btn-secondary" onClick={() => {
          localStorage.clear();
          navigate('/');
        }}>
          {t.selectLanguage}
        </button>
      </div>
    </div>
  );
}
