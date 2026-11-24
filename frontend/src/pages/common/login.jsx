import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // 1. Tembak endpoint login
      const res = await fetch('http://localhost:8000/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.detail || 'Login gagal, cek email/password');
      }

      const data = await res.json();

      // 🔑 PENYESUAIAN: backend pakai key dengan SPASI
      const accessToken = data['access token'] || data['access_token'];

      if (!accessToken) {
        throw new Error('Token tidak ditemukan di response backend');
      }

      // Simpan token
      localStorage.setItem('access_token', accessToken);
      localStorage.setItem('token_type', 'Bearer');

      // 2. Ambil data user (Role, Email, ID) biar bisa redirect
      const profileRes = await fetch('http://localhost:8000/auth/users/me', {
        headers: {
          'Authorization': `Bearer ${accessToken}`
        }
      });
      
      if (!profileRes.ok) throw new Error('Gagal mengambil data profil user');
      
      const userProfile = await profileRes.json(); 
      
      console.log("Data Profil dari Backend:", userProfile);

      //Nangkep ID mau itu namanya 'id', '_id', atau 'user_id'
      const userId = userProfile.id || userProfile._id || userProfile.user_id;

      if (!userId) {
        throw new Error("Backend tidak mengirim ID user (id/_id).");
      }

      // Simpan role, email, dan ID ke localStorage
      localStorage.setItem('user_role', userProfile.role || 'CUSTOMER'); 
      localStorage.setItem('user_email', userProfile.email);
      localStorage.setItem('user_id', userId); 

      // Tembak sinyal ke Navbar kalau udah login
      window.dispatchEvent(new Event('auth-change'));

      // 3. REDIRECT BERDASARKAN ROLE
      const userRole = (userProfile.role || 'CUSTOMER').toUpperCase();

      if (userRole === 'ADMIN' || userRole === 'AGENT') {
        navigate('/admin'); 
      } else {
        navigate('/customer'); 
      }

    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#080808] flex items-center justify-center p-4 relative overflow-hidden selection:bg-white/20 font-sans">
      
      {/* Dekorasi Background Glow */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-[20%] left-[10%] w-[500px] h-[500px] bg-white/[0.03] rounded-full blur-3xl" />
        <div className="absolute bottom-[10%] right-[5%] w-[400px] h-[400px] bg-white/[0.02] rounded-full blur-3xl" />
      </div>

      {/* Card Form */}
      <div className="relative z-10 w-full max-w-md bg-[#0A0A0A]/80 backdrop-blur-xl border border-[#262626] p-8 sm:p-10 rounded-2xl shadow-2xl">
        
        {/* Logo / Judul */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center justify-center w-12 h-12 rounded-xl border border-[#262626] bg-[#151515] text-[#F5F5F5] mb-4 hover:scale-105 transition-transform duration-200">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.6} stroke="currentColor" className="w-6 h-6">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 14v-2a9 9 0 0118 0v2M3 14h2.5a1 1 0 011 1v3a1 1 0 01-1 1H5a2 2 0 01-2-2v-3zm18 0h-2.5a1 1 0 00-1 1v3a1 1 0 001 1H19a2 2 0 002-2v-3z" />
            </svg>
          </Link>
          <h2 className="text-2xl font-semibold text-[#F5F5F5] tracking-tight">Selamat Datang Kembali</h2>
          <p className="text-sm text-[#A1A1AA] mt-2">Masuk ke akun Helpdesk TMS Anda</p>
        </div>

        {/* Pesan Error */}
        {error && (
          <div className="mb-6 bg-red-950/30 border border-red-900/50 text-red-300 px-4 py-3 rounded-lg text-sm font-medium text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-[#A1A1AA] mb-1.5">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="email@example.com"
              className="w-full bg-[#111111] border border-[#262626] text-[#F5F5F5] text-sm rounded-lg px-4 py-3 focus:outline-none focus:border-[#52525B] focus:ring-1 focus:ring-[#52525B] transition-colors placeholder:text-[#52525B]"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-[#A1A1AA] mb-1.5">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="••••••••"
              className="w-full bg-[#111111] border border-[#262626] text-[#F5F5F5] text-sm rounded-lg px-4 py-3 focus:outline-none focus:border-[#52525B] focus:ring-1 focus:ring-[#52525B] transition-colors placeholder:text-[#52525B]"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#F5F5F5] hover:bg-white text-[#080808] font-semibold rounded-lg px-4 py-3 mt-2 transition-all duration-200 hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin h-4 w-4 text-[#080808]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Memproses...
              </span>
            ) : (
              'Login'
            )}
          </button>
        </form>

        <div className="mt-8 text-center text-sm text-[#A1A1AA]">
          Belum punya akun?{' '}
          <Link to="/register" className="text-[#F5F5F5] font-medium hover:underline">
            Daftar sekarang
          </Link>
        </div>

      </div>
    </div>
  );
}