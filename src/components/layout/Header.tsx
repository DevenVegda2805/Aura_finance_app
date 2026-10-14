import React from 'react';
import { Plus, Smartphone, Settings, Wallet } from 'lucide-react';
import { usePWAInstall } from '../../hooks/usePWAInstall';

export type ActiveTab = 'overview' | 'budgets' | 'savings' | 'ledger' | 'analytics';

interface HeaderProps {
  activeTab: ActiveTab;
  onTabChange: (tab: ActiveTab) => void;
  onOpenAddModal: () => void;
  onOpenAPKModal: () => void;
  onOpenSettingsModal: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  onTabChange,
  onOpenAddModal,
  onOpenAPKModal,
  onOpenSettingsModal,
}) => {
  const { isInstalled } = usePWAInstall();

  const navLinks: { id: ActiveTab; label: string }[] = [
    { id: 'overview', label: 'Overview' },
    { id: 'budgets', label: 'Budgets' },
    { id: 'savings', label: 'Savings Goals' },
    { id: 'ledger', label: 'Transactions' },
    { id: 'analytics', label: 'Visual Reports' },
  ];

  return (
    <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-slate-200/80 transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4 md:gap-8">
        {/* Zone 1: Brand Wordmark */}
        <div className="flex items-center gap-3 shrink-0 cursor-pointer" onClick={() => onTabChange('overview')}>
          <div className="w-9 h-9 rounded-xl bg-slate-900 text-white flex items-center justify-center shadow-sm">
            <Wallet className="w-5 h-5 text-white" />
          </div>
          <span className="text-xl font-bold tracking-tight text-slate-900 whitespace-nowrap">
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
                className={`px-3.5 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-all ${
                  isActive
                    ? 'bg-slate-100 text-slate-900 font-semibold'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                {link.label}
              </button>
            );
          })}
        </nav>

        {/* Zone 3: Primary Action & Quick Tool Affordances */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          {/* APK / Mobile Install Helper */}
          <button
            onClick={onOpenAPKModal}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors whitespace-nowrap shrink-0"
            title="Install as Android APK or PWA"
          >
            <Smartphone className="w-3.5 h-3.5 text-indigo-600" />
            <span className="hidden sm:inline">{isInstalled ? 'App Ready' : 'APK / Install'}</span>
          </button>

          {/* Settings Trigger */}
          <button
            onClick={onOpenSettingsModal}
            className="w-8 h-8 rounded-xl bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-700 transition-colors"
            title="Settings & Currency"
          >
            <Settings className="w-4 h-4" />
          </button>

          {/* Primary Action Button */}
          <button
            onClick={onOpenAddModal}
            className="px-4 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-xl shadow-sm transition-all active:scale-[0.98] flex items-center gap-1.5 whitespace-nowrap shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden xs:inline">Log Entry</span>
          </button>
        </div>
      </div>
    </header>
  );
};
