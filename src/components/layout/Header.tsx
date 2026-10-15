import React from 'react';
import { Plus, Settings, Wallet, Smartphone, Sun, Moon, Bell } from 'lucide-react';
import { usePWAInstall } from '../../hooks/usePWAInstall';

export type ActiveTab = 'overview' | 'payments' | 'budgets' | 'savings' | 'ledger' | 'analytics';

interface HeaderProps {
  activeTab: ActiveTab;
  onTabChange: (tab: ActiveTab) => void;
  onOpenAddModal: () => void;
  onOpenAPKModal: () => void;
  onOpenSettingsModal: () => void;
  userName?: string;
  isStoragePersistent?: boolean;
  pendingExpensesCount?: number;
  activeAlertsCount?: number;
  onOpenAlertsDrawer?: () => void;
  darkMode?: boolean;
  onToggleDarkMode?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  onTabChange,
  onOpenAddModal,
  onOpenAPKModal,
  onOpenSettingsModal,
  userName = 'Deven Vegda',
  isStoragePersistent = true,
  pendingExpensesCount = 0,
  activeAlertsCount = 0,
  onOpenAlertsDrawer,
  darkMode = false,
  onToggleDarkMode,
}) => {
  const { isInstalled } = usePWAInstall();

  const navLinks: { id: ActiveTab; label: string; badge?: number; badgeColor?: string }[] = [
    { id: 'overview', label: 'Overview' },
    { id: 'payments', label: 'UPI & Payments', badge: pendingExpensesCount, badgeColor: 'bg-amber-500 text-white' },
    { id: 'budgets', label: 'Budgets', badge: activeAlertsCount, badgeColor: 'bg-rose-500 text-white' },
    { id: 'savings', label: 'Savings Goals' },
    { id: 'ledger', label: 'Transactions' },
    { id: 'analytics', label: 'Visual Reports' },
  ];

  const getInitials = (name: string) => {
    return (
      name
        .split(' ')
        .filter(Boolean)
        .map((p) => p[0])
        .join('')
        .toUpperCase()
        .slice(0, 2) || 'DV'
    );
  };

  return (
    <header className="sticky top-0 z-40 bg-white/85 dark:bg-slate-900/90 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800 transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-3 md:gap-8">
        {/* Zone 1: Brand Wordmark */}
        <div
          className="flex items-center gap-3 shrink-0 cursor-pointer"
          onClick={() => onTabChange('overview')}
        >
          <div className="w-9 h-9 rounded-xl bg-slate-900 dark:bg-indigo-600 text-white flex items-center justify-center shadow-xs">
            <Wallet className="w-5 h-5 text-white" />
          </div>
          <span className="text-xl font-bold tracking-tight text-slate-900 dark:text-white whitespace-nowrap">
            Aura
          </span>
        </div>

        {/* Zone 2: Navigation Links (Desktop) */}
        <nav className="hidden md:flex items-center gap-1 lg:gap-2">
          {navLinks.map((link) => {
            const isActive = activeTab === link.id;
            return (
              <button
                key={link.id}
                onClick={() => onTabChange(link.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-all relative flex items-center gap-1.5 cursor-pointer ${
                  isActive
                    ? 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white font-semibold shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800/60'
                }`}
              >
                <span>{link.label}</span>
                {link.badge && link.badge > 0 ? (
                  <span
                    className={`w-4 h-4 rounded-full text-[9px] font-bold flex items-center justify-center animate-pulse ${
                      link.badgeColor || 'bg-amber-500 text-white'
                    }`}
                  >
                    {link.badge}
                  </span>
                ) : null}
              </button>
            );
          })}
        </nav>

        {/* Zone 3: Primary Action & Quick Tool Affordances */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          {/* Budget Alerts Bell Indicator */}
          {onOpenAlertsDrawer && (
            <button
              onClick={onOpenAlertsDrawer}
              className={`relative w-8 h-8 rounded-xl flex items-center justify-center transition-colors cursor-pointer ${
                activeAlertsCount && activeAlertsCount > 0
                  ? 'bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800'
                  : 'bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300'
              }`}
              title={
                activeAlertsCount && activeAlertsCount > 0
                  ? `${activeAlertsCount} Budget Alerts Active · Tap to review`
                  : 'Budget Alert Monitor'
              }
              aria-label="Budget Alerts"
            >
              <Bell className="w-4 h-4" />
              {activeAlertsCount && activeAlertsCount > 0 ? (
                <span className="absolute -top-1 -right-1 min-w-4 h-4 px-1 rounded-full bg-rose-500 text-white font-extrabold text-[9px] flex items-center justify-center shadow-xs">
                  {activeAlertsCount}
                </span>
              ) : null}
            </button>
          )}

          {/* User Profile & Remember-Me Status Pill */}
          <button
            onClick={onOpenSettingsModal}
            className="flex items-center gap-2 px-2.5 py-1.5 bg-slate-50 dark:bg-slate-800/80 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200/80 dark:border-slate-700/80 rounded-xl transition-colors cursor-pointer text-left"
            title="Account & Storage Security"
          >
            <div className="w-6 h-6 rounded-lg bg-slate-900 dark:bg-indigo-600 text-white font-bold text-[10px] flex items-center justify-center shadow-xs">
              {getInitials(userName)}
            </div>
            <div className="hidden lg:flex flex-col">
              <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 leading-tight truncate max-w-[100px]">
                {userName}
              </span>
              <span className="text-[9px] text-emerald-600 dark:text-emerald-400 font-medium flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Remembered
              </span>
            </div>
          </button>

          {/* Quick Dark Mode Toggle */}
          {onToggleDarkMode && (
            <button
              onClick={onToggleDarkMode}
              className="w-8 h-8 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 flex items-center justify-center text-slate-700 dark:text-slate-300 transition-colors cursor-pointer"
              title={darkMode ? 'Switch to Light Theme' : 'Switch to Dark Mode'}
              aria-label="Toggle dark mode"
            >
              {darkMode ? (
                <Sun className="w-4 h-4 text-amber-400" />
              ) : (
                <Moon className="w-4 h-4 text-slate-700" />
              )}
            </button>
          )}

          {/* Direct APK Download Trigger */}
          <button
            onClick={onOpenAPKModal}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-indigo-700 dark:text-indigo-300 bg-indigo-50/90 dark:bg-indigo-950/60 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 border border-indigo-200/80 dark:border-indigo-800 rounded-xl transition-colors whitespace-nowrap shrink-0 cursor-pointer shadow-xs"
            title="Download Direct Android APK (Aura-Expense-Manager.apk)"
          >
            <Smartphone className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
            <span className="hidden sm:inline">Direct APK</span>
          </button>

          {/* Settings Trigger */}
          <button
            onClick={onOpenSettingsModal}
            className="w-8 h-8 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 flex items-center justify-center text-slate-700 dark:text-slate-300 transition-colors cursor-pointer"
            title="Settings & Appearance"
            aria-label="Open settings"
          >
            <Settings className="w-4 h-4" />
          </button>

          {/* Primary Action Button */}
          <button
            onClick={onOpenAddModal}
            className="px-3.5 sm:px-4 py-2 text-xs font-semibold text-white bg-slate-900 dark:bg-indigo-600 hover:bg-slate-800 dark:hover:bg-indigo-500 rounded-xl shadow-xs transition-all active:scale-[0.98] flex items-center gap-1.5 whitespace-nowrap shrink-0 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden xs:inline">Log Entry</span>
          </button>
        </div>
      </div>
    </header>
  );
};
