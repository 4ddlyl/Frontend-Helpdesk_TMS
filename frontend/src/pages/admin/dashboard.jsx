import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, PieChart, Pie, Cell
} from 'recharts';
import AdminSidebar from '../../components/admin_sidebar';

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');

  const token = localStorage.getItem('access_token');

  useEffect(() => {
    const roleCheck = (localStorage.getItem('user_role') || '').toUpperCase();
    if (roleCheck !== 'ADMIN' && roleCheck !== 'AGENT') {
      navigate('/login');
      return;
    }
    setUser({ email: localStorage.getItem('user_email'), role: roleCheck });

    const fetchDashboardStats = async () => {
      try {
        const res = await fetch('http://localhost:8000/ticket/dashboard', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await res.json();

        if (res.ok) {
          setStats(data);
        } else {
          setErrorMsg(data.detail || 'Gagal mengambil data dashboard');
        }
      } catch (err) {
        setErrorMsg(`Gagal koneksi: ${err.message}`);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardStats();
  }, [navigate, token]);

  // --- PENGOLAHAN DATA UNTUK GRAFIK ---

  // 1. Status
  const statusData = stats ? Object.keys(stats['tickets by status'] || {}).map(key => ({
    name: key.replace(/_/g, ' ').toUpperCase(),
    value: stats['tickets by status'][key]
  })) : [];

  // 2. Prioritas
  const priorityData = stats ? Object.keys(stats['tickets by priority'] || {}).map(key => ({
    name: key.toUpperCase(),
    value: stats['tickets by priority'][key]
  })) : [];

  // 3. Tren Harian
  const trendData = stats?.['daily ticket trend']?.tanggal?.map((date, idx) => ({
    tanggal: date,
    tiket: stats['daily ticket trend'].total[idx]
  })) || [];

  // 4. Agent Performance
  const agentData = stats?.['agent performance'] || [];

  // Warna untuk grafik
  const COLORS = ['#3B82F6', '#F59E0B', '#10B981', '#EF4444', '#8B5CF6', '#EC4899'];

  // Gradasi avatar agent
  const AVATAR_GRADIENTS = [
    'from-blue-500 to-indigo-600',
    'from-emerald-500 to-teal-600',
    'from-amber-500 to-orange-600',
    'from-fuchsia-500 to-purple-600',
    'from-sky-500 to-cyan-600',
    'from-rose-500 to-pink-600',
  ];

  // Gaya bersama untuk grafik
  const AXIS_TICK = { fill: '#71717A', fontSize: 11 };
  const GRID_STROKE = 'rgba(255,255,255,0.04)';
  const TOOLTIP_STYLE = {
    backgroundColor: 'rgba(24,24,27,0.95)',
    backdropFilter: 'blur(12px)',
    WebkitBackdropFilter: 'blur(12px)',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: '8px',
    boxShadow: '0 25px 50px -12px rgba(0,0,0,0.6)',
    padding: '8px 12px',
    fontSize: '12px',
  };
  const TOOLTIP_LABEL_STYLE = { color: '#A1A1AA', fontSize: 11, marginBottom: 2 };
  const TOOLTIP_ITEM_STYLE = { color: '#F4F4F5', fontSize: 12, padding: 0 };

  // Kelas bersama untuk kartu (bento)
  const CARD =
    'bg-[#111113] rounded-xl border border-white/[0.07] shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06)] hover:border-white/[0.15] transition-all duration-300';

  if (loading) {
    return (
      <div className="min-h-screen bg-[#09090B] flex flex-col items-center justify-center text-zinc-400 gap-4">
        <div className="relative w-10 h-10">
          <div className="absolute inset-0 rounded-full border-2 border-white/[0.08]"></div>
          <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-blue-500 animate-spin"></div>
        </div>
        <p className="text-xs uppercase tracking-wider font-medium text-zinc-500">Memuat Data Dashboard...</p>
      </div>
    );
  }

  if (errorMsg) {
    return (
      <div className="min-h-screen bg-[#09090B] flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-[#111113] rounded-xl border border-red-500/20 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06)] p-6 flex items-start gap-4">
          <div className="p-2 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 shrink-0">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
          </div>
          <div>
            <h2 className="text-sm font-semibold tracking-tight text-zinc-100">Terjadi kesalahan</h2>
            <p className="text-sm text-zinc-500 mt-1">{errorMsg}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen bg-[#09090B] text-zinc-100 font-sans flex overflow-hidden">
      
      {/* 1. PANGGIL SIDEBAR DI SINI (Kodingan <aside> yang lama UDAH DIHAPUS) */}
      <AdminSidebar/>

      {/* AMBIENT GLOW */}
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-[480px] z-0"
        style={{ background: 'radial-gradient(60% 100% at 50% 0%, rgba(59,130,246,0.09) 0%, rgba(9,9,11,0) 70%)' }}
      ></div>

      {/* MAIN CONTENT */}
      <main className="relative z-10 flex-1 flex flex-col h-screen overflow-y-auto">
        <header className="h-16 shrink-0 border-b border-white/[0.06] flex items-center justify-between px-8 bg-[#09090B]/75 backdrop-blur-xl sticky top-0 z-20">
          <div>
            <h1 className="text-base font-semibold tracking-tight text-zinc-100">Dashboard Overview</h1>
          </div>
          <div className="flex items-center gap-2.5 pl-1.5 pr-4 py-1.5 rounded-full bg-white/[0.04] border border-white/[0.08] shadow-[inset_0_1px_0_0_rgba(255,255,255,0.05)]">
            <div className="w-7 h-7 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-xs font-semibold">
              {user?.email?.charAt(0).toUpperCase()}
            </div>
            <div className="hidden sm:flex items-center gap-2.5">
              <p className="text-sm font-medium text-zinc-200 leading-none">{user?.email}</p>
              <span className="w-px h-3 bg-white/10"></span>
              <p className="text-xs text-blue-400 font-medium uppercase tracking-wider leading-none">{user?.role}</p>
            </div>
          </div>
        </header>

        <div className="p-8 max-w-7xl mx-auto w-full space-y-6">

          {/* ================= ROW 1: KARTU ANGKA ================= */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Total Tiket */}
            <div className={`${CARD} p-5 flex flex-col justify-between min-h-[132px]`}>
              <div className="flex items-start justify-between">
                <h3 className="text-xs uppercase tracking-wider font-medium text-zinc-400">Total Keseluruhan</h3>
                <div className="p-2 rounded-lg bg-white/[0.03] border border-white/[0.06] text-blue-400">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
                </div>
              </div>
              <h2 className="text-4xl font-semibold tracking-tight tabular-nums text-zinc-100">{stats['total tickets']}</h2>
            </div>

            {/* Unassigned Agent */}
            <div className={`${CARD} p-5 flex flex-col justify-between min-h-[132px]`}>
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  <span className="relative flex h-2 w-2">
                    <span className="absolute inline-flex h-full w-full rounded-full bg-red-500 opacity-60 animate-pulse"></span>
                    <span className="relative inline-flex h-2 w-2 rounded-full bg-red-500"></span>
                  </span>
                  <h3 className="text-xs uppercase tracking-wider font-medium text-zinc-400">Belum Di-assign</h3>
                </div>
                <div className="p-2 rounded-lg bg-white/[0.03] border border-white/[0.06] text-red-400">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
                </div>
              </div>
              <h2 className="text-4xl font-semibold tracking-tight tabular-nums text-red-400">{stats['unassigned agent']}</h2>
            </div>

            {/* Agent Aktif */}
            <div className={`${CARD} p-5 flex flex-col justify-between min-h-[132px]`}>
              <div className="flex items-start justify-between">
                <h3 className="text-xs uppercase tracking-wider font-medium text-zinc-400">Agent Aktif</h3>
                <div className="p-2 rounded-lg bg-white/[0.03] border border-white/[0.06] text-emerald-400">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path></svg>
                </div>
              </div>
              <h2 className="text-4xl font-semibold tracking-tight tabular-nums text-zinc-100">{agentData.length}</h2>
            </div>
          </div>

          {/* ================= ROW 2: GRAFIK UTAMA ================= */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

            {/* Area Chart: Tren Harian (Ambil 2 kolom) */}
            <div className={`lg:col-span-2 ${CARD} p-6`}>
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-sm font-semibold tracking-tight text-zinc-100">Tren Tiket Harian</h3>
              </div>
              <div className="h-80 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={trendData} margin={{ top: 5, right: 12, bottom: 0, left: -20 }}>
                    <defs>
                      <linearGradient id="trendGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#3B82F6" stopOpacity={0.25} />
                        <stop offset="100%" stopColor="#3B82F6" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="4 4" stroke={GRID_STROKE} vertical={false} />
                    <XAxis dataKey="tanggal" tick={AXIS_TICK} tickLine={false} axisLine={false} dy={10} />
                    <YAxis tick={AXIS_TICK} tickLine={false} axisLine={false} allowDecimals={false} />
                    <Tooltip
                      contentStyle={TOOLTIP_STYLE}
                      labelStyle={TOOLTIP_LABEL_STYLE}
                      itemStyle={TOOLTIP_ITEM_STYLE}
                      cursor={{ stroke: 'rgba(255,255,255,0.1)', strokeWidth: 1 }}
                    />
                    <Area
                      type="monotone"
                      dataKey="tiket"
                      stroke="#3B82F6"
                      strokeWidth={2}
                      fill="url(#trendGradient)"
                      dot={false}
                      activeDot={{ r: 5, fill: '#3B82F6', stroke: '#09090B', strokeWidth: 2 }}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Donut Chart: Prioritas (Ambil 1 kolom) */}
            <div className={`${CARD} p-6 flex flex-col`}>
              <h3 className="text-sm font-semibold tracking-tight text-zinc-100 mb-6">Berdasarkan Prioritas</h3>
              <div className="h-48 w-full relative">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={priorityData}
                      cx="50%"
                      cy="50%"
                      innerRadius={68}
                      outerRadius={88}
                      paddingAngle={4}
                      dataKey="value"
                      stroke="none"
                    >
                      {priorityData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} stroke="none" />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={TOOLTIP_STYLE}
                      labelStyle={TOOLTIP_LABEL_STYLE}
                      itemStyle={TOOLTIP_ITEM_STYLE}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              {/* Legend rapi di bawah */}
              <ul className="mt-5 space-y-2.5 divide-y divide-white/[0.06]">
                {priorityData.map((entry, index) => (
                  <li key={`legend-${index}`} className="flex items-center justify-between pt-2.5 first:pt-0">
                    <span className="flex items-center gap-2.5 text-xs font-medium text-zinc-400">
                      <span className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }}></span>
                      {entry.name}
                    </span>
                    <span className="text-sm font-semibold tracking-tight tabular-nums text-zinc-100">{entry.value}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* ================= ROW 3: BAR CHART STATUS & AGENT LIST ================= */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

            {/* Bar Chart: Status */}
            <div className={`${CARD} p-6`}>
              <h3 className="text-sm font-semibold tracking-tight text-zinc-100 mb-6">Distribusi Status Tiket</h3>
              <div className="h-80 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={statusData} margin={{ top: 5, right: 12, bottom: 0, left: -20 }}>
                    <CartesianGrid strokeDasharray="4 4" stroke={GRID_STROKE} vertical={false} />
                    <XAxis dataKey="name" tick={AXIS_TICK} tickLine={false} axisLine={false} dy={10} />
                    <YAxis tick={AXIS_TICK} tickLine={false} axisLine={false} allowDecimals={false} />
                    <Tooltip
                      contentStyle={TOOLTIP_STYLE}
                      labelStyle={TOOLTIP_LABEL_STYLE}
                      itemStyle={TOOLTIP_ITEM_STYLE}
                      cursor={{ fill: 'rgba(255,255,255,0.03)' }}
                    />
                    <Bar dataKey="value" fill="#3B82F6" radius={[6, 6, 0, 0]} maxBarSize={38} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Agent Performance List */}
            <div className={`${CARD} p-6 flex flex-col`}>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold tracking-tight text-zinc-100">Performa Agent</h3>
                <span className="text-xs uppercase tracking-wider font-medium text-zinc-500">Total Diselesaikan</span>
              </div>

              <div className="flex-1 overflow-y-auto max-h-80 pr-1">
                {agentData.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full min-h-[200px] text-zinc-500 text-sm">
                    <svg className="w-10 h-10 mb-3 text-zinc-700" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"></path></svg>
                    Belum ada data performa agent.
                  </div>
                ) : (
                  <ul className="divide-y divide-white/[0.06]">
                    {agentData.map((agent, idx) => (
                      <li key={idx} className="flex justify-between items-center py-3 first:pt-0 last:pb-0">
                        <div className="flex items-center gap-3 min-w-0">
                          <div className={`w-8 h-8 shrink-0 rounded-full bg-gradient-to-br ${AVATAR_GRADIENTS[idx % AVATAR_GRADIENTS.length]} flex items-center justify-center text-white text-xs font-semibold ring-1 ring-white/10`}>
                            {/* Ambil huruf pertama dari ID atau nama */}
                            {agent.agent_name ? agent.agent_name.charAt(0).toUpperCase() : 'A'}
                          </div>
                          <p className="text-sm font-medium text-zinc-200 truncate">
                            {agent.agent_name ? agent.agent_name : `Agent ID: ${agent._id?.slice(0, 8)}...`}
                          </p>
                        </div>
                        <span className="ml-4 shrink-0 min-w-[2.5rem] text-center font-mono text-sm font-semibold tabular-nums text-blue-400 bg-blue-500/10 border border-blue-500/20 px-2.5 py-1 rounded-md">
                          {agent.total || agent.total_tickets || 0}
                        </span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>

          </div>
        </div>
      </main>
    </div>
  );
}