import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

// PERHATIKAN PATH IMPORT-NYA (sesuai screenshot folder lo)
import LandingPage from './pages/common/landingpages';
import Login from './pages/common/login';
import Register from './pages/common/register';
import CustomerDashboard from './pages/common/customer_dashboard'; // Pastiin nama file customer lo .jsx
import AdminDashboard from './pages/admin/dashboard';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Halaman Utama */}
        <Route path="/" element={<LandingPage />} />
        
        {/* Auth */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        
        {/* Dashboard */}
        <Route path="/customer" element={<CustomerDashboard />} />
        <Route path="/admin" element={<AdminDashboard />} />
        
        {/* Fallback kalau URL ngawur */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;