import { useState } from 'react';
import { Link, useNavigate, Outlet } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { 
  FiHome, 
  FiFileText, 
  FiPlus, 
  FiLogOut, 
  FiMoon, 
  FiSun,
  FiMenu,
  FiX,
  FiBook
} from 'react-icons/fi';
import './Layout.css';

const Layout = () => {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="layout">
      {/* Mobile Header */}
      <header className="mobile-header">
        <button 
          className="menu-btn"
          onClick={() => setSidebarOpen(!sidebarOpen)}
        >
          {sidebarOpen ? <FiX size={24} /> : <FiMenu size={24} />}
        </button>
        <Link to="/dashboard" className="logo">
          <FiBook className="logo-icon" />
          <span>FlashMind</span>
        </Link>
        <button className="theme-btn" onClick={toggleTheme}>
          {theme === 'dark' ? <FiSun size={20} /> : <FiMoon size={20} />}
        </button>
      </header>

      {/* Sidebar */}
      <aside className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <Link to="/dashboard" className="logo">
            <FiBook className="logo-icon" />
            <span>FlashMind</span>
          </Link>
        </div>

        <nav className="sidebar-nav">
          <Link to="/dashboard" className="nav-item" onClick={() => setSidebarOpen(false)}>
            <FiHome size={20} />
            <span>Dashboard</span>
          </Link>
          <Link to="/notes/new" className="nav-item" onClick={() => setSidebarOpen(false)}>
            <FiPlus size={20} />
            <span>New Note</span>
          </Link>
          <Link to="/notes" className="nav-item" onClick={() => setSidebarOpen(false)}>
            <FiFileText size={20} />
            <span>All Notes</span>
          </Link>
        </nav>

        <div className="sidebar-footer">
          <div className="user-info">
            <div className="user-avatar">
              {user?.name?.charAt(0).toUpperCase()}
            </div>
            <div className="user-details">
              <span className="user-name">{user?.name}</span>
              <span className="user-email">{user?.email}</span>
            </div>
          </div>
          <button className="logout-btn" onClick={handleLogout}>
            <FiLogOut size={20} />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div 
          className="sidebar-overlay" 
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main Content */}
      <main className="main-content">
        <Outlet />
      </main>
    </div>
  );
};

export default Layout;
