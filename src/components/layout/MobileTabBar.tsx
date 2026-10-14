import React from 'react';
import { ActiveTab } from './Header';
import { LayoutDashboard, PieChart, PiggyBank, Receipt, BarChart3, Plus } from 'lucide-react';

interface MobileTabBarProps {
  activeTab: ActiveTab;
  onTabChange: (tab: ActiveTab) => void;
  onOpenAddModal: () => void;
}

export const MobileTabBar: React.FC<MobileTabBarProps> = ({
  activeTab,
  onTabChange,
  onOpenAddModal,
}) => {
  const tabs: { id: ActiveTab; label: string; icon: React.ReactNode }[] = [
    { id: 'overview', label: 'Home', icon: <LayoutDashboard className="w-5 h-5" /> },
    { id: 'budgets', label: 'Budgets', icon: <PieChart className="w-5 h-5" /> },
    { id: 'savings', label: 'Goals', icon: <PiggyBank className="w-5 h-5" /> },
    { id: 'ledger', label: 'Ledger', icon: <Receipt className="w-5 h-5" /> },
    { id: 'analytics', label: 'Reports', icon: <BarChart3 className="w-5 h-5" /> },
  ];

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200/80 px-2 py-1 safe-bottom shadow-lg">
      <div className="flex items-center justify-around h-14 max-w-md mx-auto">
        {tabs.slice(0, 2).map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`flex-1 min-h-[44px] flex flex-col items-center justify-center transition-colors ${
                isActive ? 'text-slate-900 font-bold' : 'text-slate-400 hover:text-slate-600'
              }`}
            >
              <div className="relative">
                {tab.icon}
                {isActive && (
                  <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-slate-900 rounded-full" />
                )}
              </div>
              <span className="text-[10px] tracking-tight mt-0.5">{tab.label}</span>
            </button>
          );
        })}

        {/* Center Floating Plus CTA */}
        <button
          onClick={onOpenAddModal}
          className="w-11 h-11 rounded-2xl bg-slate-900 text-white flex items-center justify-center shadow-md active:scale-90 transition-transform -translate-y-2 border-2 border-white"
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
              className={`flex-1 min-h-[44px] flex flex-col items-center justify-center transition-colors ${
                isActive ? 'text-slate-900 font-bold' : 'text-slate-400 hover:text-slate-600'
              }`}
            >
              <div className="relative">
                {tab.icon}
                {isActive && (
                  <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-slate-900 rounded-full" />
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
