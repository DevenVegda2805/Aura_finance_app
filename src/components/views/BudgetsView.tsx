import React, { useState } from 'react';
import { FinanceStore } from '../../hooks/useFinanceStore';
import { Category } from '../../types/finance';
import { formatCurrency, getDaysRemainingInMonth } from '../../utils/formatters';
import { getCategoryIcon } from '../../utils/categoryIcons';
import { EditBudgetModal } from '../modals/EditBudgetModal';
import { Settings2, Plus, AlertCircle, CheckCircle2, TrendingUp, Calendar } from 'lucide-react';

interface BudgetsViewProps {
  store: FinanceStore;
}

export const BudgetsView: React.FC<BudgetsViewProps> = ({ store }) => {
  const {
    currentMonthSummary,
    selectedMonth,
    setSelectedMonth,
    availableMonths,
    categories,
    categoryMap,
    updateCategoryLimit,
    settings,
  } = store;

  const [editingCategory, setEditingCategory] = useState<Category | null>(null);

  const daysRemaining = getDaysRemainingInMonth();
  const totalLimit = categories.reduce((sum, c) => sum + c.monthlyLimit, 0);
  const totalSpent = currentMonthSummary.totalExpenses;
  const overallPct = totalLimit > 0 ? Math.round((totalSpent / totalLimit) * 100) : 0;

  return (
    <div className="space-y-6">
      {/* View Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="text-xs text-slate-500 font-medium">
            Category Allocations &amp; Spending Caps
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 mt-0.5">
            Monthly Category Budgets
          </h1>
        </div>

        <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-2xl border border-slate-200 shadow-sm self-start sm:self-auto">
          <Calendar className="w-4 h-4 text-slate-400" />
          <select
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="text-xs font-semibold text-slate-800 bg-transparent focus:outline-none cursor-pointer pr-2"
          >
            {availableMonths.map((m) => (
              <option key={m} value={m}>
                {new Date(parseInt(m.split('-')[0]), parseInt(m.split('-')[1]) - 1).toLocaleDateString(
                  'en-US',
                  { month: 'long', year: 'numeric' }
                )}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Aggregate Budget Capacity Banner */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Total Budget Capacity
            </span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-3xl font-extrabold text-slate-900 tabular-nums">
                {formatCurrency(totalSpent, settings.currency)}
              </span>
              <span className="text-sm text-slate-500">
                spent of {formatCurrency(totalLimit, settings.currency)} cap
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100 text-center min-w-[110px]">
              <span className="text-[11px] text-slate-500 block">Remaining</span>
              <span className="text-sm font-bold text-slate-900 tabular-nums">
                {formatCurrency(Math.max(0, totalLimit - totalSpent), settings.currency)}
              </span>
            </div>
            <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100 text-center min-w-[110px]">
              <span className="text-[11px] text-slate-500 block">Safe Daily Pace</span>
              <span className="text-sm font-bold text-slate-900 tabular-nums">
                {formatCurrency(Math.max(0, totalLimit - totalSpent) / daysRemaining, settings.currency)}/d
              </span>
            </div>
          </div>
        </div>

        {/* Aggregate Progress Bar */}
        <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-500 ${
              overallPct > 95
                ? 'bg-rose-500'
                : overallPct > 75
                ? 'bg-amber-500'
                : 'bg-indigo-600'
            }`}
            style={{ width: `${Math.min(100, overallPct)}%` }}
          />
        </div>
      </div>

      {/* Category Budget Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {currentMonthSummary.categoryBreakdown.map((item) => {
          const category = categoryMap.get(item.categoryId);
          if (!category) return null;

          const isOverbudget = item.spent > item.limit && item.limit > 0;
          const isWarning = item.percentage >= 80 && !isOverbudget;
          const isUnderbudget = !isOverbudget && !isWarning;

          return (
            <div
              key={item.categoryId}
              className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-sm flex flex-col justify-between space-y-4 hover:border-slate-300 transition-colors"
            >
              <div>
                {/* Card Header: Icon, Category Name, Edit Trigger */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div
                      className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
                      style={{ backgroundColor: category.bgColor, color: category.color }}
                    >
                      {getCategoryIcon(category.iconName, { className: 'w-4 h-4' })}
                    </div>
                    <div className="min-w-0">
                      <h3 className="text-sm font-bold text-slate-900 truncate">
                        {category.name}
                      </h3>
                      <span className="text-[11px] text-slate-400 tabular-nums">
                        {item.transactionCount} transactions
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={() => setEditingCategory(category)}
                    className="w-8 h-8 rounded-xl bg-slate-50 hover:bg-slate-100 flex items-center justify-center text-slate-500 transition-colors"
                    title="Edit Monthly Limit"
                  >
                    <Settings2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Amounts & Percentage */}
                <div className="mt-4 flex items-baseline justify-between">
                  <div>
                    <span className="text-2xl font-extrabold text-slate-900 tracking-tight tabular-nums">
                      {formatCurrency(item.spent, settings.currency)}
                    </span>
                    <span className="text-xs text-slate-400 tabular-nums ml-1">
                      / {formatCurrency(item.limit, settings.currency)}
                    </span>
                  </div>

                  <span
                    className={`text-xs font-bold tabular-nums px-2 py-0.5 rounded-lg ${
                      isOverbudget
                        ? 'bg-rose-50 text-rose-700'
                        : isWarning
                        ? 'bg-amber-50 text-amber-700'
                        : 'bg-emerald-50 text-emerald-700'
                    }`}
                  >
                    {item.percentage}%
                  </span>
                </div>

                {/* Progress Bar */}
                <div className="w-full bg-slate-100 h-2 rounded-full mt-2.5 overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${Math.min(100, item.percentage)}%`,
                      backgroundColor: isOverbudget ? '#EF4444' : category.color,
                    }}
                  />
                </div>
              </div>

              {/* Card Footer: Status & Daily Runway */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                <div className="flex items-center gap-1.5">
                  {isOverbudget ? (
                    <>
                      <AlertCircle className="w-3.5 h-3.5 text-rose-500" />
                      <span className="text-rose-600 font-semibold">Over Budget</span>
                    </>
                  ) : isWarning ? (
                    <>
                      <AlertCircle className="w-3.5 h-3.5 text-amber-500" />
                      <span className="text-amber-600 font-semibold">Nearing Cap</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                      <span>On Track</span>
                    </>
                  )}
                </div>

                <span className="tabular-nums font-medium text-slate-700">
                  {isOverbudget
                    ? `${formatCurrency(item.spent - item.limit, settings.currency)} over`
                    : `${formatCurrency(item.remaining, settings.currency)} left`}
                </span>
              </div>
            </div>
          );
        })}
      </div>

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
