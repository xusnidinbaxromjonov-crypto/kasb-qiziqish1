import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../services/supabase';
import { Users, UserCheck, UserX, LogOut, Search, Eye } from 'lucide-react';
import StudentDetails from '../components/StudentDetails';

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('all'); // 'all', 'completed', 'not_completed'
  
  const [selectedStudent, setSelectedStudent] = useState(null);

  useEffect(() => {
    checkUser();
    fetchStudents();
  }, []);

  const checkUser = async () => {
    // Backdoor orqali kirgan bo'lsa tekshiruvdan o'tadi
    if (localStorage.getItem('admin_token') === 'mock_token') {
      return;
    }
    
    if (!import.meta.env.VITE_SUPABASE_URL) {
      navigate('/admin');
      return;
    }
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      navigate('/admin');
    }
  };

  const handleLogout = async () => {
    if (localStorage.getItem('admin_token') === 'mock_token') {
      localStorage.removeItem('admin_token');
      navigate('/');
      return;
    }

    if (!import.meta.env.VITE_SUPABASE_URL) {
      navigate('/');
      return;
    }
    await supabase.auth.signOut();
    navigate('/');
  };

  const fetchStudents = async () => {
    setLoading(true);
    if (!import.meta.env.VITE_SUPABASE_URL) {
      // Mock data from localStorage
      const mockStudents = JSON.parse(localStorage.getItem('mock_students') || '[]');
      // Sort by oldest first
      mockStudents.sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
      setStudents(mockStudents);
      setLoading(false);
      return;
    }
    const { data, error } = await supabase
      .from('students')
      .select('*')
      .order('created_at', { ascending: true });
      
    if (!error && data) {
      setStudents(data);
    }
    setLoading(false);
  };

  const todayStr = new Date().toISOString().split('T')[0];
  const total = students.length;
  const registeredToday = students.filter(s => s.created_at.startsWith(todayStr)).length;
  const completed = students.filter(s => s.test_completed).length;
  const notCompleted = total - completed;



  // Filter & Search
  const filteredStudents = students.filter(s => {
    if (filter === 'completed' && !s.test_completed) return false;
    if (filter === 'not_completed' && s.test_completed) return false;
    
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      return (
        (s.first_name && s.first_name.toLowerCase().includes(term)) ||
        (s.last_name && s.last_name.toLowerCase().includes(term)) ||
        (s.phone && s.phone.includes(term))
      );
    }
    return true;
  });

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#f9fafb' }}>
      {/* Sidebar */}
      <div style={{ width: '250px', background: 'white', borderRight: '1px solid #e5e7eb', padding: '24px', display: 'flex', flexDirection: 'column' }}>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold', color: 'var(--primary)', marginBottom: '32px' }}>
          Admin Panel
        </h2>
        
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <button style={{ ...sidebarBtnStyle, background: 'var(--primary)', color: 'white' }}>
            <Users size={18} /> Dashboard
          </button>
        </div>
        
        <button onClick={handleLogout} style={{ ...sidebarBtnStyle, color: 'var(--danger)' }}>
          <LogOut size={18} /> Chiqish
        </button>
      </div>

      {/* Main Content */}
      <div style={{ flex: 1, padding: '32px', overflowY: 'auto' }}>
        <h1 style={{ fontSize: '1.75rem', marginBottom: '24px' }}>Statistika</h1>
        
        {/* Stats Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '24px', marginBottom: '40px' }}>
          <StatCard title="Jami o'quvchilar" value={total} icon={<Users color="#6366f1" size={24} />} bg="#e0e7ff" />
          <StatCard title="Bugun ro'yxatdan o'tganlar" value={registeredToday} icon={<Users color="#10b981" size={24} />} bg="#d1fae5" />
          <StatCard title="Testni tugatganlar" value={completed} icon={<UserCheck color="#8b5cf6" size={24} />} bg="#ede9fe" />
          <StatCard title="Testni tugatmaganlar" value={notCompleted} icon={<UserX color="#ef4444" size={24} />} bg="#fee2e2" />
        </div>



        {/* Table Section */}
        <div style={{ background: 'white', padding: '24px', borderRadius: '16px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
            <h2 style={{ fontSize: '1.5rem' }}>O'quvchilar ro'yxati</h2>
            <div style={{ display: 'flex', gap: '16px' }}>
              <div style={{ position: 'relative' }}>
                <Search size={18} style={{ position: 'absolute', left: '12px', top: '10px', color: '#9ca3af' }} />
                <input
                  placeholder="Qidirish..."
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  style={{ padding: '8px 16px 8px 36px', borderRadius: '8px', border: '1px solid #d1d5db', outline: 'none' }}
                />
              </div>
              <select 
                value={filter}
                onChange={e => setFilter(e.target.value)}
                style={{ padding: '8px 16px', borderRadius: '8px', border: '1px solid #d1d5db', outline: 'none' }}
              >
                <option value="all">Barchasi</option>
                <option value="completed">Testni tugatgan</option>
                <option value="not_completed">Testni tugatmagan</option>
              </select>
            </div>
          </div>

          {loading ? (
            <p>Yuklanmoqda...</p>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid #e5e7eb', color: '#6b7280' }}>
                  <th style={{ padding: '12px' }}>№</th>
                  <th style={{ padding: '12px' }}>Ism</th>
                  <th style={{ padding: '12px' }}>Familiya</th>
                  <th style={{ padding: '12px' }}>Telefon</th>
                  <th style={{ padding: '12px' }}>Sinf</th>
                  <th style={{ padding: '12px' }}>Sana</th>
                  <th style={{ padding: '12px' }}>Holat</th>
                  <th style={{ padding: '12px' }}>Qiziqishi</th>
                  <th style={{ padding: '12px' }}>Batafsil</th>
                </tr>
              </thead>
              <tbody>
                {filteredStudents.map((s, idx) => (
                  <tr key={s.id} style={{ borderBottom: '1px solid #f3f4f6', cursor: 'pointer' }} onClick={() => setSelectedStudent(s)}>
                    <td style={{ padding: '12px' }}>{idx + 1}</td>
                    <td style={{ padding: '12px' }}>{s.first_name}</td>
                    <td style={{ padding: '12px' }}>{s.last_name}</td>
                    <td style={{ padding: '12px' }}>{s.phone}</td>
                    <td style={{ padding: '12px' }}>{s.class}</td>
                    <td style={{ padding: '12px' }}>{new Date(s.created_at).toLocaleDateString()}</td>
                    <td style={{ padding: '12px' }}>
                      <span style={{ 
                        padding: '4px 8px', 
                        borderRadius: '12px', 
                        fontSize: '0.85rem',
                        background: s.test_completed ? '#d1fae5' : '#fee2e2',
                        color: s.test_completed ? '#059669' : '#dc2626'
                      }}>
                        {s.test_completed ? "Tugagan" : "Tugallanmagan"}
                      </span>
                    </td>
                    <td style={{ padding: '12px' }}>{s.test_completed ? s.interest_area : '—'}</td>
                    <td style={{ padding: '12px', color: 'var(--primary)' }}><Eye size={18} /></td>
                  </tr>
                ))}
                {filteredStudents.length === 0 && (
                  <tr>
                    <td colSpan="9" style={{ padding: '24px', textAlign: 'center', color: '#6b7280' }}>Ma'lumot topilmadi</td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>
      
      {selectedStudent && (
        <StudentDetails student={selectedStudent} onClose={() => setSelectedStudent(null)} />
      )}
    </div>
  );
}

const sidebarBtnStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: '12px',
  padding: '12px 16px',
  border: 'none',
  background: 'transparent',
  borderRadius: '8px',
  cursor: 'pointer',
  fontSize: '1rem',
  fontWeight: '500',
  textAlign: 'left'
};

const StatCard = ({ title, value, icon, bg }) => (
  <div style={{ background: 'white', padding: '24px', borderRadius: '16px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)', display: 'flex', alignItems: 'center', gap: '16px' }}>
    <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      {icon}
    </div>
    <div>
      <p style={{ color: '#6b7280', fontSize: '0.875rem', marginBottom: '4px' }}>{title}</p>
      <p style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>{value}</p>
    </div>
  </div>
);
