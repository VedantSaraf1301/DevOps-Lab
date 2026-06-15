import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Sun, Moon } from 'lucide-react';
import { useAuth, useTheme } from '../App';

export default function Navbar() {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="navbar">
      <div className="navbar-brand" onClick={() => navigate('/')} style={{ cursor: 'pointer' }}>
        Ink<span>Well</span>
      </div>
      <div className="navbar-actions">
        <button className="btn-icon" onClick={toggleTheme} title="Toggle theme" aria-label="Toggle theme">
          {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
        </button>
        {user ? (
          <>
            <span className="nav-user">Hello Good morning, <strong>{user.username}</strong></span>
            <button className="btn btn-primary" onClick={() => navigate('/new')}>+ New Post</button>
            <button className="btn btn-outline" onClick={handleLogout}>Logout</button>
          </>
        ) : (
          <>
            <span className="nav-link" onClick={() => navigate('/login')}>Login</span>
            <button className="btn btn-primary" onClick={() => navigate('/signup')}>Sign Up</button>
          </>
        )}
      </div>
    </nav>
  );
}
