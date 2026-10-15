import React from 'react';
import { ActiveTab } from './Header';
import { LayoutDashboard, PieChart, PiggyBank, Receipt, Smartphone, Plus } from 'lucide-react';

interface MobileTabBarProps {
  activeTab: ActiveTab;
  onTabChange: (tab: ActiveTab) => void;
  onOpenAddModal: () => void;
  pendingExpensesCount?: number;
  activeAlertsCount?: number;
}

export const MobileTabBar: React.FC<MobileTabBarProps> = ({
  activeTab,
  onTabChange,
  onOpenAddModal,
  pendingExpensesCount = 0,
  activeAlertsCount = 0,
}) => {
  const tabs: { id: ActiveTab; label: string; icon: React.ReactNode; badge?: number; badgeColor?: string }[] = [
    { id: 'overview', label: 'Home', icon: <LayoutDashboard className="w-5 h-5" /> },
    {
      id: 'payments',
      label: 'UPI Pay',
      icon: <Smartphone className="w-5 h-5" />,
      badge: pendingExpensesCount,
      badgeColor: 'bg-amber-500 text-white',
    },
    {
      id: 'budgets',
      label: 'Budgets',
      icon: <PieChart className="w-5 h-5" />,
      badge: activeAlertsCount,
      badgeColor: 'bg-rose-500 text-white',
    },
    { id: 'savings', label: 'Goals', icon: <PiggyBank className="w-5 h-5" /> },
    { id: 'ledger', label: 'Ledger', icon: <Receipt className="w-5 h-5" /> },
  ];

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-t border-slate-200/80 dark:border-slate-800 px-2 py-1 safe-bottom shadow-lg transition-colors duration-200">
      <div className="flex items-center justify-around h-14 max-w-md mx-auto">
        {tabs.slice(0, 2).map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`flex-1 min-h-[44px] flex flex-col items-center justify-center transition-colors relative cursor-pointer ${
                isActive
                  ? 'text-slate-900 dark:text-white font-bold'
                  : 'text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300'
              }`}
            >
              <div className="relative">
                {tab.icon}
                {tab.badge && tab.badge > 0 ? (
                  <span className="absolute -top-1 -right-2 w-3.5 h-3.5 rounded-full bg-amber-500 text-white text-[8px] font-bold flex items-center justify-center animate-pulse">
                    {tab.badge}
                  </span>
                ) : null}
                {isActive && (
                  <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-slate-900 dark:bg-indigo-400 rounded-full" />
                )}
              </div>
              <span className="text-[10px] tracking-tight mt-0.5">{tab.label}</span>
            </button>
          );
        })}

        {/* Center Floating Plus CTA */}
        <button
          onClick={onOpenAddModal}
          className="w-11 h-11 rounded-2xl bg-slate-900 dark:bg-indigo-600 text-white flex items-center justify-center shadow-md active:scale-90 transition-transform -translate-y-2 border-2 border-white dark:border-slate-900 cursor-pointer"
          title="Add Transaction"
        >
          <Plus className="w-5 h-5" />
        </button>

        {tabs.slice(2).map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`flex-1 min-h-[44px] flex flex-col items-center justify-center transition-colors relative cursor-pointer ${
                isActive
                  ? 'text-slate-900 dark:text-white font-bold'
                  : 'text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300'
              }`}
            >
              <div className="relative">
                {tab.icon}
                {isActive && (
                  <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-slate-900 dark:bg-indigo-400 rounded-full" />
                )}
              </div>
              <span className="text-[10px] tracking-tight mt-0.5">{tab.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
