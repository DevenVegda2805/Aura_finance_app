export type TransactionType = 'expense' | 'income' | 'savings';

export type PaymentMethod =
  | 'phonepe'
  | 'gpay'
  | 'paytm'
  | 'apple_pay'
  | 'bhim_upi'
  | 'amazon_pay'
  | 'cred'
  | 'card'
  | 'bank_transfer'
  | 'cash';

export type RecurringFrequency = 'weekly' | 'monthly';

export interface DetectedExpense {
  id: string;
  amount: number;
  merchant: string;
  date: string; // YYYY-MM-DD
  time?: string; // HH:MM
  paymentMethod: PaymentMethod;
  referenceId?: string;
  sourceText?: string;
  suggestedCategoryId?: string;
  detectedAt: string;
  status: 'pending' | 'categorized' | 'dismissed';
}

export interface LinkedPaymentApp {
  id: string;
  name: string;
  appType: PaymentMethod;
  upiId?: string;
  isEnabled: boolean;
  iconBgColor: string;
  textColor: string;
  lastSync?: string;
}

export interface MerchantCategoryRule {
  merchantKeyword: string;
  categoryId: string;
}

export interface Category {
  id: string;
  name: string;
  iconName: string;
  color: string;
  bgColor: string;
  monthlyLimit: number;
}

export interface Transaction {
  id: string;
  date: string; // YYYY-MM-DD
  amount: number;
  type: TransactionType;
  categoryId: string;
  merchant: string;
  note?: string;
  paymentMethod: PaymentMethod;
  isRecurring?: boolean;
  recurringFrequency?: RecurringFrequency;
  recurringBillId?: string;
}

export interface RecurringBill {
  id: string;
  merchant: string;
  amount: number;
  type: TransactionType;
  categoryId: string;
  frequency: RecurringFrequency;
  startDate: string; // YYYY-MM-DD
  nextDueDate: string; // YYYY-MM-DD
  paymentMethod: PaymentMethod;
  note?: string;
  isActive: boolean;
}

export interface SavingsGoal {
  id: string;
  title: string;
  name?: string;
  targetAmount: number;
  currentAmount: number;
  targetDate: string; // YYYY-MM-DD
  category?: string;
  notes?: string;
  color: string;
  iconName: string;
}

export type CurrencyCode = 'USD' | 'EUR' | 'GBP' | 'INR' | 'CAD' | 'AUD' | 'JPY';

export interface DashboardWidgetsConfig {
  showUpiBanner: boolean;
  showFreshSlateCard: boolean;
  showFloatingUpiPopup: boolean;
  showKpiCards: boolean;
  showBudgetRunwayGauge: boolean;
  showBudgetAlertsWatchlist: boolean;
  showCategoryDonut: boolean;
  showSavingsGoals: boolean;
  showRecentTransactions: boolean;
}

export interface UserSettings {
  currency: CurrencyCode;
  monthlyIncome: number;
  userName: string;
  userEmail: string;
  rememberMe: boolean;
  darkMode?: boolean;
  lastSaved?: string;
  budgetAlertsEnabled?: boolean;
  budgetAlertThreshold?: number; // e.g. 80 (80%)
  velocityAlertsEnabled?: boolean;
  dashboardWidgets?: DashboardWidgetsConfig;
}

export type BudgetAlertSeverity = 'critical' | 'warning' | 'velocity';

export interface BudgetAlert {
  id: string; // unique alert key e.g. alert-cat-dining-2026-10
  categoryId: string;
  categoryName: string;
  categoryColor: string;
  categoryIcon: string;
  severity: BudgetAlertSeverity;
  percentage: number; // actual % of limit
  spent: number;
  limit: number;
  remaining: number;
  overspent: number;
  dailySpendRate: number;
  projectedMonthEndSpend: number;
  daysRemaining: number;
  safeDailySpend: number;
  title: string;
  message: string;
  recommendation: string;
  isDismissed?: boolean;
}

export interface MonthlyCategorySpending {
  categoryId: string;
  categoryName: string;
  color: string;
  iconName: string;
  spent: number;
  limit: number;
  percentage: number;
  remaining: number;
  transactionCount: number;
  overspent?: number;
  dailySpendRate?: number;
  projectedMonthEndSpend?: number;
  isApproaching?: boolean;
  isOverbudget?: boolean;
  isHighVelocity?: boolean;
}

export interface MonthSummary {
  monthKey: string; // YYYY-MM
  label: string; // e.g. "October 2026"
  totalIncome: number;
  totalExpenses: number;
  totalSavings: number;
  netSavingsRate: number;
  categoryBreakdown: MonthlyCategorySpending[];
}
