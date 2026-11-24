import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function CustomerDashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [tickets, setTickets] = useState([]);
  const [loadingTickets, setLoadingTickets] = useState(true);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [priority, setPriority] = useState('medium');
  
  const [categories, setCategories] = useState([]); 
  const [submitLoading, setSubmitLoading] = useState(false);
  
  // State baru buat nampilin error di layar
  const [errorMsg, setErrorMsg] = useState('');
  const [debugMsg, setDebugMsg] = useState(''); // Buat nampilin error fetch

  const token = localStorage.getItem('access_token');
  const userId = localStorage.getItem('user_id');

  const fetchMyTickets = async () => {
    if (!userId || userId === 'undefined') {
      setDebugMsg("Gagal: user_id kosong di localStorage. Silakan login ulang.");
      setLoadingTickets(false);
      return;
    }
    
    try {
      const res = await fetch(`http://localhost:8000/ticket/mytickets?customer_id=${userId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      const data = await res.json();
      console.log("Raw Data Tiket:", data); 

      if (res.ok) {
        let ticketsArray = [];
        
        // Trik pembaca data dari FastAPI
        if (Array.isArray(data)) {
          ticketsArray = data;
        } else if (data && typeof data === 'object') {
          // Kadang FastAPI ngirim array di dalam key 'data', atau ngirim object {0: {...}}
          if (Array.isArray(data.data)) ticketsArray = data.data;
          else if (Array.isArray(data.tickets)) ticketsArray = data.tickets;
          else ticketsArray = Object.values(data); // Nangkep format {0: {...}, 1: {...}}
        }
        
        // Buang data sampah (kalau ada string kosong)
        ticketsArray = ticketsArray.filter(t => typeof t === 'object' && t !== null);

        setTickets(ticketsArray);
      } else {
        setDebugMsg(`Backend Error: ${res.status} ${res.statusText}`);
      }
    } catch (err) {
      setDebugMsg(`Gagal Fetch: ${err.message}`);
    } finally {
      setLoadingTickets(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const res = await fetch('http://localhost:8000/category/all', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      
      let catArray = [];
      if (Array.isArray(data)) catArray = data;
      else if (data && typeof data === 'object') catArray = Object.values(data);
      
      catArray = catArray.filter(c => typeof c === 'object' && c !== null);

      setCategories(catArray);
    } catch (err) {
      console.error('Gagal ambil kategori', err);
    }
  };

  useEffect(() => {
    const email = localStorage.getItem('user_email');
    const role = localStorage.getItem('user_role');
    
    if (role?.toUpperCase() !== 'CUSTOMER') {
      navigate('/login');
      return;
    }
    
    setUser({ email, id: userId });
    fetchMyTickets();
    fetchCategories();
  }, [navigate, userId]);

  const handleCreateTicket = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSubmitLoading(true);

    try {
      const res = await fetch('http://localhost:8000/ticket/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          title,
          description,
          category_id: categoryId,
          priority
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || 'Gagal buat tiket');

      setTitle(''); setDescription(''); setCategoryId(''); setPriority('medium');
      alert('Tiket berhasil dibuat!');
      
      setTimeout(() => fetchMyTickets(), 500);

    } catch (err) {
      setErrorMsg(err.message);
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    window.dispatchEvent(new Event('auth-change'));
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-[#080808] text-[#F5F5F5] p-6 md:p-10 font-sans">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-10 border-b border-[#262626] pb-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Customer Area</h1>
            <p className="text-[#A1A1AA] mt-1">Halo, {user?.email}</p>
          </div>
          <button onClick={handleLogout} className="text-sm font-medium border border-[#262626] hover:bg-[#151515] px-4 py-2 rounded-lg transition-colors">
            Logout
          </button>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1 bg-[#0A0A0A] p-6 rounded-2xl border border-[#262626] h-fit">
            <h2 className="text-xl font-semibold mb-6">Buat Tiket Baru</h2>
            
            {errorMsg && <div className="mb-4 text-red-400 text-sm bg-red-950/30 p-3 rounded-lg border border-red-900/50">{errorMsg}</div>}

            <form onSubmit={handleCreateTicket} className="space-y-4">
              <div>
                <label className="block text-sm text-[#A1A1AA] mb-1">Judul Masalah</label>
                <input type="text" value={title} onChange={e => setTitle(e.target.value)} required className="w-full bg-[#111111] border border-[#262626] rounded-lg p-3 text-sm focus:border-[#52525B] focus:outline-none" placeholder="Contoh: Wifi mati" />
              </div>

              <div>
                <label className="block text-sm text-[#A1A1AA] mb-1">Kategori</label>
                <select 
                  value={categoryId} 
                  onChange={e => setCategoryId(e.target.value)} 
                  required 
                  className="w-full bg-[#111111] border border-[#262626] rounded-lg p-3 text-sm focus:border-[#52525B] focus:outline-none"
                >
                  <option value="">-- Pilih Kategori --</option>
                  {categories.length === 0 && <option value="" disabled>Loading Kategori...</option>}
                  {categories.map((cat, idx) => (
                    <option key={cat._id || idx} value={cat._id}>
                      {cat.name || 'Tanpa Nama'}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm text-[#A1A1AA] mb-1">Prioritas</label>
                <select value={priority} onChange={e => setPriority(e.target.value)} className="w-full bg-[#111111] border border-[#262626] rounded-lg p-3 text-sm focus:border-[#52525B] focus:outline-none">
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="urgent">Urgent</option>
                </select>
              </div>

              <div>
                <label className="block text-sm text-[#A1A1AA] mb-1">Deskripsi Detail</label>
                <textarea value={description} onChange={e => setDescription(e.target.value)} required rows="4" className="w-full bg-[#111111] border border-[#262626] rounded-lg p-3 text-sm focus:border-[#52525B] focus:outline-none" placeholder="Jelaskan detail masalahnya..."></textarea>
              </div>

              <button type="submit" disabled={submitLoading} className="w-full bg-[#F5F5F5] hover:bg-white text-[#080808] font-semibold py-3 rounded-lg transition-colors disabled:opacity-50 mt-2">
                {submitLoading ? 'Mengirim...' : 'Kirim Tiket'}
              </button>
            </form>
          </div>

          <div className="lg:col-span-2">
            <h2 className="text-xl font-semibold mb-6">Tiket Saya</h2>
            
            {/* TAMPILIN ERROR DI SINI KALAU ADA */}
            {debugMsg && (
              <div className="mb-4 text-red-400 text-sm bg-red-950/30 p-4 rounded-lg border border-red-900/50 font-mono">
                {debugMsg}
              </div>
            )}

            {loadingTickets ? (
              <p className="text-[#A1A1AA]">Memuat tiket...</p>
            ) : tickets.length === 0 ? (
              <div className="bg-[#0A0A0A] border border-[#262626] rounded-2xl p-10 text-center text-[#A1A1AA]">
                Belum ada tiket. Silakan buat tiket baru.
              </div>
            ) : (
              <div className="space-y-4">
                {tickets.map((ticket, idx) => (
                  <div key={ticket._id || ticket.id || idx} className="bg-[#0A0A0A] border border-[#262626] rounded-xl p-5 hover:border-[#52525B] transition-colors">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-semibold text-lg">{ticket.title}</h3>
                      <span className={`text-xs font-bold px-2 py-1 rounded-md uppercase tracking-wider
                        ${ticket.status === 'open' ? 'bg-blue-950 text-blue-400 border border-blue-900' : 
                          ticket.status === 'in_progress' ? 'bg-yellow-950 text-yellow-400 border border-yellow-900' : 
                          ticket.status === 'resolved' || ticket.status === 'closed' ? 'bg-green-950 text-green-400 border border-green-900' : 
                          'bg-gray-800 text-gray-400 border border-gray-700'}`}>
                        {ticket.status.replace('_', ' ')}
                      </span>
                    </div>
                    <p className="text-sm text-[#A1A1AA] mb-4">{ticket.description}</p>
                    
                    <div className="flex justify-between items-center text-xs text-[#52525B] border-t border-[#262626] pt-3">
                      <span>No. Tiket: {ticket.ticket_number || '-'}</span>
                      <span>Prioritas: <strong className="uppercase">{ticket.priority}</strong></span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}