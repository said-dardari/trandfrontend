import React, { useState, useEffect } from 'react';
import { paymentAPI } from '../services/api';
import { useLanguage } from '../contexts/LanguageContext';

const PaymentPage = () => {
  const [plans, setPlans] = useState([
    { id: 1, name: 'starter', displayName: 'Starter Plan', price: 200, currency: 'MAD', duration: 30, features: ['Basic trading features', 'Limited support', 'Access to basic markets'] },
    { id: 2, name: 'pro', displayName: 'Pro Plan', price: 500, currency: 'MAD', duration: 90, features: ['Advanced trading features', 'Priority support', 'Access to all markets', 'Detailed analytics'] },
    { id: 3, name: 'elite', displayName: 'Elite Plan', price: 1000, currency: 'MAD', duration: 180, features: ['All features unlocked', '24/7 premium support', 'Exclusive tools', 'VIP community access'] }
  ]);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState('cmi'); // 'cmi' or 'crypto'
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingMessage, setProcessingMessage] = useState('');
  const [prices, setPrices] = useState({ btc: null, usd: null });
  const { t } = useLanguage();

  useEffect(() => {
    loadPrices();
  }, []);

  const loadPrices = async () => {
    try {
      // Use backend endpoints to avoid CORS/network issues
      const [btcRes, usdMadRes] = await Promise.all([
        // BTC price via US price route special case
        paymentAPI.getBTCPrice ? paymentAPI.getBTCPrice() : fetch('/api/prices/us/BTC').then(r => r.json()),
        // USD/MAD rate via forex route
        fetch('/api/prices/forex/USD_MAD').then(r => r.json())
      ]);
      const btcPrice = btcRes.price || (btcRes.data && btcRes.data.price);
      const madRate = usdMadRes.price || (usdMadRes.data && usdMadRes.data.price);
      if (btcPrice) setPrices(prev => ({ ...prev, btc: btcPrice }));
      if (madRate) setPrices(prev => ({ ...prev, usd: madRate }));
      if (!btcPrice || !madRate) {
        setPrices(prev => ({ btc: prev.btc || 45000, usd: prev.usd || 10.2 }));
      }
    } catch (error) {
      console.error('Error fetching prices:', error);
      setPrices({ btc: 45000, usd: 10.2 });
    }
  };

  const handleSelectPlan = (plan) => {
    setSelectedPlan(plan);
    setShowPaymentModal(true);
  };

  const handlePayment = async () => {
    if (!selectedPlan) return;

    setIsProcessing(true);
    setProcessingMessage(t('processing'));

    try {
      const res = await paymentAPI.checkout({
        plan: selectedPlan.name,
        method: paymentMethod
      });
      setProcessingMessage(`${t('success')}! ${t('processing')}...`);
      setTimeout(() => {
        setIsProcessing(false);
        setShowPaymentModal(false);
        setProcessingMessage('');
        alert(`${t('success')}! ${t('noRealCharge')}`);
      }, 1000);
    } catch (error) {
      setIsProcessing(false);
      setProcessingMessage('');
      const msg = error.response?.data?.error || error.message || 'Payment failed';
      alert(`${t('error')}: ${msg}`);
    }
  };

  const getConvertedPrice = (planPrice) => {
    if (paymentMethod === 'crypto' && prices.btc && prices.usd) {
      const usdAmount = planPrice / prices.usd;
      return (usdAmount / prices.btc).toFixed(6);
    }
    return planPrice;
  };

  const getCurrencySymbol = () => {
    return paymentMethod === 'crypto' ? '₿' : 'MAD';
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{t('subscriptionPlans')}</h1>
          <p className="mt-2 text-gray-600 dark:text-gray-300">
            {t('choosePlan')}
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          {plans.map((plan) => (
            <div key={plan.id} className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300">
              <div className="p-6">
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">{t(plan.name + 'Plan')}</h3>
                <div className="mb-4">
                  <span className="text-4xl font-bold text-gray-900 dark:text-white">{plan.price}</span>
                  <span className="text-gray-600 dark:text-gray-300 ml-1">MAD</span>
                  <div className="text-gray-500 dark:text-gray-400 text-sm">{plan.duration} {t('daysAccess')}</div>
                </div>
                <ul className="space-y-2 mb-6">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-center text-gray-600 dark:text-gray-300">
                      <svg className="h-5 w-5 text-green-500 dark:text-green-400 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      {feature}
                    </li>
                  ))}
                </ul>
                <button
                  onClick={() => handleSelectPlan(plan)}
                  className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 transition-colors duration-200 dark:bg-blue-700 dark:hover:bg-blue-800"
                >
                  {t('selectPlan')}
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Payment Methods Explanation */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">{t('paymentMethod')}</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
              <h3 className="font-medium text-gray-900 dark:text-white mb-2">CMI</h3>
              <p className="text-gray-600 dark:text-gray-300 text-sm">
                Secure payment through CMI (Credit Mutuel de l'Industrie) - Morocco's trusted payment gateway.
              </p>
            </div>
            <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
              <h3 className="font-medium text-gray-900 dark:text-white mb-2">{t('bitcoin')}</h3>
              <p className="text-gray-600 dark:text-gray-300 text-sm">
                Pay with Bitcoin cryptocurrency. Rates are updated in real-time.
              </p>
            </div>
                <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                  <h3 className="font-medium text-gray-900 dark:text-white mb-2">PayPal</h3>
                  <p className="text-gray-600 dark:text-gray-300 text-sm">
                    Pay using PayPal if configured by SuperAdmin.
                  </p>
                </div>
          </div>
        </div>
      </div>

      {/* Payment Modal */}
      {showPaymentModal && selectedPlan && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 dark:bg-gray-900 dark:bg-opacity-75 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-full max-w-2xl shadow-lg rounded-md bg-white dark:bg-gray-800">
            <div className="mt-3">
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">{t('paymentMethod')}</h3>
                <button
                  onClick={() => setShowPaymentModal(false)}
                  className="text-gray-400 hover:text-gray-600 dark:text-gray-300 dark:hover:text-gray-100"
                >
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="mb-6">
                <h4 className="font-medium text-gray-900 dark:text-white mb-2">{t('orderSummary')}</h4>
                <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                  <div className="flex justify-between mb-1">
                    <span className="text-gray-600 dark:text-gray-300">{t('selectedPlan')}:</span>
                    <span className="font-medium">{t(selectedPlan.name + 'Plan')}</span>
                  </div>
                  <div className="flex justify-between mb-1">
                    <span className="text-gray-600 dark:text-gray-300">{t('duration')}:</span>
                    <span className="font-medium">{selectedPlan.duration} {t('daysAccess')}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-300">{t('priceText')}:</span>
                    <span className="font-medium">{selectedPlan.price} MAD</span>
                  </div>
                </div>
              </div>

              <div className="mb-6">
                <h4 className="font-medium text-gray-900 dark:text-white mb-3">{t('payWith')}:</h4>
                <div className="grid grid-cols-3 gap-4">
                  <button
                    onClick={() => setPaymentMethod('cmi')}
                    className={`p-4 border rounded-lg text-center ${
                      paymentMethod === 'cmi'
                        ? 'border-blue-500 bg-blue-50 dark:border-blue-400 dark:bg-blue-900/20'
                        : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500'
                    }`}
                  >
                    <div className="font-medium">CMI</div>
                    <div className="text-sm text-gray-600 dark:text-gray-300">Credit Mutuel de l'Industrie</div>
                  </button>
                  <button
                    onClick={() => setPaymentMethod('crypto')}
                    className={`p-4 border rounded-lg text-center ${
                      paymentMethod === 'crypto'
                        ? 'border-blue-500 bg-blue-50 dark:border-blue-400 dark:bg-blue-900/20'
                        : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500'
                    }`}
                  >
                    <div className="font-medium">{t('bitcoin')}</div>
                    <div className="text-sm text-gray-600 dark:text-gray-300">
                      {paymentMethod === 'crypto' && prices.btc 
                        ? `${getConvertedPrice(selectedPlan.price)} ₿`
                        : 'Pay with BTC'}
                    </div>
                  </button>
                  <button
                    onClick={() => setPaymentMethod('paypal')}
                    className={`p-4 border rounded-lg text-center ${
                      paymentMethod === 'paypal'
                        ? 'border-blue-500 bg-blue-50 dark:border-blue-400 dark:bg-blue-900/20'
                        : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500'
                    }`}
                  >
                    <div className="font-medium">PayPal</div>
                    <div className="text-sm text-gray-600 dark:text-gray-300">Pay with PayPal</div>
                  </button>
                </div>
              </div>

              {isProcessing ? (
                <div className="bg-blue-50 dark:bg-blue-900/20 p-6 rounded-lg text-center">
                  <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 dark:border-blue-400 mb-4"></div>
                  <p className="text-gray-700 dark:text-gray-300">{processingMessage}</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">{t('pleaseWait')}</p>
                </div>
              ) : (
                <div className="flex justify-end space-x-3">
                  <button
                    onClick={() => setShowPaymentModal(false)}
                    className="px-4 py-2 bg-gray-300 text-gray-800 rounded-md hover:bg-gray-400 dark:bg-gray-600 dark:text-white dark:hover:bg-gray-700"
                  >
                    {t('cancel')}
                  </button>
                  <button
                    onClick={handlePayment}
                    disabled={isProcessing}
                    className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 dark:bg-green-700 dark:hover:bg-green-800"
                  >
                    {t('payWith')} {getCurrencySymbol()} {getConvertedPrice(selectedPlan.price)}
                  </button>
                </div>
              )}

              <div className="mt-4 text-center text-sm text-gray-500 dark:text-gray-400">
                {t('noRealCharge')}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PaymentPage;
