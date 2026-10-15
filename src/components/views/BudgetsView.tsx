import React, { useState, useMemo } from 'react';
import { FinanceStore } from '../../hooks/useFinanceStore';
import { Category } from '../../types/finance';
import { formatCurrency, getDaysRemainingInMonth } from '../../utils/formatters';
import { getCategoryIcon } from '../../utils/categoryIcons';
import { EditBudgetModal } from '../modals/EditBudgetModal';
import {
  Settings2,
  Plus,
  AlertCircle,
  AlertTriangle,
  CheckCircle2,
  TrendingUp,
  Calendar,
  Flame,
  ArrowRight,
  ShieldAlert,
  SlidersHorizontal,
} from 'lucide-react';

interface BudgetsViewProps {
  store: FinanceStore;
  onOpenAlertsDrawer?: () => void;
}

export const BudgetsView: React.FC<BudgetsViewProps> = ({ store, onOpenAlertsDrawer }) => {
  const {
    currentMonthSummary,
    selectedMonth,
    setSelectedMonth,
    availableMonths,
    categories,
    categoryMap,
    updateCategoryLimit,
    activeBudgetAlerts,
    settings,
  } = store;

  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [filterMode, setFilterMode] = useState<'all' | 'alerts' | 'healthy'>('all');

  const daysRemaining = getDaysRemainingInMonth();
  const totalLimit = categories.reduce((sum, c) => sum + c.monthlyLimit, 0);
  const totalSpent = currentMonthSummary.totalExpenses;
  const overallPct = totalLimit > 0 ? Math.round((totalSpent / totalLimit) * 100) : 0;

  // Active alerts count
  const criticalCount = activeBudgetAlerts.filter((a) => a.severity === 'critical').length;
  const warningCount = activeBudgetAlerts.filter((a) => a.severity === 'warning').length;
  const velocityCount = activeBudgetAlerts.filter((a) => a.severity === 'velocity').length;

  const filteredCategories = useMemo(() => {
    return currentMonthSummary.categoryBreakdown.filter((item) => {
      if (filterMode === 'alerts') {
        return item.isOverbudget || item.isApproaching || item.isHighVelocity;
      }
      if (filterMode === 'healthy') {
        return !item.isOverbudget && !item.isApproaching && !item.isHighVelocity;
      }
      return true;
    });
  }, [currentMonthSummary.categoryBreakdown, filterMode]);

  return (
    <div className="space-y-6">
      {/* View Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 font-medium">
            <span>Category Allocations &amp; Spending Caps</span>
            {activeBudgetAlerts.length > 0 && (
              <>
                <span aria-hidden="true">·</span>
                <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 px-2 py-0.5 rounded-full border border-amber-200 dark:border-amber-800">
                  <AlertTriangle className="w-3 h-3 text-amber-600 dark:text-amber-400" />
                  {activeBudgetAlerts.length} Flagged Categories
                </span>
              </>
            )}
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white mt-0.5">
            Monthly Category Budgets
          </h1>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          {onOpenAlertsDrawer && (
            <button
              onClick={onOpenAlertsDrawer}
              className={`px-3 py-1.5 rounded-2xl border text-xs font-semibold flex items-center gap-1.5 transition-all shadow-xs cursor-pointer ${
                activeBudgetAlerts.length > 0
                  ? 'bg-amber-50 dark:bg-amber-950/60 border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-300 hover:bg-amber-100'
                  : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50'
              }`}
            >
              <ShieldAlert className="w-4 h-4 text-amber-500" />
              <span>Budget Alerts ({activeBudgetAlerts.length})</span>
            </button>
          )}

          <div className="flex items-center gap-2 bg-white dark:bg-slate-900 px-3 py-1.5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
            <Calendar className="w-4 h-4 text-slate-400" />
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="text-xs font-semibold text-slate-800 dark:text-slate-200 bg-transparent focus:outline-none cursor-pointer pr-2"
            >
              {availableMonths.map((m) => (
                <option key={m} value={m} className="dark:bg-slate-900 dark:text-slate-200">
                  {new Date(parseInt(m.split('-')[0]), parseInt(m.split('-')[1]) - 1).toLocaleDateString(
                    'en-US',
                    { month: 'long', year: 'numeric' }
                  )}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Aggregate Budget Capacity Banner */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Total Budget Capacity
            </span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-3xl font-extrabold text-slate-900 dark:text-white tabular-nums">
                {formatCurrency(totalSpent, settings.currency)}
              </span>
              <span className="text-sm text-slate-500 dark:text-slate-400">
                spent of {formatCurrency(totalLimit, settings.currency)} cap
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            <div className="p-3 bg-slate-50 dark:bg-slate-800/80 rounded-2xl border border-slate-100 dark:border-slate-700/80 text-center min-w-[110px]">
              <span className="text-[11px] text-slate-500 dark:text-slate-400 block">Remaining</span>
              <span className="text-sm font-bold text-slate-900 dark:text-white tabular-nums">
                {formatCurrency(Math.max(0, totalLimit - totalSpent), settings.currency)}
              </span>
            </div>

            <div className="p-3 bg-slate-50 dark:bg-slate-800/80 rounded-2xl border border-slate-100 dark:border-slate-700/80 text-center min-w-[110px]">
              <span className="text-[11px] text-slate-500 dark:text-slate-400 block">Safe Daily Pace</span>
              <span className="text-sm font-bold text-slate-900 dark:text-white tabular-nums">
                {formatCurrency(Math.max(0, totalLimit - totalSpent) / Math.max(1, daysRemaining), settings.currency)}/d
              </span>
            </div>

            <div
              className={`p-3 rounded-2xl border text-center min-w-[120px] transition-colors ${
                activeBudgetAlerts.length > 0
                  ? 'bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-800'
                  : 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800'
              }`}
            >
              <span
                className={`text-[11px] block font-medium ${
                  activeBudgetAlerts.length > 0
                    ? 'text-amber-800 dark:text-amber-300'
                    : 'text-emerald-800 dark:text-emerald-300'
                }`}
              >
                Alert Status
              </span>
              <span
                className={`text-sm font-bold tabular-nums ${
                  activeBudgetAlerts.length > 0
                    ? 'text-amber-900 dark:text-amber-200'
                    : 'text-emerald-900 dark:text-emerald-200'
                }`}
              >
                {activeBudgetAlerts.length > 0
                  ? `${activeBudgetAlerts.length} Flagged`
                  : 'All Healthy'}
              </span>
            </div>
          </div>
        </div>

        {/* Aggregate Progress Bar */}
        <div className="w-full bg-slate-100 dark:bg-slate-800 h-2.5 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-500 ${
              overallPct > 95
                ? 'bg-rose-500'
                : overallPct >= (settings.budgetAlertThreshold ?? 80)
                ? 'bg-amber-500'
                : 'bg-indigo-600'
            }`}
            style={{ width: `${Math.min(100, overallPct)}%` }}
          />
        </div>
      </div>

      {/* Filter Tabs Bar */}
      <div className="flex items-center justify-between gap-3 border-b border-slate-200 dark:border-slate-800 pb-2">
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setFilterMode('all')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
              filterMode === 'all'
                ? 'bg-slate-900 dark:bg-indigo-600 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            All Categories ({currentMonthSummary.categoryBreakdown.length})
          </button>
          <button
            onClick={() => setFilterMode('alerts')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
              filterMode === 'alerts'
                ? 'bg-amber-500 text-slate-950 shadow-xs font-bold'
                : 'text-amber-700 dark:text-amber-400 hover:text-amber-800 dark:hover:text-amber-300'
            }`}
          >
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>Alerts &amp; Warnings ({activeBudgetAlerts.length})</span>
          </button>
          <button
            onClick={() => setFilterMode('healthy')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
              filterMode === 'healthy'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Healthy ({currentMonthSummary.categoryBreakdown.length - activeBudgetAlerts.length})
          </button>
        </div>

        <span className="text-xs text-slate-400 dark:text-slate-500 hidden sm:inline">
          Alert threshold set at {settings.budgetAlertThreshold ?? 80}%
        </span>
      </div>

      {/* Category Budget Cards Grid */}
      {filteredCategories.length === 0 ? (
        <div className="p-12 text-center bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-2">
          <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto" />
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">
            No categories match this filter
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {filterMode === 'alerts'
              ? 'No categories are currently approaching or exceeding their limits.'
              : 'All categories are currently flagged with warnings.'}
          </p>
          <button
            onClick={() => setFilterMode('all')}
            className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline pt-2 cursor-pointer"
          >
            Reset filter to show all
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredCategories.map((item) => {
            const category = categoryMap.get(item.categoryId);
            if (!category) return null;

            const isOverbudget = Boolean(item.isOverbudget);
            const isWarning = Boolean(item.isApproaching);
            const isHighVelocity = Boolean(item.isHighVelocity);

            return (
              <div
                key={item.categoryId}
                className={`p-5 rounded-3xl border transition-all duration-200 flex flex-col justify-between space-y-4 hover:border-slate-300 dark:hover:border-slate-700 ${
                  isOverbudget
                    ? 'bg-rose-50/40 dark:bg-rose-950/20 border-rose-300 dark:border-rose-800 ring-2 ring-rose-500/15 shadow-sm'
                    : isWarning
                    ? 'bg-amber-50/40 dark:bg-amber-950/20 border-amber-300 dark:border-amber-800 ring-2 ring-amber-500/15 shadow-sm'
                    : isHighVelocity
                    ? 'bg-purple-50/30 dark:bg-purple-950/20 border-purple-200 dark:border-purple-800/80 shadow-xs'
                    : 'bg-white dark:bg-slate-900 border-slate-200/80 dark:border-slate-800 shadow-xs'
                }`}
              >
                <div>
                  {/* Card Header: Icon, Category Name, Edit Trigger */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div
                        className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 shadow-xs"
                        style={{ backgroundColor: category.bgColor, color: category.color }}
                      >
                        {getCategoryIcon(category.iconName, { className: 'w-4 h-4' })}
                      </div>
                      <div className="min-w-0">
                        <h3 className="text-sm font-bold text-slate-900 dark:text-white truncate">
                          {category.name}
                        </h3>
                        <span className="text-[11px] text-slate-400 dark:text-slate-500 tabular-nums">
                          {item.transactionCount} transactions
                        </span>
                      </div>
                    </div>

                    <button
                      onClick={() => setEditingCategory(category)}
                      className="w-8 h-8 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 flex items-center justify-center text-slate-600 dark:text-slate-300 transition-colors cursor-pointer"
                      title="Edit Monthly Limit"
                    >
                      <Settings2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Amounts & Percentage Badge */}
                  <div className="mt-4 flex items-baseline justify-between">
                    <div>
                      <span className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight tabular-nums">
                        {formatCurrency(item.spent, settings.currency)}
                      </span>
                      <span className="text-xs text-slate-400 dark:text-slate-500 tabular-nums ml-1">
                        / {formatCurrency(item.limit, settings.currency)}
                      </span>
                    </div>

                    <span
                      className={`text-xs font-bold tabular-nums px-2 py-0.5 rounded-lg ${
                        isOverbudget
                          ? 'bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border border-rose-300 dark:border-rose-800'
                          : isWarning
                          ? 'bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-300 dark:border-amber-800'
                          : isHighVelocity
                          ? 'bg-purple-100 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800'
                          : 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                      }`}
                    >
                      {item.percentage}%
                    </span>
                  </div>

                  {/* Progress Bar */}
                  <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full mt-2.5 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        isOverbudget
                          ? 'bg-rose-500'
                          : isWarning
                          ? 'bg-amber-500'
                          : isHighVelocity
                          ? 'bg-purple-500'
                          : category.color
                      }`}
                      style={{
                        width: `${Math.min(100, item.percentage)}%`,
                      }}
                    />
                  </div>

                  {/* Pacing Advice Callout for Flagged Items */}
                  {(isWarning || isOverbudget || isHighVelocity) && (
                    <div className="mt-3 p-2.5 rounded-xl bg-white/80 dark:bg-slate-850/80 border border-slate-200/60 dark:border-slate-800 text-[11px] space-y-1">
                      <div className="flex items-center justify-between text-slate-600 dark:text-slate-300 font-medium">
                        <span>Current Burn:</span>
                        <span className="font-bold tabular-nums">
                          {formatCurrency(item.dailySpendRate || 0, settings.currency)}/day
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-slate-600 dark:text-slate-300 font-medium">
                        <span>Safe Runway:</span>
                        <span className="font-bold tabular-nums text-emerald-600 dark:text-emerald-400">
                          {formatCurrency(
                            Math.max(0, (item.remaining || 0) / Math.max(1, daysRemaining)),
                            settings.currency
                          )}
                          /day
                        </span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Card Footer: Status & Action */}
                <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
                  <div className="flex items-center gap-1.5">
                    {isOverbudget ? (
                      <>
                        <AlertCircle className="w-3.5 h-3.5 text-rose-500" />
                        <span className="text-rose-600 dark:text-rose-400 font-bold">
                          Over Limit
                        </span>
                      </>
                    ) : isWarning ? (
                      <>
                        <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
                        <span className="text-amber-600 dark:text-amber-400 font-bold">
                          Nearing Cap
                        </span>
                      </>
                    ) : isHighVelocity ? (
                      <>
                        <Flame className="w-3.5 h-3.5 text-purple-500" />
                        <span className="text-purple-600 dark:text-purple-400 font-semibold">
                          Fast Velocity
                        </span>
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                        <span>On Track</span>
                      </>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="tabular-nums font-medium text-slate-700 dark:text-slate-300">
                      {isOverbudget
                        ? `${formatCurrency((item.overspent || item.spent - item.limit), settings.currency)} over`
                        : `${formatCurrency(item.remaining, settings.currency)} left`}
                    </span>
                    <button
                      onClick={() => setEditingCategory(category)}
                      className="text-indigo-600 dark:text-indigo-400 font-semibold hover:underline cursor-pointer"
                    >
                      Adjust
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Edit Budget Modal */}
      {editingCategory && (
        <EditBudgetModal
          category={editingCategory}
          isOpen={!!editingCategory}
          onClose={() => setEditingCategory(null)}
          currency={settings.currency}
          onUpdateLimit={updateCategoryLimit}
        />
      )}
    </div>
  );
};
