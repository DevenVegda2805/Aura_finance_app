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
  Zap,
  Plus,
  AlertTriangle,
  AlertCircle,
  X,
  SlidersHorizontal,
} from 'lucide-react';
import { ActiveTab } from '../layout/Header';
import { DashboardWidgetsConfig, DetectedExpense, SavingsGoal } from '../../types/finance';
import { CustomizeDashboardModal } from '../modals/CustomizeDashboardModal';
import { DEFAULT_DASHBOARD_WIDGETS } from '../../data/seedData';

interface OverviewViewProps {
  store: FinanceStore;
  onNavigate: (tab: ActiveTab) => void;
  onOpenAddModal: () => void;
  onContributeGoal: (goal: SavingsGoal) => void;
  onOpenCategorizeModal?: (exp: DetectedExpense) => void;
  onOpenAlertsDrawer?: () => void;
}

export const OverviewView: React.FC<OverviewViewProps> = ({
  store,
  onNavigate,
  onOpenAddModal,
  onContributeGoal,
  onOpenCategorizeModal,
  onOpenAlertsDrawer,
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
    activeBudgetAlerts,
    settings,
  } = store;

  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);
  const [isCustomizeModalOpen, setIsCustomizeModalOpen] = useState(false);

  const widgets: DashboardWidgetsConfig = {
    ...DEFAULT_DASHBOARD_WIDGETS,
    ...(settings.dashboardWidgets || {}),
  };

  const hiddenWidgetsCount = Object.keys(widgets).filter(
    (k) => !widgets[k as keyof DashboardWidgetsConfig]
  ).length;

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
          <div className="flex items-center flex-wrap gap-2 text-xs text-slate-500 dark:text-slate-400 font-medium">
            <span>Financial Command Center</span>
            <span aria-hidden="true">·</span>
            <span className="font-semibold text-slate-700 dark:text-slate-300">{settings.userName}</span>
            <span aria-hidden="true">·</span>
            <span className="inline-flex items-center gap-1 text-[11px] text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800 font-semibold">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Device Data Remembered
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white mt-1">
            Welcome back, {settings.userName.split(' ')[0]}
          </h1>
        </div>

        {/* Top Actions: Customize View & Month Selector */}
        <div className="flex items-center gap-2 self-start sm:self-auto flex-wrap">
          {/* Customize Front Page Button */}
          <button
            type="button"
            onClick={() => setIsCustomizeModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800 shadow-xs transition-all cursor-pointer"
            title="Customize Front Page layout & remove clutter"
          >
            <SlidersHorizontal className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
            <span>Customize View</span>
            {hiddenWidgetsCount > 0 && (
              <span className="ml-0.5 text-[10px] px-1.5 py-0.2 rounded-full bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800 font-bold">
                {hiddenWidgetsCount} hidden
              </span>
            )}
          </button>

          {/* Month Selector Dropdown */}
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

      {/* UPI & Payment App Integration Banner */}
      {widgets.showUpiBanner !== false && (
        <div className="bg-gradient-to-r from-purple-950 via-slate-900 to-indigo-950 rounded-3xl p-5 text-white shadow-md flex flex-col md:flex-row md:items-center justify-between gap-4 border border-purple-900/40 relative animate-in fade-in duration-200">
          <div className="flex items-center gap-3.5 min-w-0 pr-8 md:pr-0">
            <div className="w-11 h-11 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center shrink-0 border border-white/20">
              <Zap className="w-6 h-6 text-amber-300" />
            </div>
            <div>
              <div className="flex items-center flex-wrap gap-2">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-purple-200 bg-purple-500/30 px-2.5 py-0.5 rounded-full border border-purple-400/30">
                  Auto-Expense Detection
                </span>
                <span className="text-slate-300 text-xs hidden sm:inline">
                  PhonePe · Apple Pay · Google Pay · Paytm
                </span>
              </div>
              <h2 className="text-base font-bold text-white mt-1">
                Live UPI &amp; Mobile Payment Integration
              </h2>
              <p className="text-xs text-purple-200/80 mt-0.5 max-w-xl">
                Aura sees the expense from your payment apps, asks you only which category to store it in, and handles the rest automatically!
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => {
                const detected = store.simulateIncomingPayment('phonepe_swiggy');
                if (onOpenCategorizeModal) onOpenCategorizeModal(detected);
              }}
              className="px-3.5 py-2 bg-white/15 hover:bg-white/25 active:scale-95 text-white text-xs font-semibold rounded-xl border border-white/20 transition-all flex items-center gap-1.5 cursor-pointer"
              title="Simulate incoming PhonePe alert"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              <span>Simulate Expense</span>
            </button>

            <button
              onClick={() => onNavigate('payments')}
              className="px-4 py-2 bg-white text-slate-900 hover:bg-slate-100 active:scale-95 text-xs font-bold rounded-xl shadow-xs transition-all flex items-center gap-1 cursor-pointer"
            >
              <span>Payment Hub</span>
              <ChevronRight className="w-3.5 h-3.5 text-slate-700" />
            </button>

            {/* Quick Remove from Front Page Button */}
            <button
              type="button"
              onClick={() => store.dismissFrontPageWidget('showUpiBanner')}
              title="Remove Live UPI banner from front page (can be restored in Customize View)"
              aria-label="Remove Live UPI banner"
              className="w-8 h-8 rounded-xl bg-white/10 hover:bg-white/25 text-purple-200 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Clean Slate Quick Actions when 0 transactions exist */}
      {widgets.showFreshSlateCard !== false && transactions.length === 0 && (
        <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4 animate-in fade-in duration-200">
          <div className="space-y-1 pr-8 md:pr-0">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Fresh Slate Ledger · Ready for Your Expenses &amp; Savings
              </h3>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-xl">
              You are starting completely clean with 0 auto-generated expenses. Everything you log or detect via PhonePe, Apple Pay, Google Pay, or Paytm will be permanently remembered.
            </p>
          </div>

          <div className="flex items-center flex-wrap gap-2 shrink-0">
            <button
              onClick={onOpenAddModal}
              className="px-3.5 py-2 bg-slate-900 dark:bg-indigo-600 hover:bg-slate-800 dark:hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all active:scale-95 cursor-pointer shadow-xs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Log First Expense</span>
            </button>
            <button
              onClick={() => {
                const detected = store.simulateIncomingPayment('phonepe_swiggy');
                if (onOpenCategorizeModal) onOpenCategorizeModal(detected);
              }}
              className="px-3.5 py-2 bg-indigo-50 dark:bg-indigo-950/60 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all active:scale-95 cursor-pointer"
            >
              <Zap className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
              <span>Test UPI Payment</span>
            </button>
            <button
              onClick={store.loadSampleTestData}
              className="px-3 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-xl text-xs font-medium flex items-center gap-1.5 transition-all active:scale-95 cursor-pointer"
              title="Populate test records to verify all working components, charts, and reports"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span>Load Test Records</span>
            </button>

            {/* Quick Remove from Front Page Button */}
            <button
              type="button"
              onClick={() => store.dismissFrontPageWidget('showFreshSlateCard')}
              title="Remove fresh slate card from front page (can be restored in Customize View)"
              aria-label="Remove fresh slate card"
              className="w-8 h-8 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 flex items-center justify-center transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Apple Wallet Style Hero KPI Cards */}
      {widgets.showKpiCards !== false && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 animate-in fade-in duration-150">
          {/* Total Expenses / Outflow */}
          <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-col justify-between">
            <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
              <span>Total Outflow</span>
              <div className="w-7 h-7 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                <TrendingDown className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-4">
              <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight tabular-nums">
                {formatCurrency(currentMonthSummary.totalExpenses, settings.currency)}
              </span>
              <div className="flex items-center gap-1.5 text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                <span>Limit: {formatCurrency(totalMonthlyBudget, settings.currency)}</span>
                <span aria-hidden="true">·</span>
                <span
                  className={`font-semibold ${
                    budgetRatio > 90 ? 'text-rose-600 dark:text-rose-400' : 'text-slate-700 dark:text-slate-300'
                  }`}
                >
                  {Math.round(budgetRatio)}% utilized
                </span>
              </div>
            </div>
          </div>

          {/* Total Income / Inflow */}
          <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-col justify-between">
            <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
              <span>Total Inflow</span>
              <div className="w-7 h-7 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                <TrendingUp className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-4">
              <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight tabular-nums">
                {formatCurrency(currentMonthSummary.totalIncome, settings.currency)}
              </span>
              <div className="flex items-center gap-1.5 text-[11px] text-emerald-600 dark:text-emerald-400 mt-1 font-medium">
                <span>
                  Net Surplus:{' '}
                  {formatCurrency(
                    Math.max(0, currentMonthSummary.totalIncome - currentMonthSummary.totalExpenses),
                    settings.currency
                  )}
                </span>
              </div>
            </div>
          </div>

          {/* Monthly Net Savings Rate */}
          <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-col justify-between">
            <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
              <span>Savings Rate</span>
              <div className="w-7 h-7 rounded-xl bg-sky-50 dark:bg-sky-950/60 text-sky-600 dark:text-sky-400 flex items-center justify-center">
                <PiggyBank className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-4">
              <div className="flex items-baseline gap-2">
                <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight tabular-nums">
                  {currentMonthSummary.netSavingsRate}%
                </span>
                <span className="text-xs text-slate-400 dark:text-slate-500 font-medium">of income kept</span>
              </div>
              <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full mt-2 overflow-hidden">
                <div
                  className="bg-sky-500 h-full rounded-full transition-all duration-500"
                  style={{ width: `${Math.min(100, currentMonthSummary.netSavingsRate)}%` }}
                />
              </div>
            </div>
          </div>

          {/* Accumulated Vault Reserves */}
          <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-col justify-between">
            <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
              <span>Goal Reserves</span>
              <div className="w-7 h-7 rounded-xl bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 flex items-center justify-center">
                <ShieldCheck className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-4">
              <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight tabular-nums">
                {formatCurrency(totalAccumulatedSavings, settings.currency)}
              </span>
              <div className="flex items-center gap-1.5 text-[11px] text-purple-700 dark:text-purple-300 mt-1 font-medium">
                <span>Across {savingsGoals.length} savings goals</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Monthly Budget Runway Alert & Health Gauge */}
      {widgets.showBudgetRunwayGauge !== false && (
        <div className="bg-white dark:bg-slate-900 p-5 sm:p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-3 animate-in fade-in duration-150">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h2 className="text-sm font-bold text-slate-900 dark:text-white">
                Monthly Budget Safety Pacing
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                {remainingBudget > 0
                  ? `${formatCurrency(remainingBudget, settings.currency)} remaining for the next ${daysRemaining} days (${formatCurrency(dailyRunway, settings.currency)}/day safe runway)`
                  : `Budget ceiling reached for this month.`}
              </p>
            </div>

            <button
              onClick={() => onNavigate('budgets')}
              className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 flex items-center gap-1 self-start sm:self-auto cursor-pointer"
            >
              <span>Adjust Category Limits</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Progress Bar with Color Thresholds */}
          <div className="relative w-full bg-slate-100 dark:bg-slate-800 h-3 rounded-full overflow-hidden">
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
      )}

      {/* Active Category Budget Watchlist */}
      {widgets.showBudgetAlertsWatchlist !== false && activeBudgetAlerts.length > 0 && (
        <div className="bg-amber-50/60 dark:bg-amber-950/30 p-5 rounded-3xl border border-amber-200/80 dark:border-amber-900/60 shadow-xs space-y-3 animate-in fade-in duration-150">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-amber-500 text-white flex items-center justify-center font-bold text-xs shadow-xs">
                <AlertTriangle className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  Budget Alert Watchlist ({activeBudgetAlerts.length} Flagged)
                </h3>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  Categories approaching or exceeding monthly spending limits
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {onOpenAlertsDrawer && (
                <button
                  onClick={onOpenAlertsDrawer}
                  className="text-xs font-semibold text-amber-900 dark:text-amber-300 hover:underline flex items-center gap-0.5 cursor-pointer"
                >
                  <span>Review Watchlist</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 pt-1">
            {activeBudgetAlerts.slice(0, 3).map((alert) => (
              <div
                key={alert.id}
                onClick={() => onNavigate('budgets')}
                className="p-3 bg-white dark:bg-slate-900 hover:border-slate-300 dark:hover:border-slate-700 rounded-2xl border border-slate-200/80 dark:border-slate-800 flex items-center justify-between gap-2 shadow-xs cursor-pointer transition-all"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div
                    className="w-8 h-8 rounded-xl flex items-center justify-center text-white shrink-0 text-xs shadow-xs"
                    style={{ backgroundColor: alert.categoryColor }}
                  >
                    {getCategoryIcon(alert.categoryIcon, { className: 'w-4 h-4' })}
                  </div>
                  <div className="min-w-0">
                    <span className="text-xs font-bold text-slate-900 dark:text-white truncate block">
                      {alert.categoryName}
                    </span>
                    <span className="text-[10px] text-slate-400 dark:text-slate-500 tabular-nums">
                      {formatCurrency(alert.spent, settings.currency)} / {formatCurrency(alert.limit, settings.currency)}
                    </span>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <span
                    className={`text-xs font-extrabold tabular-nums px-2 py-0.5 rounded-lg block ${
                      alert.severity === 'critical'
                        ? 'bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300'
                        : 'bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300'
                    }`}
                  >
                    {alert.percentage}%
                  </span>
                  <span className="text-[9px] text-slate-400 dark:text-slate-500 font-medium mt-0.5 block">
                    {alert.severity === 'critical' ? 'Exceeded' : 'Nearing Cap'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Two Column Layout: Donut Pie Visualizer + Savings Milestones */}
      {(widgets.showCategoryDonut !== false || widgets.showSavingsGoals !== false) && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 animate-in fade-in duration-150">
          {/* Left: Interactive Category Donut / Pie Breakdown */}
          {widgets.showCategoryDonut !== false && (
            <div className={`${widgets.showSavingsGoals !== false ? 'lg:col-span-7' : 'lg:col-span-12'} bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-col`}>
              <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800 mb-4">
                <div>
                  <h2 className="text-base font-bold text-slate-900 dark:text-white tracking-tight">
                    Expense Categorization
                  </h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Interactive pie breakdown · Tap slices to inspect
                  </p>
                </div>
                <button
                  onClick={() => onNavigate('analytics')}
                  className="text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white flex items-center gap-1 cursor-pointer"
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
          )}

          {/* Right: Active Savings Milestones */}
          {widgets.showSavingsGoals !== false && (
            <div className={`${widgets.showCategoryDonut !== false ? 'lg:col-span-5' : 'lg:col-span-12'} bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-col justify-between`}>
              <div>
                <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800 mb-4">
                  <div>
                    <h2 className="text-base font-bold text-slate-900 dark:text-white tracking-tight">
                      Savings Goal Milestones
                    </h2>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Ring progress towards life objectives
                    </p>
                  </div>
                  <button
                    onClick={() => onNavigate('savings')}
                    className="text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white flex items-center gap-1 cursor-pointer"
                  >
                    <span>View All</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="space-y-3">
                  {savingsGoals.length === 0 ? (
                    <div className="py-6 text-center space-y-2">
                      <div className="w-10 h-10 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500 mx-auto flex items-center justify-center">
                        <PiggyBank className="w-5 h-5" />
                      </div>
                      <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                        No savings goals created yet
                      </p>
                      <p className="text-[11px] text-slate-400 dark:text-slate-500 max-w-[240px] mx-auto">
                        Set milestone targets for emergency reserves, vacations, or major purchases.
                      </p>
                      <button
                        onClick={() => onNavigate('savings')}
                        className="mt-1 px-3 py-1.5 text-xs font-semibold bg-slate-900 dark:bg-indigo-600 text-white rounded-xl shadow-xs cursor-pointer"
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
                          className="p-3.5 rounded-2xl bg-slate-50/70 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 flex items-center justify-between gap-3 group hover:bg-slate-100/60 dark:hover:bg-slate-800 transition-colors"
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <ProgressRing
                              progress={pct}
                              size={48}
                              strokeWidth={5}
                              color={goal.color}
                              trackColor="#334155"
                            >
                              <span className="text-[10px] font-bold text-slate-800 dark:text-slate-200 tabular-nums">
                                {pct}%
                              </span>
                            </ProgressRing>

                            <div className="min-w-0">
                              <h3 className="text-xs font-bold text-slate-900 dark:text-white truncate">
                                {goal.title}
                              </h3>
                              <p className="text-[11px] text-slate-500 dark:text-slate-400 tabular-nums">
                                {formatCurrency(goal.currentAmount, settings.currency)} of{' '}
                                {formatCurrency(goal.targetAmount, settings.currency)}
                              </p>
                            </div>
                          </div>

                          <button
                            onClick={() => onContributeGoal(goal)}
                            className="px-3 py-1.5 text-xs font-semibold bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 rounded-xl hover:bg-slate-900 dark:hover:bg-indigo-600 hover:text-white transition-all shadow-xs shrink-0 cursor-pointer"
                          >
                            + Deposit
                          </button>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                {savingsGoals[0] ? (
                  <>
                    <span className="truncate max-w-[180px]">Next: {savingsGoals[0].title}</span>
                    <span className="font-semibold text-slate-800 dark:text-slate-200">
                      {Math.min(100, Math.round((savingsGoals[0].currentAmount / savingsGoals[0].targetAmount) * 100))}% Funded
                    </span>
                  </>
                ) : (
                  <>
                    <span>Ready to start saving</span>
                    <span className="font-semibold text-slate-800 dark:text-slate-200">$0 Total Saved</span>
                  </>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Recent Ledger Feed */}
      {widgets.showRecentTransactions !== false && (
        <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4 animate-in fade-in duration-150">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white tracking-tight">
                Recent Transactions
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Latest activity recorded for {currentMonthSummary.label}
              </p>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={onOpenAddModal}
                className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 cursor-pointer"
              >
                + Add
              </button>
              <button
                onClick={() => onNavigate('ledger')}
                className="text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white flex items-center gap-0.5 cursor-pointer"
              >
                <span>See All</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {recentTransactions.length === 0 ? (
            <p className="text-xs text-slate-400 dark:text-slate-500 py-6 text-center">
              No transactions recorded for this period.
            </p>
          ) : (
            <div className="divide-y divide-slate-100 dark:divide-slate-800">
              {recentTransactions.map((tx) => {
                const cat = categoryMap.get(tx.categoryId);
                const isIncome = tx.type === 'income';
                const isSavings = tx.type === 'savings';

                return (
                  <div
                    key={tx.id}
                    className="py-3 flex items-center justify-between gap-3 hover:bg-slate-50/80 dark:hover:bg-slate-800/50 px-2 rounded-xl transition-colors"
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
                        <p className="text-xs font-bold text-slate-900 dark:text-white truncate">
                          {tx.merchant}
                        </p>
                        <div className="flex items-center gap-1.5 text-[11px] text-slate-500 dark:text-slate-400">
                          <span>{cat?.name || (isIncome ? 'Income' : 'Savings Goal')}</span>
                          <span aria-hidden="true">·</span>
                          <span>{formatRelativeDate(tx.date)}</span>
                          {tx.note && (
                            <>
                              <span aria-hidden="true">·</span>
                              <span className="truncate max-w-[140px] text-slate-400 dark:text-slate-500">
                                {tx.note}
                              </span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <p
                        className={`text-xs font-extrabold tabular-nums ${
                          isIncome
                            ? 'text-emerald-600 dark:text-emerald-400'
                            : isSavings
                            ? 'text-indigo-600 dark:text-indigo-400'
                            : 'text-slate-900 dark:text-white'
                        }`}
                      >
                        {isIncome ? '+' : isSavings ? '' : '-'}
                        {formatCurrency(tx.amount, settings.currency)}
                      </p>
                      <span className="text-[10px] text-slate-400 dark:text-slate-500 capitalize">
                        {tx.paymentMethod.replace('_', ' ')}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Customize Front Page Modal */}
      <CustomizeDashboardModal
        isOpen={isCustomizeModalOpen}
        onClose={() => setIsCustomizeModalOpen(false)}
        widgets={widgets}
        onUpdateWidgets={store.updateDashboardWidgets}
        onResetToDefaults={store.resetDashboardLayout}
        onApplyMinimalist={store.applyMinimalistDashboard}
      />
    </div>
  );
};
