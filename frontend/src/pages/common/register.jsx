import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';

export default function Register() {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('http://localhost:8000/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, email, password }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        // FastAPI biasanya ngasih error di 'detail'
        throw new Error(data.detail || 'Registrasi gagal, coba lagi.');
      }

      setSuccess(true);
      // Kasih delay 2 detik biar user baca pesan sukses, baru pindah ke login
      setTimeout(() => {
        navigate('/login');
      }, 2000);

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
        <div className="absolute -top-[20%] right-[10%] w-[500px] h-[500px] bg-white/[0.03] rounded-full blur-3xl" />
        <div className="absolute bottom-[10%] left-[5%] w-[400px] h-[400px] bg-white/[0.02] rounded-full blur-3xl" />
      </div>

      {/* Card Form */}
      <div className="relative z-10 w-full max-w-md bg-[#0A0A0A]/80 backdrop-blur-xl border border-[#262626] p-8 sm:p-10 rounded-2xl shadow-2xl">
        
        {/* Logo / Judul */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center justify-center w-12 h-12 rounded-xl border border-[#262626] bg-[#151515] text-[#F5F5F5] mb-4 hover:scale-105 transition-transform duration-200">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.6} stroke="currentColor" className="w-6 h-6">
              <path strokeLinecap="round" strokeLinejoin="round" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
            </svg>
          </Link>
          <h2 className="text-2xl font-semibold text-[#F5F5F5] tracking-tight">Buat Akun Baru</h2>
          <p className="text-sm text-[#A1A1AA] mt-2">Bergabung dengan Helpdesk TMS</p>
        </div>

        {/* Pesan Error */}
        {error && (
          <div className="mb-6 bg-red-950/30 border border-red-900/50 text-red-300 px-4 py-3 rounded-lg text-sm font-medium text-center">
            {error}
          </div>
        )}

        {/* Pesan Sukses */}
        {success && (
          <div className="mb-6 bg-green-950/30 border border-green-900/50 text-green-300 px-4 py-3 rounded-lg text-sm font-medium text-center">
            Registrasi berhasil! Mengalihkan ke halaman Login...
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-[#A1A1AA] mb-1.5">Username</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              placeholder="johndoe"
              className="w-full bg-[#111111] border border-[#262626] text-[#F5F5F5] text-sm rounded-lg px-4 py-3 focus:outline-none focus:border-[#52525B] focus:ring-1 focus:ring-[#52525B] transition-colors placeholder:text-[#52525B]"
            />
          </div>

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
              minLength={8}
              placeholder="Minimal 8 karakter"
              className="w-full bg-[#111111] border border-[#262626] text-[#F5F5F5] text-sm rounded-lg px-4 py-3 focus:outline-none focus:border-[#52525B] focus:ring-1 focus:ring-[#52525B] transition-colors placeholder:text-[#52525B]"
            />
          </div>

          <button
            type="submit"
            disabled={loading || success}
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
              'Daftar Sekarang'
            )}
          </button>
        </form>

        <div className="mt-8 text-center text-sm text-[#A1A1AA]">
          Sudah punya akun?{' '}
          <Link to="/login" className="text-[#F5F5F5] font-medium hover:underline">
            Masuk di sini
          </Link>
        </div>

      </div>
    </div>
  );
}