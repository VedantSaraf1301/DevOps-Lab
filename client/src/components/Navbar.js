import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../App';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="navbar">
      <div className="navbar-brand" onClick={() => navigate('/')} style={{ cursor: 'pointer' }}>
        Ink<span>well</span>
      </div>
      <div className="navbar-actions">
        {user ? (
          <>
            <span className="nav-user">Hi, <strong>{user.username}</strong></span>
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
