import { useState, useEffect, useMemo, useCallback } from 'react';
import {
  BudgetAlert,
  Category,
  DashboardWidgetsConfig,
  DetectedExpense,
  LinkedPaymentApp,
  MerchantCategoryRule,
  MonthSummary,
  MonthlyCategorySpending,
  PaymentMethod,
  RecurringBill,
  RecurringFrequency,
  SavingsGoal,
  Transaction,
  UserSettings,
} from '../types/finance';
import {
  DEFAULT_CATEGORIES,
  DEFAULT_DASHBOARD_WIDGETS,
  DEFAULT_LINKED_PAYMENT_APPS,
  DEFAULT_MERCHANT_RULES,
  DEFAULT_RECURRING_BILLS,
  DEFAULT_SAVINGS_GOALS,
  DEFAULT_TRANSACTIONS,
  DEFAULT_USER_SETTINGS,
  SAMPLE_TEST_RECURRING_BILLS,
  SAMPLE_TEST_SAVINGS_GOALS,
  SAMPLE_TEST_TRANSACTIONS,
} from '../data/seedData';
import { formatMonthYear, formatCurrency, getDaysRemainingInMonth } from '../utils/formatters';
import { downloadDirectAPK, downloadAppPackage } from '../utils/downloadDirectAPK';
import { parseExpenseNotification } from '../utils/expenseParser';
import { saveToIndexedDB, loadFromIndexedDB, VaultSnapshot } from '../utils/indexedDBStorage';

const STORAGE_KEYS = {
  MASTER_VAULT: 'aura_master_vault_v1',
  TRANSACTIONS: 'aura_clean_transactions_v3',
  CATEGORIES: 'aura_clean_categories_v3',
  SAVINGS: 'aura_clean_savings_v3',
  RECURRING: 'aura_clean_recurring_v3',
  SETTINGS: 'aura_clean_settings_v3',
  DETECTED_EXPENSES: 'aura_detected_expenses_v1',
  PAYMENT_APPS: 'aura_payment_apps_v1',
  MERCHANT_RULES: 'aura_merchant_rules_v1',
  DISMISSED_ALERTS: 'aura_dismissed_alerts_v1',
};

// Safe retrieval with automatic fallback across legacy keys and master vault to prevent data loss
function getStoredItem<T>(key: string, fallback: T, legacyKeys: string[] = []): T {
  if (typeof window === 'undefined') return fallback;
  try {
    const val = localStorage.getItem(key);
    if (val) {
      const parsed = JSON.parse(val);
      if (parsed !== undefined && parsed !== null) return parsed;
    }
    // Check master vault
    const vaultStr = localStorage.getItem(STORAGE_KEYS.MASTER_VAULT);
    if (vaultStr) {
      const vault = JSON.parse(vaultStr);
      if (vault && vault[key]) return vault[key];
    }
    // Check legacy migration keys
    for (const lk of legacyKeys) {
      const leg = localStorage.getItem(lk);
      if (leg) {
        const parsed = JSON.parse(leg);
        if (parsed !== undefined && parsed !== null) return parsed;
      }
    }
  } catch (e) {
    console.warn(`[Aura Storage] Error reading ${key}:`, e);
  }
  return fallback;
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
  // 1. Transactions state (with multi-key resilience)
  const [transactions, setTransactions] = useState<Transaction[]>(() =>
    getStoredItem(STORAGE_KEYS.TRANSACTIONS, DEFAULT_TRANSACTIONS, [
      'aura_transactions_clean_v2',
      'aura_transactions_v1',
    ])
  );

  // 2. Categories state
  const [categories, setCategories] = useState<Category[]>(() =>
    getStoredItem(STORAGE_KEYS.CATEGORIES, DEFAULT_CATEGORIES, ['aura_categories_v1'])
  );

  // 3. Savings Goals state
  const [savingsGoals, setSavingsGoals] = useState<SavingsGoal[]>(() =>
    getStoredItem(STORAGE_KEYS.SAVINGS, DEFAULT_SAVINGS_GOALS, [
      'aura_savings_clean_v2',
      'aura_savings_v1',
    ])
  );

  // 4. Recurring Bills state
  const [recurringBills, setRecurringBills] = useState<RecurringBill[]>(() =>
    getStoredItem(STORAGE_KEYS.RECURRING, DEFAULT_RECURRING_BILLS, [
      'aura_recurring_bills_clean_v2',
      'aura_recurring_bills_v1',
    ])
  );

  // 5. Settings state (persists user identity and preferences)
  const [settings, setSettings] = useState<UserSettings>(() => {
    const loaded = getStoredItem(STORAGE_KEYS.SETTINGS, DEFAULT_USER_SETTINGS, ['aura_settings_v1']);
    return {
      ...DEFAULT_USER_SETTINGS,
      ...loaded,
      dashboardWidgets: {
        ...DEFAULT_DASHBOARD_WIDGETS,
        ...(loaded.dashboardWidgets || {}),
      },
      userName: loaded.userName || DEFAULT_USER_SETTINGS.userName,
      userEmail: loaded.userEmail || DEFAULT_USER_SETTINGS.userEmail,
      rememberMe: loaded.rememberMe !== undefined ? loaded.rememberMe : true,
      lastSaved: loaded.lastSaved || new Date().toISOString(),
    };
  });

  // 6. Detected Expenses from UPI & Payment Alerts
  const [detectedExpenses, setDetectedExpenses] = useState<DetectedExpense[]>(() =>
    getStoredItem(STORAGE_KEYS.DETECTED_EXPENSES, [])
  );

  // 7. Linked UPI & Mobile Payment Apps (PhonePe, Apple Pay, GPay, Paytm, etc.)
  const [linkedPaymentApps, setLinkedPaymentApps] = useState<LinkedPaymentApp[]>(() =>
    getStoredItem(STORAGE_KEYS.PAYMENT_APPS, DEFAULT_LINKED_PAYMENT_APPS)
  );

  // 8. Learned Merchant-to-Category Auto-categorization Rules
  const [merchantRules, setMerchantRules] = useState<MerchantCategoryRule[]>(() =>
    getStoredItem(STORAGE_KEYS.MERCHANT_RULES, DEFAULT_MERCHANT_RULES)
  );

  // 9. Dismissed Budget Alerts
  const [dismissedAlertIds, setDismissedAlertIds] = useState<string[]>(() =>
    getStoredItem(STORAGE_KEYS.DISMISSED_ALERTS, [])
  );

  // 10. Real-time Toast Budget Alert Notification
  const [latestBudgetNotification, setLatestBudgetNotification] = useState<BudgetAlert | null>(null);

  // Storage persistence and save indicator tracking
  const [isStoragePersistent, setIsStoragePersistent] = useState<boolean>(true);
  const [lastSavedTimestamp, setLastSavedTimestamp] = useState<Date>(() => new Date());

  // Request durable storage permission from browser if supported
  useEffect(() => {
    if (typeof navigator !== 'undefined' && navigator.storage) {
      if (navigator.storage.persist) {
        navigator.storage
          .persist()
          .then((persisted) => {
            setIsStoragePersistent(persisted);
          })
          .catch(() => {});
      } else if (navigator.storage.persisted) {
        navigator.storage
          .persisted()
          .then((persisted) => {
            setIsStoragePersistent(persisted);
          })
          .catch(() => {});
      }
    }
  }, []);

  // Hydrate from IndexedDB on initial mount if localStorage was empty/cleared
  useEffect(() => {
    loadFromIndexedDB()
      .then((snapshot) => {
        if (!snapshot) return;
        if (
          Array.isArray(snapshot.transactions) &&
          snapshot.transactions.length > 0 &&
          transactions.length === 0
        ) {
          setTransactions(snapshot.transactions as Transaction[]);
        }
        if (
          Array.isArray(snapshot.savingsGoals) &&
          snapshot.savingsGoals.length > 0 &&
          savingsGoals.length === 0
        ) {
          setSavingsGoals(snapshot.savingsGoals as SavingsGoal[]);
        }
        if (
          Array.isArray(snapshot.recurringBills) &&
          snapshot.recurringBills.length > 0 &&
          recurringBills.length === 0
        ) {
          setRecurringBills(snapshot.recurringBills as RecurringBill[]);
        }
      })
      .catch((e) => console.warn('[Aura] Error restoring from IndexedDB:', e));
  }, []);

  // Selected month (defaults dynamically to current active month)
  const [selectedMonth, setSelectedMonth] = useState<string>(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  });

  // Sync snapshot to Master Vault in localStorage and IndexedDB
  const syncToVault = useCallback(
    (
      txs: Transaction[],
      cats: Category[],
      savings: SavingsGoal[],
      bills: RecurringBill[],
      sett: UserSettings,
      apps: LinkedPaymentApp[],
      expenses: DetectedExpense[],
      rules: MerchantCategoryRule[]
    ) => {
      try {
        const snapshot: VaultSnapshot = {
          transactions: txs,
          categories: cats,
          savingsGoals: savings,
          recurringBills: bills,
          settings: sett,
          linkedPaymentApps: apps,
          detectedExpenses: expenses,
          merchantRules: rules,
          savedAt: new Date().toISOString(),
        };
        localStorage.setItem(STORAGE_KEYS.MASTER_VAULT, JSON.stringify(snapshot));
        saveToIndexedDB(snapshot);
        setLastSavedTimestamp(new Date());
      } catch (e) {
        console.warn('Master vault sync warning:', e);
      }
    },
    []
  );

  // Persistence side-effects
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(transactions));
      syncToVault(
        transactions,
        categories,
        savingsGoals,
        recurringBills,
        settings,
        linkedPaymentApps,
        detectedExpenses,
        merchantRules
      );
    } catch (e) {
      console.warn('Failed to save transactions', e);
    }
  }, [transactions, categories, savingsGoals, recurringBills, settings, linkedPaymentApps, detectedExpenses, merchantRules, syncToVault]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(categories));
    } catch (e) {
      console.warn('Failed to save categories', e);
    }
  }, [categories]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.SAVINGS, JSON.stringify(savingsGoals));
    } catch (e) {
      console.warn('Failed to save savings', e);
    }
  }, [savingsGoals]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.RECURRING, JSON.stringify(recurringBills));
    } catch (e) {
      console.warn('Failed to save recurring bills', e);
    }
  }, [recurringBills]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
    } catch (e) {
      console.warn('Failed to save settings', e);
    }
  }, [settings]);

  // Synchronize dark mode class on document element and theme-color meta tag
  useEffect(() => {
    const isDark = Boolean(settings.darkMode);
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    const themeColorMeta = document.querySelector('meta[name="theme-color"]');
    if (themeColorMeta) {
      themeColorMeta.setAttribute('content', isDark ? '#0A0D14' : '#F5F5F7');
    }
  }, [settings.darkMode]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.DETECTED_EXPENSES, JSON.stringify(detectedExpenses));
    } catch (e) {
      console.warn('Failed to save detected expenses', e);
    }
  }, [detectedExpenses]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.PAYMENT_APPS, JSON.stringify(linkedPaymentApps));
    } catch (e) {
      console.warn('Failed to save payment apps', e);
    }
  }, [linkedPaymentApps]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.MERCHANT_RULES, JSON.stringify(merchantRules));
    } catch (e) {
      console.warn('Failed to save merchant rules', e);
    }
  }, [merchantRules]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.DISMISSED_ALERTS, JSON.stringify(dismissedAlertIds));
    } catch (e) {
      console.warn('Failed to save dismissed alerts', e);
    }
  }, [dismissedAlertIds]);

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

      const [yearStr, monthStr] = monthKey.split('-');
      const year = parseInt(yearStr, 10);
      const month = parseInt(monthStr, 10);
      const daysInMonth = new Date(year, month, 0).getDate();
      const now = new Date();
      const currentMonthKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
      const isCurrentMonth = monthKey === currentMonthKey;
      const dayOfMonth = isCurrentMonth ? Math.min(now.getDate(), daysInMonth) : daysInMonth;
      const threshold = settings.budgetAlertThreshold ?? 80;

      const categoryBreakdown: MonthlyCategorySpending[] = categories.map((cat) => {
        const item = spendingByCat[cat.id] || { spent: 0, count: 0 };
        const spent = Number(item.spent.toFixed(2));
        const limit = cat.monthlyLimit;
        const rawPercentage = limit > 0 ? Math.round((spent / limit) * 100) : 0;
        const remaining = Number(Math.max(0, limit - spent).toFixed(2));
        const overspent = Number(Math.max(0, spent - limit).toFixed(2));
        const dailySpendRate = dayOfMonth > 0 ? Number((spent / dayOfMonth).toFixed(2)) : 0;
        const projectedMonthEndSpend = Number((dailySpendRate * daysInMonth).toFixed(2));
        const isOverbudget = spent >= limit && limit > 0;
        const isApproaching = rawPercentage >= threshold && !isOverbudget && limit > 0;
        const isHighVelocity =
          Boolean(settings.velocityAlertsEnabled !== false) &&
          isCurrentMonth &&
          !isOverbudget &&
          !isApproaching &&
          dayOfMonth >= 4 &&
          projectedMonthEndSpend > limit * 1.15 &&
          spent > 0;

        return {
          categoryId: cat.id,
          categoryName: cat.name,
          color: cat.color,
          iconName: cat.iconName,
          spent,
          limit,
          percentage: rawPercentage,
          remaining,
          transactionCount: item.count,
          overspent,
          dailySpendRate,
          projectedMonthEndSpend,
          isApproaching,
          isOverbudget,
          isHighVelocity,
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
    [transactions, categories, settings.monthlyIncome, settings.budgetAlertThreshold, settings.velocityAlertsEnabled]
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

  // Active Budget Alerts across categories for the selected month
  const activeBudgetAlerts = useMemo<BudgetAlert[]>(() => {
    if (settings.budgetAlertsEnabled === false) return [];

    const alerts: BudgetAlert[] = [];
    const threshold = settings.budgetAlertThreshold ?? 80;
    const velocityEnabled = settings.velocityAlertsEnabled !== false;

    const [year, month] = selectedMonth.split('-').map(Number);
    const daysInMonth = new Date(year, month, 0).getDate();
    const now = new Date();
    const currentMonthKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    const isCurrentMonth = selectedMonth === currentMonthKey;
    const dayOfMonth = isCurrentMonth ? Math.min(now.getDate(), daysInMonth) : daysInMonth;
    const daysRemaining = isCurrentMonth ? Math.max(1, daysInMonth - dayOfMonth) : 0;

    currentMonthSummary.categoryBreakdown.forEach((item) => {
      if (item.limit <= 0) return;

      const cat = categoryMap.get(item.categoryId);
      const catName = cat?.name || item.categoryName;
      const catColor = cat?.color || item.color;
      const catIcon = cat?.iconName || item.iconName;

      const spent = item.spent;
      const limit = item.limit;
      const percentage = Math.round((spent / limit) * 100);
      const remaining = Math.max(0, limit - spent);
      const overspent = Math.max(0, spent - limit);
      const dailySpendRate = dayOfMonth > 0 ? Number((spent / dayOfMonth).toFixed(2)) : 0;
      const projectedMonthEndSpend = Number((dailySpendRate * daysInMonth).toFixed(2));
      const safeDailySpend = daysRemaining > 0 ? Number((remaining / daysRemaining).toFixed(2)) : 0;
      const alertId = `budget-alert-${item.categoryId}-${selectedMonth}`;
      const isDismissed = dismissedAlertIds.includes(alertId);

      if (spent >= limit) {
        alerts.push({
          id: alertId,
          categoryId: item.categoryId,
          categoryName: catName,
          categoryColor: catColor,
          categoryIcon: catIcon,
          severity: 'critical',
          percentage,
          spent,
          limit,
          remaining: 0,
          overspent,
          dailySpendRate,
          projectedMonthEndSpend,
          daysRemaining,
          safeDailySpend: 0,
          title: `${catName} Limit Exceeded`,
          message: `${catName} has used ${percentage}% of its monthly cap (${formatCurrency(spent, settings.currency)} of ${formatCurrency(limit, settings.currency)}). Over budget by ${formatCurrency(overspent, settings.currency)}.`,
          recommendation: `Pause non-essential charges or increase monthly limit to restore balance.`,
          isDismissed,
        });
      } else if (percentage >= threshold) {
        alerts.push({
          id: alertId,
          categoryId: item.categoryId,
          categoryName: catName,
          categoryColor: catColor,
          categoryIcon: catIcon,
          severity: 'warning',
          percentage,
          spent,
          limit,
          remaining,
          overspent: 0,
          dailySpendRate,
          projectedMonthEndSpend,
          daysRemaining,
          safeDailySpend,
          title: `${catName} Approaching Limit`,
          message: `${catName} is at ${percentage}% of monthly budget (${formatCurrency(spent, settings.currency)} / ${formatCurrency(limit, settings.currency)}). Only ${formatCurrency(remaining, settings.currency)} remaining with ${daysRemaining} days left in the month.`,
          recommendation: `Keep daily spend under ${formatCurrency(safeDailySpend, settings.currency)}/day (current pace is ${formatCurrency(dailySpendRate, settings.currency)}/day) to stay on budget.`,
          isDismissed,
        });
      } else if (
        velocityEnabled &&
        isCurrentMonth &&
        dayOfMonth >= 4 &&
        projectedMonthEndSpend > limit * 1.15 &&
        spent > 0
      ) {
        alerts.push({
          id: alertId,
          categoryId: item.categoryId,
          categoryName: catName,
          categoryColor: catColor,
          categoryIcon: catIcon,
          severity: 'velocity',
          percentage,
          spent,
          limit,
          remaining,
          overspent: 0,
          dailySpendRate,
          projectedMonthEndSpend,
          daysRemaining,
          safeDailySpend,
          title: `${catName} Fast Pacing Warning`,
          message: `${catName} is pacing at ${formatCurrency(dailySpendRate, settings.currency)}/day and projected to hit ${formatCurrency(projectedMonthEndSpend, settings.currency)} by month end (${Math.round((projectedMonthEndSpend / limit) * 100)}% of limit).`,
          recommendation: `Slow spending pace to ${formatCurrency(safeDailySpend, settings.currency)}/day to prevent breaking your ${formatCurrency(limit, settings.currency)} limit.`,
          isDismissed,
        });
      }
    });

    return alerts.sort((a, b) => {
      const order = { critical: 0, warning: 1, velocity: 2 };
      if (order[a.severity] !== order[b.severity]) {
        return order[a.severity] - order[b.severity];
      }
      return b.percentage - a.percentage;
    });
  }, [
    settings.budgetAlertsEnabled,
    settings.budgetAlertThreshold,
    settings.velocityAlertsEnabled,
    settings.currency,
    selectedMonth,
    currentMonthSummary.categoryBreakdown,
    categoryMap,
    dismissedAlertIds,
  ]);

  const unDismissedBudgetAlerts = useMemo(
    () => activeBudgetAlerts.filter((a) => !a.isDismissed),
    [activeBudgetAlerts]
  );

  const dismissBudgetAlert = useCallback((id: string) => {
    setDismissedAlertIds((prev) => (prev.includes(id) ? prev : [...prev, id]));
  }, []);

  const resetDismissedAlerts = useCallback(() => {
    setDismissedAlertIds([]);
  }, []);

  const clearLatestBudgetNotification = useCallback(() => {
    setLatestBudgetNotification(null);
  }, []);

  const updateBudgetAlertSettings = useCallback(
    (options: {
      budgetAlertsEnabled?: boolean;
      budgetAlertThreshold?: number;
      velocityAlertsEnabled?: boolean;
    }) => {
      setSettings((prev) => ({
        ...prev,
        ...options,
        lastSaved: new Date().toISOString(),
      }));
      setLastSavedTimestamp(new Date());
    },
    []
  );

  const triggerBudgetAlertCheck = useCallback(
    (categoryId: string, addedAmount: number, txDate: string) => {
      if (settings.budgetAlertsEnabled === false) return;
      const targetMonth = txDate.slice(0, 7);
      const cat = categoryMap.get(categoryId);
      if (!cat || cat.monthlyLimit <= 0) return;

      const existingSpent = transactions
        .filter((t) => t.date.startsWith(targetMonth) && t.type === 'expense' && t.categoryId === categoryId)
        .reduce((sum, t) => sum + t.amount, 0);

      const newTotal = existingSpent + addedAmount;
      const threshold = settings.budgetAlertThreshold ?? 80;
      const percentage = Math.round((newTotal / cat.monthlyLimit) * 100);

      if (percentage >= threshold) {
        const isExceeded = newTotal >= cat.monthlyLimit;
        const overspent = Math.max(0, newTotal - cat.monthlyLimit);
        const remaining = Math.max(0, cat.monthlyLimit - newTotal);
        const daysLeft = getDaysRemainingInMonth();
        const safeDaily = daysLeft > 0 ? Number((remaining / daysLeft).toFixed(2)) : 0;

        const alert: BudgetAlert = {
          id: `toast-${categoryId}-${Date.now()}`,
          categoryId,
          categoryName: cat.name,
          categoryColor: cat.color,
          categoryIcon: cat.iconName,
          severity: isExceeded ? 'critical' : 'warning',
          percentage,
          spent: newTotal,
          limit: cat.monthlyLimit,
          remaining,
          overspent,
          dailySpendRate: 0,
          projectedMonthEndSpend: newTotal,
          daysRemaining: daysLeft,
          safeDailySpend: safeDaily,
          title: isExceeded ? `${cat.name} Budget Exceeded!` : `${cat.name} Approaching Limit!`,
          message: isExceeded
            ? `New transaction pushed ${cat.name} to ${percentage}% of monthly budget (${formatCurrency(newTotal, settings.currency)} / ${formatCurrency(cat.monthlyLimit, settings.currency)}). Over limit by ${formatCurrency(overspent, settings.currency)}.`
            : `New transaction brought ${cat.name} to ${percentage}% of its monthly cap. Only ${formatCurrency(remaining, settings.currency)} left for the next ${daysLeft} days.`,
          recommendation: isExceeded
            ? `Review your recent charges or consider adjusting this category's limit.`
            : `Safe daily runway: ${formatCurrency(safeDaily, settings.currency)}/day.`,
        };

        setLatestBudgetNotification(alert);
      }
    },
    [settings.budgetAlertsEnabled, settings.budgetAlertThreshold, settings.currency, categoryMap, transactions]
  );

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

    if (tx.type === 'expense' && tx.categoryId) {
      triggerBudgetAlertCheck(tx.categoryId, tx.amount, tx.date);
    }
  }, [triggerBudgetAlertCheck]);

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

  const addSavingsGoal = useCallback(
    (newGoal: Omit<SavingsGoal, 'id'> | Omit<SavingsGoal, 'id' | 'currentAmount'>) => {
      const id = `goal-${Date.now()}`;
      const goal: SavingsGoal = {
        currentAmount: 0,
        ...newGoal,
        id,
      };
      setSavingsGoals((prev) => [...prev, goal]);
    },
    []
  );

  const updateSavingsGoal = useCallback((updatedGoal: SavingsGoal) => {
    setSavingsGoals((prev) => prev.map((g) => (g.id === updatedGoal.id ? updatedGoal : g)));
  }, []);

  const deleteSavingsGoal = useCallback((id: string) => {
    setSavingsGoals((prev) => prev.filter((g) => g.id !== id));
  }, []);

  const contributeToSavingsGoal = useCallback(
    (goalId: string, amount: number, paymentMethod: PaymentMethod = 'apple_pay', note?: string) => {
      const goal = savingsGoals.find((g) => g.id === goalId);
      if (!goal || amount <= 0) return;

      const updatedCurrent = goal.currentAmount + amount;
      setSavingsGoals((prev) =>
        prev.map((g) => (g.id === goalId ? { ...g, currentAmount: updatedCurrent } : g))
      );

      const today = new Date().toISOString().split('T')[0];
      const tx: Transaction = {
        id: `tx-${Date.now()}`,
        date: today,
        amount,
        type: 'savings',
        categoryId: goal.id,
        merchant: `Contribution: ${goal.title || goal.name || 'Savings Goal'}`,
        paymentMethod,
        note: note || `Contribution to savings goal`,
      };
      setTransactions((prev) => [tx, ...prev]);
    },
    [savingsGoals]
  );

  const addRecurringBill = useCallback((newBill: Omit<RecurringBill, 'id'>) => {
    const id = `rec-${Date.now()}`;
    setRecurringBills((prev) => [...prev, { ...newBill, id }]);
  }, []);

  const deleteRecurringBill = useCallback((id: string) => {
    setRecurringBills((prev) => prev.filter((b) => b.id !== id));
  }, []);

  const toggleRecurringBill = useCallback((id: string) => {
    setRecurringBills((prev) =>
      prev.map((b) => (b.id === id ? { ...b, isActive: !b.isActive } : b))
    );
  }, []);

  const triggerRecurringBillNow = useCallback(
    (billId: string) => {
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
    },
    [recurringBills]
  );

  const updateSettings = useCallback((newSettings: Partial<UserSettings>) => {
    setSettings((prev) => {
      const updated = {
        ...prev,
        ...newSettings,
        lastSaved: new Date().toISOString(),
      };
      return updated;
    });
    setLastSavedTimestamp(new Date());
  }, []);

  const toggleDarkMode = useCallback(() => {
    setSettings((prev) => {
      const nextDarkMode = !prev.darkMode;
      return {
        ...prev,
        darkMode: nextDarkMode,
        lastSaved: new Date().toISOString(),
      };
    });
    setLastSavedTimestamp(new Date());
  }, []);

  const updateDashboardWidgets = useCallback((newWidgets: Partial<DashboardWidgetsConfig>) => {
    setSettings((prev) => {
      const updated = {
        ...prev,
        dashboardWidgets: {
          ...DEFAULT_DASHBOARD_WIDGETS,
          ...(prev.dashboardWidgets || {}),
          ...newWidgets,
        },
        lastSaved: new Date().toISOString(),
      };
      return updated;
    });
    setLastSavedTimestamp(new Date());
  }, []);

  const dismissFrontPageWidget = useCallback((widgetKey: keyof DashboardWidgetsConfig) => {
    setSettings((prev) => {
      const updated = {
        ...prev,
        dashboardWidgets: {
          ...DEFAULT_DASHBOARD_WIDGETS,
          ...(prev.dashboardWidgets || {}),
          [widgetKey]: false,
        },
        lastSaved: new Date().toISOString(),
      };
      return updated;
    });
    setLastSavedTimestamp(new Date());
  }, []);

  const resetDashboardLayout = useCallback(() => {
    setSettings((prev) => {
      const updated = {
        ...prev,
        dashboardWidgets: { ...DEFAULT_DASHBOARD_WIDGETS },
        lastSaved: new Date().toISOString(),
      };
      return updated;
    });
    setLastSavedTimestamp(new Date());
  }, []);

  const applyMinimalistDashboard = useCallback(() => {
    setSettings((prev) => {
      const updated = {
        ...prev,
        dashboardWidgets: {
          showUpiBanner: false,
          showFreshSlateCard: false,
          showFloatingUpiPopup: false,
          showKpiCards: true,
          showBudgetRunwayGauge: true,
          showBudgetAlertsWatchlist: true,
          showCategoryDonut: true,
          showSavingsGoals: true,
          showRecentTransactions: true,
        },
        lastSaved: new Date().toISOString(),
      };
      return updated;
    });
    setLastSavedTimestamp(new Date());
  }, []);

  const resetToDefaults = useCallback(() => {
    setTransactions([]);
    setCategories(DEFAULT_CATEGORIES);
    setSavingsGoals([]);
    setRecurringBills([]);
    setDetectedExpenses([]);
    setSettings(DEFAULT_USER_SETTINGS);
    const now = new Date();
    setSelectedMonth(`${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`);
    try {
      localStorage.removeItem(STORAGE_KEYS.TRANSACTIONS);
      localStorage.removeItem(STORAGE_KEYS.SAVINGS);
      localStorage.removeItem(STORAGE_KEYS.RECURRING);
      localStorage.removeItem(STORAGE_KEYS.DETECTED_EXPENSES);
      localStorage.removeItem(STORAGE_KEYS.MASTER_VAULT);
    } catch {}
    setLastSavedTimestamp(new Date());
  }, []);

  // Quick button to load realistic sample records for instant testing
  const loadSampleTestData = useCallback(() => {
    setTransactions(SAMPLE_TEST_TRANSACTIONS);
    setSavingsGoals(SAMPLE_TEST_SAVINGS_GOALS);
    setRecurringBills(SAMPLE_TEST_RECURRING_BILLS);
    setSettings((prev) => ({
      ...prev,
      monthlyIncome: 4500,
      lastSaved: new Date().toISOString(),
    }));
    setLastSavedTimestamp(new Date());
  }, []);

  // Export JSON Backup
  const exportDataJSON = useCallback(() => {
    const payload = {
      version: '1.2.0',
      exportedAt: new Date().toISOString(),
      user: {
        name: settings.userName,
        email: settings.userEmail,
      },
      transactions,
      categories,
      savingsGoals,
      recurringBills,
      settings,
      linkedPaymentApps,
      detectedExpenses,
      merchantRules,
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `aura-financial-backup-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }, [transactions, categories, savingsGoals, recurringBills, settings, linkedPaymentApps, detectedExpenses, merchantRules]);

  // Export Direct APK File (Aura-Expense-Manager.apk)
  const exportDataAPK = useCallback(
    async (appUrl: string = typeof window !== 'undefined' ? window.location.href : '') => {
      const userBackup = {
        transactions,
        categories,
        savingsGoals,
        recurringBills,
        settings,
        linkedPaymentApps,
        detectedExpenses,
      };
      return await downloadDirectAPK(appUrl, userBackup);
    },
    [transactions, categories, savingsGoals, recurringBills, settings, linkedPaymentApps, detectedExpenses]
  );

  // Backward-compatible alias for exportDataZIP -> direct APK
  const exportDataZIP = exportDataAPK;

  // Import JSON Backup
  const importDataJSON = useCallback((jsonContent: string): boolean => {
    try {
      const parsed = JSON.parse(jsonContent);
      if (Array.isArray(parsed.transactions) && Array.isArray(parsed.categories)) {
        setTransactions(parsed.transactions);
        setCategories(parsed.categories);
        if (Array.isArray(parsed.savingsGoals)) setSavingsGoals(parsed.savingsGoals);
        if (Array.isArray(parsed.recurringBills)) setRecurringBills(parsed.recurringBills);
        if (parsed.settings) setSettings(parsed.settings);
        if (Array.isArray(parsed.linkedPaymentApps)) setLinkedPaymentApps(parsed.linkedPaymentApps);
        if (Array.isArray(parsed.detectedExpenses)) setDetectedExpenses(parsed.detectedExpenses);
        if (Array.isArray(parsed.merchantRules)) setMerchantRules(parsed.merchantRules);
        setLastSavedTimestamp(new Date());
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

  // UPI & Payment App Auto-Detection and Categorization
  const pendingDetectedExpenses = useMemo(
    () => detectedExpenses.filter((e) => e.status === 'pending'),
    [detectedExpenses]
  );

  const detectExpenseFromText = useCallback(
    (rawText: string): DetectedExpense | null => {
      const parsed = parseExpenseNotification(rawText, categories, merchantRules);
      if (!parsed) return null;
      setDetectedExpenses((prev) => [parsed, ...prev]);
      setLastSavedTimestamp(new Date());
      return parsed;
    },
    [categories, merchantRules]
  );

  const categorizeExpense = useCallback(
    (detectedExpenseId: string, categoryId: string, rememberRule = true): Transaction | null => {
      const detected = detectedExpenses.find((e) => e.id === detectedExpenseId);
      if (!detected) return null;

      const newTx: Transaction = {
        id: `tx-upi-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        date: detected.date || new Date().toISOString().split('T')[0],
        amount: detected.amount,
        type: 'expense',
        categoryId,
        merchant: detected.merchant,
        paymentMethod: detected.paymentMethod,
        note: detected.referenceId ? `UPI Ref: ${detected.referenceId}` : 'Instant Payment Alert',
      };

      setTransactions((prev) => [newTx, ...prev]);
      setDetectedExpenses((prev) =>
        prev.map((e) =>
          e.id === detectedExpenseId
            ? { ...e, status: 'categorized', suggestedCategoryId: categoryId }
            : e
        )
      );

      triggerBudgetAlertCheck(categoryId, detected.amount, newTx.date);

      if (rememberRule && detected.merchant && detected.merchant !== 'UPI Merchant') {
        const keyword = detected.merchant.toLowerCase().trim();
        setMerchantRules((prev) => {
          const filtered = prev.filter((r) => r.merchantKeyword.toLowerCase() !== keyword);
          return [{ merchantKeyword: keyword, categoryId }, ...filtered];
        });
      }

      setLastSavedTimestamp(new Date());
      return newTx;
    },
    [detectedExpenses, triggerBudgetAlertCheck]
  );

  const dismissDetectedExpense = useCallback((id: string) => {
    setDetectedExpenses((prev) =>
      prev.map((e) => (e.id === id ? { ...e, status: 'dismissed' } : e))
    );
    setLastSavedTimestamp(new Date());
  }, []);

  const toggleLinkedPaymentApp = useCallback((id: string) => {
    setLinkedPaymentApps((prev) =>
      prev.map((app) => (app.id === id ? { ...app, isEnabled: !app.isEnabled } : app))
    );
    setLastSavedTimestamp(new Date());
  }, []);

  const updateLinkedPaymentApp = useCallback((id: string, upiId: string) => {
    setLinkedPaymentApps((prev) =>
      prev.map((app) =>
        app.id === id ? { ...app, upiId, lastSync: new Date().toLocaleTimeString() } : app
      )
    );
    setLastSavedTimestamp(new Date());
  }, []);

  const simulateIncomingPayment = useCallback(
    (preset?: 'phonepe_swiggy' | 'applepay_starbucks' | 'gpay_fuel' | 'paytm_groceries'): DetectedExpense => {
      let sampleText = '';
      if (preset === 'applepay_starbucks') {
        sampleText = `Apple Pay: Approved $14.50 at Starbucks Coffee on ${new Date().toLocaleDateString()}`;
      } else if (preset === 'gpay_fuel') {
        sampleText = `Sent Rs 650.00 to Shell Petrol Station via Google Pay (GPay). UPI Ref 8492019482`;
      } else if (preset === 'paytm_groceries') {
        sampleText = `Rs 380 debited via Paytm UPI to Blinkit Groceries. Txn ID: PTM9382103`;
      } else {
        sampleText = `Paid Rs. 420.00 to Swiggy via PhonePe UPI on ${new Date().toLocaleDateString()}. UPI Ref 38291049281`;
      }
      const detected = parseExpenseNotification(sampleText, categories, merchantRules)!;
      setDetectedExpenses((prev) => [detected, ...prev]);
      setLastSavedTimestamp(new Date());
      return detected;
    },
    [categories, merchantRules]
  );

  return {
    transactions,
    categories,
    categoryMap,
    savingsGoals,
    recurringBills,
    settings,
    detectedExpenses,
    pendingDetectedExpenses,
    linkedPaymentApps,
    merchantRules,
    selectedMonth,
    setSelectedMonth,
    availableMonths,
    currentMonthSummary,
    getMonthSummary,
    totalMonthlyBudget,
    totalAccumulatedSavings,
    totalSavingsTarget,
    totalMonthlyRecurring,
    isStoragePersistent,
    lastSavedTimestamp,
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
    toggleDarkMode,
    resetToDefaults,
    loadSampleTestData,
    exportDataJSON,
    exportDataAPK,
    exportDataZIP,
    importDataJSON,
    exportTransactionsCSV,
    // UPI & Payment Actions
    detectExpenseFromText,
    categorizeExpense,
    dismissDetectedExpense,
    toggleLinkedPaymentApp,
    updateLinkedPaymentApp,
    simulateIncomingPayment,
    // Budget Alert Monitoring
    activeBudgetAlerts,
    unDismissedBudgetAlerts,
    dismissBudgetAlert,
    resetDismissedAlerts,
    latestBudgetNotification,
    clearLatestBudgetNotification,
    updateBudgetAlertSettings,
    // Front Page & Dashboard Layout Customization
    updateDashboardWidgets,
    dismissFrontPageWidget,
    resetDashboardLayout,
    applyMinimalistDashboard,
  };
}

export type FinanceStore = ReturnType<typeof useFinanceStore>;
