export type TransactionType = 'expense' | 'income' | 'savings';

export type PaymentMethod = 'apple_pay' | 'card' | 'bank_transfer' | 'cash';

export type RecurringFrequency = 'weekly' | 'monthly';

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
  targetAmount: number;
  currentAmount: number;
  targetDate: string; // YYYY-MM-DD
  category: string;
  notes?: string;
  color: string;
  iconName: string;
}

export type CurrencyCode = 'USD' | 'EUR' | 'GBP' | 'INR' | 'CAD' | 'AUD' | 'JPY';

export interface UserSettings {
  currency: CurrencyCode;
  monthlyIncome: number;
  userName: string;
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
