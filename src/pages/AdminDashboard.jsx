import React, { useState, useEffect } from 'react';
import { adminAPI } from '../services/api';
import { useLanguage } from '../contexts/LanguageContext';

const AdminDashboard = () => {
  const [admin, setAdmin] = useState(null);
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('dashboard');
  const [showUserDetail, setShowUserDetail] = useState(false);
  
  const { t } = useLanguage();

  useEffect(() => {
    loadAdminProfile();
    loadStats();
  }, []);

  const loadAdminProfile = async () => {
    try {
      const response = await adminAPI.getProfile();
      setAdmin(response.data.admin);
    } catch (err) {
      console.error('Error loading admin profile:', err);
      setError('Failed to load admin profile');
    }
  };

  const loadStats = async () => {
    try {
      const response = await adminAPI.getStats();
      setStats(response.data);
      setLoading(false);
    } catch (err) {
      console.error('Error loading stats:', err);
      setError('Failed to load statistics');
      setLoading(false);
    }
  };

  const loadUsers = async () => {
    try {
      const response = await adminAPI.getAllUsers();
      setUsers(response.data.users);
    } catch (err) {
      console.error('Error loading users:', err);
      setError('Failed to load users');
    }
  };

  const loadUserDetail = async (userId) => {
    try {
      const response = await adminAPI.getUserDetail(userId);
      setSelectedUser(response.data);
      setShowUserDetail(true);
    } catch (err) {
      console.error('Error loading user detail:', err);
      setError('Failed to load user details');
    }
  };

  const updateUserStatus = async (challengeId, newStatus) => {
    try {
      await adminAPI.updateChallengeStatus(challengeId, { status: newStatus });
      // Refresh user detail
      if (selectedUser) {
        loadUserDetail(selectedUser.user.id);
      }
      setError('');
    } catch (err) {
      console.error('Error updating challenge status:', err);
      setError(err.response?.data?.error || 'Failed to update challenge status');
    }
  };

  const adjustBalance = async (challengeId, newBalance) => {
    try {
      await adminAPI.adjustChallengeBalance(challengeId, { new_balance: newBalance });
      // Refresh user detail
      if (selectedUser) {
        loadUserDetail(selectedUser.user.id);
      }
      setError('');
    } catch (err) {
      console.error('Error adjusting balance:', err);
      setError(err.response?.data?.error || 'Failed to adjust balance');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300';
      case 'completed': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300';
      case 'failed': return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
    }
  };

  const getRoleBadge = (role) => {
    const isSuperAdmin = role === 'superadmin';
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
        isSuperAdmin 
          ? 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300'
          : 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300'
      }`}>
        {isSuperAdmin ? 'SuperAdmin' : 'Admin'}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 dark:border-blue-400"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Admin Dashboard</h1>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                Welcome back, {admin?.username} {getRoleBadge(admin?.role)}
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-500 dark:text-gray-400">
                Last login: {admin?.last_login ? new Date(admin.last_login).toLocaleString() : 'Never'}
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation Tabs */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6">
        <div className="border-b border-gray-200 dark:border-gray-700">
          <nav className="-mb-px flex space-x-8">
            {[
              { id: 'dashboard', name: 'Dashboard', icon: '📊' },
              { id: 'users', name: 'Users', icon: '👥' },
              { id: 'challenges', name: 'Challenges', icon: '🎯' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                }`}
              >
                <span className="mr-2">{tab.icon}</span>
                {tab.name}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && (
          <div className="mb-6 rounded-md bg-red-50 dark:bg-red-900/20 p-4">
            <div className="text-sm text-red-700 dark:text-red-300">{error}</div>
          </div>
        )}

        {/* Dashboard Tab */}
        {activeTab === 'dashboard' && stats && (
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Platform Statistics</h2>
            
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                <div className="flex items-center">
                  <div className="rounded-md bg-blue-500 p-3">
                    <span className="text-white text-xl">👥</span>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Users</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.stats.total_users}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                <div className="flex items-center">
                  <div className="rounded-md bg-green-500 p-3">
                    <span className="text-white text-xl">🎯</span>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Active Challenges</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.stats.active_challenges}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                <div className="flex items-center">
                  <div className="rounded-md bg-yellow-500 p-3">
                    <span className="text-white text-xl">📈</span>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Trades</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.stats.total_trades}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                <div className="flex items-center">
                  <div className="rounded-md bg-purple-500 p-3">
                    <span className="text-white text-xl">👑</span>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Admin Accounts</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.stats.total_admins}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
                <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white">Recent Users</h3>
                </div>
                <div className="divide-y divide-gray-200 dark:divide-gray-700">
                  {stats.recent_activity.users.slice(0, 5).map((user) => (
                    <div key={user.id} className="px-6 py-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-gray-900 dark:text-white">{user.username}</p>
                          <p className="text-sm text-gray-500 dark:text-gray-400">{user.email}</p>
                        </div>
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          {new Date(user.created_at).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
                <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white">Recent Challenges</h3>
                </div>
                <div className="divide-y divide-gray-200 dark:divide-gray-700">
                  {stats.recent_activity.challenges.slice(0, 5).map((challenge) => (
                    <div key={challenge.id} className="px-6 py-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-gray-900 dark:text-white">{challenge.name}</p>
                          <p className="text-sm text-gray-500 dark:text-gray-400">User ID: {challenge.user_id}</p>
                        </div>
                        <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(challenge.status)}`}>
                          {challenge.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Users Tab */}
        {activeTab === 'users' && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">User Management</h2>
              <button
                onClick={loadUsers}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Refresh Users
              </button>
            </div>

            {users.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-500 dark:text-gray-400">No users found</p>
              </div>
            ) : (
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                  <thead className="bg-gray-50 dark:bg-gray-700">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        User
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Email
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Challenges
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Joined
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                    {users.map((user) => (
                      <tr key={user.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900 dark:text-white">
                            {user.username}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                          {user.email}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                          {user.challenges_count} challenges
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            user.is_active 
                              ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
                              : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
                          }`}>
                            {user.is_active ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                          {new Date(user.created_at).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <button
                            onClick={() => loadUserDetail(user.id)}
                            className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
                          >
                            View Details
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* User Detail Modal */}
        {showUserDetail && selectedUser && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 dark:bg-gray-900 dark:bg-opacity-75 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-11/12 max-w-4xl shadow-lg rounded-md bg-white dark:bg-gray-800">
              <div className="mt-3">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                    User Details: {selectedUser.user.username}
                  </h3>
                  <button
                    onClick={() => setShowUserDetail(false)}
                    className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                  >
                    ✕
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                    <h4 className="font-medium text-gray-900 dark:text-white mb-2">User Information</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-300">Email: {selectedUser.user.email}</p>
                    <p className="text-sm text-gray-600 dark:text-gray-300">
                      Status: {selectedUser.user.is_active ? 'Active' : 'Inactive'}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-300">
                      Member since: {new Date(selectedUser.user.created_at).toLocaleDateString()}
                    </p>
                  </div>

                  <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                    <h4 className="font-medium text-gray-900 dark:text-white mb-2">Challenge Summary</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-300">
                      Total Challenges: {selectedUser.challenges.length}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-300">
                      Active: {selectedUser.challenges.filter(c => c.status === 'active').length}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-300">
                      Completed: {selectedUser.challenges.filter(c => c.status === 'completed').length}
                    </p>
                  </div>
                </div>

                <div>
                  <h4 className="font-medium text-gray-900 dark:text-white mb-3">Challenges</h4>
                  <div className="space-y-4 max-h-96 overflow-y-auto">
                    {selectedUser.challenges.map((challenge) => (
                      <div key={challenge.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                        <div className="flex justify-between items-start mb-3">
                          <div>
                            <h5 className="font-medium text-gray-900 dark:text-white">{challenge.name}</h5>
                            <p className="text-sm text-gray-500 dark:text-gray-400">{challenge.description}</p>
                          </div>
                          <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(challenge.status)}`}>
                            {challenge.status}
                          </span>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-3 text-sm">
                          <div>
                            <p className="text-gray-500 dark:text-gray-400">Initial Balance</p>
                            <p className="font-medium">${challenge.initial_balance.toFixed(2)}</p>
                          </div>
                          <div>
                            <p className="text-gray-500 dark:text-gray-400">Current Balance</p>
                            <p className="font-medium">${challenge.current_balance.toFixed(2)}</p>
                          </div>
                          <div>
                            <p className="text-gray-500 dark:text-gray-400">Trades</p>
                            <p className="font-medium">{challenge.trades_count}</p>
                          </div>
                          <div>
                            <p className="text-gray-500 dark:text-gray-400">Created</p>
                            <p className="font-medium">{new Date(challenge.created_at).toLocaleDateString()}</p>
                          </div>
                        </div>

                        {/* Admin Actions */}
                        <div className="flex flex-wrap gap-2 pt-3 border-t border-gray-200 dark:border-gray-700">
                          <select
                            value={challenge.status}
                            onChange={(e) => updateUserStatus(challenge.id, e.target.value)}
                            className="px-3 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                          >
                            <option value="active">Set Active</option>
                            <option value="failed">Set Failed</option>
                            <option value="completed">Set Completed</option>
                          </select>
                          
                          {admin?.role === 'superadmin' && (
                            <div className="flex items-center gap-2">
                              <input
                                type="number"
                                placeholder="New balance"
                                className="px-3 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white w-32"
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter') {
                                    const value = parseFloat(e.target.value);
                                    if (!isNaN(value) && value >= 0) {
                                      adjustBalance(challenge.id, value);
                                      e.target.value = '';
                                    }
                                  }
                                }}
                              />
                              <span className="text-xs text-gray-500 dark:text-gray-400">Press Enter</span>
                            </div>
                          )}
                        </div>

                        {/* Latest Trades Preview */}
                        {challenge.trades && challenge.trades.length > 0 && (
                          <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
                            <h6 className="text-sm font-medium text-gray-900 dark:text-white mb-2">Recent Trades</h6>
                            <div className="max-h-32 overflow-y-auto">
                              <table className="min-w-full text-xs">
                                <thead>
                                  <tr className="border-b border-gray-200 dark:border-gray-700">
                                    <th className="text-left py-1">Symbol</th>
                                    <th className="text-left py-1">Type</th>
                                    <th className="text-left py-1">Quantity</th>
                                    <th className="text-left py-1">Price</th>
                                    <th className="text-left py-1">Date</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {challenge.trades.slice(0, 5).map((trade) => (
                                    <tr key={trade.id} className="border-b border-gray-100 dark:border-gray-700">
                                      <td className="py-1">{trade.symbol}</td>
                                      <td className="py-1 capitalize">{trade.trade_type}</td>
                                      <td className="py-1">{trade.quantity}</td>
                                      <td className="py-1">${trade.price}</td>
                                      <td className="py-1">{new Date(trade.timestamp).toLocaleDateString()}</td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default AdminDashboard;