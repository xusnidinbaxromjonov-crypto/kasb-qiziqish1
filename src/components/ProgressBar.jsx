import React from 'react';

export default function ProgressBar({ current, total }) {
  const percentage = (current / total) * 100;
  
  return (
    <div style={{ width: '100%', marginBottom: '24px' }}>
      <div style={{ 
        background: 'rgba(99, 102, 241, 0.2)', 
        borderRadius: '8px', 
        height: '8px', 
        overflow: 'hidden' 
      }}>
        <div style={{ 
          background: 'var(--primary)', 
          height: '100%', 
          width: `${percentage}%`,
          transition: 'width 0.3s ease-out'
        }} />
      </div>
    </div>
  );
}
