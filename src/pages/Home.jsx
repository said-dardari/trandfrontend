import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const Home = () => {
  const { user } = useAuth();

  return (
    <div style={{ textAlign: 'center', padding: '2rem' }}>
      <h1>Welcome to the Full-Stack Application</h1>
      <p>This is a sample application with authentication and protected routes.</p>
      
      {!user && (
        <div style={{ marginTop: '2rem' }}>
          <Link 
            to="/login" 
            style={{
              backgroundColor: '#007bff',
              color: 'white',
              padding: '0.5rem 1rem',
              textDecoration: 'none',
              borderRadius: '4px',
              marginRight: '1rem'
            }}
          >
            Login
          </Link>
          <Link 
            to="/register" 
            style={{
              backgroundColor: '#28a745',
              color: 'white',
              padding: '0.5rem 1rem',
              textDecoration: 'none',
              borderRadius: '4px'
            }}
          >
            Register
          </Link>
        </div>
      )}
      
      {user && (
        <div style={{ marginTop: '2rem' }}>
          <p>You are logged in as <strong>{user.username}</strong>.</p>
          <Link 
            to="/dashboard" 
            style={{
              backgroundColor: '#007bff',
              color: 'white',
              padding: '0.5rem 1rem',
              textDecoration: 'none',
              borderRadius: '4px'
            }}
          >
            Go to Dashboard
          </Link>
        </div>
      )}
    </div>
  );
};

export default Home;