import React, { useState, useRef, useEffect } from 'react';
import { CurrencyCode, DashboardWidgetsConfig, UserSettings } from '../../types/finance';
import { DEFAULT_DASHBOARD_WIDGETS } from '../../data/seedData';
import {
  X,
  Check,
  Download,
  Upload,
  RotateCcw,
  AlertTriangle,
  User,
  Mail,
  ShieldCheck,
  HardDrive,
  Smartphone,
  Sparkles,
  Sun,
  Moon,
  ShieldAlert,
  Sliders,
  SlidersHorizontal,
  Zap,
  CreditCard,
  Layers,
  BarChart3,
  PieChart,
  PiggyBank,
  Receipt,
} from 'lucide-react';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: UserSettings;
  isStoragePersistent?: boolean;
  lastSavedTimestamp?: Date;
  transactionsCount?: number;
  savingsGoalsCount?: number;
  recurringBillsCount?: number;
  onUpdateSettings: (settings: Partial<UserSettings>) => void;
  onExportJSON: () => void;
  onDownloadAPK?: () => void;
  onImportJSON: (jsonStr: string) => boolean;
  onResetData: () => void;
  onLoadSampleData?: () => void;
}

const CURRENCIES: { code: CurrencyCode; label: string; symbol: string }[] = [
  { code: 'USD', label: 'US Dollar', symbol: '$' },
  { code: 'EUR', label: 'Euro', symbol: '€' },
  { code: 'GBP', label: 'British Pound', symbol: '£' },
  { code: 'INR', label: 'Indian Rupee', symbol: '₹' },
  { code: 'CAD', label: 'Canadian Dollar', symbol: 'CA$' },
  { code: 'AUD', label: 'Australian Dollar', symbol: 'AU$' },
  { code: 'JPY', label: 'Japanese Yen', symbol: '¥' },
];

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  settings,
  isStoragePersistent = true,
  lastSavedTimestamp,
  transactionsCount = 0,
  savingsGoalsCount = 0,
  recurringBillsCount = 0,
  onUpdateSettings,
  onExportJSON,
  onDownloadAPK,
  onImportJSON,
  onResetData,
  onLoadSampleData,
}) => {
  const [userName, setUserName] = useState(settings.userName || 'Deven Vegda');
  const [userEmail, setUserEmail] = useState(settings.userEmail || 'Vegdadeven@gmail.com');
  const [monthlyIncome, setMonthlyIncome] = useState(settings.monthlyIncome.toString());
  const [currency, setCurrency] = useState<CurrencyCode>(settings.currency);
  const [rememberMe, setRememberMe] = useState(settings.rememberMe !== false);
  const [darkMode, setDarkMode] = useState(Boolean(settings.darkMode));
  const [budgetAlertsEnabled, setBudgetAlertsEnabled] = useState(settings.budgetAlertsEnabled !== false);
  const [budgetAlertThreshold, setBudgetAlertThreshold] = useState(settings.budgetAlertThreshold ?? 80);
  const [velocityAlertsEnabled, setVelocityAlertsEnabled] = useState(settings.velocityAlertsEnabled !== false);
  const [dashboardWidgets, setDashboardWidgets] = useState<DashboardWidgetsConfig>(() => ({
    ...DEFAULT_DASHBOARD_WIDGETS,
    ...(settings.dashboardWidgets || {}),
  }));
  const [importStatus, setImportStatus] = useState<string>('');
  const [saveFeedback, setSaveFeedback] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setDarkMode(Boolean(settings.darkMode));
      setUserName(settings.userName || 'Deven Vegda');
      setUserEmail(settings.userEmail || 'Vegdadeven@gmail.com');
      setMonthlyIncome(settings.monthlyIncome.toString());
      setCurrency(settings.currency);
      setRememberMe(settings.rememberMe !== false);
      setBudgetAlertsEnabled(settings.budgetAlertsEnabled !== false);
      setBudgetAlertThreshold(settings.budgetAlertThreshold ?? 80);
      setVelocityAlertsEnabled(settings.velocityAlertsEnabled !== false);
      setDashboardWidgets({
        ...DEFAULT_DASHBOARD_WIDGETS,
        ...(settings.dashboardWidgets || {}),
      });
    }
  }, [isOpen, settings]);

  if (!isOpen) return null;

  const handleToggleDarkMode = (enableDark: boolean) => {
    setDarkMode(enableDark);
    onUpdateSettings({ darkMode: enableDark });
  };

  const handleToggleWidget = (key: keyof DashboardWidgetsConfig) => {
    setDashboardWidgets((prev) => {
      const updated = {
        ...prev,
        [key]: !prev[key],
      };
      onUpdateSettings({ dashboardWidgets: updated });
      return updated;
    });
  };

  const handleApplyMinimalistWidgets = () => {
    const minimal: DashboardWidgetsConfig = {
      showUpiBanner: false,
      showFreshSlateCard: false,
      showFloatingUpiPopup: false,
      showKpiCards: true,
      showBudgetRunwayGauge: true,
      showBudgetAlertsWatchlist: true,
      showCategoryDonut: true,
      showSavingsGoals: true,
      showRecentTransactions: true,
    };
    setDashboardWidgets(minimal);
    onUpdateSettings({ dashboardWidgets: minimal });
  };

  const handleResetAllWidgets = () => {
    setDashboardWidgets(DEFAULT_DASHBOARD_WIDGETS);
    onUpdateSettings({ dashboardWidgets: DEFAULT_DASHBOARD_WIDGETS });
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const income = parseFloat(monthlyIncome);
    onUpdateSettings({
      userName: userName.trim() || settings.userName || 'Deven Vegda',
      userEmail: userEmail.trim() || settings.userEmail || 'Vegdadeven@gmail.com',
      monthlyIncome: isNaN(income) ? 0 : Math.max(0, income),
      currency,
      rememberMe,
      darkMode,
      budgetAlertsEnabled,
      budgetAlertThreshold,
      velocityAlertsEnabled,
      dashboardWidgets,
    });
    setSaveFeedback(true);
    setTimeout(() => {
      setSaveFeedback(false);
      onClose();
    }, 800);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        const success = onImportJSON(content);
        if (success) {
          setImportStatus('Financial backup restored successfully!');
          setTimeout(() => {
            setImportStatus('');
            onClose();
          }, 1200);
        } else {
          setImportStatus('Invalid JSON backup file.');
        }
      }
    };
    reader.readAsText(file);
  };

  const getInitials = (name: string) => {
    return (
      name
        .split(' ')
        .filter(Boolean)
        .map((part) => part[0])
        .join('')
        .toUpperCase()
        .slice(0, 2) || 'ME'
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 rounded-3xl w-full max-w-lg shadow-2xl border border-slate-100 dark:border-slate-800 overflow-hidden flex flex-col max-h-[92vh] transition-colors duration-200">
        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-5 pb-3 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-slate-900 dark:bg-indigo-600 text-white font-bold text-xs flex items-center justify-center shadow-xs">
              {getInitials(userName)}
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white tracking-tight">
                Account &amp; Appearance
              </h2>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Dark mode, identity, storage persistence &amp; APK
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 flex items-center justify-center text-slate-600 dark:text-slate-300 transition-colors cursor-pointer"
            aria-label="Close settings"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSave} className="p-6 overflow-y-auto space-y-5 text-slate-700 dark:text-slate-300 text-xs">
          {importStatus && (
            <div
              className={`p-3 rounded-xl border text-xs ${
                importStatus.includes('success')
                  ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800'
                  : 'bg-rose-50 dark:bg-rose-950/40 text-rose-800 dark:text-rose-300 border-rose-200 dark:border-rose-800'
              }`}
            >
              {importStatus}
            </div>
          )}

          {/* Dark Mode Viewing Experience Toggle Card */}
          <div className="p-4 rounded-2xl border transition-all bg-slate-50 dark:bg-slate-800/60 border-slate-200/80 dark:border-slate-750">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-start gap-3">
                <div
                  className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all shrink-0 ${
                    darkMode
                      ? 'bg-indigo-600 text-white shadow-xs'
                      : 'bg-amber-100 text-amber-700'
                  }`}
                >
                  {darkMode ? <Moon className="w-4.5 h-4.5 text-indigo-100" /> : <Sun className="w-4.5 h-4.5 text-amber-600" />}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900 dark:text-white text-xs">Dark Mode</span>
                    <span
                      className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${
                        darkMode
                          ? 'bg-indigo-950/70 text-indigo-300 border-indigo-800'
                          : 'bg-amber-50 text-amber-800 border-amber-200'
                      }`}
                    >
                      {darkMode ? 'Comfortable Dark' : 'Standard Light'}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                    Provides a comfortable, high-contrast viewing experience for low-light environments. Preference persists across sessions.
                  </p>
                </div>
              </div>

              {/* Interactive Smooth Toggle Switch */}
              <button
                type="button"
                role="switch"
                aria-checked={darkMode}
                onClick={() => handleToggleDarkMode(!darkMode)}
                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 dark:focus:ring-offset-slate-900 ${
                  darkMode ? 'bg-indigo-600' : 'bg-slate-300 dark:bg-slate-700'
                }`}
                title="Toggle Dark Mode"
              >
                <span className="sr-only">Toggle dark mode</span>
                <span
                  aria-hidden="true"
                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
                    darkMode ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            {/* Quick Segment Buttons */}
            <div className="grid grid-cols-2 gap-2 mt-3 pt-3 border-t border-slate-200/60 dark:border-slate-700/60">
              <button
                type="button"
                onClick={() => handleToggleDarkMode(false)}
                className={`py-2 px-3 rounded-xl border text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                  !darkMode
                    ? 'bg-white text-slate-900 border-slate-300 dark:border-slate-600 shadow-xs'
                    : 'bg-transparent text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                <Sun className="w-3.5 h-3.5 text-amber-500" />
                <span>Light Theme</span>
              </button>
              <button
                type="button"
                onClick={() => handleToggleDarkMode(true)}
                className={`py-2 px-3 rounded-xl border text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                  darkMode
                    ? 'bg-slate-900 dark:bg-indigo-600 text-white border-slate-800 dark:border-indigo-500 shadow-xs'
                    : 'bg-transparent text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                <Moon className="w-3.5 h-3.5 text-indigo-200" />
                <span>Dark Mode</span>
              </button>
            </div>
          </div>

          {/* Budget Alerts & Surveillance Monitoring Card */}
          <div className="p-4 rounded-2xl border transition-all bg-slate-50 dark:bg-slate-800/60 border-slate-200/80 dark:border-slate-750 space-y-3.5">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-start gap-3">
                <div
                  className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all shrink-0 ${
                    budgetAlertsEnabled
                      ? 'bg-amber-500 text-slate-950 shadow-xs'
                      : 'bg-slate-200 dark:bg-slate-700 text-slate-500'
                  }`}
                >
                  <ShieldAlert className="w-4.5 h-4.5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900 dark:text-white text-xs">
                      Budget Alerts &amp; Spending Monitor
                    </span>
                    <span
                      className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${
                        budgetAlertsEnabled
                          ? 'bg-amber-100 dark:bg-amber-950/70 text-amber-800 dark:text-amber-300 border-amber-300 dark:border-amber-800'
                          : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-400 border-slate-300 dark:border-slate-600'
                      }`}
                    >
                      {budgetAlertsEnabled ? `Active (${budgetAlertThreshold}%)` : 'Disabled'}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                    Monitors your spending patterns in real-time. Displays toasts and highlights when any category approaches or exceeds its monthly cap.
                  </p>
                </div>
              </div>

              {/* Toggle Switch */}
              <button
                type="button"
                role="switch"
                aria-checked={budgetAlertsEnabled}
                onClick={() => setBudgetAlertsEnabled(!budgetAlertsEnabled)}
                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                  budgetAlertsEnabled ? 'bg-amber-500' : 'bg-slate-300 dark:bg-slate-700'
                }`}
                title="Toggle Budget Alerts"
              >
                <span className="sr-only">Toggle budget alerts</span>
                <span
                  aria-hidden="true"
                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
                    budgetAlertsEnabled ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            {budgetAlertsEnabled && (
              <div className="pt-3 border-t border-slate-200/60 dark:border-slate-750 space-y-3 animate-in fade-in duration-150">
                {/* Warning Threshold Buttons */}
                <div>
                  <div className="flex items-center justify-between text-[11px] mb-1.5">
                    <span className="font-semibold text-slate-700 dark:text-slate-300">
                      Alert Trigger Threshold:
                    </span>
                    <span className="font-bold text-amber-700 dark:text-amber-400">
                      Flag at {budgetAlertThreshold}% of Limit
                    </span>
                  </div>

                  <div className="grid grid-cols-5 gap-1.5">
                    {[70, 75, 80, 85, 90].map((t) => (
                      <button
                        key={t}
                        type="button"
                        onClick={() => setBudgetAlertThreshold(t)}
                        className={`py-1.5 text-xs font-bold rounded-xl border transition-all cursor-pointer ${
                          budgetAlertThreshold === t
                            ? 'bg-amber-500 text-slate-950 border-amber-500 shadow-xs'
                            : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-100'
                        }`}
                      >
                        {t}%
                      </button>
                    ))}
                  </div>
                </div>

                {/* Velocity Monitor Checkbox */}
                <div className="flex items-center justify-between pt-2 border-t border-slate-200/50 dark:border-slate-750">
                  <div>
                    <span className="font-semibold text-slate-800 dark:text-slate-200 block text-xs">
                      Early Spending Velocity Pacing
                    </span>
                    <span className="text-[10px] text-slate-500 dark:text-slate-400">
                      Surfaces early warnings when daily burn rate projects a month-end overshoot
                    </span>
                  </div>

                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={velocityAlertsEnabled}
                      onChange={(e) => setVelocityAlertsEnabled(e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-9 h-5 bg-slate-300 dark:bg-slate-750 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-indigo-600"></div>
                  </label>
                </div>
              </div>
            )}
          </div>

          {/* Dashboard & Front Page Customization Card */}
          <div className="p-4 rounded-2xl border transition-all bg-slate-50 dark:bg-slate-800/60 border-slate-200/80 dark:border-slate-750 space-y-3.5">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-xl flex items-center justify-center transition-all shrink-0 bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800">
                  <SlidersHorizontal className="w-4.5 h-4.5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900 dark:text-white text-xs">
                      Front Page &amp; Dashboard Widgets
                    </span>
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300">
                      {Object.keys(dashboardWidgets).filter((k) => !dashboardWidgets[k as keyof DashboardWidgetsConfig]).length} hidden
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                    Remove clutter and customize which cards and banners appear on your front page. Changes apply immediately.
                  </p>
                </div>
              </div>

              {/* Quick Presets */}
              <div className="flex items-center gap-1.5 shrink-0">
                <button
                  type="button"
                  onClick={handleApplyMinimalistWidgets}
                  className="px-2.5 py-1 text-[11px] font-semibold rounded-xl bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700 shadow-xs transition-all cursor-pointer"
                  title="Hide promo banners and pop-ups; keep financial charts"
                >
                  Minimalist
                </button>
                <button
                  type="button"
                  onClick={handleResetAllWidgets}
                  className="px-2.5 py-1 text-[11px] font-semibold rounded-xl bg-indigo-50 dark:bg-indigo-950/60 hover:bg-indigo-100 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 transition-all cursor-pointer flex items-center gap-1"
                  title="Show all widgets"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>All</span>
                </button>
              </div>
            </div>

            {/* List of Widget Toggles */}
            <div className="pt-2 border-t border-slate-200/60 dark:border-slate-750 grid grid-cols-1 sm:grid-cols-2 gap-2">
              {[
                {
                  key: 'showUpiBanner' as const,
                  label: 'Live UPI & Payment Banner',
                  sub: 'PhonePe/GPay banner & simulator',
                  icon: <Zap className="w-3.5 h-3.5 text-purple-500" />,
                },
                {
                  key: 'showFreshSlateCard' as const,
                  label: 'Fresh Slate Ledger Card',
                  sub: 'Welcome guide on empty ledger',
                  icon: <Sparkles className="w-3.5 h-3.5 text-emerald-500" />,
                },
                {
                  key: 'showFloatingUpiPopup' as const,
                  label: 'Floating UPI Pop-up Bar',
                  sub: 'Bottom alert for incoming transactions',
                  icon: <CreditCard className="w-3.5 h-3.5 text-indigo-500" />,
                },
                {
                  key: 'showKpiCards' as const,
                  label: 'Financial Health KPI Cards',
                  sub: 'Outflow, Inflow, Savings, Reserves',
                  icon: <Layers className="w-3.5 h-3.5 text-sky-500" />,
                },
                {
                  key: 'showBudgetRunwayGauge' as const,
                  label: 'Budget Safety Pacing Gauge',
                  sub: 'Safe daily spend & days remaining',
                  icon: <BarChart3 className="w-3.5 h-3.5 text-emerald-500" />,
                },
                {
                  key: 'showBudgetAlertsWatchlist' as const,
                  label: 'Budget Alert Watchlist',
                  sub: 'Categories nearing/over budget',
                  icon: <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />,
                },
                {
                  key: 'showCategoryDonut' as const,
                  label: 'Expense Donut Pie Chart',
                  sub: 'Visual spending breakdown',
                  icon: <PieChart className="w-3.5 h-3.5 text-purple-500" />,
                },
                {
                  key: 'showSavingsGoals' as const,
                  label: 'Savings Goal Milestones',
                  sub: 'Target progress rings',
                  icon: <PiggyBank className="w-3.5 h-3.5 text-rose-500" />,
                },
                {
                  key: 'showRecentTransactions' as const,
                  label: 'Recent Ledger Feed',
                  sub: 'Latest transaction activity',
                  icon: <Receipt className="w-3.5 h-3.5 text-slate-500" />,
                },
              ].map((item) => {
                const checked = dashboardWidgets[item.key] !== false;
                return (
                  <div
                    key={item.key}
                    onClick={() => handleToggleWidget(item.key)}
                    className={`p-2.5 rounded-xl border flex items-center justify-between gap-2 cursor-pointer transition-all ${
                      checked
                        ? 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700'
                        : 'bg-slate-100/70 dark:bg-slate-850/60 border-slate-200/50 dark:border-slate-800 opacity-60'
                    }`}
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <div className="w-6 h-6 rounded-lg bg-slate-100 dark:bg-slate-700 flex items-center justify-center shrink-0">
                        {item.icon}
                      </div>
                      <div className="min-w-0">
                        <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 block truncate">
                          {item.label}
                        </span>
                        <span className="text-[10px] text-slate-400 dark:text-slate-500 block truncate">
                          {item.sub}
                        </span>
                      </div>
                    </div>

                    <button
                      type="button"
                      role="switch"
                      aria-checked={checked}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleToggleWidget(item.key);
                      }}
                      className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                        checked ? 'bg-indigo-600' : 'bg-slate-300 dark:bg-slate-700'
                      }`}
                    >
                      <span
                        aria-hidden="true"
                        className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${
                          checked ? 'translate-x-4' : 'translate-x-0'
                        }`}
                      />
                    </button>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Active Data Persistence Status Card */}
          <div className="p-4 bg-emerald-50/80 dark:bg-emerald-950/20 rounded-2xl border border-emerald-200/80 dark:border-emerald-800/50 space-y-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                <span className="font-bold text-emerald-950 dark:text-emerald-300 text-xs">
                  Device Memory &amp; Auto-Save Active
                </span>
              </div>
              <span className="text-[10px] font-semibold text-emerald-700 dark:text-emerald-400 bg-white dark:bg-slate-850 px-2 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800">
                Persistent Dual Vault
              </span>
            </div>

            <p className="text-[11px] text-emerald-800 dark:text-emerald-400/90 leading-relaxed">
              Aura permanently preserves your records in dual persistent storage (LocalStorage + IndexedDB). Every transaction, savings goal, UPI link, and budget is remembered across sessions.
            </p>

            {/* In-Memory Record Counter */}
            <div className="grid grid-cols-3 gap-2 py-1">
              <div className="p-2 bg-white/90 dark:bg-slate-800 rounded-xl border border-emerald-200/80 dark:border-emerald-800/40 text-center">
                <span className="text-[10px] text-slate-500 dark:text-slate-400 block">Transactions</span>
                <span className="font-extrabold text-slate-900 dark:text-white text-sm tabular-nums">{transactionsCount}</span>
              </div>
              <div className="p-2 bg-white/90 dark:bg-slate-800 rounded-xl border border-emerald-200/80 dark:border-emerald-800/40 text-center">
                <span className="text-[10px] text-slate-500 dark:text-slate-400 block">Savings Goals</span>
                <span className="font-extrabold text-slate-900 dark:text-white text-sm tabular-nums">{savingsGoalsCount}</span>
              </div>
              <div className="p-2 bg-white/90 dark:bg-slate-800 rounded-xl border border-emerald-200/80 dark:border-emerald-800/40 text-center">
                <span className="text-[10px] text-slate-500 dark:text-slate-400 block">Recurring Bills</span>
                <span className="font-extrabold text-slate-900 dark:text-white text-sm tabular-nums">{recurringBillsCount}</span>
              </div>
            </div>

            <div className="flex items-center gap-3 pt-1 text-[10px] text-emerald-700 dark:text-emerald-400 border-t border-emerald-200/60 dark:border-emerald-800/40 font-medium">
              <span className="flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                Storage: {isStoragePersistent ? 'Guaranteed' : 'Active'}
              </span>
              <span>·</span>
              <span className="flex items-center gap-1">
                <HardDrive className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                Last Saved: {lastSavedTimestamp ? lastSavedTimestamp.toLocaleTimeString() : 'Just now'}
              </span>
            </div>
          </div>

          {/* User Profile / Identity Fields */}
          <div className="space-y-3 pt-1">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[10px] text-slate-400 dark:text-slate-500">
              User Profile &amp; Identity
            </h3>

            <div>
              <label className="block text-xs font-medium text-slate-600 dark:text-slate-300 mb-1 flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-slate-400" />
                <span>Your Name</span>
              </label>
              <input
                type="text"
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
                placeholder="Your full name"
                className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all font-medium"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-600 dark:text-slate-300 mb-1 flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-slate-400" />
                <span>Email Address</span>
              </label>
              <input
                type="email"
                value={userEmail}
                onChange={(e) => setUserEmail(e.target.value)}
                placeholder="your.email@example.com"
                className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all font-medium"
              />
            </div>

            {/* Remember Me Toggle */}
            <label className="flex items-start gap-2.5 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700 cursor-pointer hover:bg-slate-100/60 dark:hover:bg-slate-800 transition-colors">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="mt-0.5 rounded border-slate-300 dark:border-slate-600 text-indigo-600 focus:ring-indigo-500 w-4 h-4 cursor-pointer"
              />
              <div className="text-[11px] leading-relaxed">
                <span className="font-semibold text-slate-900 dark:text-white block">
                  Remember me and keep my data on this device
                </span>
                <span className="text-slate-500 dark:text-slate-400">
                  Preserves your profile, budget configurations, transactions, and ledger across browser sessions.
                </span>
              </div>
            </label>
          </div>

          {/* Currency & Monthly Income */}
          <div className="space-y-3 pt-2 border-t border-slate-100 dark:border-slate-800">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[10px] text-slate-400 dark:text-slate-500">
              Financial Preferences
            </h3>

            <div>
              <label className="block text-xs font-medium text-slate-600 dark:text-slate-300 mb-1">Default Currency</label>
              <div className="grid grid-cols-2 gap-2">
                {CURRENCIES.map((c) => (
                  <button
                    key={c.code}
                    type="button"
                    onClick={() => setCurrency(c.code)}
                    className={`p-2.5 rounded-xl border text-left flex items-center justify-between transition-all cursor-pointer ${
                      currency === c.code
                        ? 'border-indigo-600 dark:border-indigo-500 bg-slate-900 dark:bg-indigo-600 text-white shadow-xs'
                        : 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-750 text-slate-700 dark:text-slate-200'
                    }`}
                  >
                    <span className="font-medium">{c.label}</span>
                    <span className="font-bold tabular-nums">{c.symbol}</span>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-600 dark:text-slate-300 mb-1">
                Expected Monthly Income Baseline
              </label>
              <input
                type="number"
                step="50"
                value={monthlyIncome}
                onChange={(e) => setMonthlyIncome(e.target.value)}
                placeholder="0"
                className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white font-semibold tabular-nums focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-1">
                Used to calculate monthly savings capacity and financial runway.
              </p>
            </div>
          </div>

          {/* Backup, Direct APK & Restore */}
          <div className="pt-2 border-t border-slate-100 dark:border-slate-800 space-y-2.5">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-bold uppercase tracking-wider text-[10px] text-slate-400 dark:text-slate-500">
                Direct APK &amp; Data Backup
              </label>
              <span className="text-[10px] text-slate-400 dark:text-slate-500">Instant Export</span>
            </div>

            <div className="grid grid-cols-2 gap-2">
              {onDownloadAPK && (
                <button
                  type="button"
                  onClick={onDownloadAPK}
                  className="py-2.5 px-3 bg-indigo-50 dark:bg-indigo-950/60 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 border border-indigo-200/80 dark:border-indigo-800 text-indigo-900 dark:text-indigo-200 font-bold rounded-xl flex items-center justify-center gap-1.5 transition-colors text-xs cursor-pointer shadow-xs"
                >
                  <Smartphone className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                  <span>Download Direct APK</span>
                </button>
              )}

              <button
                type="button"
                onClick={onExportJSON}
                className="py-2.5 px-3 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-semibold rounded-xl flex items-center justify-center gap-1.5 transition-colors text-xs cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Export Data JSON</span>
              </button>

              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="py-2.5 px-3 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-semibold rounded-xl flex items-center justify-center gap-1.5 transition-colors text-xs col-span-2 cursor-pointer"
              >
                <Upload className="w-3.5 h-3.5" />
                <span>Restore Data from Backup File (.json)</span>
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept=".json"
                className="hidden"
                onChange={handleFileChange}
              />
            </div>
          </div>

          {/* Test & Data Reset Section */}
          <div className="pt-2 border-t border-slate-100 dark:border-slate-800 space-y-2">
            {onLoadSampleData && (
              <button
                type="button"
                onClick={() => {
                  onLoadSampleData();
                  onClose();
                }}
                className="w-full py-2.5 bg-amber-50 dark:bg-amber-950/40 hover:bg-amber-100 dark:hover:bg-amber-900/40 border border-amber-200 dark:border-amber-800 text-amber-900 dark:text-amber-200 rounded-xl font-semibold transition-colors flex items-center justify-center gap-1.5 text-xs cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                <span>Load Sample Records (Test All Charts &amp; UPI)</span>
              </button>
            )}

            {showResetConfirm ? (
              <div className="p-3 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 rounded-xl space-y-2">
                <div className="flex items-center gap-1.5 text-rose-800 dark:text-rose-300 font-semibold text-xs">
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  <span>Clear all personal data and start fresh?</span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      onResetData();
                      setShowResetConfirm(false);
                      onClose();
                    }}
                    className="flex-1 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-lg font-medium text-xs transition-colors cursor-pointer"
                  >
                    Yes, Clear Everything
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowResetConfirm(false)}
                    className="flex-1 py-1.5 bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 rounded-lg font-medium text-xs transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setShowResetConfirm(true)}
                className="w-full py-2 text-rose-600 dark:text-rose-400 hover:text-rose-700 dark:hover:text-rose-300 hover:bg-rose-50 dark:hover:bg-rose-950/30 rounded-xl font-medium transition-colors flex items-center justify-center gap-1.5 text-xs cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Start from Scratch (Clear All Data)</span>
              </button>
            )}
          </div>

          <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 bg-slate-900 dark:bg-indigo-600 hover:bg-slate-800 dark:hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold shadow-md active:scale-95 transition-all flex items-center gap-1.5 cursor-pointer"
            >
              {saveFeedback ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  Saved!
                </>
              ) : (
                <>
                  <Check className="w-3.5 h-3.5" />
                  Save &amp; Remember Me
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
