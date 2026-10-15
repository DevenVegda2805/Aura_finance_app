import React, { useState } from 'react';
import { BudgetAlert, CurrencyCode, UserSettings } from '../../types/finance';
import { formatCurrency } from '../../utils/formatters';
import { getCategoryIcon } from '../../utils/categoryIcons';
import {
  X,
  AlertTriangle,
  AlertCircle,
  TrendingUp,
  Settings2,
  CheckCircle2,
  RotateCcw,
  Sliders,
  Bell,
  BellOff,
  Flame,
  ArrowRight,
  ShieldAlert,
} from 'lucide-react';

interface BudgetAlertsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  alerts: BudgetAlert[];
  allAlertsCount: number;
  currency: CurrencyCode;
  settings: UserSettings;
  onAdjustLimit: (categoryId: string) => void;
  onDismissAlert: (alertId: string) => void;
  onResetDismissedAlerts: () => void;
  onUpdateAlertSettings: (options: {
    budgetAlertsEnabled?: boolean;
    budgetAlertThreshold?: number;
    velocityAlertsEnabled?: boolean;
  }) => void;
  onNavigateToBudgets: () => void;
}

export const BudgetAlertsDrawer: React.FC<BudgetAlertsDrawerProps> = ({
  isOpen,
  onClose,
  alerts,
  allAlertsCount,
  currency,
  settings,
  onAdjustLimit,
  onDismissAlert,
  onResetDismissedAlerts,
  onUpdateAlertSettings,
  onNavigateToBudgets,
}) => {
  const [filter, setFilter] = useState<'all' | 'critical' | 'warning' | 'velocity'>('all');
  const [showConfig, setShowConfig] = useState(false);

  if (!isOpen) return null;

  const currentThreshold = settings.budgetAlertThreshold ?? 80;
  const isEnabled = settings.budgetAlertsEnabled !== false;
  const isVelocityEnabled = settings.velocityAlertsEnabled !== false;

  const filteredAlerts = alerts.filter((a) => {
    if (filter === 'critical') return a.severity === 'critical';
    if (filter === 'warning') return a.severity === 'warning';
    if (filter === 'velocity') return a.severity === 'velocity';
    return true;
  });

  const criticalCount = alerts.filter((a) => a.severity === 'critical').length;
  const warningCount = alerts.filter((a) => a.severity === 'warning').length;
  const velocityCount = alerts.filter((a) => a.severity === 'velocity').length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 rounded-3xl w-full max-w-2xl shadow-2xl border border-slate-100 dark:border-slate-800 overflow-hidden flex flex-col max-h-[92vh] animate-in zoom-in-95 duration-150 transition-colors duration-200">
        {/* Drawer Header */}
        <div className="flex items-center justify-between px-6 pt-5 pb-3 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500 text-white flex items-center justify-center shadow-xs">
              <ShieldAlert className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white tracking-tight">
                  Budget Alerts &amp; Spending Monitor
                </h2>
                <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                  {alerts.length} Active
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Live surveillance of category caps, pacing velocity, and overshoots
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowConfig(!showConfig)}
              className={`p-2 rounded-xl border transition-colors cursor-pointer ${
                showConfig
                  ? 'bg-indigo-50 dark:bg-indigo-950/60 border-indigo-200 dark:border-indigo-800 text-indigo-700 dark:text-indigo-300'
                  : 'bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
              }`}
              title="Configure threshold & monitoring settings"
            >
              <Sliders className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 flex items-center justify-center text-slate-600 dark:text-slate-300 transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Quick Settings Panel (Collapsible) */}
        {showConfig && (
          <div className="p-5 bg-slate-50 dark:bg-slate-850 border-b border-slate-200 dark:border-slate-800 space-y-4 animate-in slide-in-from-top-2 duration-150 text-xs">
            <div className="flex items-center justify-between">
              <div>
                <span className="font-bold text-slate-900 dark:text-white block">
                  Budget Alert System Trigger
                </span>
                <span className="text-slate-500 dark:text-slate-400 text-[11px]">
                  Real-time notifications and UI visual alerts across Aura
                </span>
              </div>

              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={isEnabled}
                  onChange={(e) => onUpdateAlertSettings({ budgetAlertsEnabled: e.target.checked })}
                  className="sr-only peer"
                />
                <div className="w-10 h-6 bg-slate-300 dark:bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
              </label>
            </div>

            {/* Threshold Selector */}
            <div className="space-y-1.5 pt-2 border-t border-slate-200 dark:border-slate-750">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-800 dark:text-slate-200">
                  Approaching Warning Threshold:
                </span>
                <span className="font-bold text-indigo-600 dark:text-indigo-400">
                  {currentThreshold}% of Category Limit
                </span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Trigger warning ribbons and badges when spent reaches this percentage of monthly ceiling.
              </p>
              <div className="grid grid-cols-5 gap-2 pt-1">
                {[70, 75, 80, 85, 90].map((t) => (
                  <button
                    key={t}
                    onClick={() => onUpdateAlertSettings({ budgetAlertThreshold: t })}
                    className={`py-1.5 rounded-xl font-bold text-xs transition-all cursor-pointer border ${
                      currentThreshold === t
                        ? 'bg-slate-900 dark:bg-indigo-600 text-white border-slate-900 dark:border-indigo-500 shadow-xs'
                        : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    {t}%
                  </button>
                ))}
              </div>
            </div>

            {/* Spending Velocity Forecasting Toggle */}
            <div className="flex items-center justify-between pt-2 border-t border-slate-200 dark:border-slate-750">
              <div>
                <span className="font-bold text-slate-900 dark:text-white block">
                  Pacing Velocity &amp; Burn Rate Forecasts
                </span>
                <span className="text-slate-500 dark:text-slate-400 text-[11px]">
                  Detects fast early spend and projects month-end overshoots
                </span>
              </div>

              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={isVelocityEnabled}
                  onChange={(e) =>
                    onUpdateAlertSettings({ velocityAlertsEnabled: e.target.checked })
                  }
                  className="sr-only peer"
                />
                <div className="w-10 h-6 bg-slate-300 dark:bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
              </label>
            </div>
          </div>
        )}

        {/* Filter Pills */}
        <div className="px-6 py-3 bg-slate-50/70 dark:bg-slate-800/40 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2 overflow-x-auto">
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setFilter('all')}
              className={`px-3 py-1 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                filter === 'all'
                  ? 'bg-slate-900 dark:bg-indigo-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              All Alerts ({alerts.length})
            </button>
            <button
              onClick={() => setFilter('critical')}
              className={`px-3 py-1 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                filter === 'critical'
                  ? 'bg-rose-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Exceeded ({criticalCount})
            </button>
            <button
              onClick={() => setFilter('warning')}
              className={`px-3 py-1 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                filter === 'warning'
                  ? 'bg-amber-500 text-slate-950 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Approaching ({warningCount})
            </button>
            {velocityCount > 0 && (
              <button
                onClick={() => setFilter('velocity')}
                className={`px-3 py-1 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                  filter === 'velocity'
                    ? 'bg-purple-600 text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                Fast Velocity ({velocityCount})
              </button>
            )}
          </div>

          {allAlertsCount > alerts.length && (
            <button
              onClick={onResetDismissedAlerts}
              className="text-[11px] font-semibold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1 cursor-pointer shrink-0"
              title="Restore dismissed alerts"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Restore Dismissed</span>
            </button>
          )}
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-4">
          {filteredAlerts.length === 0 ? (
            <div className="py-12 text-center space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto shadow-xs">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                All Category Spending is Healthy!
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
                No categories have crossed the {currentThreshold}% warning threshold or are pacing to overshoot their monthly allocations.
              </p>
              <button
                onClick={() => {
                  onNavigateToBudgets();
                  onClose();
                }}
                className="px-4 py-2 bg-slate-900 dark:bg-indigo-600 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold shadow-xs cursor-pointer inline-flex items-center gap-1.5 mt-2"
              >
                <span>View Monthly Budgets</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            filteredAlerts.map((item) => {
              const isCrit = item.severity === 'critical';
              const isVel = item.severity === 'velocity';

              return (
                <div
                  key={item.id}
                  className={`p-5 rounded-3xl border transition-all ${
                    isCrit
                      ? 'bg-rose-50/50 dark:bg-rose-950/20 border-rose-200 dark:border-rose-900/60 shadow-xs ring-1 ring-rose-500/10'
                      : isVel
                      ? 'bg-purple-50/50 dark:bg-purple-950/20 border-purple-200 dark:border-purple-900/60 shadow-xs'
                      : 'bg-amber-50/50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-900/60 shadow-xs ring-1 ring-amber-500/10'
                  }`}
                >
                  {/* Card Top: Icon, Category Name, Severity Tag, Actions */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <div
                        className="w-10 h-10 rounded-2xl flex items-center justify-center text-white shrink-0 shadow-xs"
                        style={{ backgroundColor: item.categoryColor }}
                      >
                        {getCategoryIcon(item.categoryIcon, { className: 'w-5 h-5' })}
                      </div>

                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <h3 className="text-sm font-bold text-slate-900 dark:text-white truncate">
                            {item.categoryName}
                          </h3>
                          <span
                            className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full ${
                              isCrit
                                ? 'bg-rose-100 dark:bg-rose-900/60 text-rose-800 dark:text-rose-200 border border-rose-300 dark:border-rose-800'
                                : isVel
                                ? 'bg-purple-100 dark:bg-purple-900/60 text-purple-800 dark:text-purple-200 border border-purple-300 dark:border-purple-800'
                                : 'bg-amber-100 dark:bg-amber-900/60 text-amber-800 dark:text-amber-200 border border-amber-300 dark:border-amber-800'
                            }`}
                          >
                            {isCrit ? 'Exceeded Limit' : isVel ? 'Velocity Warning' : 'Approaching Limit'}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                          {item.title}
                        </p>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <span className="text-base font-extrabold text-slate-900 dark:text-white tabular-nums block">
                        {formatCurrency(item.spent, currency)}
                      </span>
                      <span className="text-[11px] text-slate-400 dark:text-slate-500 tabular-nums">
                        of {formatCurrency(item.limit, currency)} cap
                      </span>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="mt-4 space-y-1.5">
                    <div className="flex items-center justify-between text-xs font-semibold tabular-nums">
                      <span className="text-slate-600 dark:text-slate-400 text-[11px]">
                        Budget Utilization
                      </span>
                      <span
                        className={`font-bold ${
                          isCrit
                            ? 'text-rose-600 dark:text-rose-400'
                            : isVel
                            ? 'text-purple-600 dark:text-purple-400'
                            : 'text-amber-600 dark:text-amber-400'
                        }`}
                      >
                        {item.percentage}%
                      </span>
                    </div>

                    <div className="w-full bg-slate-200/80 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          isCrit ? 'bg-rose-500' : isVel ? 'bg-purple-500' : 'bg-amber-500'
                        }`}
                        style={{ width: `${Math.min(100, item.percentage)}%` }}
                      />
                    </div>
                  </div>

                  {/* Pacing & Runway Grid */}
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mt-4 pt-3 border-t border-slate-200/60 dark:border-slate-800/80 text-xs">
                    <div className="p-2.5 rounded-xl bg-white/80 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60">
                      <span className="text-[10px] text-slate-400 dark:text-slate-500 block">
                        {isCrit ? 'Overspent' : 'Remaining Runway'}
                      </span>
                      <span
                        className={`font-bold tabular-nums text-xs ${
                          isCrit ? 'text-rose-600 dark:text-rose-400' : 'text-slate-900 dark:text-white'
                        }`}
                      >
                        {isCrit
                          ? `+${formatCurrency(item.overspent, currency)}`
                          : formatCurrency(item.remaining, currency)}
                      </span>
                    </div>

                    <div className="p-2.5 rounded-xl bg-white/80 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60">
                      <span className="text-[10px] text-slate-400 dark:text-slate-500 block">
                        Current Pace
                      </span>
                      <span className="font-bold text-slate-900 dark:text-white tabular-nums text-xs">
                        {formatCurrency(item.dailySpendRate, currency)}/day
                      </span>
                    </div>

                    <div className="p-2.5 rounded-xl bg-white/80 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60 col-span-2 sm:col-span-1">
                      <span className="text-[10px] text-slate-400 dark:text-slate-500 block">
                        Safe Daily Target
                      </span>
                      <span className="font-bold text-emerald-600 dark:text-emerald-400 tabular-nums text-xs">
                        {formatCurrency(item.safeDailySpend, currency)}/day
                      </span>
                    </div>
                  </div>

                  {/* Explanation & Action Row */}
                  <div className="mt-3.5 p-3 rounded-xl bg-white/90 dark:bg-slate-800/80 border border-slate-200/60 dark:border-slate-700/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                    <p className="text-slate-700 dark:text-slate-300 text-[11px] leading-relaxed">
                      {item.recommendation}
                    </p>

                    <div className="flex items-center gap-2 shrink-0 self-end sm:self-auto">
                      <button
                        onClick={() => {
                          onDismissAlert(item.id);
                        }}
                        className="px-2.5 py-1.5 text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 text-xs font-medium cursor-pointer"
                        title="Dismiss until next session"
                      >
                        Snooze
                      </button>

                      <button
                        onClick={() => {
                          onAdjustLimit(item.categoryId);
                          onClose();
                        }}
                        className="px-3 py-1.5 bg-slate-900 dark:bg-indigo-600 hover:bg-slate-800 dark:hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold transition-all active:scale-95 flex items-center gap-1 shadow-xs cursor-pointer"
                      >
                        <Settings2 className="w-3 h-3" />
                        <span>Adjust Limit</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 dark:bg-slate-850 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <button
            onClick={() => {
              onNavigateToBudgets();
              onClose();
            }}
            className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1 cursor-pointer"
          >
            <span>Open Budgets &amp; Limits View</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={onClose}
            className="px-4 py-2 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-semibold rounded-xl text-xs transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
