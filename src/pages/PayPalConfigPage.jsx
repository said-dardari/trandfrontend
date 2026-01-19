import React, { useState, useEffect } from 'react';
import { paymentAPI } from '../services/api';
import { useLanguage } from '../contexts/LanguageContext';

const PayPalConfigPage = () => {
  const [credentials, setCredentials] = useState({
    client_id: '',
    secret: '',
    webhook_id: ''
  });
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [configStatus, setConfigStatus] = useState({ client_id: false, secret: false, webhook_id: false });
  const { t } = useLanguage();

  useEffect(() => {
    loadConfig();
  }, []);

  const loadConfig = async () => {
    setLoading(true);
    try {
      const response = await paymentAPI.getPayPalStatus();
      setConfigStatus({
        client_id: !!response.data.has_client_id,
        secret: !!response.data.has_secret,
        webhook_id: !!response.data.has_webhook
      });
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load configuration status');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setSaving(true);

    try {
      await paymentAPI.configurePayPal(credentials);
      setSuccess('Configuration saved successfully!');
      // Reload status after saving
      setTimeout(loadConfig, 1000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save configuration');
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setCredentials(prev => ({
      ...prev,
      [name]: value
    }));
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{t('paypalConfig')}</h1>
          <p className="mt-2 text-gray-600 dark:text-gray-300">
            {t('configurePaypal')}
          </p>
        </div>

        {error && (
          <div className="mb-6 rounded-md bg-red-50 dark:bg-red-900/20 p-4">
            <div className="text-sm text-red-700 dark:text-red-300">{error}</div>
          </div>
        )}

        {success && (
          <div className="mb-6 rounded-md bg-green-50 dark:bg-green-900/20 p-4">
            <div className="text-sm text-green-700 dark:text-green-300">{success}</div>
          </div>
        )}

        {/* Configuration Status */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">{t('configurationStatus')}</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
              <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">{t('clientId')}</div>
              <div className={`font-medium ${configStatus.client_id ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                {configStatus.client_id ? t('set') : t('notSet')}
              </div>
            </div>
            <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
              <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">{t('secret')}</div>
              <div className={`font-medium ${configStatus.secret ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                {configStatus.secret ? t('set') : t('notSet')}
              </div>
            </div>
            <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
              <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">{t('webhookId')}</div>
              <div className={`font-medium ${configStatus.webhook_id ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                {configStatus.webhook_id ? t('set') : t('notSet')}
              </div>
            </div>
          </div>
          <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <div className="text-sm text-gray-600 dark:text-gray-300">
              {t('status')}:{' '}
              <span className={`font-medium ${configStatus.client_id && configStatus.secret && configStatus.webhook_id ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                {configStatus.client_id && configStatus.secret && configStatus.webhook_id ? t('configured') : t('notConfigured')}
              </span>
            </div>
          </div>
        </div>

        {/* Configuration Form */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">{t('configure')}</h2>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="client_id" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                {t('clientId')}
              </label>
              <input
                type="password"
                id="client_id"
                name="client_id"
                value={credentials.client_id}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                placeholder="Enter PayPal Client ID"
              />
            </div>
            <div>
              <label htmlFor="secret" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                {t('secret')}
              </label>
              <input
                type="password"
                id="secret"
                name="secret"
                value={credentials.secret}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                placeholder="Enter PayPal Secret"
              />
            </div>
            <div>
              <label htmlFor="webhook_id" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                {t('webhookId')}
              </label>
              <input
                type="password"
                id="webhook_id"
                name="webhook_id"
                value={credentials.webhook_id}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                placeholder="Enter PayPal Webhook ID"
              />
            </div>
            <div className="flex justify-end">
              <button
                type="submit"
                disabled={saving}
                className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 flex items-center dark:bg-blue-700 dark:hover:bg-blue-800"
              >
                {saving ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    {t('configuring')}
                  </>
                ) : (
                  t('configure')
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default PayPalConfigPage;
