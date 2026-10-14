import { useState, useEffect, useMemo, useCallback } from 'react';
import {
  Category,
  MonthSummary,
  MonthlyCategorySpending,
  RecurringBill,
  RecurringFrequency,
  SavingsGoal,
  Transaction,
  UserSettings,
} from '../types/finance';
import {
  DEFAULT_CATEGORIES,
  DEFAULT_RECURRING_BILLS,
  DEFAULT_SAVINGS_GOALS,
  DEFAULT_TRANSACTIONS,
  DEFAULT_USER_SETTINGS,
} from '../data/seedData';
import { formatMonthYear } from '../utils/formatters';

const STORAGE_KEYS = {
  TRANSACTIONS: 'aura_clean_transactions_v3',
  CATEGORIES: 'aura_clean_categories_v3',
  SAVINGS: 'aura_clean_savings_v3',
  RECURRING: 'aura_clean_recurring_v3',
  SETTINGS: 'aura_clean_settings_v3',
};

// Clear legacy demo keys on client
if (typeof window !== 'undefined') {
  try {
    [
      'aura_transactions_v1',
      'aura_categories_v1',
      'aura_savings_v1',
      'aura_recurring_bills_v1',
      'aura_settings_v1',
      'aura_transactions_clean_v2',
      'aura_savings_clean_v2',
      'aura_recurring_bills_clean_v2',
    ].forEach((k) => localStorage.removeItem(k));
  } catch {
    // Ignore in SSR
  }
}

function calculateNextDueDate(fromDateStr: string, frequency: RecurringFrequency): string {
  const [year, month, day] = fromDateStr.split('-').map(Number);
  const date = new Date(year, month - 1, day);
  if (frequency === 'weekly') {
    date.setDate(date.getDate() + 7);
  } else {
    date.setMonth(date.getMonth() + 1);
  }
  return date.toISOString().split('T')[0];
}

export function useFinanceStore() {
  // 1. Transactions state (starts completely empty from scratch)
  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.TRANSACTIONS);
      if (saved) return JSON.parse(saved);
    } catch {
      // Fallback
    }
    return DEFAULT_TRANSACTIONS;
  });

  // 2. Categories state
  const [categories, setCategories] = useState<Category[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.CATEGORIES);
      if (saved) return JSON.parse(saved);
    } catch {
      // Fallback
    }
    return DEFAULT_CATEGORIES;
  });

  // 3. Savings Goals state (starts completely empty from scratch)
  const [savingsGoals, setSavingsGoals] = useState<SavingsGoal[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.SAVINGS);
      if (saved) return JSON.parse(saved);
    } catch {
      // Fallback
    }
    return DEFAULT_SAVINGS_GOALS;
  });

  // 4. Recurring Bills state (starts completely empty from scratch)
  const [recurringBills, setRecurringBills] = useState<RecurringBill[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.RECURRING);
      if (saved) return JSON.parse(saved);
    } catch {
      // Fallback
    }
    return DEFAULT_RECURRING_BILLS;
  });

  // 5. Settings state
  const [settings, setSettings] = useState<UserSettings>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.SETTINGS);
      if (saved) return JSON.parse(saved);
    } catch {
      // Fallback
    }
    return DEFAULT_USER_SETTINGS;
  });

  // 6. Selected month (defaults dynamically to current active month)
  const [selectedMonth, setSelectedMonth] = useState<string>(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  });

  // Persistence side-effects
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(transactions));
    } catch (e) {
      console.warn('Failed to save transactions to localStorage', e);
    }
  }, [transactions]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(categories));
    } catch (e) {
      console.warn('Failed to save categories to localStorage', e);
    }
  }, [categories]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.SAVINGS, JSON.stringify(savingsGoals));
    } catch (e) {
      console.warn('Failed to save savings to localStorage', e);
    }
  }, [savingsGoals]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.RECURRING, JSON.stringify(recurringBills));
    } catch (e) {
      console.warn('Failed to save recurring bills to localStorage', e);
    }
  }, [recurringBills]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
    } catch (e) {
      console.warn('Failed to save settings to localStorage', e);
    }
  }, [settings]);

  // Derived: Lookup maps
  const categoryMap = useMemo(() => {
    const map = new Map<string, Category>();
    categories.forEach((cat) => map.set(cat.id, cat));
    return map;
  }, [categories]);

  // Available unique months sorted descending
  const availableMonths = useMemo(() => {
    const monthSet = new Set<string>();
    transactions.forEach((tx) => {
      const m = tx.date.slice(0, 7);
      if (m) monthSet.add(m);
    });
    const now = new Date();
    const currentMonthKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    monthSet.add(currentMonthKey);
    return Array.from(monthSet).sort().reverse();
  }, [transactions]);

  // Calculate summary for any month
  const getMonthSummary = useCallback(
    (monthKey: string): MonthSummary => {
      const monthTransactions = transactions.filter((t) => t.date.startsWith(monthKey));

      let totalIncome = 0;
      let totalExpenses = 0;
      let totalSavings = 0;

      const spendingByCat: Record<string, { spent: number; count: number }> = {};

      monthTransactions.forEach((tx) => {
        if (tx.type === 'income') {
          totalIncome += tx.amount;
        } else if (tx.type === 'expense') {
          totalExpenses += tx.amount;
          if (!spendingByCat[tx.categoryId]) {
            spendingByCat[tx.categoryId] = { spent: 0, count: 0 };
          }
          spendingByCat[tx.categoryId].spent += tx.amount;
          spendingByCat[tx.categoryId].count += 1;
        } else if (tx.type === 'savings') {
          totalSavings += tx.amount;
        }
      });

      if (totalIncome === 0 && settings.monthlyIncome > 0) {
        totalIncome = settings.monthlyIncome;
      }

      const categoryBreakdown: MonthlyCategorySpending[] = categories.map((cat) => {
        const item = spendingByCat[cat.id] || { spent: 0, count: 0 };
        const spent = Number(item.spent.toFixed(2));
        const limit = cat.monthlyLimit;
        const percentage = limit > 0 ? Math.min(100, Math.round((spent / limit) * 100)) : 0;
        const remaining = Number(Math.max(0, limit - spent).toFixed(2));

        return {
          categoryId: cat.id,
          categoryName: cat.name,
          color: cat.color,
          iconName: cat.iconName,
          spent,
          limit,
          percentage,
          remaining,
          transactionCount: item.count,
        };
      });

      categoryBreakdown.sort((a, b) => b.spent - a.spent);

      const netSavingsRate =
        totalIncome > 0
          ? Math.max(0, Math.round(((totalIncome - totalExpenses) / totalIncome) * 100))
          : 0;

      return {
        monthKey,
        label: formatMonthYear(monthKey),
        totalIncome,
        totalExpenses: Number(totalExpenses.toFixed(2)),
        totalSavings: Number(totalSavings.toFixed(2)),
        netSavingsRate,
        categoryBreakdown,
      };
    },
    [transactions, categories, settings.monthlyIncome]
  );

  // Active month summary
  const currentMonthSummary = useMemo(
    () => getMonthSummary(selectedMonth),
    [getMonthSummary, selectedMonth]
  );

  // Total allocated monthly budget across all categories
  const totalMonthlyBudget = useMemo(() => {
    return categories.reduce((acc, cat) => acc + cat.monthlyLimit, 0);
  }, [categories]);

  // Total savings across all goals
  const totalAccumulatedSavings = useMemo(() => {
    return savingsGoals.reduce((acc, g) => acc + g.currentAmount, 0);
  }, [savingsGoals]);

  // Total savings target across all goals
  const totalSavingsTarget = useMemo(() => {
    return savingsGoals.reduce((acc, g) => acc + g.targetAmount, 0);
  }, [savingsGoals]);

  // Total active recurring monthly commitments
  const totalMonthlyRecurring = useMemo(() => {
    return recurringBills
      .filter((b) => b.isActive && b.type === 'expense')
      .reduce((sum, b) => {
        return sum + (b.frequency === 'weekly' ? b.amount * 4.33 : b.amount);
      }, 0);
  }, [recurringBills]);

  // CRUD Actions
  const addTransaction = useCallback((newTx: Omit<Transaction, 'id'>) => {
    const id = `tx-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`;
    let recurringBillId: string | undefined = undefined;

    if (newTx.isRecurring) {
      const recFreq = newTx.recurringFrequency || 'monthly';
      const recId = `rec-${Date.now()}`;
      recurringBillId = recId;
      const nextDueDate = calculateNextDueDate(newTx.date, recFreq);
      const newBill: RecurringBill = {
        id: recId,
        merchant: newTx.merchant,
        amount: newTx.amount,
        type: newTx.type,
        categoryId: newTx.categoryId,
        frequency: recFreq,
        startDate: newTx.date,
        nextDueDate,
        paymentMethod: newTx.paymentMethod,
        note: newTx.note,
        isActive: true,
      };
      setRecurringBills((prev) => [newBill, ...prev]);
    }

    const tx: Transaction = { ...newTx, id, recurringBillId };
    setTransactions((prev) => [tx, ...prev]);

    if (tx.type === 'savings' && tx.categoryId && tx.categoryId.startsWith('goal-')) {
      setSavingsGoals((goals) =>
        goals.map((g) =>
          g.id === tx.categoryId ? { ...g, currentAmount: g.currentAmount + tx.amount } : g
        )
      );
    }
  }, []);

  const updateTransaction = useCallback((updatedTx: Transaction) => {
    setTransactions((prev) => prev.map((t) => (t.id === updatedTx.id ? updatedTx : t)));
  }, []);

  const deleteTransaction = useCallback((id: string) => {
    setTransactions((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const updateCategoryLimit = useCallback((categoryId: string, newLimit: number) => {
    setCategories((prev) =>
      prev.map((c) => (c.id === categoryId ? { ...c, monthlyLimit: Math.max(0, newLimit) } : c))
    );
  }, []);

  const addCategory = useCallback((newCat: Omit<Category, 'id'>) => {
    const id = `cat-${Date.now()}`;
    setCategories((prev) => [...prev, { ...newCat, id }]);
  }, []);

  const addSavingsGoal = useCallback((newGoal: Omit<SavingsGoal, 'id' | 'currentAmount'>) => {
    const id = `goal-${Date.now()}`;
    setSavingsGoals((prev) => [...prev, { ...newGoal, id, currentAmount: 0 }]);
  }, []);

  const updateSavingsGoal = useCallback((updatedGoal: SavingsGoal) => {
    setSavingsGoals((prev) => prev.map((g) => (g.id === updatedGoal.id ? updatedGoal : g)));
  }, []);

  const deleteSavingsGoal = useCallback((goalId: string) => {
    setSavingsGoals((prev) => prev.filter((g) => g.id !== goalId));
  }, []);

  const contributeToSavingsGoal = useCallback((goalId: string, amount: number) => {
    if (amount <= 0) return;
    setSavingsGoals((prev) =>
      prev.map((g) =>
        g.id === goalId ? { ...g, currentAmount: Number((g.currentAmount + amount).toFixed(2)) } : g
      )
    );

    const today = new Date().toISOString().split('T')[0];
    const targetGoal = savingsGoals.find((g) => g.id === goalId);
    const txId = `tx-${Date.now()}`;
    const newTx: Transaction = {
      id: txId,
      date: today,
      amount,
      type: 'savings',
      categoryId: goalId,
      merchant: targetGoal ? `${targetGoal.title} Deposit` : 'Savings Deposit',
      note: 'Goal milestone contribution',
      paymentMethod: 'bank_transfer',
    };
    setTransactions((prev) => [newTx, ...prev]);
  }, [savingsGoals]);

  const addRecurringBill = useCallback((newBill: Omit<RecurringBill, 'id' | 'isActive'>) => {
    const id = `rec-${Date.now()}`;
    setRecurringBills((prev) => [{ ...newBill, id, isActive: true }, ...prev]);
  }, []);

  const deleteRecurringBill = useCallback((billId: string) => {
    setRecurringBills((prev) => prev.filter((b) => b.id !== billId));
  }, []);

  const toggleRecurringBill = useCallback((billId: string) => {
    setRecurringBills((prev) =>
      prev.map((b) => (b.id === billId ? { ...b, isActive: !b.isActive } : b))
    );
  }, []);

  const triggerRecurringBillNow = useCallback((billId: string) => {
    const bill = recurringBills.find((b) => b.id === billId);
    if (!bill) return;

    const today = new Date().toISOString().split('T')[0];
    const txId = `tx-${Date.now()}`;
    const tx: Transaction = {
      id: txId,
      date: today,
      amount: bill.amount,
      type: bill.type,
      categoryId: bill.categoryId,
      merchant: bill.merchant,
      paymentMethod: bill.paymentMethod,
      note: bill.note ? `${bill.note} (Scheduled bill)` : 'Scheduled recurring bill',
      isRecurring: true,
      recurringFrequency: bill.frequency,
      recurringBillId: bill.id,
    };
    setTransactions((prev) => [tx, ...prev]);

    const nextDue = calculateNextDueDate(bill.nextDueDate, bill.frequency);
    setRecurringBills((prev) =>
      prev.map((b) => (b.id === billId ? { ...b, nextDueDate: nextDue } : b))
    );
  }, [recurringBills]);

  const updateSettings = useCallback((newSettings: Partial<UserSettings>) => {
    setSettings((prev) => ({ ...prev, ...newSettings }));
  }, []);

  const resetToDefaults = useCallback(() => {
    setTransactions([]);
    setCategories(DEFAULT_CATEGORIES);
    setSavingsGoals([]);
    setRecurringBills([]);
    setSettings(DEFAULT_USER_SETTINGS);
    const now = new Date();
    setSelectedMonth(`${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`);
    localStorage.clear();
  }, []);

  // Export JSON
  const exportDataJSON = useCallback(() => {
    const payload = {
      version: '1.2',
      exportedAt: new Date().toISOString(),
      transactions,
      categories,
      savingsGoals,
      recurringBills,
      settings,
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `aura-financial-backup-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }, [transactions, categories, savingsGoals, recurringBills, settings]);

  // Import JSON
  const importDataJSON = useCallback((jsonContent: string): boolean => {
    try {
      const parsed = JSON.parse(jsonContent);
      if (Array.isArray(parsed.transactions) && Array.isArray(parsed.categories)) {
        setTransactions(parsed.transactions);
        setCategories(parsed.categories);
        if (Array.isArray(parsed.savingsGoals)) setSavingsGoals(parsed.savingsGoals);
        if (Array.isArray(parsed.recurringBills)) setRecurringBills(parsed.recurringBills);
        if (parsed.settings) setSettings(parsed.settings);
        return true;
      }
      return false;
    } catch {
      return false;
    }
  }, []);

  // Export CSV
  const exportTransactionsCSV = useCallback(() => {
    const headers = [
      'ID',
      'Date',
      'Type',
      'Amount',
      'Category',
      'Merchant',
      'Note',
      'Payment Method',
      'Recurring',
      'Frequency',
    ];
    const rows = transactions.map((t) => {
      const cat = categoryMap.get(t.categoryId)?.name || t.categoryId;
      return [
        t.id,
        t.date,
        t.type,
        t.amount.toFixed(2),
        `"${cat.replace(/"/g, '""')}"`,
        `"${t.merchant.replace(/"/g, '""')}"`,
        `"${(t.note || '').replace(/"/g, '""')}"`,
        t.paymentMethod,
        t.isRecurring ? 'Yes' : 'No',
        t.recurringFrequency || 'none',
      ].join(',');
    });
    const csvContent = [headers.join(','), ...rows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `aura-transactions-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }, [transactions, categoryMap]);

  return {
    transactions,
    categories,
    categoryMap,
    savingsGoals,
    recurringBills,
    settings,
    selectedMonth,
    setSelectedMonth,
    availableMonths,
    currentMonthSummary,
    getMonthSummary,
    totalMonthlyBudget,
    totalAccumulatedSavings,
    totalSavingsTarget,
    totalMonthlyRecurring,
    // Actions
    addTransaction,
    updateTransaction,
    deleteTransaction,
    updateCategoryLimit,
    addCategory,
    addSavingsGoal,
    updateSavingsGoal,
    deleteSavingsGoal,
    contributeToSavingsGoal,
    addRecurringBill,
    deleteRecurringBill,
    toggleRecurringBill,
    triggerRecurringBillNow,
    updateSettings,
    resetToDefaults,
    exportDataJSON,
    importDataJSON,
    exportTransactionsCSV,
  };
}

export type FinanceStore = ReturnType<typeof useFinanceStore>;
