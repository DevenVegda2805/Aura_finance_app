import React, { useState } from 'react';
import { FinanceStore } from '../../hooks/useFinanceStore';
import { formatCurrency, formatRelativeDate, getDaysRemainingInMonth } from '../../utils/formatters';
import { DonutPieChart } from '../charts/DonutPieChart';
import { ProgressRing } from '../charts/ProgressRing';
import { getCategoryIcon } from '../../utils/categoryIcons';
import {
  TrendingUp,
  TrendingDown,
  PiggyBank,
  ArrowUpRight,
  ChevronRight,
  ShieldCheck,
  Calendar,
  Sparkles,
} from 'lucide-react';
import { ActiveTab } from '../layout/Header';
import { SavingsGoal } from '../../types/finance';

interface OverviewViewProps {
  store: FinanceStore;
  onNavigate: (tab: ActiveTab) => void;
  onOpenAddModal: () => void;
  onContributeGoal: (goal: SavingsGoal) => void;
}

export const OverviewView: React.FC<OverviewViewProps> = ({
  store,
  onNavigate,
  onOpenAddModal,
  onContributeGoal,
}) => {
  const {
    currentMonthSummary,
    selectedMonth,
    setSelectedMonth,
    availableMonths,
    totalMonthlyBudget,
    totalAccumulatedSavings,
    savingsGoals,
    transactions,
    categoryMap,
    settings,
  } = store;

  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);

  const daysRemaining = getDaysRemainingInMonth();
  const spent = currentMonthSummary.totalExpenses;
  const budgetRatio = totalMonthlyBudget > 0 ? (spent / totalMonthlyBudget) * 100 : 0;
  const remainingBudget = Math.max(0, totalMonthlyBudget - spent);
  const dailyRunway = daysRemaining > 0 ? remainingBudget / daysRemaining : 0;

  // Recent transactions for this month
  const recentTransactions = transactions
    .filter((t) => t.date.startsWith(selectedMonth))
    .slice(0, 6);

  return (
    <div className="space-y-6">
      {/* Top Banner & Month Selector */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
            <span>Financial Command Center</span>
            <span aria-hidden="true">·</span>
            <span>{settings.userName}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 mt-0.5">
            Overview &amp; Spending
          </h1>
        </div>

        {/* Month Selector Dropdown */}
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

      {/* Apple Wallet Style Hero KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Expenses / Outflow */}
        <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span>Total Outflow</span>
            <div className="w-7 h-7 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <TrendingDown className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-4">
            <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight tabular-nums">
              {formatCurrency(currentMonthSummary.totalExpenses, settings.currency)}
            </span>
            <div className="flex items-center gap-1.5 text-[11px] text-slate-500 mt-1">
              <span>Limit: {formatCurrency(totalMonthlyBudget, settings.currency)}</span>
              <span aria-hidden="true">·</span>
              <span
                className={`font-semibold ${
                  budgetRatio > 90 ? 'text-rose-600' : 'text-slate-700'
                }`}
              >
                {Math.round(budgetRatio)}% utilized
              </span>
            </div>
          </div>
        </div>

        {/* Total Income / Inflow */}
        <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span>Total Inflow</span>
            <div className="w-7 h-7 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-4">
            <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight tabular-nums">
              {formatCurrency(currentMonthSummary.totalIncome, settings.currency)}
            </span>
            <div className="flex items-center gap-1.5 text-[11px] text-emerald-600 mt-1 font-medium">
              <span>Net Surplus: {formatCurrency(Math.max(0, currentMonthSummary.totalIncome - currentMonthSummary.totalExpenses), settings.currency)}</span>
            </div>
          </div>
        </div>

        {/* Monthly Net Savings Rate */}
        <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span>Savings Rate</span>
            <div className="w-7 h-7 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center">
              <PiggyBank className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-4">
            <div className="flex items-baseline gap-2">
              <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight tabular-nums">
                {currentMonthSummary.netSavingsRate}%
              </span>
              <span className="text-xs text-slate-400 font-medium">of income kept</span>
            </div>
            <div className="w-full bg-slate-100 h-1.5 rounded-full mt-2 overflow-hidden">
              <div
                className="bg-sky-500 h-full rounded-full transition-all duration-500"
                style={{ width: `${Math.min(100, currentMonthSummary.netSavingsRate)}%` }}
              />
            </div>
          </div>
        </div>

        {/* Accumulated Vault Reserves */}
        <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span>Goal Reserves</span>
            <div className="w-7 h-7 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
              <ShieldCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-4">
            <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight tabular-nums">
              {formatCurrency(totalAccumulatedSavings, settings.currency)}
            </span>
            <div className="flex items-center gap-1.5 text-[11px] text-purple-700 mt-1 font-medium">
              <span>Across {savingsGoals.length} savings goals</span>
            </div>
          </div>
        </div>
      </div>

      {/* Monthly Budget Runway Alert & Health Gauge */}
      <div className="bg-white p-5 sm:p-6 rounded-3xl border border-slate-200/80 shadow-sm space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h2 className="text-sm font-bold text-slate-900">
              Monthly Budget Safety Pacing
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              {remainingBudget > 0
                ? `${formatCurrency(remainingBudget, settings.currency)} remaining for the next ${daysRemaining} days (${formatCurrency(dailyRunway, settings.currency)}/day safe runway)`
                : `Budget ceiling reached for this month.`}
            </p>
          </div>

          <button
            onClick={() => onNavigate('budgets')}
            className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 self-start sm:self-auto"
          >
            <span>Adjust Category Limits</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Progress Bar with Color Thresholds */}
        <div className="relative w-full bg-slate-100 h-3 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-500 ${
              budgetRatio > 95
                ? 'bg-rose-500'
                : budgetRatio > 75
                ? 'bg-amber-500'
                : 'bg-emerald-500'
            }`}
            style={{ width: `${Math.min(100, budgetRatio)}%` }}
          />
        </div>
      </div>

      {/* Two Column Layout: Donut Pie Visualizer + Savings Milestones */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Interactive Category Donut / Pie Breakdown */}
        <div className="lg:col-span-7 bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm flex flex-col">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-4">
            <div>
              <h2 className="text-base font-bold text-slate-900 tracking-tight">
                Expense Categorization
              </h2>
              <p className="text-xs text-slate-500">
                Interactive pie breakdown · Tap slices to inspect
              </p>
            </div>
            <button
              onClick={() => onNavigate('analytics')}
              className="text-xs font-semibold text-slate-600 hover:text-slate-900 flex items-center gap-1"
            >
              <span>Full Analytics</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <DonutPieChart
            categories={currentMonthSummary.categoryBreakdown}
            totalExpenses={currentMonthSummary.totalExpenses}
            currency={settings.currency}
            selectedCategoryId={selectedCategoryId}
            onSelectCategory={(id) => setSelectedCategoryId(id)}
          />
        </div>

        {/* Right: Active Savings Milestones */}
        <div className="lg:col-span-5 bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-4">
              <div>
                <h2 className="text-base font-bold text-slate-900 tracking-tight">
                  Savings Goal Milestones
                </h2>
                <p className="text-xs text-slate-500">
                  Ring progress towards life objectives
                </p>
              </div>
              <button
                onClick={() => onNavigate('savings')}
                className="text-xs font-semibold text-slate-600 hover:text-slate-900 flex items-center gap-1"
              >
                <span>View All</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="space-y-3">
              {savingsGoals.length === 0 ? (
                <div className="py-6 text-center space-y-2">
                  <div className="w-10 h-10 rounded-2xl bg-slate-100 text-slate-400 mx-auto flex items-center justify-center">
                    <PiggyBank className="w-5 h-5" />
                  </div>
                  <p className="text-xs font-semibold text-slate-700">No savings goals created yet</p>
                  <p className="text-[11px] text-slate-400 max-w-[240px] mx-auto">
                    Set milestone targets for emergency reserves, vacations, or major purchases.
                  </p>
                  <button
                    onClick={() => onNavigate('savings')}
                    className="mt-1 px-3 py-1.5 text-xs font-semibold bg-slate-900 text-white rounded-xl shadow-xs"
                  >
                    + Create First Goal
                  </button>
                </div>
              ) : (
                savingsGoals.slice(0, 3).map((goal) => {
                  const pct = Math.min(100, Math.round((goal.currentAmount / goal.targetAmount) * 100));
                  return (
                    <div
                      key={goal.id}
                      className="p-3.5 rounded-2xl bg-slate-50/70 border border-slate-100 flex items-center justify-between gap-3 group hover:bg-slate-100/60 transition-colors"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <ProgressRing
                          progress={pct}
                          size={48}
                          strokeWidth={5}
                          color={goal.color}
                          trackColor="#E2E8F0"
                        >
                          <span className="text-[10px] font-bold text-slate-800 tabular-nums">
                            {pct}%
                          </span>
                        </ProgressRing>

                        <div className="min-w-0">
                          <h3 className="text-xs font-bold text-slate-900 truncate">
                            {goal.title}
                          </h3>
                          <p className="text-[11px] text-slate-500 tabular-nums">
                            {formatCurrency(goal.currentAmount, settings.currency)} of{' '}
                            {formatCurrency(goal.targetAmount, settings.currency)}
                          </p>
                        </div>
                      </div>

                      <button
                        onClick={() => onContributeGoal(goal)}
                        className="px-3 py-1.5 text-xs font-semibold bg-white border border-slate-200 text-slate-800 rounded-xl hover:bg-slate-900 hover:text-white transition-all shadow-xs shrink-0"
                      >
                        + Deposit
                      </button>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            {savingsGoals[0] ? (
              <>
                <span className="truncate max-w-[180px]">Next: {savingsGoals[0].title}</span>
                <span className="font-semibold text-slate-800">
                  {Math.min(100, Math.round((savingsGoals[0].currentAmount / savingsGoals[0].targetAmount) * 100))}% Funded
                </span>
              </>
            ) : (
              <>
                <span>Ready to start saving</span>
                <span className="font-semibold text-slate-800">$0 Total Saved</span>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Recent Ledger Feed */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div>
            <h2 className="text-base font-bold text-slate-900 tracking-tight">
              Recent Transactions
            </h2>
            <p className="text-xs text-slate-500">
              Latest activity recorded for {currentMonthSummary.label}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={onOpenAddModal}
              className="text-xs font-semibold text-indigo-600 hover:text-indigo-800"
            >
              + Add
            </button>
            <button
              onClick={() => onNavigate('ledger')}
              className="text-xs font-semibold text-slate-600 hover:text-slate-900 flex items-center gap-0.5"
            >
              <span>See All</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {recentTransactions.length === 0 ? (
          <p className="text-xs text-slate-400 py-6 text-center">No transactions recorded for this period.</p>
        ) : (
          <div className="divide-y divide-slate-100">
            {recentTransactions.map((tx) => {
              const cat = categoryMap.get(tx.categoryId);
              const isIncome = tx.type === 'income';
              const isSavings = tx.type === 'savings';

              return (
                <div
                  key={tx.id}
                  className="py-3 flex items-center justify-between gap-3 hover:bg-slate-50/80 px-2 rounded-xl transition-colors"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
                      style={{
                        backgroundColor: isIncome ? '#EBF9EE' : isSavings ? '#EEF0FF' : (cat?.bgColor || '#F1F5F9'),
                        color: isIncome ? '#16A34A' : isSavings ? '#5856D6' : (cat?.color || '#475569'),
                      }}
                    >
                      {getCategoryIcon(cat?.iconName || (isIncome ? 'briefcase' : isSavings ? 'piggybank' : 'dollar'), {
                        className: 'w-4 h-4',
                      })}
                    </div>

                    <div className="min-w-0">
                      <p className="text-xs font-bold text-slate-900 truncate">
                        {tx.merchant}
                      </p>
                      <div className="flex items-center gap-1.5 text-[11px] text-slate-500">
                        <span>{cat?.name || (isIncome ? 'Income' : 'Savings Goal')}</span>
                        <span aria-hidden="true">·</span>
                        <span>{formatRelativeDate(tx.date)}</span>
                        {tx.note && (
                          <>
                            <span aria-hidden="true">·</span>
                            <span className="truncate max-w-[140px] text-slate-400">{tx.note}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <p
                      className={`text-xs font-extrabold tabular-nums ${
                        isIncome
                          ? 'text-emerald-600'
                          : isSavings
                          ? 'text-indigo-600'
                          : 'text-slate-900'
                      }`}
                    >
                      {isIncome ? '+' : isSavings ? '' : '-'}
                      {formatCurrency(tx.amount, settings.currency)}
                    </p>
                    <span className="text-[10px] text-slate-400 capitalize">
                      {tx.paymentMethod.replace('_', ' ')}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
