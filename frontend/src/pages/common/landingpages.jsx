import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';

// ==========================================
// UTILITAS PRESENTASI (CSS global, ikon, animasi)
// Tidak menyentuh logic aplikasi.
// ==========================================

// CSS global: font, smooth scroll, reveal, focus
const GlobalStyles = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;600;700&display=swap');

    html { scroll-behavior: smooth; }
    .lp-root { font-family: 'Manrope', ui-sans-serif, system-ui, -apple-system, 'Segoe UI', sans-serif; -webkit-font-smoothing: antialiased; }
    .lp-root :focus-visible { outline: 2px solid #F5F5F5; outline-offset: 3px; border-radius: 6px; }
    .lp-root [id] { scroll-margin-top: 80px; }

    .reveal {
      opacity: 0;
      transform: translate3d(0, 24px, 0);
      transition: opacity 0.8s cubic-bezier(0.16, 1, 0.3, 1), transform 0.8s cubic-bezier(0.16, 1, 0.3, 1);
      will-change: opacity, transform;
    }
    .reveal.is-visible { opacity: 1; transform: none; }

    @media (prefers-reduced-motion: reduce) {
      html { scroll-behavior: auto; }
      .reveal { opacity: 1; transform: none; transition: none; }
      .lp-root * { animation-duration: 0.01ms !important; transition-duration: 0.01ms !important; }
    }
  `}</style>
);

// Ikon garis SVG (pengganti emoji)
const ICON_PATHS = {
  headset: 'M3 14v-2a9 9 0 0118 0v2M3 14h2.5a1 1 0 011 1v3a1 1 0 01-1 1H5a2 2 0 01-2-2v-3zm18 0h-2.5a1 1 0 00-1 1v3a1 1 0 001 1H19a2 2 0 002-2v-3z',
  layers: 'M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5',
  clock: 'M12 22a10 10 0 100-20 10 10 0 000 20zM12 6v6l4 2',
  zap: 'M13 2L3 14h9l-1 8 10-12h-9l1-8z',
  chart: 'M3 3v18h18M7 16v-5M12 16V8M17 16v-3',
  lock: 'M5 11h14v10H5zM8 11V7a4 4 0 018 0v4',
  users: 'M17 21v-2a4 4 0 00-4-4H7a4 4 0 00-4 4v2M10 11a4 4 0 100-8 4 4 0 000 8zM21 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75',
  warning: 'M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-4.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z',
  chevron: 'M19.5 8.25l-7.5 7.5-7.5-7.5',
};

const Icon = ({ name, className = 'w-5 h-5' }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth={1.6}
    stroke="currentColor"
    className={className}
    aria-hidden="true"
  >
    <path strokeLinecap="round" strokeLinejoin="round" d={ICON_PATHS[name]} />
  </svg>
);

const StarIcon = ({ className = 'w-4 h-4' }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
  </svg>
);

// Reveal: fade-up saat masuk viewport (Intersection Observer)
const Reveal = ({ children, delay = 0, className = '' }) => {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (!('IntersectionObserver' in window)) {
      setVisible(true);
      return;
    }
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          io.disconnect();
        }
      },
      { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      style={{ transitionDelay: `${delay}ms` }}
      className={`reveal ${visible ? 'is-visible' : ''} ${className}`}
    >
      {children}
    </div>
  );
};

// Parallax ringan: memindahkan elemen langsung lewat ref (tanpa re-render)
const useParallax = (speed = 0.1, max = 700) => {
  const ref = useRef(null);

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    let raf = 0;
    const update = () => {
      raf = 0;
      if (ref.current) {
        const y = Math.min(window.scrollY, max) * speed;
        ref.current.style.transform = `translate3d(0, ${y}px, 0)`;
      }
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    update();
    return () => {
      window.removeEventListener('scroll', onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, [speed, max]);

  return ref;
};


// 1. NAVBAR
const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);
  const [isOpen, setIsOpen] = useState(false); 
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userEmail, setUserEmail] = useState('');

  useEffect(() => {
    // Fungsi buat ngecek status login dari localStorage
    const checkAuth = () => {
      const token = localStorage.getItem('access_token');
      const email = localStorage.getItem('user_email');
      setIsLoggedIn(!!token); // true kalau token ada
      setUserEmail(email || 'User');
    };

    // Cek pertama kali halaman dibuka
    checkAuth();

    // Dengerin sinyal 'auth-change' dari halaman Login/Logout
    window.addEventListener('auth-change', checkAuth);
    
    // Handler buat scroll effect
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });

    return () => {
      window.removeEventListener('auth-change', checkAuth);
      window.removeEventListener('scroll', onScroll);
    };
  }, []);

  const handleLogout = () => {
    // Hapus semua data login
    localStorage.removeItem('access_token');
    localStorage.removeItem('token_type');
    localStorage.removeItem('user_email');
    
    // Tembak sinyal kalau udah logout
    window.dispatchEvent(new Event('auth-change'));
    
    // Tutup menu mobile kalau lagi kebuka
    setIsOpen(false);
  };

  return (
    <nav
      className={`sticky top-0 z-50 border-b transition-all duration-300 ${
        scrolled || isOpen
          ? 'bg-[#080808]/90 backdrop-blur-xl border-[#262626]'
          : 'bg-transparent border-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-[72px]">
          
          {/* Logo */}
          <div className="flex items-center gap-3">
            <span className="flex items-center justify-center w-8 h-8 rounded-md border border-[#262626] bg-[#151515] text-[#F5F5F5]">
              <Icon name="headset" className="w-4 h-4" />
            </span>
            <span className="font-semibold text-lg text-[#F5F5F5] tracking-tight">Helpdesk TMS</span>
          </div>

          {/* Menu Desktop */}
          <div className="hidden md:flex space-x-8">
            <a href="#home" className="text-sm text-[#A1A1AA] hover:text-[#F5F5F5] font-medium transition-colors duration-200">Home</a>
            <a href="#fitur" className="text-sm text-[#A1A1AA] hover:text-[#F5F5F5] font-medium transition-colors duration-200">Fitur</a>
            <a href="#faq" className="text-sm text-[#A1A1AA] hover:text-[#F5F5F5] font-medium transition-colors duration-200">FAQ</a>
          </div>

          {/* Tombol Kanan Desktop */}
          <div className="hidden md:flex items-center space-x-3">
            {isLoggedIn ? (
              // KALAU UDAH LOGIN
              <>
                <Link to="/dashboard" className="text-sm font-medium text-[#A1A1AA] hover:text-[#F5F5F5] transition-colors mr-2">
                  Hi, {userEmail.split('@')[0]} {/* Ambil nama depan dari email */}
                </Link>
                <button 
                  onClick={handleLogout}
                  className="text-[#F5F5F5] border border-[#262626] hover:border-[#52525B] hover:bg-[#151515] px-4 py-2 rounded-lg font-medium transition-all duration-200 text-sm"
                >
                  Logout
                </button>
              </>
            ) : (
              // KALAU BELUM LOGIN
              <>
                <Link to="/login" className="text-[#F5F5F5] border border-[#262626] hover:border-[#52525B] hover:bg-[#151515] px-4 py-2 rounded-lg font-medium transition-all duration-200 text-sm">
                  Login
                </Link>
                <Link to="/register" className="bg-[#F5F5F5] hover:bg-white text-[#080808] px-4 py-2 rounded-lg font-semibold transition-all duration-200 text-sm">
                  Daftar
                </Link>
              </>
            )}
          </div>

          {/* Tombol Hamburger Mobile */}
          <div className="flex md:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="text-[#A1A1AA] hover:text-[#F5F5F5] focus:outline-none p-2"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {isOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Menu Dropdown Mobile */}
      <div
        className={`md:hidden overflow-hidden transition-all duration-300 ease-in-out ${
          isOpen ? 'max-h-64 border-t border-[#262626] opacity-100' : 'max-h-0 opacity-0'
        }`}
      >
        <div className="px-4 pt-2 pb-6 space-y-2 bg-[#080808]">
          <a href="#home" onClick={() => setIsOpen(false)} className="block px-3 py-2 rounded-md text-base font-medium text-[#A1A1AA] hover:text-[#F5F5F5] hover:bg-[#151515]">Home</a>
          <a href="#fitur" onClick={() => setIsOpen(false)} className="block px-3 py-2 rounded-md text-base font-medium text-[#A1A1AA] hover:text-[#F5F5F5] hover:bg-[#151515]">Fitur</a>
          <a href="#faq" onClick={() => setIsOpen(false)} className="block px-3 py-2 rounded-md text-base font-medium text-[#A1A1AA] hover:text-[#F5F5F5] hover:bg-[#151515]">FAQ</a>
          
          <div className="pt-4 flex flex-col gap-3">
            {isLoggedIn ? (
              // KALAU UDAH LOGIN (MOBILE)
              <>
                <div className="text-center text-[#A1A1AA] text-sm py-2">Hi, {userEmail.split('@')[0]}</div>
                <Link to="/dashboard" onClick={() => setIsOpen(false)} className="text-center bg-[#F5F5F5] text-[#080808] px-4 py-2 rounded-lg font-semibold transition-all duration-200">
                  Ke Dashboard
                </Link>
                <button onClick={handleLogout} className="text-center text-[#F5F5F5] border border-[#262626] hover:bg-[#151515] px-4 py-2 rounded-lg font-medium transition-all duration-200">
                  Logout
                </button>
              </>
            ) : (
              // KALAU BELUM LOGIN (MOBILE)
              <>
                <Link to="/login" onClick={() => setIsOpen(false)} className="text-center text-[#F5F5F5] border border-[#262626] hover:bg-[#151515] px-4 py-2 rounded-lg font-medium transition-all duration-200">
                  Login
                </Link>
                <Link to="/register" onClick={() => setIsOpen(false)} className="text-center bg-[#F5F5F5] text-[#080808] px-4 py-2 rounded-lg font-semibold transition-all duration-200">
                  Daftar
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};


// 2. HERO
const Hero = () => {
  // 1. Import useNavigate di paling atas file LandingPage.jsx lo
  // import { Link, useNavigate } from 'react-router-dom';
  const navigate = useNavigate();

  // 2. Fungsi buat ngecek apakah user udah login atau belum
  const handleBuatTiket = () => {
    const token = localStorage.getItem('access_token');
    if (!token) {
      // Kalau belum login, arahin ke halaman login
      navigate('/login');
    } else {
      // Kalau udah login, langsung arahin ke halaman customer (form tiket)
      navigate('/customer');
    }
  };

  return (
    <section id="home" className="relative bg-[#080808] pt-24 pb-32 lg:pt-32 lg:pb-40 overflow-hidden flex flex-col items-center justify-center text-center">
      
      {/* CSS Khusus untuk Animasi di Hero */}
      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0) scale(1); }
          50% { transform: translateY(-20px) scale(1.05); }
        }
        @keyframes gradient-shift {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        .animate-float { animation: float 8s ease-in-out infinite; }
        .text-gradient {
          background-size: 200% auto;
          background-image: linear-gradient(90deg, #A1A1AA 0%, #F5F5F5 50%, #A1A1AA 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          animation: gradient-shift 6s linear infinite;
        }
      `}</style>

      {/* Glow backgrounds (Animasi Ngambang) */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="animate-float absolute -top-[20%] left-[10%] w-[500px] h-[500px] bg-white/[0.03] rounded-full blur-3xl" />
        <div className="animate-float absolute top-[20%] right-[5%] w-[400px] h-[400px] bg-white/[0.02] rounded-full blur-3xl" style={{ animationDelay: '2s' }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-[radial-gradient(closest-side,rgba(255,255,255,0.04),transparent)] pointer-events-none" />
      </div>

      <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 z-10 flex flex-col items-center">
        
        <Reveal>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-[#262626] bg-[#111111] mb-8">
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
            <span className="text-xs font-medium text-[#A1A1AA] tracking-wide uppercase">Sistem Helpdesk 24/7</span>
          </div>
        </Reveal>

        <Reveal delay={100}>
          <h1 className="text-[3rem] sm:text-6xl lg:text-[5.5rem] font-semibold text-[#F5F5F5] leading-[1.05] tracking-[-0.04em] mb-6">
            Solusi Cepat untuk <br />
            <span className="text-gradient">Setiap Masalah</span>
          </h1>
        </Reveal>

        <Reveal delay={200}>
          <p className="text-lg md:text-xl text-[#A1A1AA] leading-relaxed mb-10 max-w-2xl mx-auto">
            Tim support kami siap membantu 24/7. Buat tiket, pantau status, dan selesaikan masalah Anda dengan sistem helpdesk terpadu kami.
          </p>
        </Reveal>

        <Reveal delay={300}>
          <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
            
            {/* 3. Ubah Link jadi button dengan onClick */}
            <button 
              onClick={handleBuatTiket}
              className="group relative bg-[#F5F5F5] hover:bg-white text-[#080808] px-8 py-4 rounded-xl text-base font-semibold transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_0_20px_rgba(255,255,255,0.2)] text-center overflow-hidden"
            >
              <span className="relative z-10">Buat Tiket Sekarang</span>
            </button>

            <a href="#fitur" className="border border-[#262626] text-[#F5F5F5] hover:border-[#52525B] hover:bg-[#111111] px-8 py-4 rounded-xl text-base font-medium transition-all duration-300 text-center">
              Pelajari Fitur
            </a>
          </div>
        </Reveal>
      </div>
    </section>
  );
};

// 3. STATS
const Stats = () => {
  const data = [
    { label: 'Tiket Selesai', value: '10k+' },
    { label: 'Kepuasan Pelanggan', value: '99%' },
    { label: 'Waktu Respon', value: '< 5m' },
  ];
  return (
    <section className="bg-[#0A0A0A] border-y border-[#262626]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Grid diubah jadi text-center dan gap, divide-x dihapus */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-0 text-center">
          {data.map((item, i) => (
            <Reveal key={i} delay={i * 100}>
              {/* flex-col & items-center bikin teks pas di tengah */}
              <div className={`flex flex-col items-center justify-center py-10 md:py-14 ${i !== data.length - 1 ? 'md:border-r md:border-[#262626]' : ''}`}>
                <div className="text-5xl md:text-6xl font-semibold text-[#F5F5F5] tracking-[-0.04em] tabular-nums mb-3">
                  {item.value}
                </div>
                <div className="text-sm text-[#A1A1AA] font-medium">
                  {item.label}
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
};


// 4. FEATURES
const Features = () => {
  // Catatan: nilai `icon` kini berupa nama ikon SVG (menggantikan emoji)
  const features = [
    { icon: 'layers', title: 'Manajemen Tiket', desc: 'Kelola semua keluhan dalam satu tempat.' },
    { icon: 'clock', title: 'Tracking Real-time', desc: 'Pantau status tiket secara langsung.' },
    { icon: 'zap', title: 'Prioritas Cerdas', desc: 'Atur tiket berdasarkan tingkat urgensi.' },
    { icon: 'chart', title: 'Dashboard Analitik', desc: 'Laporan performa dan statistik lengkap.' },
    { icon: 'lock', title: 'Keamanan Data', desc: 'Dilindungi JWT dan Role-Based Access.' },
    { icon: 'users', title: 'Kolaborasi Tim', desc: 'Diskusi antar Agent dan Customer dengan mudah.' },
  ];

  return (
    <section id="fitur" className="py-24 lg:py-32 bg-[#080808]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <Reveal>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-16 items-end mb-14">
            <h2 className="text-3xl md:text-5xl font-semibold text-[#F5F5F5] tracking-[-0.03em] leading-[1.1]">Fitur Unggulan</h2>
            <p className="text-[#A1A1AA] leading-relaxed max-w-md">Semua yang Anda butuhkan untuk memberikan layanan pelanggan terbaik dalam satu platform.</p>
          </div>
        </Reveal>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-px bg-[#262626] border border-[#262626] rounded-2xl overflow-hidden">
          {features.map((feat, idx) => (
            <Reveal key={idx} delay={(idx % 3) * 90 + Math.floor(idx / 3) * 90}>
              <div className="group h-full p-8 lg:p-10 bg-[#0A0A0A] hover:bg-[#111111] transition-colors duration-300">
                <div className="w-11 h-11 border border-[#262626] bg-[#151515] text-[#F5F5F5] rounded-lg flex items-center justify-center mb-8 group-hover:border-[#52525B] transition-colors duration-300">
                  <Icon name={feat.icon} className="w-5 h-5" />
                </div>
                <h3 className="text-lg font-semibold text-[#F5F5F5] tracking-tight mb-2">{feat.title}</h3>
                <p className="text-[#A1A1AA] text-[15px] leading-relaxed">{feat.desc}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
};


// 5. HOW IT WORKS
const HowItWorks = () => {
  const steps = [
    { num: '1', title: 'Buat Akun & Login', desc: 'Daftar dengan email dan masuk ke sistem.' },
    { num: '2', title: 'Buat Tiket Masalah', desc: 'Jelaskan kendala Anda dengan detail.' },
    { num: '3', title: 'Pantau & Selesai', desc: 'Cek progress dan selesaikan masalah.' },
  ];

  return (
    <section className="py-24 lg:py-32 bg-[#0A0A0A] border-y border-[#262626]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <Reveal>
          <h2 className="text-3xl md:text-5xl font-semibold text-[#F5F5F5] tracking-[-0.03em] leading-[1.1] mb-16 max-w-xl">Bagaimana Cara Kerjanya?</h2>
        </Reveal>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 md:gap-8">
          {steps.map((step, idx) => (
            <Reveal key={idx} delay={idx * 120}>
              <div className="relative pl-14 md:pl-0">
                {/* Nomor langkah */}
                <div className="absolute left-0 top-0 md:static z-10 flex items-center justify-center w-10 h-10 rounded-full border border-[#262626] bg-[#151515] text-sm font-semibold text-[#F5F5F5] md:mb-8">
                  {step.num}
                </div>
                {/* Garis penghubung: vertikal di mobile */}
                {idx < steps.length - 1 && (
                  <div aria-hidden="true" className="md:hidden absolute left-5 top-10 -bottom-12 w-px bg-[#262626]" />
                )}
                {/* Garis penghubung: horizontal di desktop */}
                {idx < steps.length - 1 && (
                  <div aria-hidden="true" className="hidden md:block absolute top-5 left-14 -right-8 h-px bg-[#262626]" />
                )}
                <h3 className="text-xl font-semibold text-[#F5F5F5] tracking-tight mb-2 pt-1.5 md:pt-0">{step.title}</h3>
                <p className="text-[#A1A1AA] leading-relaxed max-w-xs">{step.desc}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
};


// 6. TESTIMONIALS
const Testimonials = () => {
  const reviews = [
    { name: 'Budi Santoso', role: 'Pelanggan Setia', text: 'Responnya super cepat! Masalah saya selesai dalam hitungan menit.', avatar: 'https://i.pravatar.cc/150?img=11' },
    { name: 'Siti Aminah', role: 'Pemilik Bisnis', text: 'Dashboard-nya sangat membantu saya memantau keluhan pelanggan.', avatar: 'https://i.pravatar.cc/150?img=5' },
    { name: 'Andi Wijaya', role: 'IT Support', text: 'Sistem tiket yang sangat rapi. Kerja sama tim jadi lebih efisien.', avatar: 'https://i.pravatar.cc/150?img=33' },
  ];

  return (
    <section className="py-24 lg:py-32 bg-[#080808]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <Reveal>
          <h2 className="text-3xl md:text-5xl font-semibold text-[#F5F5F5] tracking-[-0.03em] leading-[1.1] mb-14 max-w-xl">Apa Kata Mereka?</h2>
        </Reveal>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 lg:gap-6">
          {reviews.map((rev, idx) => (
            <Reveal key={idx} delay={idx * 100} className="h-full">
              <div className="h-full flex flex-col justify-between bg-[#111111] p-8 rounded-xl border border-[#262626] hover:border-[#3F3F46] transition-colors duration-300">
                <div>
                  <div className="flex gap-1 text-[#F5F5F5]/80 mb-6" aria-label="Rating 5 dari 5">
                    {[0, 1, 2, 3, 4].map((s) => <StarIcon key={s} className="w-4 h-4" />)}
                  </div>
                  <p className="text-[#F5F5F5] text-[17px] leading-relaxed mb-10">“{rev.text}”</p>
                </div>
                <div className="flex items-center gap-4 pt-6 border-t border-[#262626]">
                  <img src={rev.avatar} alt={rev.name} className="w-10 h-10 rounded-full object-cover grayscale border border-[#262626]" />
                  <div>
                    <h4 className="font-semibold text-[#F5F5F5] text-sm">{rev.name}</h4>
                    <p className="text-sm text-[#A1A1AA]">{rev.role}</p>
                  </div>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
};

// 7. FAQ
const FAQ = () => {
  const [faqs, setFaqs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [openIndex, setOpenIndex] = useState(null);

  useEffect(() => {
    const fetchFaqs = async () => {
      try {
        const res = await fetch('http://localhost:8000/faq/all');
        if (!res.ok) throw new Error('Gagal ambil data');
        const data = await res.json();
        const faqData = Array.isArray(data) ? data : data.data || [];
        setFaqs(faqData);
      } catch (err) {
        console.error('Error Fetch FAQ:', err);
        setError(true);
      } finally {
        setLoading(false);
      }
    };
    fetchFaqs();
  }, []);

  const toggleFaq = (index) => setOpenIndex(openIndex === index ? null : index);

  return (
    <section id="faq" className="py-24 lg:py-32 bg-[#0A0A0A] border-t border-[#262626]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16">
          <div className="lg:col-span-4">
            <Reveal className="lg:sticky lg:top-28">
              <h2 className="text-3xl md:text-5xl font-semibold text-[#F5F5F5] tracking-[-0.03em] leading-[1.1] mb-4">Pertanyaan Umum</h2>
              <p className="text-[#A1A1AA] leading-relaxed">Punya pertanyaan? Mungkin jawabannya ada di sini.</p>
            </Reveal>
          </div>
        
          <div className="lg:col-span-8">
            {/* Loading State */}
            {loading && (
              <div className="flex justify-start py-10">
                <div className="w-8 h-8 border-2 border-[#262626] border-t-[#F5F5F5] rounded-full animate-spin"></div>
              </div>
            )}
            
            {/* Error State */}
            {error && !loading && (
              <div className="flex items-start gap-3 bg-red-950/30 border border-red-900/50 text-red-300 px-5 py-4 rounded-xl text-sm font-medium">
                <Icon name="warning" className="w-5 h-5 flex-shrink-0 mt-0.5" />
                <span>Maaf, gagal mengambil data FAQ. Pastikan server backend sudah berjalan.</span>
              </div>
            )}

            {/* Empty State */}
            {!loading && !error && faqs.length === 0 && (
              <div className="text-[#A1A1AA] py-8">Belum ada data FAQ saat ini.</div>
            )}

            {/* FAQ Items */}
            {!loading && !error && faqs.map((faq, index) => (
              <div key={faq.id || index} className="border-b border-[#262626] first:border-t">
                <button
                  onClick={() => toggleFaq(index)}
                  aria-expanded={openIndex === index}
                  className="group w-full py-6 text-left flex justify-between items-center gap-6"
                >
                  <span className="font-medium text-[#F5F5F5] text-lg tracking-tight">{faq.question || faq.pertanyaan}</span>
                  <span className="flex-shrink-0 flex items-center justify-center w-8 h-8 rounded-full border border-[#262626] text-[#A1A1AA] group-hover:text-[#F5F5F5] group-hover:border-[#52525B] transition-colors duration-200">
                    <Icon
                      name="chevron"
                      className={`w-4 h-4 transform transition-transform duration-300 ${openIndex === index ? 'rotate-180' : ''}`}
                    />
                  </span>
                </button>
                <div 
                  className={`overflow-hidden transition-all duration-500 ease-in-out ${
                    openIndex === index ? 'max-h-96 pb-6 opacity-100' : 'max-h-0 pb-0 opacity-0'
                  }`}
                >
                  <p className="text-[#A1A1AA] leading-relaxed max-w-2xl pr-14">{faq.answer || faq.jawaban}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};


// 8. CTA
const CTA = () => (
  <section className="py-24 lg:py-32 bg-[#080808]">
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
      <Reveal>
        <div
          className="relative overflow-hidden rounded-3xl border border-[#262626] bg-[#111111] p-10 md:p-20 text-center"
          style={{ backgroundImage: 'radial-gradient(60% 80% at 50% 0%, rgba(255,255,255,0.07), rgba(255,255,255,0))' }}
        >
          <div className="relative">
            <h2 className="text-3xl md:text-5xl font-semibold text-[#F5F5F5] tracking-[-0.03em] leading-[1.1] mb-6">Siap Menyelesaikan Masalah Anda?</h2>
            <p className="text-[#A1A1AA] text-lg leading-relaxed mb-10 max-w-2xl mx-auto">Bergabunglah dengan ribuan pelanggan yang puas. Daftar sekarang dan nikmati layanan support terbaik.</p>
            <Link to="/register" className="inline-block bg-[#F5F5F5] hover:bg-white text-[#080808] px-9 py-4 rounded-lg font-semibold text-base transition-all duration-200 hover:-translate-y-0.5">
              Daftar Sekarang!
            </Link>
          </div>
        </div>
      </Reveal>
    </div>
  </section>
);


// 9. FOOTER
const Footer = () => (
  <footer className="bg-[#080808] border-t border-[#262626] py-16">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="grid grid-cols-1 md:grid-cols-12 gap-12 mb-14">
        <div className="md:col-span-6">
          <div className="flex items-center gap-3 mb-4">
            <span className="flex items-center justify-center w-8 h-8 rounded-md border border-[#262626] bg-[#151515] text-[#F5F5F5]">
              <Icon name="headset" className="w-4 h-4" />
            </span>
            <span className="font-semibold text-lg text-[#F5F5F5] tracking-tight">Helpdesk TMS</span>
          </div>
          <p className="text-sm text-[#A1A1AA] leading-relaxed max-w-sm">
            Platform manajemen tiket terpadu untuk mempermudah komunikasi antara pelanggan dan tim support.
          </p>
        </div>
        <div className="md:col-span-3">
          <h3 className="text-[#F5F5F5] font-semibold text-sm mb-5">Tautan Cepat</h3>
          <ul className="space-y-3 text-sm text-[#A1A1AA]">
            <li><a href="#home" className="hover:text-[#F5F5F5] transition-colors duration-200">Beranda</a></li>
            <li><a href="#fitur" className="hover:text-[#F5F5F5] transition-colors duration-200">Fitur</a></li>
            <li><a href="#faq" className="hover:text-[#F5F5F5] transition-colors duration-200">FAQ</a></li>
          </ul>
        </div>
        <div className="md:col-span-3">
          <h3 className="text-[#F5F5F5] font-semibold text-sm mb-5">Hubungi Kami</h3>
          <ul className="space-y-3 text-sm text-[#A1A1AA]">
            <li>Email: support@helpdesktms.com</li>
            <li>Telepon: +62 21 1234 5678</li>
            <li>Alamat: Jl. Teknologi No. 123, Jakarta</li>
          </ul>
        </div>
      </div>
      <div className="border-t border-[#262626] pt-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 text-sm text-[#71717A]">
        <p>&copy; 2026 Helpdesk TMS. Hak Cipta Dilindungi.</p>
        <div className="flex gap-6">
          <a href="#" className="hover:text-[#F5F5F5] transition-colors duration-200">Kebijakan Privasi</a>
          <a href="#" className="hover:text-[#F5F5F5] transition-colors duration-200">Syarat & Ketentuan</a>
        </div>
      </div>
    </div>
  </footer>
);


// MAIN APP (Export Default)
export default function LandingPage() {
  return (
    <div className="lp-root min-h-screen bg-[#080808] font-sans text-[#F5F5F5] selection:bg-white/20">
      <GlobalStyles />
      <Navbar />
      <main>
        <Hero />
        <Stats />
        <Features />
        <HowItWorks />
        <Testimonials />
        <FAQ />
        <CTA />
      </main>
      <Footer />
    </div>
  );
}