import React, { useState, useEffect, useRef } from 'react';
import { pricesAPI, newsAPI, aiAPI } from '../services/api';
import { useLanguage } from '../contexts/LanguageContext';

const DashboardPage = () => {
  const [usStocks, setUsStocks] = useState([]);
  const [moroccanStocks, setMoroccanStocks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMarket, setSelectedMarket] = useState('us');
  const [lastUpdateTime, setLastUpdateTime] = useState(null);
  const [newsItems, setNewsItems] = useState([]);
  const [filteredTrades, setFilteredTrades] = useState({ good_trades: [], high_risk_trades: [] });
  const intervalRef = useRef(null);
  const abortRef = useRef(null);
  const { t } = useLanguage();

  // Popular stocks to display
  const popularStocks = {
    us: ['AAPL', 'GOOGL', 'MSFT', 'AMZN', 'TSLA', 'META', 'NVDA', 'JPM', 'V', 'WMT', 'BTC'],
    moroccan: ['IAM', 'CIH', 'ATTIJARI', 'BCP', 'UMA', 'MASI', 'COSUMA', 'ADD', 'LABEL', 'SNA']
  };

  // Simple sparkline generator based on current price (client-side)
  const buildSparkline = (basePrice) => {
    const points = [];
    if (!basePrice) return points;
    let p = basePrice;
    for (let i = 0; i < 30; i++) {
      const movement = (Math.random() - 0.5) * 0.02; // ±2%
      p = p * (1 + movement);
      points.push(p);
    }
    return points;
  };

  const renderSparkline = (points, color = '#10b981') => {
    if (!points || points.length === 0) return null;
    const width = 200;
    const height = 40;
    const minP = Math.min(...points);
    const maxP = Math.max(...points);
    const norm = (v) => (height - ((v - minP) / (maxP - minP || 1)) * height);
    const step = width / (points.length - 1);
    const path = points.map((v, i) => `${i === 0 ? 'M' : 'L'} ${i * step} ${norm(v)}`).join(' ');
    return (
      <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
        <path d={path} fill="none" stroke={color} strokeWidth="2" />
      </svg>
    );
  };

  useEffect(() => {
    loadPrices();
    loadNews();
    loadFiltered();
    
    // Set up auto-refresh every 10 seconds
    intervalRef.current = setInterval(() => {
      loadPrices();
    }, 10000);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      if (abortRef.current) {
        abortRef.current.abort();
      }
    };
  }, []);

  const loadPrices = async () => {
    setLoading(true);
    try {
      // Cancel any in-flight requests before starting new ones
      if (abortRef.current) {
        abortRef.current.abort();
      }
      abortRef.current = new AbortController();
      const signal = abortRef.current.signal;
      // Load US stocks
      const usPromises = popularStocks.us.map(ticker => 
        pricesAPI.getUSPrice(ticker, { signal }).catch((err) => {
          // Ignore aborted requests silently
          if (err?.code === 'ERR_CANCELED' || err?.name === 'CanceledError' || err?.name === 'AbortError') return null;
          return null;
        })
      );
      const usResults = await Promise.all(usPromises);
      const usData = usResults
        .filter(result => result?.data)
        .map(result => ({
          symbol: result.data.ticker || result.data.symbol,
          price: result.data.price,
          change: result.data.change || 0,
          changePercent: result.data.change_percent || 0,
          timestamp: result.data.timestamp
        }));
      setUsStocks(usData);

      // Load Moroccan stocks
      const moroccanPromises = popularStocks.moroccan.map(symbol => 
        pricesAPI.getMoroccanPrice(symbol, { signal }).catch((err) => {
          if (err?.code === 'ERR_CANCELED' || err?.name === 'CanceledError' || err?.name === 'AbortError') return null;
          return null;
        })
      );
      const moroccanResults = await Promise.all(moroccanPromises);
      const moroccanData = moroccanResults
        .filter(result => result?.data)
        .map(result => ({
          symbol: result.data.symbol,
          price: result.data.price,
          change: result.data.change || 0,
          changePercent: result.data.change_percent || 0,
          timestamp: result.data.timestamp
        }));
      setMoroccanStocks(moroccanData);
      
      setLastUpdateTime(new Date());
    } catch (error) {
      // Ignore aborted errors globally
      if (!(error?.code === 'ERR_CANCELED' || error?.name === 'CanceledError' || error?.name === 'AbortError')) {
        console.error('Error loading prices:', error);
      }
    } finally {
      setLoading(false);
    }
  };

  const loadNews = async () => {
    try {
      const res = await newsAPI.getFeed();
      setNewsItems(res.data.news || []);
    } catch (e) {
      console.error('Error loading news:', e);
    }
  };

  const loadFiltered = async () => {
    try {
      const res = await aiAPI.getFiltered();
      setFilteredTrades(res.data || { good_trades: [], high_risk_trades: [] });
    } catch (e) {
      console.error('Error loading filtered trades:', e);
    }
  };

  const searchStock = async () => {
    if (!searchTerm.trim()) return;
    
    try {
      setLoading(true);
      let result;
      
      if (selectedMarket === 'us') {
        result = await pricesAPI.getUSPrice(searchTerm.toUpperCase());
      } else {
        result = await pricesAPI.getMoroccanPrice(searchTerm.toUpperCase());
      }
      
      if (result.data) {
        const newStock = {
          symbol: result.data.ticker || result.data.symbol,
          price: result.data.price,
          change: result.data.change || 0,
          changePercent: result.data.change_percent || 0,
          timestamp: result.data.timestamp
        };
        
        if (selectedMarket === 'us') {
          setUsStocks(prev => [...prev, newStock]);
        } else {
          setMoroccanStocks(prev => [...prev, newStock]);
        }
        
        setSearchTerm('');
      }
    } catch (error) {
      console.error('Error searching stock:', error);
    } finally {
      setLoading(false);
    }
  };

  const getChangeColor = (change) => {
    if (change > 0) return 'text-green-600 dark:text-green-400';
    if (change < 0) return 'text-red-600 dark:text-red-400';
    return 'text-gray-600 dark:text-gray-400';
  };

  const getChangeArrow = (change) => {
    if (change > 0) return '▲';
    if (change < 0) return '▼';
    return '●';
  };

  const stocksToShow = selectedMarket === 'us' ? usStocks : moroccanStocks;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{t('dashboard')}</h1>
          <p className="mt-2 text-gray-600 dark:text-gray-300">
            {t('monitorPrices')}
          </p>
          {lastUpdateTime && (
            <div className="mt-2 text-sm text-gray-500 dark:text-gray-400">
              {t('lastUpdated')}: {lastUpdateTime.toLocaleTimeString()} | {t('autoRefresh')}
            </div>
          )}
        </div>

        {/* Live News Hub */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">{t('viewLeaderboard')} News</h2>
          {newsItems.length === 0 ? (
            <div className="text-gray-500 dark:text-gray-400 italic">{t('loading')}</div>
          ) : (
            <div className="space-y-4">
              {newsItems.slice(0, 6).map((n, idx) => (
                <div key={idx} className="border-l-4 border-blue-500 pl-4 dark:border-blue-400">
                  <div className="text-sm text-gray-500 dark:text-gray-300">{n.source} • {n.symbol}</div>
                  <div className="text-md font-medium text-gray-900 dark:text-white">{n.title}</div>
                  <div className="text-sm text-gray-600 dark:text-gray-300">{n.summary}</div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Smart Filtering */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">AI Smart Filtering</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Good Trades</h3>
              {filteredTrades.good_trades.length === 0 ? (
                <div className="text-gray-500 dark:text-gray-400 italic">{t('loading')}</div>
              ) : (
                <ul className="space-y-2">
                  {filteredTrades.good_trades.map(g => (
                    <li key={g.symbol} className="bg-gray-50 dark:bg-gray-700 rounded-md p-3">
                      <div className="flex justify-between">
                        <span className="font-medium text-gray-900 dark:text-white">{g.symbol}</span>
                        <span className="text-sm text-gray-600 dark:text-gray-300">Score: {g.score}</span>
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-300">Change: {g.change_pct?.toFixed(2)}% • Vol: {g.volatility_index}</div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">High-Risk Trades</h3>
              {filteredTrades.high_risk_trades.length === 0 ? (
                <div className="text-gray-500 dark:text-gray-400 italic">{t('loading')}</div>
              ) : (
                <ul className="space-y-2">
                  {filteredTrades.high_risk_trades.map(h => (
                    <li key={h.symbol} className="bg-gray-50 dark:bg-gray-700 rounded-md p-3">
                      <div className="flex justify-between">
                        <span className="font-medium text-gray-900 dark:text-white">{h.symbol}</span>
                        <span className="text-sm text-gray-600 dark:text-gray-300">Vol: {h.volatility_index}</span>
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-300">Change: {h.change_pct?.toFixed(2)}%</div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>
        {/* Market Selector */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 mb-8">
          <div className="flex flex-wrap gap-3 mb-6">
            <button
              onClick={() => setSelectedMarket('us')}
              className={`px-6 py-3 rounded-lg font-medium transition-all duration-200 ${
                selectedMarket === 'us'
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
              }`}
            >
              {t('usStocks')}
            </button>
            <button
              onClick={() => setSelectedMarket('moroccan')}
              className={`px-6 py-3 rounded-lg font-medium transition-all duration-200 ${
                selectedMarket === 'moroccan'
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
              }`}
            >
              {t('moroccanMarket')}
            </button>
          </div>

          {/* Search Bar */}
          <div className="flex flex-col sm:flex-row gap-3 mb-6">
            <div className="flex-1">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder={t('searchStock')}
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                onKeyPress={(e) => e.key === 'Enter' && searchStock()}
              />
            </div>
            <button
              onClick={searchStock}
              disabled={!searchTerm.trim() || loading}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 transition-colors duration-200 dark:bg-blue-700 dark:hover:bg-blue-800"
            >
              {t('searchStock').split(' ')[0]} {/* Just 'Search' part */}
            </button>
          </div>

          {/* Loading State */}
          {loading && stocksToShow.length === 0 && (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 dark:border-blue-400"></div>
              <p className="mt-4 text-gray-600 dark:text-gray-300">{t('loadingPrices')}</p>
            </div>
          )}

          {/* Stock Grid */}
          {!loading && stocksToShow.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {stocksToShow.map((stock) => (
                <div key={stock.symbol} className="bg-gray-50 dark:bg-gray-700 rounded-lg p-6 hover:shadow-md transition-shadow duration-200 border border-gray-100 dark:border-gray-600">
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="font-bold text-xl text-gray-900 dark:text-white">{stock.symbol}</h3>
                    <span className={`text-sm font-medium px-2 py-1 rounded-full ${getChangeColor(stock.change)}`}>
                      {getChangeArrow(stock.change)} {stock.change > 0 ? '+' : ''}{stock.change?.toFixed(2)} ({stock.changePercent?.toFixed(2)}%)
                    </span>
                  </div>
                  <div className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                    ${stock.price?.toFixed(2)}
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    {t('lastUpdated')}: {stock.timestamp ? new Date(stock.timestamp).toLocaleTimeString() : new Date().toLocaleTimeString()}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Empty State */}
          {!loading && stocksToShow.length === 0 && (
            <div className="text-center py-16">
              <div className="text-6xl mb-4">📊</div>
              <h3 className="text-xl font-medium text-gray-900 dark:text-white mb-2">{t('noStocksFound')}</h3>
              <p className="text-gray-600 dark:text-gray-300 mb-6">
                {t('searchToSeePrices')}
              </p>
              <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-6 max-w-md mx-auto">
                <h4 className="font-medium text-blue-900 dark:text-blue-300 mb-2">
                  {selectedMarket === 'us' ? t('popularUSText') : t('popularMoroccanText')}
                </h4>
                <div className="flex flex-wrap gap-2">
                  {(selectedMarket === 'us' ? popularStocks.us : popularStocks.moroccan).slice(0, 5).map(symbol => (
                    <button
                      key={symbol}
                      onClick={() => {
                        setSearchTerm(symbol);
                        searchStock();
                      }}
                      className="px-3 py-1 bg-white dark:bg-gray-700 text-blue-600 dark:text-blue-300 text-sm rounded-md border border-blue-200 dark:border-blue-700 hover:bg-blue-50 dark:hover:bg-blue-800/50"
                    >
                      {symbol}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Featured Stocks Section - Highlighting IAM and BTC */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">{t('featuredUpdates')}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Maroc Telecom (IAM) */}
            <div className="border-l-4 border-green-500 pl-4 dark:border-green-400">
              <h3 className="font-bold text-lg text-gray-900 dark:text-white">{t('marocTelecom')}</h3>
              <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">{t('leadingTelecom')}</p>
              {moroccanStocks.some(s => s.symbol === 'IAM') ? (
                <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
                  <div className="flex justify-between items-center">
                    <span className="text-2xl font-bold text-gray-900 dark:text-white">
                      MAD {moroccanStocks.find(s => s.symbol === 'IAM')?.price?.toFixed(2)}
                    </span>
                    <span className={`font-medium ${getChangeColor(moroccanStocks.find(s => s.symbol === 'IAM')?.change)}`}>
                      {getChangeArrow(moroccanStocks.find(s => s.symbol === 'IAM')?.change)} {moroccanStocks.find(s => s.symbol === 'IAM')?.change > 0 ? '+' : ''}{moroccanStocks.find(s => s.symbol === 'IAM')?.change?.toFixed(2)}%
                    </span>
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    {t('lastUpdated')}: {moroccanStocks.find(s => s.symbol === 'IAM')?.timestamp ? 
                      new Date(moroccanStocks.find(s => s.symbol === 'IAM')?.timestamp).toLocaleTimeString() : 
                      new Date().toLocaleTimeString()}
                  </div>
                  <div className="mt-3">
                    {renderSparkline(buildSparkline(moroccanStocks.find(s => s.symbol === 'IAM')?.price), '#059669')}
                  </div>
                </div>
              ) : (
                <div className="text-gray-500 dark:text-gray-400 italic">{t('loadingPrices').replace('...', '')} IAM {t('loading').toLowerCase()}...</div>
              )}
            </div>
            
            {/* Bitcoin (BTC) */}
            <div className="border-l-4 border-orange-500 pl-4 dark:border-orange-400">
              <h3 className="font-bold text-lg text-gray-900 dark:text-white">{t('bitcoin')}</h3>
              <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">{t('leadingCrypto')}</p>
              {usStocks.some(s => s.symbol === 'BTC') ? (
                <div className="bg-orange-50 dark:bg-orange-900/20 p-4 rounded-lg">
                  <div className="flex justify-between items-center">
                    <span className="text-2xl font-bold text-gray-900 dark:text-white">
                      ${usStocks.find(s => s.symbol === 'BTC')?.price?.toFixed(2)}
                    </span>
                    <span className={`font-medium ${getChangeColor(usStocks.find(s => s.symbol === 'BTC')?.change)}`}>
                      {getChangeArrow(usStocks.find(s => s.symbol === 'BTC')?.change)} {usStocks.find(s => s.symbol === 'BTC')?.change > 0 ? '+' : ''}{usStocks.find(s => s.symbol === 'BTC')?.change?.toFixed(2)}%
                    </span>
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    {t('lastUpdated')}: {usStocks.find(s => s.symbol === 'BTC')?.timestamp ? 
                      new Date(usStocks.find(s => s.symbol === 'BTC')?.timestamp).toLocaleTimeString() : 
                      new Date().toLocaleTimeString()}
                  </div>
                  <div className="mt-3">
                    {renderSparkline(buildSparkline(usStocks.find(s => s.symbol === 'BTC')?.price), '#f59e0b')}
                  </div>
                </div>
              ) : (
                <div className="text-gray-500 dark:text-gray-400 italic">{t('loadingPrices').replace('...', '')} BTC {t('loading').toLowerCase()}...</div>
              )}
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">{t('settings')}</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button className="bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300 px-6 py-4 rounded-lg font-medium hover:bg-green-100 dark:hover:bg-green-800/50 transition-colors duration-200 text-center">
              <div className="text-2xl mb-2">⚔️</div>
              <div>{t('startChallenge')}</div>
            </button>
            <button className="bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 px-6 py-4 rounded-lg font-medium hover:bg-blue-100 dark:hover:bg-blue-800/50 transition-colors duration-200 text-center">
              <div className="text-2xl mb-2">🏆</div>
              <div>{t('viewLeaderboard')}</div>
            </button>
            <button className="bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300 px-6 py-4 rounded-lg font-medium hover:bg-purple-100 dark:hover:bg-purple-800/50 transition-colors duration-200 text-center">
              <div className="text-2xl mb-2">💳</div>
              <div>{t('makePayment')}</div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
