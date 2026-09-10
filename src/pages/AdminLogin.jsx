import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../services/supabase';

export default function AdminLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  React.useEffect(() => {
    const checkExistingSession = async () => {
      if (localStorage.getItem('admin_token') === 'mock_token') {
        navigate('/admin/dashboard');
        return;
      }
      if (import.meta.env.VITE_SUPABASE_URL) {
        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
          navigate('/admin/dashboard');
        }
      }
    };
    checkExistingSession();
  }, [navigate]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    try {
      // Vaqtincha test qilish uchun (Supabase ulanmagan bo'lsa)
      if (!import.meta.env.VITE_SUPABASE_URL) {
        if (email === 'admin@admin.com' && password === 'admin123') {
          localStorage.setItem('admin_token', 'mock_token');
          navigate('/admin/dashboard');
          return;
        } else {
          throw new Error("Parol yoki login noto'g'ri. (Test uchun: admin@admin.com / admin123)");
        }
      }

      const { error: authError } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (authError) throw authError;

      navigate('/admin/dashboard');
    } catch (err) {
      console.error(err);
      setError(err.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-container slide-up">
      <div className="glass-panel content-box">
        <h1 className="gradient-text">Admin Panel</h1>
        
        <form onSubmit={handleLogin} style={{ marginTop: '24px' }}>
          <input
            type="email"
            className="input-field"
            placeholder="Email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
          />
          <input
            type="password"
            className="input-field"
            placeholder="Parol / Пароль"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
          />
          
          {error && <div className="error-text">{error}</div>}

          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? '...' : 'Kirish / Вход'}
          </button>
        </form>
      </div>
    </div>
  );
}
