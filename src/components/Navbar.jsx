import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const Navbar = () => {
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
  };

  return (
    <nav style={{
      backgroundColor: '#333',
      padding: '1rem',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center'
    }}>
      <div>
        <Link to="/" style={{ color: 'white', textDecoration: 'none', fontSize: '1.5rem' }}>
          TradeSense AI
        </Link>
      </div>
      <ul style={{
        listStyle: 'none',
        display: 'flex',
        margin: 0,
        padding: 0
      }}>
        <li style={{ marginRight: '1rem' }}>
          <Link to="/" style={{ color: 'white', textDecoration: 'none' }}>Home</Link>
        </li>
        
        {user ? (
          <>
            <li style={{ marginRight: '1rem' }}>
              <Link to="/dashboard" style={{ color: 'white', textDecoration: 'none' }}>Dashboard</Link>
            </li>
            <li style={{ marginRight: '1rem' }}>
              <Link to="/challenge" style={{ color: 'white', textDecoration: 'none' }}>Challenge</Link>
            </li>
            <li style={{ marginRight: '1rem' }}>
              <Link to="/leaderboard" style={{ color: 'white', textDecoration: 'none' }}>Leaderboard</Link>
            </li>
            <li style={{ marginRight: '1rem' }}>
              <Link to="/community" style={{ color: 'white', textDecoration: 'none' }}>Community</Link>
            </li>
            <li style={{ marginRight: '1rem' }}>
              <Link to="/learning" style={{ color: 'white', textDecoration: 'none' }}>Learning</Link>
            </li>
            <li>
              <span style={{ color: 'white', marginRight: '1rem' }}>Welcome, {user.username}!</span>
              <button 
                onClick={handleLogout}
                style={{
                  backgroundColor: '#dc3545',
                  color: 'white',
                  border: 'none',
                  padding: '0.5rem 1rem',
                  borderRadius: '4px',
                  cursor: 'pointer'
                }}
              >
                Logout
              </button>
            </li>
          </>
        ) : (
          <>
            <li style={{ marginRight: '1rem' }}>
              <Link to="/login" style={{ color: 'white', textDecoration: 'none' }}>Login</Link>
            </li>
            <li>
              <Link to="/register" style={{ color: 'white', textDecoration: 'none' }}>Register</Link>
            </li>
          </>
        )}
      </ul>
    </nav>
  );
};

export default Navbar;
