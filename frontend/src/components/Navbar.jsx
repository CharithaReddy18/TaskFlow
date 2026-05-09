import React, { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { LogOut, LayoutDashboard, FolderKanban } from 'lucide-react';

const Navbar = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  if (!user) return null;

  return (
    <nav className="navbar">
      <div className="logo" style={{ fontWeight: 700, fontSize: '1.2rem', color: 'var(--primary)' }}>
        TaskFlow
      </div>
      <div className="nav-links">
        <Link to="/" className="nav-link" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <LayoutDashboard size={18} /> Dashboard
        </Link>
        <Link to="/projects" className="nav-link" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <FolderKanban size={18} /> Projects
        </Link>
        <div style={{ marginLeft: '20px', display: 'flex', alignItems: 'center', gap: '15px' }}>
          <span style={{ color: 'var(--text-muted)' }}>{user.name} ({user.role})</span>
          <button onClick={handleLogout} className="btn btn-secondary" style={{ padding: '6px 12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <LogOut size={16} /> Logout
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
