import { Category, RecurringBill, SavingsGoal, Transaction, UserSettings } from '../types/finance';

export const DEFAULT_USER_SETTINGS: UserSettings = {
  currency: 'USD',
  monthlyIncome: 0,
  userName: 'Personal Account',
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
