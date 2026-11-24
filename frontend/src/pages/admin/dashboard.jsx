import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function Dashboard() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const cekAkses = async () => {
      const token = localStorage.getItem('access_token');

      // 1. Kalau nggak ada token, tendang ke login
      if (!token) {
        navigate('/login');
        return;
      }

      try {
        // 2. Tanya ke backend: "Ini siapa yang punya token?"
        const res = await fetch('http://localhost:8000/auth/users/me', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (!res.ok) throw new Error('Token tidak valid');

        const userData = await res.json();
        // userData isinya: { id: "...", email: "...", role: "CUSTOMER" }

        // 3. CEK ROLE! Kalau customer, tendang!
        // (Sesuaikan string 'CUSTOMER' sama enum di backend lo)
        if (userData.role === 'CUSTOMER') {
          alert('Akses Ditolak! Halaman ini khusus Admin/Agent.');
          localStorage.removeItem('access_token'); // Hapus token
          navigate('/login'); // Balikin ke login
          return;
        }

        // 4. Kalau lolos, simpen data user buat ditampilin
        setUser(userData);
        setLoading(false);

      } catch (err) {
        console.error(err);
        localStorage.removeItem('access_token');
        navigate('/login');
      }
    };

    cekAkses();
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('token_type');
    navigate('/login');
  };

  if (loading) return <div style={{ padding: '2rem' }}>Cek Akses...</div>;

  return (
    <div style={{ padding: '2rem' }}>
      <h1>Dashboard Admin</h1>
      <p>Selamat datang, <strong>{user?.email}</strong>!</p>
      <p>Role lo: <strong>{user?.role}</strong></p>
      
      <button onClick={handleLogout} style={{ marginTop: '1rem' }}>
        Logout
      </button>
    </div>
  );
}