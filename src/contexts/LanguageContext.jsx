import React, { createContext, useContext, useState, useEffect } from 'react';

const translations = {
  en: {
    // Navigation
    dashboard: 'Dashboard',
    challenge: 'Challenge',
    leaderboard: 'Leaderboard',
    pricing: 'Pricing',
    login: 'Login',
    register: 'Register',
    logout: 'Logout',
    welcome: 'Welcome',
    
    // Dashboard
    monitorPrices: 'Monitor real-time stock prices and market movements',
    lastUpdated: 'Last updated',
    autoRefresh: 'Auto-refresh: Every 5 seconds',
    usStocks: 'US Stocks',
    moroccanMarket: 'Moroccan Market',
    searchStock: 'Search stock...',
    featuredUpdates: 'Featured Real-Time Updates',
    marocTelecom: 'Maroc Telecom (IAM)',
    leadingTelecom: 'Leading telecommunications company in Morocco',
    bitcoin: 'Bitcoin (BTC)',
    leadingCrypto: 'Leading cryptocurrency',
    startChallenge: 'Start New Challenge',
    viewLeaderboard: 'View Leaderboard',
    makePayment: 'Make Payment',
    
    // Auth
    email: 'Email',
    password: 'Password',
    confirmPassword: 'Confirm Password',
    username: 'Username',
    signIn: 'Sign In',
    signUp: 'Sign Up',
    dontHaveAccount: "Don't have an account?",
    alreadyHaveAccount: 'Already have an account?',
    forgotPassword: 'Forgot Password?',
    
    // Challenge
    challengeTitle: 'Trading Challenge',
    startNewChallenge: 'Start New Challenge',
    challengeName: 'Challenge Name',
    challengeDescription: 'Challenge Description',
    durationDays: 'Duration (Days)',
    challengeStatus: 'Challenge Status',
    currentBalance: 'Current Balance',
    initialBalance: 'Initial Balance',
    profitLoss: 'Profit/Loss',
    trades: 'Trades',
    equity: 'Equity',
    makeTrade: 'Make Trade',
    symbol: 'Symbol',
    tradeType: 'Trade Type',
    quantity: 'Quantity',
    price: 'Price',
    buy: 'Buy',
    sell: 'Sell',
    active: 'Active',
    completed: 'Completed',
    failed: 'Failed',
    
    // Payment
    subscriptionPlans: 'Subscription Plans',
    choosePlan: 'Choose a plan to unlock premium trading features',
    starterPlan: 'Starter Plan',
    proPlan: 'Pro Plan',
    elitePlan: 'Elite Plan',
    daysAccess: 'days access',
    features: 'Features',
    selectPlan: 'Select Plan',
    paymentMethod: 'Payment Method',
    orderSummary: 'Order Summary',
    selectedPlan: 'Selected Plan',
    duration: 'Duration',
    priceText: 'Price',
    total: 'Total',
    payWith: 'Pay with',
    processing: 'Processing Payment (3s simulation)...',
    pleaseWait: 'Please wait while we process your payment...',
    noRealCharge: 'This is a simulation - no real payment will be charged',
    
    // General
    home: 'Home',
    settings: 'Settings',
    language: 'Language',
    french: 'French',
    arabic: 'Arabic',
    english: 'English',
    cancel: 'Cancel',
    save: 'Save',
    success: 'Success',
    error: 'Error',
    loading: 'Loading...',
    
    // Messages
    loadingPrices: 'Loading stock prices...',
    noStocksFound: 'No stocks found',
    searchToSeePrices: 'Search for a stock symbol to see real-time prices',
    popularUSText: 'Popular US Stocks',
    popularMoroccanText: 'Popular Moroccan Stocks',
    profitTargetReached: 'Profit target of +10% reached',
    totalMaxLossReached: 'Total max loss of -10% reached',
    dailyMaxLossExceeded: 'Daily max loss of -5% exceeded',
    rememberMe: 'Remember me',
    
    // Challenge Page
    noChallenges: 'No challenges',
    profitTargetProgress: 'Profit Target Progress',
    dailyDrawdown: 'Daily Drawdown',
    totalDrawdown: 'Total Drawdown',
    challengeRules: 'Challenge Rules',
    dailyMaxLoss: 'Daily Max Loss',
    totalMaxLoss: 'Total Max Loss',
    profitTarget: 'Profit Target',
    refresh: 'Refresh',
    
    // Leaderboard Page
    rank: 'Rank',
    totalTrades: 'Total Trades',
    winRate: 'Win Rate',
    
    
    // Footer
    copyright: '© 2024 TradeChallenge Platform. All rights reserved.',
    
    // PayPal Config (for admin)
    paypalConfig: 'PayPal Configuration',
    configurePaypal: 'Configure PayPal credentials for the trading platform',
    clientId: 'Client ID',
    secret: 'Secret',
    webhookId: 'Webhook ID',
    configure: 'Configure PayPal',
    configuring: 'Configuring...',
    status: 'Status',
    configurationStatus: 'Configuration Status',
    set: 'SET',
    notSet: 'NOT SET',
    notConfigured: 'NOT CONFIGURED',
    configured: 'CONFIGURED',
    
    // Homepage
    readyToStart: 'Ready to start your journey?',
    getStarted: 'Get started'
  },
  fr: {
    // Navigation
    dashboard: 'Tableau de bord',
    challenge: 'Défi',
    leaderboard: 'Classement',
    pricing: 'Tarification',
    login: 'Connexion',
    register: 'Inscription',
    logout: 'Déconnexion',
    welcome: 'Bienvenue',
    
    // Dashboard
    monitorPrices: 'Surveillez les cours boursiers en temps réel et les mouvements du marché',
    lastUpdated: 'Dernière mise à jour',
    autoRefresh: 'Actualisation automatique: Tous les 5 secondes',
    usStocks: 'Actions américaines',
    moroccanMarket: 'Marché marocain',
    searchStock: 'Rechercher une action...',
    featuredUpdates: 'Mises à jour en temps réel sélectionnées',
    marocTelecom: 'Maroc Telecom (IAM)',
    leadingTelecom: 'Première entreprise de télécommunications au Maroc',
    bitcoin: 'Bitcoin (BTC)',
    leadingCrypto: 'Cryptomonnaie leader',
    startChallenge: 'Commencer un nouveau défi',
    viewLeaderboard: 'Voir le classement',
    makePayment: 'Effectuer un paiement',
    
    // Auth
    email: 'Email',
    password: 'Mot de passe',
    confirmPassword: 'Confirmer le mot de passe',
    username: "Nom d'utilisateur",
    signIn: 'Se connecter',
    signUp: "S'inscrire",
    dontHaveAccount: "Vous n'avez pas de compte ?",
    alreadyHaveAccount: 'Vous avez déjà un compte ?',
    forgotPassword: 'Mot de passe oublié?',
    
    // Challenge
    challengeTitle: 'Défi de trading',
    startNewChallenge: 'Commencer un nouveau défi',
    challengeName: 'Nom du défi',
    challengeDescription: 'Description du défi',
    durationDays: 'Durée (Jours)',
    challengeStatus: 'Statut du défi',
    currentBalance: 'Solde actuel',
    initialBalance: 'Solde initial',
    profitLoss: 'Profit/Perte',
    trades: 'Transactions',
    equity: 'Capital',
    makeTrade: 'Effectuer un échange',
    symbol: 'Symbole',
    tradeType: 'Type de transaction',
    quantity: 'Quantité',
    price: 'Prix',
    buy: 'Acheter',
    sell: 'Vendre',
    active: 'Actif',
    completed: 'Terminé',
    failed: 'Échoué',
    
    // Payment
    subscriptionPlans: 'Formules d\'abonnement',
    choosePlan: 'Choisissez un plan pour débloquer les fonctionnalités de trading premium',
    starterPlan: 'Formule Démarrage',
    proPlan: 'Formule Pro',
    elitePlan: 'Formule Élite',
    daysAccess: 'jours d\'accès',
    features: 'Fonctionnalités',
    selectPlan: 'Sélectionner le plan',
    paymentMethod: 'Méthode de paiement',
    orderSummary: 'Résumé de la commande',
    selectedPlan: 'Plan sélectionné',
    duration: 'Durée',
    priceText: 'Prix',
    total: 'Total',
    payWith: 'Payer avec',
    processing: 'Traitement du paiement (simulation 3s)...',
    pleaseWait: 'Veuillez patienter pendant que nous traitons votre paiement...',
    noRealCharge: 'Ceci est une simulation - aucun paiement réel ne sera effectué',
    
    // General
    home: 'Accueil',
    settings: 'Paramètres',
    language: 'Langue',
    french: 'Français',
    arabic: 'Arabe',
    english: 'Anglais',
    cancel: 'Annuler',
    save: 'Enregistrer',
    success: 'Succès',
    error: 'Erreur',
    loading: 'Chargement...',
    
    // Messages
    loadingPrices: 'Chargement des cours boursiers...',
    noStocksFound: 'Aucune action trouvée',
    searchToSeePrices: 'Recherchez un symbole d\'action pour voir les cours en temps réel',
    popularUSText: 'Actions américaines populaires',
    popularMoroccanText: 'Actions marocaines populaires',
    profitTargetReached: 'Objectif de profit de +10% atteint',
    totalMaxLossReached: 'Perte maximale totale de -10% atteinte',
    dailyMaxLossExceeded: 'Perte maximale quotidienne de -5% dépassée',
    rememberMe: 'Se souvenir de moi',
    
    // Challenge Page
    noChallenges: 'Aucun défi',
    profitTargetProgress: 'Progression de l\'objectif de profit',
    dailyDrawdown: 'Baisse quotidienne',
    totalDrawdown: 'Baisse totale',
    challengeRules: 'Règles du défi',
    dailyMaxLoss: 'Perte max quotidienne',
    totalMaxLoss: 'Perte max totale',
    profitTarget: 'Objectif de profit',
    refresh: 'Actualiser',
    
    // Leaderboard Page
    rank: 'Rang',
    totalTrades: 'Total des transactions',
    winRate: 'Taux de réussite',
    
    
    // Footer
    copyright: '© 2024 Plateforme TradeChallenge. Tous droits réservés.',
    
    // PayPal Config (for admin)
    paypalConfig: 'Configuration PayPal',
    configurePaypal: 'Configurer les identifiants PayPal pour la plateforme de trading',
    clientId: 'Identifiant client',
    secret: 'Secret',
    webhookId: 'ID Webhook',
    configure: 'Configurer PayPal',
    configuring: 'Configuration...',
    status: 'Statut',
    configurationStatus: 'Statut de la configuration',
    set: 'DÉFINI',
    notSet: 'NON DÉFINI',
    notConfigured: 'NON CONFIGURÉ',
    configured: 'CONFIGURÉ',
    
    // Homepage
    readyToStart: 'Prêt à commencer votre parcours ?',
    getStarted: 'Commencer'
  },
  ar: {
    // Navigation
    dashboard: 'لوحة القيادة',
    challenge: 'التحدي',
    leaderboard: 'المتصدرين',
    pricing: 'التسعير',
    login: 'تسجيل الدخول',
    register: 'التسجيل',
    logout: 'تسجيل الخروج',
    welcome: 'مرحباً',
    
    // Dashboard
    monitorPrices: 'راقب أسعار الأسهم في الوقت الفعلي وتحركات السوق',
    lastUpdated: 'آخر تحديث',
    autoRefresh: 'التحديث التلقائي: كل 5 ثوانٍ',
    usStocks: 'الأسهم الأمريكية',
    moroccanMarket: 'السوق المغربي',
    searchStock: 'ابحث عن سهم...',
    featuredUpdates: 'تحديثات مميزة في الوقت الفعلي',
    marocTelecom: 'مورو تيلكوم (IAM)',
    leadingTelecom: 'شركة الاتصالات الرائدة في المغرب',
    bitcoin: 'بتكوين (BTC)',
    leadingCrypto: 'عملة رقمية رائدة',
    startChallenge: 'ابدأ تحدياً جديداً',
    viewLeaderboard: 'عرض المتصدرين',
    makePayment: 'إجراء دفع',
    
    // Auth
    email: 'البريد الإلكتروني',
    password: 'كلمة المرور',
    confirmPassword: 'تأكيد كلمة المرور',
    username: 'اسم المستخدم',
    signIn: 'تسجيل الدخول',
    signUp: 'إنشاء حساب',
    dontHaveAccount: 'لا تملك حساباً؟',
    alreadyHaveAccount: 'هل لديك حساب بالفعل؟',
    forgotPassword: 'نسيت كلمة المرور؟',
    
    // Challenge
    challengeTitle: 'تحدي التداول',
    startNewChallenge: 'ابدأ تحدياً جديداً',
    challengeName: 'اسم التحدي',
    challengeDescription: 'وصف التحدي',
    durationDays: 'المدة (أيام)',
    challengeStatus: 'حالة التحدي',
    currentBalance: 'الرصيد الحالي',
    initialBalance: 'الرصيد الأولي',
    profitLoss: 'الربح/الخسارة',
    trades: 'المعاملات',
    equity: 'حقوق الملكية',
    makeTrade: 'إجراء صفقة',
    symbol: 'الرمز',
    tradeType: 'نوع الصفقة',
    quantity: 'الكمية',
    price: 'السعر',
    buy: 'شراء',
    sell: 'بيع',
    active: 'نشط',
    completed: 'مكتمل',
    failed: 'فشل',
    
    // Payment
    subscriptionPlans: 'خطط الاشتراك',
    choosePlan: 'اختر خطة لفتح ميزات التداول المتميزة',
    starterPlan: 'الخطة الابتدائية',
    proPlan: 'الخطة الاحترافية',
    elitePlan: 'الخطة الممتازة',
    daysAccess: 'أيام الوصول',
    features: 'المميزات',
    selectPlan: 'اختر الخطة',
    paymentMethod: 'طريقة الدفع',
    orderSummary: 'ملخص الطلب',
    selectedPlan: 'الخطة المحددة',
    duration: 'المدة',
    priceText: 'السعر',
    total: 'المجموع',
    payWith: 'ادفع بـ',
    processing: 'معالجة الدفع (محاكاة 3 ثوانٍ)...',
    pleaseWait: 'يرجى الانتظار أثناء معالجة دفعتك...',
    noRealCharge: 'هذا فقط محاكاة - لن يتم تحصيل أي دفع فعلي',
    
    // General
    home: 'الرئيسية',
    settings: 'الإعدادات',
    language: 'اللغة',
    french: 'الفرنسية',
    arabic: 'العربية',
    english: 'الإنجليزية',
    cancel: 'إلغاء',
    save: 'حفظ',
    success: 'نجاح',
    error: 'خطأ',
    loading: 'جارٍ التحميل...',
    
    // Messages
    loadingPrices: 'جاري تحميل أسعار الأسهم...',
    noStocksFound: 'لم يتم العثور على أسهم',
    searchToSeePrices: 'ابحث عن رمز سهم لرؤية الأسعار في الوقت الفعلي',
    popularUSText: 'الأسهم الأمريكية الشائعة',
    popularMoroccanText: 'الأسهم المغربية الشائعة',
    profitTargetReached: 'تم تحقيق هدف الربح +10%',
    totalMaxLossReached: 'تم الوصول إلى أقصى خسارة إجمالية -10%',
    dailyMaxLossExceeded: 'تم تجاوز أقصى خسارة يومية -5%',
    rememberMe: 'تذكرني',
    
    // Challenge Page
    noChallenges: 'لا توجد تحديات',
    profitTargetProgress: 'تقدم هدف الربح',
    dailyDrawdown: 'الانخفاض اليومي',
    totalDrawdown: 'الانخفاض الإجمالي',
    challengeRules: 'قواعد التحدي',
    dailyMaxLoss: 'أقصى خسارة يومية',
    totalMaxLoss: 'أقصى خسارة إجمالية',
    profitTarget: 'هدف الربح',
    refresh: 'تحديث',
    
    // Leaderboard Page
    rank: 'الترتيب',
    totalTrades: 'إجمالي المعاملات',
    winRate: 'نسبة الربح',
    
    
    // Footer
    copyright: '© 2024 منصة تراديتشالينج. جميع الحقوق محفوظة.',
    
    // PayPal Config (for admin)
    paypalConfig: 'إعدادات بايبال',
    configurePaypal: 'تكوين بيانات اعتماد بايبال لمنصة التداول',
    clientId: 'معرّف العميل',
    secret: 'السر',
    webhookId: 'معرّف الخطاف',
    configure: 'تهيئة بايبال',
    configuring: 'جاري التهيئة...',
    status: 'الحالة',
    configurationStatus: 'حالة الإعداد',
    set: 'تم التعيين',
    notSet: 'غير محدد',
    notConfigured: 'غير معد',
    configured: 'معد',
      
    // Homepage
    readyToStart: 'هل أنت مستعد لبدء رحلتك؟',
    getStarted: 'ابدأ الآن'
  },
};

const LanguageContext = createContext();

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};

export const LanguageProvider = ({ children }) => {
  const [language, setLanguage] = useState(() => {
    // Check for saved language in localStorage, default to 'en'
    const savedLanguage = localStorage.getItem('language');
    return savedLanguage || 'en';
  });

  // Save language preference to localStorage
  useEffect(() => {
    localStorage.setItem('language', language);
  }, [language]);

  const t = (key) => {
    const translation = translations[language][key];
    return translation || key; // fallback to key if translation not found
  };

  const value = {
    language,
    setLanguage,
    t
  };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
};