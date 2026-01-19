import React from 'react';
import { useAuth } from '../contexts/AuthContext';

const Dashboard = () => {
  const { user } = useAuth();

  return (
    <div style={{ padding: '2rem' }}>
      <h1>Dashboard</h1>
      {user && (
        <div>
          <h2>Welcome, {user.username}!</h2>
          <p>Email: {user.email}</p>
          <p>Account created: {new Date(user.createdAt).toLocaleDateString()}</p>
          <p>Last updated: {new Date(user.updatedAt).toLocaleDateString()}</p>
        </div>
      )}
      <div style={{ marginTop: '2rem' }}>
        <h3>About this dashboard</h3>
        <p>This is a protected route that is only accessible to authenticated users.</p>
        <p>You can build more features here that require user authentication.</p>
      </div>
    </div>
  );
};

export default Dashboard;