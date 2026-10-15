import React from 'react';
import {
  X,
  SlidersHorizontal,
  Zap,
  Sparkles,
  PieChart,
  BarChart3,
  Receipt,
  PiggyBank,
  AlertTriangle,
  RotateCcw,
  Check,
  CreditCard,
  Layers,
} from 'lucide-react';
import { DashboardWidgetsConfig } from '../../types/finance';
import { DEFAULT_DASHBOARD_WIDGETS } from '../../data/seedData';

interface CustomizeDashboardModalProps {
  isOpen: boolean;
  onClose: () => void;
  widgets: DashboardWidgetsConfig;
  onUpdateWidgets: (widgets: Partial<DashboardWidgetsConfig>) => void;
  onResetToDefaults: () => void;
  onApplyMinimalist: () => void;
}

export const CustomizeDashboardModal: React.FC<CustomizeDashboardModalProps> = ({
  isOpen,
  onClose,
  widgets,
  onUpdateWidgets,
  onResetToDefaults,
  onApplyMinimalist,
}) => {
  if (!isOpen) return null;

  const currentWidgets: DashboardWidgetsConfig = {
    ...DEFAULT_DASHBOARD_WIDGETS,
    ...widgets,
  };

  const widgetDefinitions: Array<{
    key: keyof DashboardWidgetsConfig;
    name: string;
    description: string;
    icon: React.ReactNode;
    category: 'banners' | 'analytics' | 'activity';
    isDeletableClutter?: boolean;
  }> = [
    {
      key: 'showUpiBanner',
      name: 'Live UPI & Payment Banner',
      description: 'Purple top banner displaying auto-detection info, Swiggy/PhonePe simulator, and Payment Hub shortcuts.',
      icon: <Zap className="w-4 h-4 text-purple-400" />,
      category: 'banners',
      isDeletableClutter: true,
    },
    {
      key: 'showFreshSlateCard',
      name: 'Fresh Slate Ledger Card',
      description: 'Welcome helper card with test record generator shown when starting with 0 transactions.',
      icon: <Sparkles className="w-4 h-4 text-emerald-400" />,
      category: 'banners',
      isDeletableClutter: true,
    },
    {
      key: 'showFloatingUpiPopup',
      name: 'Floating UPI Expense Pop-up',
      description: 'Bottom docking bar that floats whenever an incoming transaction is detected and awaits categorization.',
      icon: <CreditCard className="w-4 h-4 text-indigo-400" />,
      category: 'banners',
      isDeletableClutter: true,
    },
    {
      key: 'showKpiCards',
      name: 'Financial Health KPI Cards',
      description: 'Overview summary metrics: Total Outflow, Total Inflow, Savings Rate, and Goal Reserves.',
      icon: <Layers className="w-4 h-4 text-sky-400" />,
      category: 'analytics',
    },
    {
      key: 'showBudgetRunwayGauge',
      name: 'Budget Safety Pacing Gauge',
      description: 'Visual runway bar displaying safe daily spend and remaining days in month.',
      icon: <BarChart3 className="w-4 h-4 text-emerald-400" />,
      category: 'analytics',
    },
    {
      key: 'showBudgetAlertsWatchlist',
      name: 'Budget Alert Watchlist',
      description: 'Warning highlight card surfacing categories that are nearing or exceeding monthly budget limits.',
      icon: <AlertTriangle className="w-4 h-4 text-amber-400" />,
      category: 'analytics',
    },
    {
      key: 'showCategoryDonut',
      name: 'Expense Categorization Chart',
      description: 'Interactive Apple Wallet-style Donut Chart breaking down expenses by category.',
      icon: <PieChart className="w-4 h-4 text-purple-400" />,
      category: 'analytics',
    },
    {
      key: 'showSavingsGoals',
      name: 'Savings Goal Milestones',
      description: 'Progress rings showing funding status of all active life objectives and emergency vaults.',
      icon: <PiggyBank className="w-4 h-4 text-rose-400" />,
      category: 'activity',
    },
    {
      key: 'showRecentTransactions',
      name: 'Recent Ledger Feed',
      description: 'Chronological list of recent income, expense, and savings transactions for the active month.',
      icon: <Receipt className="w-4 h-4 text-slate-400" />,
      category: 'activity',
    },
  ];

  const hiddenCount = widgetDefinitions.filter((w) => !currentWidgets[w.key]).length;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="bg-white dark:bg-slate-900 w-full max-w-lg rounded-3xl shadow-2xl border border-slate-200/80 dark:border-slate-800 flex flex-col max-h-[90vh] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
              <SlidersHorizontal className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                Customize Front Page
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Choose cards &amp; remove clutter to suit your workflow
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Quick Layout Presets Bar */}
        <div className="px-5 py-3.5 bg-slate-50 dark:bg-slate-850/60 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-300">
            <span className="font-semibold">Quick Presets:</span>
            {hiddenCount > 0 ? (
              <span className="text-[11px] px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800 font-semibold">
                {hiddenCount} hidden
              </span>
            ) : (
              <span className="text-[11px] px-2 py-0.5 rounded-full bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-semibold">
                All visible
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onApplyMinimalist}
              className="px-3 py-1 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-semibold rounded-xl border border-slate-200 dark:border-slate-700 transition-all shadow-xs cursor-pointer flex items-center gap-1"
              title="Remove all promotional banners & pop-ups; keep financial charts & records"
            >
              <span>Clean / Minimal</span>
            </button>

            <button
              type="button"
              onClick={onResetToDefaults}
              className="px-3 py-1 bg-indigo-50 dark:bg-indigo-950/60 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300 text-xs font-semibold rounded-xl border border-indigo-200 dark:border-indigo-800 transition-all cursor-pointer flex items-center gap-1"
              title="Reset all cards to standard view"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Show All</span>
            </button>
          </div>
        </div>

        {/* Scrollable Widget Items List */}
        <div className="p-5 overflow-y-auto space-y-3">
          {widgetDefinitions.map((widget) => {
            const isEnabled = currentWidgets[widget.key] !== false;

            return (
              <div
                key={widget.key}
                className={`p-3.5 rounded-2xl border transition-all flex items-start justify-between gap-3 ${
                  isEnabled
                    ? 'bg-white dark:bg-slate-800/80 border-slate-200 dark:border-slate-700/80 shadow-xs'
                    : 'bg-slate-50 dark:bg-slate-900/40 border-slate-200/60 dark:border-slate-800/60 opacity-60'
                }`}
              >
                <div className="flex items-start gap-3 min-w-0">
                  <div
                    className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 border ${
                      isEnabled
                        ? 'bg-slate-100 dark:bg-slate-700 border-slate-200 dark:border-slate-600'
                        : 'bg-slate-200/50 dark:bg-slate-800 border-slate-300/40 dark:border-slate-700'
                    }`}
                  >
                    {widget.icon}
                  </div>

                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-900 dark:text-white">
                        {widget.name}
                      </span>
                      {widget.isDeletableClutter && (
                        <span className="text-[10px] font-semibold px-2 py-0.2 rounded-full bg-purple-50 dark:bg-purple-950/50 text-purple-600 dark:text-purple-300 border border-purple-200 dark:border-purple-800">
                          Banner / Alert
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 leading-relaxed">
                      {widget.description}
                    </p>
                  </div>
                </div>

                {/* Switch Toggle */}
                <button
                  type="button"
                  role="switch"
                  aria-checked={isEnabled}
                  onClick={() => onUpdateWidgets({ [widget.key]: !isEnabled })}
                  className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 dark:focus:ring-offset-slate-900 ${
                    isEnabled ? 'bg-indigo-600' : 'bg-slate-300 dark:bg-slate-700'
                  }`}
                  title={`Toggle ${widget.name}`}
                >
                  <span className="sr-only">Toggle {widget.name}</span>
                  <span
                    aria-hidden="true"
                    className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
                      isEnabled ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60 flex items-center justify-between">
          <span className="text-xs text-slate-500 dark:text-slate-400">
            Changes auto-save directly to your device
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-slate-900 dark:bg-indigo-600 hover:bg-slate-800 dark:hover:bg-indigo-500 text-white text-xs font-bold rounded-xl shadow-xs transition-all active:scale-95 cursor-pointer flex items-center gap-1.5"
          >
            <Check className="w-3.5 h-3.5" />
            <span>Done</span>
          </button>
        </div>
      </div>
    </div>
  );
};
