import React, { useEffect } from 'react';
import { BudgetAlert, CurrencyCode } from '../../types/finance';
import { formatCurrency } from '../../utils/formatters';
import { getCategoryIcon } from '../../utils/categoryIcons';
import { AlertTriangle, AlertCircle, X, ArrowRight, Gauge, Check } from 'lucide-react';

interface BudgetAlertToastProps {
  alert: BudgetAlert | null;
  currency: CurrencyCode;
  onClose: () => void;
  onAdjustLimit: (categoryId: string) => void;
  onViewBudgets?: () => void;
}

export const BudgetAlertToast: React.FC<BudgetAlertToastProps> = ({
  alert,
  currency,
  onClose,
  onAdjustLimit,
  onViewBudgets,
}) => {
  useEffect(() => {
    if (!alert) return;
    const timer = setTimeout(() => {
      onClose();
    }, 8500);
    return () => clearTimeout(timer);
  }, [alert, onClose]);

  if (!alert) return null;

  const isCritical = alert.severity === 'critical';

  return (
    <div
      role="alert"
      aria-live="assertive"
      className="fixed bottom-20 md:bottom-6 right-4 sm:right-6 z-50 max-w-sm sm:max-w-md w-full animate-in slide-in-from-bottom-5 fade-in duration-300 pointer-events-auto"
    >
      <div
        className={`rounded-3xl p-4 sm:p-5 shadow-2xl border backdrop-blur-xl transition-all duration-200 ${
          isCritical
            ? 'bg-rose-950/95 text-white border-rose-500/40 ring-2 ring-rose-500/20'
            : 'bg-slate-900/95 dark:bg-slate-950/95 text-white border-amber-500/40 ring-2 ring-amber-500/20'
        }`}
      >
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-2.5 min-w-0">
            <div
              className={`w-9 h-9 rounded-2xl flex items-center justify-center shrink-0 shadow-md ${
                isCritical
                  ? 'bg-rose-500 text-white animate-pulse'
                  : 'bg-amber-500 text-slate-950'
              }`}
            >
              {isCritical ? (
                <AlertCircle className="w-5 h-5 stroke-[2.5]" />
              ) : (
                <AlertTriangle className="w-5 h-5 stroke-[2.5]" />
              )}
            </div>

            <div className="min-w-0">
              <div className="flex items-center gap-1.5 flex-wrap">
                <span
                  className={`text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                    isCritical
                      ? 'bg-rose-500/30 text-rose-200 border border-rose-400/40'
                      : 'bg-amber-500/30 text-amber-200 border border-amber-400/40'
                  }`}
                >
                  {isCritical ? 'Budget Exceeded' : 'Budget Alert'}
                </span>
                <span className="text-xs font-bold text-white/90 truncate">
                  {alert.categoryName}
                </span>
              </div>
              <p className="text-xs font-medium text-slate-200 mt-0.5 leading-snug">
                {alert.title}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-7 h-7 rounded-full bg-white/10 hover:bg-white/20 text-white/70 hover:text-white flex items-center justify-center transition-colors cursor-pointer shrink-0"
            aria-label="Dismiss alert"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Progress Bar & Numerical Details */}
        <div className="mt-3.5 space-y-2">
          <div className="flex items-center justify-between text-xs tabular-nums font-semibold">
            <span className="text-slate-300">
              {formatCurrency(alert.spent, currency)}{' '}
              <span className="text-slate-400 font-normal">/ {formatCurrency(alert.limit, currency)}</span>
            </span>
            <span
              className={`px-1.5 py-0.2 rounded font-extrabold ${
                isCritical ? 'text-rose-300 bg-rose-500/20' : 'text-amber-300 bg-amber-500/20'
              }`}
            >
              {alert.percentage}%
            </span>
          </div>

          <div className="w-full bg-white/10 h-2 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                isCritical ? 'bg-rose-500' : 'bg-amber-400'
              }`}
              style={{ width: `${Math.min(100, alert.percentage)}%` }}
            />
          </div>

          <p className="text-[11px] text-slate-300 leading-relaxed pt-0.5">
            {alert.message}
          </p>
        </div>

        {/* Action Buttons */}
        <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between gap-2">
          {onViewBudgets && (
            <button
              onClick={() => {
                onViewBudgets();
                onClose();
              }}
              className="text-xs font-semibold text-slate-300 hover:text-white transition-colors cursor-pointer underline flex items-center gap-1"
            >
              <span>View All Budgets</span>
            </button>
          )}

          <div className="flex items-center gap-2 ml-auto">
            <button
              onClick={() => {
                onAdjustLimit(alert.categoryId);
                onClose();
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all active:scale-95 flex items-center gap-1 shadow-xs cursor-pointer ${
                isCritical
                  ? 'bg-white text-rose-950 hover:bg-rose-100'
                  : 'bg-white text-slate-900 hover:bg-amber-100'
              }`}
            >
              <span>Adjust Limit</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
