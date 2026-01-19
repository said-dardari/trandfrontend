import axios from 'axios';

// Create axios instance with base configuration
const api = axios.create({
  baseURL: '/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  }
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Unauthorized - only remove token and let ProtectedRoute handle the redirect
      // This preserves React Router's navigation logic and prevents bypassing ProtectedRoute
      localStorage.removeItem('token');
      
      // Dispatch a custom event to notify the app of auth failure
      window.dispatchEvent(new CustomEvent('authFailure', { detail: { status: 401 } }));
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  register: (userData) => api.post('/auth/register', userData),
  login: (credentials) => api.post('/auth/login', credentials),
  getProfile: () => api.get('/auth/profile')
};

// Challenge API
export const challengeAPI = {
  startChallenge: (challengeData) => api.post('/challenge/start', challengeData),
  makeTrade: (tradeData) => api.post('/challenge/trade', tradeData),
  getChallengeStatus: (challengeId) => api.get(`/challenge/status?challenge_id=${challengeId}`),
  getAllUserChallenges: (userId) => api.get(`/challenges/user/${userId}`)
};

// Prices API
export const pricesAPI = {
  getUSPrice: (ticker, options = {}) => api.get(`/prices/us/${ticker}`, options),
  getMoroccanPrice: (symbol, options = {}) => api.get(`/prices/maroc/${symbol}`, options),
  getForex: (pair, options = {}) => api.get(`/prices/forex/${pair}`, options)
};

// Payment API
export const paymentAPI = {
  checkout: (paymentData) => api.post('/payment/checkout', paymentData),
  getPaymentMethods: () => api.get('/payments/methods'),
  getPlans: () => api.get('/plans'),
  // PayPal Admin Configuration Endpoints
  configurePayPal: (configData) => api.post('/admin/paypal/configure', configData),
  getPayPalStatus: () => api.get('/admin/paypal/status')
};

// Leaderboard API
export const leaderboardAPI = {
  getLeaderboard: () => api.get('/leaderboard'),
  getChallengeLeaderboard: (challengeId) => api.get(`/leaderboard/challenge/${challengeId}`),
  getUserStats: (userId) => api.get(`/user/${userId}/stats`)
};

// Configuration API
export const configAPI = {
  getConfigStatus: () => api.get('/admin/config/status'),
  setConfig: (configData) => api.post('/admin/config/set', configData)
};

// AI API
export const aiAPI = {
  getSignals: (symbol) => api.get(`/ai/signals/${symbol}`),
  getTradePlan: (symbol, market = 'us') => api.get(`/ai/trade_plan/${symbol}?market=${market}`),
  getRisk: (symbol) => api.get(`/ai/risk/${symbol}`),
  getFiltered: () => api.get('/ai/filter')
};

// News API
export const newsAPI = {
  getFeed: () => api.get('/news/feed')
};

// Social API
export const socialAPI = {
  getFeed: () => api.get('/social/feed'),
  post: (payload) => api.post('/social/post', payload),
  comment: (payload) => api.post('/social/comment', payload),
  getComments: (postId) => api.get(`/social/comments/${postId}`)
};

// Learning API
export const learningAPI = {
  getCourses: () => api.get('/learning/courses')
};

// Admin API
export const adminAPI = {
  login: (credentials) => api.post('/admin/login', credentials),
  getProfile: () => api.get('/admin/profile'),
  getAllUsers: (params = {}) => api.get('/admin/users', { params }),
  getUserDetail: (userId) => api.get(`/admin/users/${userId}`),
  updateChallengeStatus: (challengeId, statusData) => api.put(`/admin/challenges/${challengeId}/status`, statusData),
  adjustChallengeBalance: (challengeId, balanceData) => api.put(`/admin/challenges/${challengeId}/balance`, balanceData),
  getStats: () => api.get('/admin/stats')
};

export default api;
