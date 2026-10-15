import React, { useState } from 'react';
import { BudgetAlert, CurrencyCode } from '../../types/finance';
import { formatCurrency } from '../../utils/formatters';
import { getCategoryIcon } from '../../utils/categoryIcons';
import {
  AlertTriangle,
  AlertCircle,
  TrendingUp,
  X,
  ChevronRight,
  Settings2,
  SlidersHorizontal,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';

interface BudgetAlertBannerProps {
  alerts: BudgetAlert[];
  currency: CurrencyCode;
  onOpenAlertsDrawer: () => void;
  onAdjustLimit: (categoryId: string) => void;
  onDismissAlert?: (alertId: string) => void;
}

export const BudgetAlertBanner: React.FC<BudgetAlertBannerProps> = ({
  alerts,
  currency,
  onOpenAlertsDrawer,
  onAdjustLimit,
  onDismissAlert,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  if (!alerts || alerts.length === 0) return null;

  const criticalAlerts = alerts.filter((a) => a.severity === 'critical');
  const warningAlerts = alerts.filter((a) => a.severity === 'warning');
  const velocityAlerts = alerts.filter((a) => a.severity === 'velocity');

  const hasCritical = criticalAlerts.length > 0;
  const primaryAlert = alerts[0];

  return (
    <div
      role="region"
      aria-label="Active Budget Warnings"
      className={`rounded-3xl border transition-all duration-300 shadow-sm overflow-hidden ${
        hasCritical
          ? 'bg-rose-50/90 dark:bg-rose-950/40 border-rose-200 dark:border-rose-900/60 ring-1 ring-rose-500/10'
          : 'bg-amber-50/90 dark:bg-amber-950/40 border-amber-200 dark:border-amber-900/60 ring-1 ring-amber-500/10'
      }`}
    >
      {/* Primary Banner Header Bar */}
      <div className="p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-start sm:items-center gap-3.5 min-w-0">
          <div
            className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 shadow-xs ${
              hasCritical
                ? 'bg-rose-600 text-white animate-pulse'
                : 'bg-amber-500 text-white'
            }`}
          >
            {hasCritical ? (
              <AlertCircle className="w-5 h-5 stroke-[2.5]" />
            ) : (
              <AlertTriangle className="w-5 h-5 stroke-[2.5]" />
            )}
          </div>

          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span
                className={`text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-0.5 rounded-full ${
                  hasCritical
                    ? 'bg-rose-100 dark:bg-rose-900/60 text-rose-800 dark:text-rose-200 border border-rose-300 dark:border-rose-800'
                    : 'bg-amber-100 dark:bg-amber-900/60 text-amber-800 dark:text-amber-200 border border-amber-300 dark:border-amber-800'
                }`}
              >
                {hasCritical
                  ? `${criticalAlerts.length} Over Budget`
                  : 'Budget Alert Monitor'}
              </span>

              <span className="text-xs font-bold text-slate-900 dark:text-white">
                {alerts.length} {alerts.length === 1 ? 'Category Alert' : 'Category Alerts Active'}
              </span>
            </div>

            <p className="text-xs text-slate-700 dark:text-slate-300 mt-1 leading-relaxed">
              <strong className="text-slate-900 dark:text-white font-semibold">
                {primaryAlert.categoryName}
              </strong>{' '}
              {primaryAlert.severity === 'critical' ? (
                <>
                  exceeded monthly cap ({primaryAlert.percentage}% utilized,{' '}
                  <span className="text-rose-600 dark:text-rose-400 font-bold">
                    +{formatCurrency(primaryAlert.overspent, currency)} over
                  </span>
                  ).
                </>
              ) : (
                <>
                  approaching monthly cap ({primaryAlert.percentage}% spent,{' '}
                  <span className="text-amber-700 dark:text-amber-300 font-bold">
                    {formatCurrency(primaryAlert.remaining, currency)} remaining
                  </span>
                  ).
                </>
              )}
              {alerts.length > 1 && (
                <span className="text-slate-500 dark:text-slate-400 ml-1">
                  +{alerts.length - 1} other {alerts.length - 1 === 1 ? 'category' : 'categories'} flagged.
                </span>
              )}
            </p>
          </div>
        </div>

        {/* Right CTA Controls */}
        <div className="flex items-center gap-2 shrink-0 self-end md:self-auto">
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="px-3 py-1.5 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-750 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-200 transition-colors flex items-center gap-1 cursor-pointer"
          >
            <span>{isExpanded ? 'Hide Details' : 'View Watchlist'}</span>
            {isExpanded ? (
              <ChevronUp className="w-3.5 h-3.5" />
            ) : (
              <ChevronDown className="w-3.5 h-3.5" />
            )}
          </button>

          <button
            onClick={onOpenAlertsDrawer}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold text-white transition-all active:scale-95 flex items-center gap-1.5 shadow-xs cursor-pointer ${
              hasCritical
                ? 'bg-rose-600 hover:bg-rose-700'
                : 'bg-amber-600 hover:bg-amber-700'
            }`}
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span>Manage Alerts</span>
          </button>

          {onDismissAlert && (
            <button
              onClick={() => onDismissAlert(primaryAlert.id)}
              className="w-7 h-7 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 flex items-center justify-center transition-colors cursor-pointer"
              title="Dismiss banner"
              aria-label="Dismiss banner"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Expanded Accordion: Detailed Category Cards */}
      {isExpanded && (
        <div className="px-4 sm:px-5 pb-5 pt-1 border-t border-slate-200/60 dark:border-slate-800/60 space-y-3 animate-in fade-in duration-200">
          <div className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 flex items-center justify-between">
            <span>Categories currently exceeding or nearing monthly limits</span>
            <span>Recommended Safe Daily Burn</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {alerts.map((item) => {
              const isCrit = item.severity === 'critical';
              const isVel = item.severity === 'velocity';

              return (
                <div
                  key={item.id}
                  className="p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col justify-between space-y-3"
                >
                  <div>
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2 min-w-0">
                        <div
                          className="w-7 h-7 rounded-lg flex items-center justify-center text-white shrink-0 text-xs"
                          style={{ backgroundColor: item.categoryColor }}
                        >
                          {getCategoryIcon(item.categoryIcon, { className: 'w-3.5 h-3.5' })}
                        </div>
                        <span className="text-xs font-bold text-slate-900 dark:text-white truncate">
                          {item.categoryName}
                        </span>
                      </div>

                      <span
                        className={`text-[10px] font-extrabold px-2 py-0.5 rounded-md ${
                          isCrit
                            ? 'bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800'
                            : isVel
                            ? 'bg-purple-100 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800'
                            : 'bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800'
                        }`}
                      >
                        {isCrit
                          ? `${item.percentage}% Exceeded`
                          : isVel
                          ? 'Fast Velocity'
                          : `${item.percentage}% Used`}
                      </span>
                    </div>

                    {/* Progress Track */}
                    <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden mt-2.5">
                      <div
                        className={`h-full rounded-full transition-all duration-300 ${
                          isCrit ? 'bg-rose-500' : isVel ? 'bg-purple-500' : 'bg-amber-500'
                        }`}
                        style={{ width: `${Math.min(100, item.percentage)}%` }}
                      />
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 mt-1.5">
                      <span>
                        {formatCurrency(item.spent, currency)} of {formatCurrency(item.limit, currency)}
                      </span>
                      <span className="font-semibold text-slate-700 dark:text-slate-300">
                        {isCrit
                          ? `+${formatCurrency(item.overspent, currency)} over`
                          : `${formatCurrency(item.remaining, currency)} left`}
                      </span>
                    </div>

                    <p className="text-[11px] text-slate-600 dark:text-slate-400 mt-1.5 leading-snug">
                      {item.recommendation}
                    </p>
                  </div>

                  <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                    <span className="text-[10px] text-slate-400 dark:text-slate-500">
                      {item.daysRemaining} days remaining in cycle
                    </span>
                    <button
                      onClick={() => onAdjustLimit(item.categoryId)}
                      className="text-[11px] font-bold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 flex items-center gap-1 cursor-pointer"
                    >
                      <Settings2 className="w-3 h-3" />
                      <span>Adjust Cap</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
