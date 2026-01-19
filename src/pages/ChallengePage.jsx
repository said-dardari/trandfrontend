import React, { useState, useEffect } from 'react';
import { challengeAPI, aiAPI } from '../services/api';
import { useLanguage } from '../contexts/LanguageContext';
import { useAuth } from '../contexts/AuthContext';

const ChallengePage = () => {
  const [challenges, setChallenges] = useState([]);
  const [activeChallenge, setActiveChallenge] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showStartModal, setShowStartModal] = useState(false);
  const [showTradeModal, setShowTradeModal] = useState(false);
  const [newChallenge, setNewChallenge] = useState({
    name: '',
    description: '',
    duration: 30
  });
  const [tradeData, setTradeData] = useState({
    symbol: '',
    tradeType: 'buy',
    quantity: '',
    price: ''
  });
  const [aiSignals, setAiSignals] = useState(null);
  const [aiRisk, setAiRisk] = useState(null);
  const [aiPlan, setAiPlan] = useState(null);
  const { t } = useLanguage();
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  
  // Debug logging
  useEffect(() => {
    console.log('ChallengePage auth state:', { 
      user, 
      isAuthenticated, 
      authLoading,
      userId: user?.id
    });
  }, [user, isAuthenticated, authLoading]);

  useEffect(() => {
    // Only load challenges when user is fully authenticated and not loading
    // Also check isAuthenticated flag to ensure the user is confirmed authenticated
    if (!authLoading && user && user.id && isAuthenticated) {
      console.log('User authenticated, loading challenges');
      loadChallenges();
    } else if (!isAuthenticated && !authLoading) {
      // If not authenticated and not loading, clear any active challenges
      setActiveChallenge(null);
      setChallenges([]);
    }
  }, [user, authLoading, isAuthenticated]);

  const loadChallenges = async () => {
    // More robust check for authentication state
    if (!user || !user.id || !isAuthenticated) {
      console.log('User not authenticated, skipping challenge load');
      return;
    }
    
    setLoading(true);
    setError(''); // Clear previous errors
    
    try {
      console.log('Loading challenges for user:', user.id);
      
      // First, get all challenges for the user
      const challengesResponse = await challengeAPI.getAllUserChallenges(user.id);
      console.log('Challenges API response:', challengesResponse);
      setChallenges(challengesResponse.data.challenges || []);
      
      // Find active challenge
      const active = challengesResponse.data.challenges?.find(c => c.status === 'active');
      // Render list immediately to reduce perceived latency
      setLoading(false);
      if (active) {
        // Fetch status in background without blocking initial render
        (async () => {
          try {
            const statusResponse = await challengeAPI.getChallengeStatus(active.id);
            console.log('Challenge status response:', statusResponse);
            const detailedChallenge = { ...active, ...statusResponse.data };
            setActiveChallenge(detailedChallenge);
          } catch (statusErr) {
            console.error('Error getting challenge status:', statusErr);
            console.error('Status error response:', statusErr.response);
            setActiveChallenge(active);
          }
        })();
      } else {
        setActiveChallenge(null);
      }
    } catch (err) {
      console.error('Error loading challenges:', err);
      console.error('Error response:', err.response);
      // Handle 401 errors specifically
      if (err.response?.status === 401) {
        setError('Session expired. Please log in again.');
      } else {
        setError(err.response?.data?.message || 'Failed to load challenges');
      }
    } finally {
      // Ensure loading state is cleared if an error occurs before initial render
      setLoading(false);
    }
  };

  const handleStartChallenge = async () => {
    // Double check authentication before making the API call
    if (!user || !isAuthenticated) {
      setError('Please log in to start a challenge');
      return;
    }
    
    try {
      console.log('Starting challenge with data:', newChallenge);
      const response = await challengeAPI.startChallenge(newChallenge);
      console.log('Challenge start response:', response);
      setShowStartModal(false);
      setNewChallenge({ name: '', description: '', duration: 30 });
      loadChallenges(); // Refresh the list
    } catch (err) {
      console.error('Error starting challenge:', err);
      console.error('Error response:', err.response);
      // Handle 401 errors specifically
      if (err.response?.status === 401) {
        setError('Session expired. Please log in again.');
        // Logout the user to clear the invalid session
        // Note: We don't have direct access to logout here, but the response interceptor will handle it
      } else {
        setError(err.response?.data?.message || 'Failed to start challenge');
      }
    }
  };

  // Load AI assistance when trade modal is open and symbol changes
  useEffect(() => {
    const loadAi = async () => {
      if (!showTradeModal || !tradeData.symbol.trim()) {
        setAiSignals(null);
        setAiRisk(null);
        setAiPlan(null);
        return;
      }
      try {
        const [signalsRes, riskRes, planRes] = await Promise.all([
          aiAPI.getSignals(tradeData.symbol.trim()),
          aiAPI.getRisk(tradeData.symbol.trim()),
          aiAPI.getTradePlan(tradeData.symbol.trim(), 'us')
        ]);
        setAiSignals(signalsRes.data);
        setAiRisk(riskRes.data);
        setAiPlan(planRes.data);
      } catch (e) {
        // Silent fail; keep trading functional even if AI endpoint fails
        console.error('AI assistance error:', e);
      }
    };
    loadAi();
  }, [showTradeModal, tradeData.symbol]);

  const handleMakeTrade = async () => {
    // Double check authentication before making the API call
    if (!user || !isAuthenticated || !activeChallenge) return;
    
    // Validate input data
    if (!tradeData.symbol.trim()) {
      setError('Please enter a symbol');
      return;
    }
    
    if (!tradeData.quantity || isNaN(parseFloat(tradeData.quantity)) || parseFloat(tradeData.quantity) <= 0) {
      setError('Please enter a valid quantity greater than 0');
      return;
    }
    
    if (!tradeData.price || isNaN(parseFloat(tradeData.price)) || parseFloat(tradeData.price) <= 0) {
      setError('Please enter a valid price greater than 0');
      return;
    }
    
    try {
      // Prevent buy orders that exceed current balance (no fees/leverage)
      if (tradeData.tradeType === 'buy') {
        const qty = parseFloat(tradeData.quantity);
        const prc = parseFloat(tradeData.price);
        const netCost = prc * qty;
        const balance = Number(activeChallenge.current_balance || 0);
        if (netCost > balance) {
          setError(`Insufficient balance for this buy. Cost: ${netCost.toFixed(2)} > Balance: ${balance.toFixed(2)}`);
          return;
        }
      }
      
      const tradePayload = {
        challenge_id: activeChallenge.id,
        symbol: tradeData.symbol.trim(),
        trade_type: tradeData.tradeType,
        quantity: parseFloat(tradeData.quantity),
        price: parseFloat(tradeData.price)
      };
      
      console.log('Making trade with data:', tradePayload);
      const response = await challengeAPI.makeTrade(tradePayload);
      console.log('Trade response:', response);
      
      setShowTradeModal(false);
      setTradeData({ symbol: '', tradeType: 'buy', quantity: '', price: '' });
      
      // Reload challenge status to get updated metrics
      loadChallenges();
    } catch (err) {
      console.error('Error making trade:', err);
      console.error('Error response:', err.response);
      // Handle 401 errors specifically
      if (err.response?.status === 401) {
        setError('Session expired. Please log in again.');
      } else {
        setError(err.response?.data?.error || err.response?.data?.message || 'Failed to execute trade');
      }
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

  const getStatusText = (status) => {
    switch (status) {
      case 'active': return 'Active';
      case 'completed': return 'Completed';
      case 'failed': return 'Failed';
      default: return status;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 dark:border-blue-400"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-300">{t('loading')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{t('challengeTitle')}</h1>
          <p className="mt-2 text-gray-600 dark:text-gray-300">
            {t('choosePlan')}
          </p>
        </div>

        {error && (
          <div className="mb-6 rounded-md bg-red-50 dark:bg-red-900/20 p-4">
            <div className="text-sm text-red-700 dark:text-red-300">{error}</div>
          </div>
        )}

        {/* Active Challenge Card */}
        {activeChallenge && (
          <div className="mb-8 bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">{activeChallenge.name}</h2>
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(activeChallenge.status)}`}>
                {t(getStatusText(activeChallenge.status).toLowerCase())}
              </span>
            </div>
            <p className="text-gray-600 dark:text-gray-300 mb-4">{activeChallenge.description}</p>
            
            {/* Challenge Metrics Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                <div className="text-sm text-gray-500 dark:text-gray-400">{t('currentBalance')}</div>
                <div className="text-xl font-bold text-gray-900 dark:text-white">${activeChallenge.current_balance?.toFixed(2)}</div>
              </div>
              
              <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                <div className="text-sm text-gray-500 dark:text-gray-400">{t('initialBalance')}</div>
                <div className="text-xl font-bold text-gray-900 dark:text-white">${activeChallenge.initial_balance?.toFixed(2)}</div>
              </div>
              
              <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                <div className="text-sm text-gray-500 dark:text-gray-400">{t('profitLoss')}</div>
                <div className={`text-xl font-bold ${activeChallenge.profit_loss_percentage >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                  {activeChallenge.profit_loss_percentage >= 0 ? '+' : ''}{activeChallenge.profit_loss_percentage?.toFixed(2)}%
                </div>
              </div>
              
              <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                <div className="text-sm text-gray-500 dark:text-gray-400">{t('challengeStatus')}</div>
                <div className={`text-xl font-bold ${getStatusColor(activeChallenge.status).includes('green') ? 'text-green-600 dark:text-green-400' : getStatusColor(activeChallenge.status).includes('red') ? 'text-red-600 dark:text-red-400' : 'text-blue-600 dark:text-blue-400'}`}>
                  {t(getStatusText(activeChallenge.status).toLowerCase())}
                </div>
              </div>
            </div>
            
            {/* Action Buttons */}
            <div className="flex gap-3 mb-6">
              <button
                onClick={() => setShowTradeModal(true)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors duration-200 dark:bg-blue-700 dark:hover:bg-blue-800"
              >
                {t('makeTrade')}
              </button>
              <button
                onClick={loadChallenges}
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg font-medium hover:bg-gray-300 transition-colors duration-200 dark:bg-gray-600 dark:text-white dark:hover:bg-gray-700"
              >
                {t('refresh')}
              </button>
            </div>
            
            {/* Progress Bars */}
            <div className="space-y-4">
              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{t('profitTargetProgress')}</span>
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    {Math.min(Math.max(activeChallenge.profit_target_progress_percentage || 0, 0), 10).toFixed(2)}% / 10%
                  </span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2.5">
                  <div 
                    className="bg-green-600 h-2.5 rounded-full" 
                    style={{ width: `${Math.min(Math.max(activeChallenge.profit_target_progress_percentage || 0, 0), 10) * 10}%` }}
                  ></div>
                </div>
              </div>
              
              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{t('dailyDrawdown')}</span>
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    {Math.abs(Math.min(activeChallenge.daily_drawdown_percentage || 0, 0)).toFixed(2)}% / 5%
                  </span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2.5">
                  <div 
                    className="bg-blue-600 h-2.5 rounded-full" 
                    style={{ width: `${Math.min(Math.abs(activeChallenge.daily_drawdown_percentage || 0), 5) * 20}%` }}
                  ></div>
                </div>
              </div>
              
              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{t('totalDrawdown')}</span>
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    {Math.abs(Math.min(activeChallenge.total_drawdown_percentage || 0, 0)).toFixed(2)}% / 10%
                  </span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2.5">
                  <div 
                    className={`${(activeChallenge.total_drawdown_percentage || 0) > -10 ? 'bg-yellow-600' : 'bg-red-600'} h-2.5 rounded-full`} 
                    style={{ width: `${Math.min(Math.abs(activeChallenge.total_drawdown_percentage || 0), 10) * 10}%` }}
                  ></div>
                </div>
              </div>
            </div>
            
            {/* Challenge Rules Summary */}
            <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-3">{t('challengeRules')}</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-red-50 dark:bg-red-900/20 p-3 rounded-lg">
                  <div className="text-sm font-medium text-red-800 dark:text-red-200">{t('dailyMaxLoss')}</div>
                  <div className="text-lg font-bold text-red-600 dark:text-red-400">-5%</div>
                </div>
                <div className="bg-red-50 dark:bg-red-900/20 p-3 rounded-lg">
                  <div className="text-sm font-medium text-red-800 dark:text-red-200">{t('totalMaxLoss')}</div>
                  <div className="text-lg font-bold text-red-600 dark:text-red-400">-10%</div>
                </div>
                <div className="bg-green-50 dark:bg-green-900/20 p-3 rounded-lg">
                  <div className="text-sm font-medium text-green-800 dark:text-green-200">{t('profitTarget')}</div>
                  <div className="text-lg font-bold text-green-600 dark:text-green-400">+10%</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Start New Challenge Button */}
        {!activeChallenge && (
          <div className="mb-8 bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 text-center">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">{t('startNewChallenge')}</h2>
            <p className="text-gray-600 dark:text-gray-300 mb-6">{t('choosePlan')}</p>
            <button
              onClick={() => setShowStartModal(true)}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors duration-200 dark:bg-blue-700 dark:hover:bg-blue-800"
            >
              {t('startNewChallenge')}
            </button>
          </div>
        )}

        {/* Challenge List */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">{t('challengeTitle')}</h2>
          {challenges.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">🎯</div>
              <h3 className="text-xl font-medium text-gray-900 dark:text-white mb-2">{t('noChallenges')}</h3>
              <p className="text-gray-600 dark:text-gray-300">{t('startNewChallenge')}</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">{t('challengeName')}</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">{t('challengeDescription')}</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">{t('durationDays')}</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">{t('challengeStatus')}</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">{t('profitLoss')}</th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                  {challenges.map((challenge) => (
                    <tr key={challenge.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">{challenge.name}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">{challenge.description}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">{challenge.duration} {t('daysAccess')}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(challenge.status)}`}>
                          {t(getStatusText(challenge.status).toLowerCase())}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <span className={challenge.profit_loss_percentage >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}>
                          {challenge.profit_loss_percentage >= 0 ? '+' : ''}{challenge.profit_loss_percentage?.toFixed(2)}%
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Start Challenge Modal */}
      {showStartModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 dark:bg-gray-900 dark:bg-opacity-75 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white dark:bg-gray-800">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">{t('startNewChallenge')}</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('challengeName')}</label>
                  <input
                    type="text"
                    value={newChallenge.name}
                    onChange={(e) => setNewChallenge({...newChallenge, name: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    placeholder={t('challengeName')}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('challengeDescription')}</label>
                  <textarea
                    value={newChallenge.description}
                    onChange={(e) => setNewChallenge({...newChallenge, description: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    rows="3"
                    placeholder={t('challengeDescription')}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('durationDays')}</label>
                  <input
                    type="number"
                    value={newChallenge.duration}
                    onChange={(e) => setNewChallenge({...newChallenge, duration: parseInt(e.target.value)})}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    min="1"
                    max="365"
                  />
                </div>
              </div>
              <div className="items-center gap-2 mt-6">
                <button
                  onClick={handleStartChallenge}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 mr-2 dark:bg-blue-700 dark:hover:bg-blue-800"
                >
                  {t('startNewChallenge')}
                </button>
                <button
                  onClick={() => setShowStartModal(false)}
                  className="px-4 py-2 bg-gray-300 text-gray-800 rounded-md hover:bg-gray-400 dark:bg-gray-600 dark:text-white dark:hover:bg-gray-700"
                >
                  {t('cancel')}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Make Trade Modal */}
      {showTradeModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 dark:bg-gray-900 dark:bg-opacity-75 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white dark:bg-gray-800">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">{t('makeTrade')}</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('symbol')}</label>
                  <input
                    type="text"
                    value={tradeData.symbol}
                    onChange={(e) => setTradeData({...tradeData, symbol: e.target.value.toUpperCase()})}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    placeholder="e.g., AAPL, BTC_USD"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('tradeType')}</label>
                  <select
                    value={tradeData.tradeType}
                    onChange={(e) => setTradeData({...tradeData, tradeType: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  >
                    <option value="buy">{t('buy')}</option>
                    <option value="sell">{t('sell')}</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('quantity')}</label>
                  <input
                    type="number"
                    value={tradeData.quantity}
                    onChange={(e) => setTradeData({...tradeData, quantity: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    placeholder="Enter quantity"
                    step="0.000001"
                    min="0"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('price')}</label>
                  <input
                    type="number"
                    value={tradeData.price}
                    onChange={(e) => setTradeData({...tradeData, price: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    placeholder="Enter price"
                    step="0.000001"
                    min="0"
                  />
                </div>
              </div>
              <div className="items-center gap-2 mt-6">
                <button
                  onClick={handleMakeTrade}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 mr-2 dark:bg-blue-700 dark:hover:bg-blue-800"
                >
                  {t('makeTrade')}
                </button>
                <button
                  onClick={() => setShowTradeModal(false)}
                  className="px-4 py-2 bg-gray-300 text-gray-800 rounded-md hover:bg-gray-400 dark:bg-gray-600 dark:text-white dark:hover:bg-gray-700"
                >
                  {t('cancel')}
                </button>
              </div>
      {/* AI Assistance Panel */}
      <div className="mt-6 border-t border-gray-200 dark:border-gray-700 pt-4">
        <h4 className="text-md font-semibold text-gray-900 dark:text-white mb-3">AI Trading Assistance</h4>
        <div className="space-y-3">
          <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-lg">
            <div className="text-sm text-gray-500 dark:text-gray-300 mb-1">Real-time Signal</div>
            <div className="text-sm font-medium text-gray-900 dark:text-white">
              {aiSignals ? `${aiSignals.signal.toUpperCase()} (${(aiSignals.confidence * 100).toFixed(0)}% confidence)` : 'Enter a symbol to view signal'}
              {aiSignals && aiSignals.stop_level ? ` • Stop: ${aiSignals.stop_level}` : ''}
            </div>
          </div>
          <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-lg">
            <div className="text-sm text-gray-500 dark:text-gray-300 mb-1">Risk Alerts</div>
            <div className="text-sm font-medium text-gray-900 dark:text-white">
              {aiRisk ? `Volatility: ${aiRisk.volatility_index} • Filter: ${aiRisk.auto_filter}` : 'Risk data not available'}
            </div>
            {aiRisk && aiRisk.alerts && aiRisk.alerts.length > 0 && (
              <ul className="mt-1 text-xs text-red-600 dark:text-red-400 list-disc pl-5">
                {aiRisk.alerts.map((a, idx) => <li key={idx}>{a}</li>)}
              </ul>
            )}
          </div>
          <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-lg">
            <div className="text-sm text-gray-500 dark:text-gray-300 mb-1">AI Trade Plan</div>
            <div className="text-sm font-medium text-gray-900 dark:text-white">
              {aiPlan ? `Entry: ${aiPlan.recommended.entry} • TP: ${aiPlan.recommended.take_profit} • SL: ${aiPlan.recommended.stop_loss} • Risk: ${aiPlan.risk_level}` : 'Plan not available'}
            </div>
          </div>
        </div>
      </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChallengePage;
