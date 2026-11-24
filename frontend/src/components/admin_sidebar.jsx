import { useNavigate, useLocation } from 'react-router-dom';

export default function AdminSidebar() {
  const navigate = useNavigate();
  const location = useLocation();
  
  const role = (localStorage.getItem('user_role') || '').toUpperCase();
  const email = localStorage.getItem('user_email') || 'Admin';
  
  // Ambil inisial untuk avatar
  const initial = email.charAt(0).toUpperCase();

  const handleLogout = () => {
    localStorage.clear();
    window.dispatchEvent(new Event('auth-change'));
    navigate('/login');
  };

  // Fungsi buat nentuin menu mana yang lagi aktif
  const isActive = (path) => location.pathname === path;

  // Style dasar buat menu
  const menuClass = (path) => `relative w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors duration-200 ${
    isActive(path) 
      ? 'bg-white/[0.06] text-white' 
      : 'text-zinc-400 hover:bg-white/[0.04] hover:text-zinc-100'
  }`;

  // Indikator garis biru di kiri menu
  const ActiveIndicator = () => (
    <span className="absolute left-0 top-1/2 -translate-y-1/2 h-5 w-[3px] rounded-r-full bg-blue-500"></span>
  );

  return (
    <aside className="relative z-10 w-64 border-r border-white/[0.06] bg-[#09090B] flex-col hidden md:flex">
      
      {/* LOGO HEADER */}
      <div className="h-16 flex items-center px-6 border-b border-white/[0.06]">
        <span className="flex items-center justify-center w-8 h-8 rounded-lg border border-white/[0.08] bg-white/[0.03] text-white mr-3 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06)]">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.6} stroke="currentColor" className="w-4 h-4">
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 14v-2a9 9 0 0118 0v2M3 14h2.5a1 1 0 011 1v3a1 1 0 01-1 1H5a2 2 0 01-2-2v-3zm18 0h-2.5a1 1 0 00-1 1v3a1 1 0 001 1H19a2 2 0 002-2v-3z" />
          </svg>
        </span>
        <span className="font-semibold tracking-tight text-zinc-100">Admin Panel</span>
      </div>

      {/* MENU UTAMA */}
      <div className="p-3 flex-grow overflow-y-auto space-y-1">
        
        <p className="px-3 pt-3 pb-2 text-xs uppercase tracking-wider font-medium text-zinc-500">Menu</p>
        
        {/* Dashboard */}
        <button onClick={() => navigate('/admin')} className={menuClass('/admin')}>
          {isActive('/admin') && <ActiveIndicator />}
          <svg className={`w-4 h-4 ${isActive('/admin') ? 'text-blue-400' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"></path>
          </svg>
          Dashboard
        </button>
        
        {/* Manajemen Tiket */}
        <button onClick={() => navigate('/admin/tickets')} className={menuClass('/admin/tickets')}>
          {isActive('/admin/tickets') && <ActiveIndicator />}
          <svg className={`w-4 h-4 ${isActive('/admin/tickets') ? 'text-blue-400' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path>
          </svg>
          Manajemen Tiket
        </button>

        {/* MENU KHUSUS ADMIN */}
        {role === 'ADMIN' && (
          <>
            <p className="px-3 pt-6 pb-2 text-xs uppercase tracking-wider font-medium text-zinc-500">Administrasi</p>
            
            {/* Kelola Staff */}
            <button onClick={() => navigate('/admin/staff')} className={menuClass('/admin/staff')}>
              {isActive('/admin/staff') && <ActiveIndicator />}
              <svg className={`w-4 h-4 ${isActive('/admin/staff') ? 'text-blue-400' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"></path>
              </svg>
              Kelola Staff
            </button>
            
            {/* Kategori */}
            <button onClick={() => navigate('/admin/categories')} className={menuClass('/admin/categories')}>
              {isActive('/admin/categories') && <ActiveIndicator />}
              <svg className={`w-4 h-4 ${isActive('/admin/categories') ? 'text-blue-400' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"></path>
              </svg>
              Kategori
            </button>
          </>
        )}
      </div>

      {/* FOOTER: USER INFO & LOGOUT */}
      <div className="p-3 border-t border-white/[0.06] space-y-2">
        
        {/* Info User Gaya Pill */}
        <div className="flex items-center gap-2.5 px-2 py-2 rounded-lg bg-white/[0.02] border border-white/[0.05]">
          <div className="w-8 h-8 shrink-0 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-xs font-semibold ring-1 ring-white/10">
            {initial}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-medium text-zinc-200 truncate leading-tight">{email}</p>
            <p className="text-[10px] text-blue-400 font-semibold uppercase tracking-wider leading-tight">{role}</p>
          </div>
        </div>

        {/* Tombol Logout */}
        <button onClick={handleLogout} className="w-full flex items-center gap-3 px-3 py-2 text-zinc-400 hover:bg-red-500/10 hover:text-red-400 rounded-lg text-sm font-medium transition-colors duration-200">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path>
          </svg>
          Logout
        </button>
      </div>
    </aside>
  );
}