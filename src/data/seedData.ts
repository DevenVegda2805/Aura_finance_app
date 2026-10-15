import {
  Category,
  DashboardWidgetsConfig,
  LinkedPaymentApp,
  MerchantCategoryRule,
  RecurringBill,
  SavingsGoal,
  Transaction,
  UserSettings,
} from '../types/finance';

export const DEFAULT_DASHBOARD_WIDGETS: DashboardWidgetsConfig = {
  showUpiBanner: true,
  showFreshSlateCard: true,
  showFloatingUpiPopup: true,
  showKpiCards: true,
  showBudgetRunwayGauge: true,
  showBudgetAlertsWatchlist: true,
  showCategoryDonut: true,
  showSavingsGoals: true,
  showRecentTransactions: true,
};

export const DEFAULT_USER_SETTINGS: UserSettings = {
  currency: 'USD',
  monthlyIncome: 0,
  userName: 'Deven Vegda',
  userEmail: 'Vegdadeven@gmail.com',
  rememberMe: true,
  darkMode: false,
  budgetAlertsEnabled: true,
  budgetAlertThreshold: 80,
  velocityAlertsEnabled: true,
  dashboardWidgets: DEFAULT_DASHBOARD_WIDGETS,
  lastSaved: new Date().toISOString(),
};

export const DEFAULT_CATEGORIES: Category[] = [
  {
    id: 'cat-housing',
    name: 'Housing & Rent',
    iconName: 'home',
    color: '#5856D6',
    bgColor: '#EEF0FF',
    monthlyLimit: 1500,
  },
  {
    id: 'cat-groceries',
    name: 'Groceries & Market',
    iconName: 'shoppingcart',
    color: '#FF9500',
    bgColor: '#FFF5E5',
    monthlyLimit: 500,
  },
  {
    id: 'cat-dining',
    name: 'Dining & Cafes',
    iconName: 'utensils',
    color: '#FF2D55',
    bgColor: '#FFEAEF',
    monthlyLimit: 300,
  },
  {
    id: 'cat-transport',
    name: 'Transit & Travel',
    iconName: 'car',
    color: '#007AFF',
    bgColor: '#E6F2FF',
    monthlyLimit: 200,
  },
  {
    id: 'cat-shopping',
    name: 'Shopping & Style',
    iconName: 'sparkles',
    color: '#AF52DE',
    bgColor: '#F6EBFF',
    monthlyLimit: 250,
  },
  {
    id: 'cat-wellness',
    name: 'Health & Fitness',
    iconName: 'heartpulse',
    color: '#34C759',
    bgColor: '#EBF9EE',
    monthlyLimit: 150,
  },
  {
    id: 'cat-entertainment',
    name: 'Entertainment & Subs',
    iconName: 'film',
    color: '#FF3B30',
    bgColor: '#FFEBEA',
    monthlyLimit: 100,
  },
  {
    id: 'cat-utilities',
    name: 'Bills & Utilities',
    iconName: 'smartphone',
    color: '#30B0C7',
    bgColor: '#E5F7F9',
    monthlyLimit: 150,
  },
];

// Starts from scratch: no auto-generated savings goals
export const DEFAULT_SAVINGS_GOALS: SavingsGoal[] = [];

// Starts from scratch: no auto-generated recurring bills
export const DEFAULT_RECURRING_BILLS: RecurringBill[] = [];

// Starts from scratch: no auto-generated transactions
export const DEFAULT_TRANSACTIONS: Transaction[] = [];

// Realistic test records for instant component verification & testing
const now = new Date();
const currentMonthStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
const todayStr = now.toISOString().split('T')[0];

export const SAMPLE_TEST_SAVINGS_GOALS: SavingsGoal[] = [
  {
    id: 'goal-emergency',
    title: 'Emergency Rainy Day Fund',
    name: 'Emergency Rainy Day Fund',
    targetAmount: 5000,
    currentAmount: 1850,
    targetDate: `${now.getFullYear()}-12-31`,
    category: 'Emergency',
    color: '#34C759',
    iconName: 'shield',
  },
  {
    id: 'goal-vacation',
    title: 'Tokyo & Kyoto Trip',
    name: 'Tokyo & Kyoto Trip',
    targetAmount: 3200,
    currentAmount: 1200,
    targetDate: `${now.getFullYear() + 1}-04-15`,
    category: 'Travel',
    color: '#007AFF',
    iconName: 'plane',
  },
  {
    id: 'goal-macbook',
    title: 'MacBook Pro M4',
    name: 'MacBook Pro M4',
    targetAmount: 2200,
    currentAmount: 850,
    targetDate: `${now.getFullYear()}-11-30`,
    category: 'Tech',
    color: '#AF52DE',
    iconName: 'laptop',
  },
];

export const SAMPLE_TEST_RECURRING_BILLS: RecurringBill[] = [
  {
    id: 'rec-rent',
    merchant: 'Apartment Lease',
    amount: 1400,
    type: 'expense',
    categoryId: 'cat-housing',
    frequency: 'monthly',
    startDate: `${currentMonthStr}-01`,
    nextDueDate: `${currentMonthStr}-01`,
    paymentMethod: 'bank_transfer',
    note: 'Primary apartment rent',
    isActive: true,
  },
  {
    id: 'rec-wifi',
    merchant: 'Fiber Gigabit Internet',
    amount: 70,
    type: 'expense',
    categoryId: 'cat-utilities',
    frequency: 'monthly',
    startDate: `${currentMonthStr}-15`,
    nextDueDate: `${currentMonthStr}-15`,
    paymentMethod: 'apple_pay',
    note: 'Home workspace internet',
    isActive: true,
  },
  {
    id: 'rec-spotify',
    merchant: 'Spotify Duo Subscription',
    amount: 14.99,
    type: 'expense',
    categoryId: 'cat-entertainment',
    frequency: 'monthly',
    startDate: `${currentMonthStr}-20`,
    nextDueDate: `${currentMonthStr}-20`,
    paymentMethod: 'phonepe',
    note: 'Music streaming family plan',
    isActive: true,
  },
];

export const SAMPLE_TEST_TRANSACTIONS: Transaction[] = [
  {
    id: 'tx-sample-1',
    date: todayStr,
    amount: 450,
    type: 'expense',
    categoryId: 'cat-dining',
    merchant: 'Swiggy Gourmet Feast',
    paymentMethod: 'phonepe',
    note: 'UPI payment via PhonePe',
  },
  {
    id: 'tx-sample-2',
    date: todayStr,
    amount: 84.5,
    type: 'expense',
    categoryId: 'cat-groceries',
    merchant: 'Blinkit Instant Mart',
    paymentMethod: 'paytm',
    note: 'Fresh produce & dairy',
  },
  {
    id: 'tx-sample-3',
    date: todayStr,
    amount: 14.75,
    type: 'expense',
    categoryId: 'cat-dining',
    merchant: 'Starbucks Reserve',
    paymentMethod: 'apple_pay',
    note: 'Cold brew & bagel',
  },
  {
    id: 'tx-sample-4',
    date: `${currentMonthStr}-05`,
    amount: 4500,
    type: 'income',
    categoryId: 'cat-housing',
    merchant: 'Monthly Professional Income',
    paymentMethod: 'bank_transfer',
    note: 'Direct salary deposit',
  },
  {
    id: 'tx-sample-5',
    date: `${currentMonthStr}-08`,
    amount: 65,
    type: 'expense',
    categoryId: 'cat-transport',
    merchant: 'Shell Petrol Station',
    paymentMethod: 'gpay',
    note: 'GPay fuel refill',
  },
];

// Pre-configured payment apps ready for UPI and Apple Pay integration
export const DEFAULT_LINKED_PAYMENT_APPS: LinkedPaymentApp[] = [
  {
    id: 'pay-phonepe',
    name: 'PhonePe UPI',
    appType: 'phonepe',
    upiId: 'deven@ybl',
    isEnabled: true,
    iconBgColor: '#5f259f',
    textColor: '#ffffff',
  },
  {
    id: 'pay-applepay',
    name: 'Apple Pay',
    appType: 'apple_pay',
    upiId: 'Apple Wallet · Primary Card',
    isEnabled: true,
    iconBgColor: '#000000',
    textColor: '#ffffff',
  },
  {
    id: 'pay-gpay',
    name: 'Google Pay',
    appType: 'gpay',
    upiId: 'deven@okaxis',
    isEnabled: true,
    iconBgColor: '#1a73e8',
    textColor: '#ffffff',
  },
  {
    id: 'pay-paytm',
    name: 'Paytm UPI',
    appType: 'paytm',
    upiId: 'deven@paytm',
    isEnabled: true,
    iconBgColor: '#002970',
    textColor: '#ffffff',
  },
  {
    id: 'pay-bhim',
    name: 'BHIM UPI',
    appType: 'bhim_upi',
    upiId: 'deven@upi',
    isEnabled: true,
    iconBgColor: '#005d52',
    textColor: '#ffffff',
  },
];

export const DEFAULT_MERCHANT_RULES: MerchantCategoryRule[] = [
  { merchantKeyword: 'swiggy', categoryId: 'cat-dining' },
  { merchantKeyword: 'zomato', categoryId: 'cat-dining' },
  { merchantKeyword: 'starbucks', categoryId: 'cat-dining' },
  { merchantKeyword: 'uber', categoryId: 'cat-transport' },
  { merchantKeyword: 'ola', categoryId: 'cat-transport' },
  { merchantKeyword: 'blinkit', categoryId: 'cat-groceries' },
  { merchantKeyword: 'zepto', categoryId: 'cat-groceries' },
  { merchantKeyword: 'amazon', categoryId: 'cat-shopping' },
  { merchantKeyword: 'netflix', categoryId: 'cat-entertainment' },
];

