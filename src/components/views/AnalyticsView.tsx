import React, { useState, useMemo } from 'react';
import { FinanceStore } from '../../hooks/useFinanceStore';
import { MonthlyBarChart } from '../charts/MonthlyBarChart';
import { DonutPieChart } from '../charts/DonutPieChart';
import { SpendingVelocityChart } from '../charts/SpendingVelocityChart';
import { formatCurrency, formatCompactCurrency } from '../../utils/formatters';
import { getCategoryIcon } from '../../utils/categoryIcons';
import {
  PieChart,
  BarChart3,
  TrendingUp,
  Store,
  Calendar,
  Layers,
  ArrowUpRight,
  ShieldCheck,
} from 'lucide-react';

interface AnalyticsViewProps {
  store: FinanceStore;
}

export const AnalyticsView: React.FC<AnalyticsViewProps> = ({ store }) => {
  const {
    currentMonthSummary,
    selectedMonth,
    setSelectedMonth,
    availableMonths,
    getMonthSummary,
    transactions,
    categoryMap,
    totalMonthlyBudget,
    totalAccumulatedSavings,
    settings,
  } = store;

  const [activeCategoryId, setActiveCategoryId] = useState<string | null>(null);

  // Summaries across all available months for multi-month bar chart
  const allMonthSummaries = useMemo(() => {
    return availableMonths.map((m) => getMonthSummary(m));
  }, [availableMonths, getMonthSummary]);

  // Top spending merchants for the selected month
  const topMerchants = useMemo(() => {
    const merchantMap: Record<string, { amount: number; count: number; categoryId: string }> = {};

    transactions
      .filter((t) => t.date.startsWith(selectedMonth) && t.type === 'expense')
      .forEach((t) => {
        if (!merchantMap[t.merchant]) {
          merchantMap[t.merchant] = { amount: 0, count: 0, categoryId: t.categoryId };
        }
        merchantMap[t.merchant].amount += t.amount;
        merchantMap[t.merchant].count += 1;
      });

    return Object.entries(merchantMap)
      .map(([name, data]) => ({
        merchant: name,
        amount: data.amount,
        count: data.count,
        categoryId: data.categoryId,
        share:
          currentMonthSummary.totalExpenses > 0
            ? Math.round((data.amount / currentMonthSummary.totalExpenses) * 100)
            : 0,
      }))
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 5);
  }, [transactions, selectedMonth, currentMonthSummary.totalExpenses]);

  // Day-of-week expense distribution
  const dayOfWeekSpending = useMemo(() => {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const totals = [0, 0, 0, 0, 0, 0, 0];

    transactions
      .filter((t) => t.date.startsWith(selectedMonth) && t.type === 'expense')
      .forEach((t) => {
        const [year, month, day] = t.date.split('-').map(Number);
        const dateObj = new Date(year, month - 1, day);
        const dayIdx = dateObj.getDay();
        totals[dayIdx] += t.amount;
      });

    const maxDay = Math.max(...totals, 100);

    return days.map((dayName, idx) => ({
      day: dayName,
      amount: totals[idx],
      pctOfMax: Math.round((totals[idx] / maxDay) * 100),
    }));
  }, [transactions, selectedMonth]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="text-xs text-slate-500 font-medium">
            Visual Intelligence &amp; Data Models
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 mt-0.5">
            Spending &amp; Savings Analytics
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

      {/* Chart 1: Multi-Month Financial Trajectory Bar Graph */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100">
          <div>
            <h2 className="text-base font-bold text-slate-900 tracking-tight flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-indigo-600" />
              <span>Multi-Month Cashflow Graph</span>
            </h2>
            <p className="text-xs text-slate-500">
              Comparative history of Inflow vs Outflow vs Saved across billing cycles
            </p>
          </div>
          <span className="text-xs text-slate-400">Tap any month bar to filter report</span>
        </div>

        <MonthlyBarChart
          monthSummaries={allMonthSummaries}
          currency={settings.currency}
          selectedMonth={selectedMonth}
          onSelectMonth={(m) => setSelectedMonth(m)}
        />
      </div>

      {/* Chart 2: Interactive Donut / Pie Visualization */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div>
            <h2 className="text-base font-bold text-slate-900 tracking-tight flex items-center gap-2">
              <PieChart className="w-4 h-4 text-emerald-600" />
              <span>Category Expense Pie Distribution</span>
            </h2>
            <p className="text-xs text-slate-500">
              Slice proportions for {currentMonthSummary.label}
            </p>
          </div>
        </div>

        <DonutPieChart
          categories={currentMonthSummary.categoryBreakdown}
          totalExpenses={currentMonthSummary.totalExpenses}
          currency={settings.currency}
          selectedCategoryId={activeCategoryId}
          onSelectCategory={(id) => setActiveCategoryId(id)}
        />
      </div>

      {/* Chart 3: Spending Velocity & Runway Pace */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div>
            <h2 className="text-base font-bold text-slate-900 tracking-tight flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-sky-600" />
              <span>Cumulative Spending Velocity Curve</span>
            </h2>
            <p className="text-xs text-slate-500">
              Daily cumulative expenditure progression vs monthly budget ceiling
            </p>
          </div>
        </div>

        <SpendingVelocityChart
          transactions={transactions}
          monthKey={selectedMonth}
          monthlyLimit={totalMonthlyBudget}
          currency={settings.currency}
        />
      </div>

      {/* Two Column Section: Top Merchants + Day-of-Week Rhythm */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top 5 Spending Payees */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h2 className="text-base font-bold text-slate-900 tracking-tight flex items-center gap-2">
                <Store className="w-4 h-4 text-purple-600" />
                <span>Top Spending Merchants</span>
              </h2>
              <p className="text-xs text-slate-500">
                Largest total payee outflows in {currentMonthSummary.label}
              </p>
            </div>
          </div>

          {topMerchants.length === 0 ? (
            <p className="text-xs text-slate-400 py-6 text-center">No merchant data recorded yet.</p>
          ) : (
            <div className="space-y-3">
              {topMerchants.map((item, idx) => {
                const cat = categoryMap.get(item.categoryId);
                return (
                  <div
                    key={item.merchant}
                    className="p-3 rounded-2xl bg-slate-50/70 border border-slate-100 flex items-center justify-between gap-3"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <span className="w-6 text-xs font-bold text-slate-400 tabular-nums">
                        #{idx + 1}
                      </span>
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-slate-900 truncate">
                          {item.merchant}
                        </p>
                        <p className="text-[11px] text-slate-500">
                          {cat?.name || 'General'} · {item.count} {item.count === 1 ? 'charge' : 'charges'}
                        </p>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <span className="text-xs font-extrabold text-slate-900 tabular-nums">
                        {formatCurrency(item.amount, settings.currency)}
                      </span>
                      <span className="block text-[10px] text-slate-500 tabular-nums">
                        {item.share}% of spend
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Day-of-Week Rhythm */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h2 className="text-base font-bold text-slate-900 tracking-tight flex items-center gap-2">
                <Layers className="w-4 h-4 text-amber-600" />
                <span>Day-of-Week Spending Heat</span>
              </h2>
              <p className="text-xs text-slate-500">
                Weekly behavioral cadence for {currentMonthSummary.label}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-7 gap-2 pt-4">
            {dayOfWeekSpending.map((d) => (
              <div key={d.day} className="flex flex-col items-center gap-2">
                {/* Bar */}
                <div className="w-full bg-slate-100 h-28 rounded-xl flex items-end p-1">
                  <div
                    className="w-full bg-slate-900 rounded-lg transition-all duration-500 hover:bg-indigo-600"
                    style={{ height: `${Math.max(8, d.pctOfMax)}%` }}
                    title={`${d.day}: ${formatCurrency(d.amount, settings.currency)}`}
                  />
                </div>
                {/* Day Label */}
                <span className="text-[11px] font-semibold text-slate-600">
                  {d.day}
                </span>
                <span className="text-[9px] text-slate-400 tabular-nums truncate max-w-full">
                  {formatCompactCurrency(d.amount, settings.currency)}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
