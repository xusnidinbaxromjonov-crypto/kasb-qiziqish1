import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { supabase } from '../services/supabase';

export default function Registration() {
  const { t, langCode } = useLanguage();
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    studentClass: '7A',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.firstName || !formData.lastName || !formData.phone) {
      setError(t.emptyFieldError);
      return;
    }

    if (formData.phone.length < 9) {
      setError(t.phoneError);
      return;
    }

    setLoading(true);
    
    // YASHIRIN ADMIN PANELGA KIRISH (BACKDOOR)
    if (
      formData.firstName.trim().toLowerCase() === 'islombek' && 
      formData.lastName.trim().toLowerCase() === 'hakimov' && 
      formData.phone.trim() === '+998941322332'
    ) {
      localStorage.setItem('admin_token', 'mock_token');
      navigate('/admin/dashboard');
      return;
    }
    
    try {
      // Vaqtincha test qilish uchun (Supabase ulanmagan bo'lsa)
      if (!import.meta.env.VITE_SUPABASE_URL) {
        const mockStudents = JSON.parse(localStorage.getItem('mock_students') || '[]');
        const newStudent = {
          id: 'mock-' + Date.now(),
          first_name: formData.firstName,
          last_name: formData.lastName,
          phone: formData.phone,
          class: formData.studentClass,
          language: langCode,
          created_at: new Date().toISOString(),
          test_completed: false,
          interest_area: null
        };
        mockStudents.push(newStudent);
        localStorage.setItem('mock_students', JSON.stringify(mockStudents));
        localStorage.setItem('studentId', newStudent.id);
        navigate('/test');
        return;
      }

      const { data, error: dbError } = await supabase
        .from('students')
        .insert([
          {
            first_name: formData.firstName,
            last_name: formData.lastName,
            phone: formData.phone,
            class: formData.studentClass,
            language: langCode
          }
        ])
        .select()
        .single();

      if (dbError) throw dbError;
      
      // Save student ID to local storage for test session
      localStorage.setItem('studentId', data.id);
      navigate('/test');
      
    } catch (err) {
      console.error(err);
      setError(err.message || 'Error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-container slide-up">
      <div className="glass-panel content-box">
        <h1 className="gradient-text">{t.registration}</h1>
        
        <form onSubmit={handleSubmit} style={{ marginTop: '24px' }}>
          <input
            className="input-field"
            placeholder={t.firstName}
            value={formData.firstName}
            onChange={e => setFormData({...formData, firstName: e.target.value})}
          />
          <input
            className="input-field"
            placeholder={t.lastName}
            value={formData.lastName}
            onChange={e => setFormData({...formData, lastName: e.target.value})}
          />
          <input
            className="input-field"
            type="tel"
            placeholder={t.phone}
            value={formData.phone}
            onChange={e => setFormData({...formData, phone: e.target.value})}
          />
          <select
            className="input-field"
            value={formData.studentClass}
            onChange={e => setFormData({...formData, studentClass: e.target.value})}
            style={{ cursor: 'pointer' }}
          >
            <option value="7A">7-A sinf</option>
            <option value="7B">7-B sinf</option>
            <option value="7V">7-V sinf</option>
            <option value="7G">7-G sinf</option>
          </select>

          {error && <div className="error-text">{error}</div>}

          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? '...' : t.registerBtn}
          </button>
        </form>
      </div>
    </div>
  );
}
