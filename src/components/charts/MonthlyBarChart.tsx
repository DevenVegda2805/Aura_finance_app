import React, { useState } from 'react';
import { MonthSummary, CurrencyCode } from '../../types/finance';
import { formatCurrency, formatCompactCurrency } from '../../utils/formatters';

interface MonthlyBarChartProps {
  monthSummaries: MonthSummary[];
  currency: CurrencyCode;
  selectedMonth: string;
  onSelectMonth?: (monthKey: string) => void;
}

export const MonthlyBarChart: React.FC<MonthlyBarChartProps> = ({
  monthSummaries,
  currency,
  selectedMonth,
  onSelectMonth,
}) => {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  // Take chronological order (oldest to newest) for chart timeline
  const chartData = [...monthSummaries].reverse();

  // Find max value across all months for dynamic scaling
  const maxVal = Math.max(
    ...chartData.map((m) => Math.max(m.totalIncome, m.totalExpenses, m.totalSavings, 1000)),
    4000
  );

  return (
    <div className="w-full">
      {/* Legend & Summary Metrics */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6 text-xs text-slate-500 dark:text-slate-400">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-sm bg-emerald-500" />
            <span className="font-medium text-slate-700 dark:text-slate-300">Inflow</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-sm bg-indigo-500" />
            <span className="font-medium text-slate-700 dark:text-slate-300">Outflow (Spent)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-sm bg-sky-400" />
            <span className="font-medium text-slate-700 dark:text-slate-300">Saved</span>
          </div>
        </div>

        <div className="text-[11px] text-slate-400 dark:text-slate-500">
          Showing 3-Month Trajectory
        </div>
      </div>

      {/* Bar Chart Container */}
      <div className="relative h-64 w-full flex items-end justify-between gap-4 pt-8 pb-8 border-b border-slate-200 dark:border-slate-800">
        {/* Background Grid Lines */}
        <div className="absolute inset-0 flex flex-col justify-between pointer-events-none pb-8 text-[10px] text-slate-400 dark:text-slate-500 tabular-nums">
          <div className="border-b border-dashed border-slate-200/80 dark:border-slate-800/80 w-full flex justify-between">
            <span>{formatCompactCurrency(maxVal, currency)}</span>
          </div>
          <div className="border-b border-dashed border-slate-200/80 dark:border-slate-800/80 w-full flex justify-between">
            <span>{formatCompactCurrency(maxVal * 0.5, currency)}</span>
          </div>
          <div className="border-b border-slate-200 dark:border-slate-800 w-full flex justify-between">
            <span>{formatCompactCurrency(0, currency)}</span>
          </div>
        </div>

        {/* Month Columns */}
        {chartData.map((item, idx) => {
          const isSelected = item.monthKey === selectedMonth;
          const isHovered = hoveredIndex === idx;

          const incomeHeight = Math.max(6, (item.totalIncome / maxVal) * 100);
          const expenseHeight = Math.max(6, (item.totalExpenses / maxVal) * 100);
          const savingsHeight = Math.max(6, (item.totalSavings / maxVal) * 100);

          return (
            <div
              key={item.monthKey}
              onClick={() => onSelectMonth && onSelectMonth(item.monthKey)}
              onMouseEnter={() => setHoveredIndex(idx)}
              onMouseLeave={() => setHoveredIndex(null)}
              className={`relative flex-1 flex flex-col items-center h-full justify-end cursor-pointer group transition-all ${
                isSelected ? 'opacity-100' : 'opacity-85 hover:opacity-100'
              }`}
            >
              {/* Tooltip on Hover */}
              {isHovered && (
                <div className="absolute -top-14 z-20 bg-slate-900 dark:bg-slate-800 border border-slate-700 text-white text-xs rounded-xl px-3 py-2 shadow-xl whitespace-nowrap pointer-events-none transform -translate-y-1 transition-transform">
                  <div className="font-semibold">{item.label}</div>
                  <div className="text-[11px] text-slate-300 dark:text-slate-400 flex items-center gap-2 mt-0.5">
                    <span>Inflow: {formatCurrency(item.totalIncome, currency)}</span>
                    <span>·</span>
                    <span>Spent: {formatCurrency(item.totalExpenses, currency)}</span>
                  </div>
                </div>
              )}

              {/* Tri-Bar Cluster */}
              <div className="w-full max-w-[80px] flex items-end justify-center gap-1.5 sm:gap-2 h-full z-10 pb-1">
                {/* Income Bar */}
                <div
                  style={{ height: `${incomeHeight}%` }}
                  className="w-1/3 max-w-[16px] bg-emerald-500 rounded-t-md transition-all duration-300 group-hover:bg-emerald-400"
                  title={`Income: ${formatCurrency(item.totalIncome, currency)}`}
                />

                {/* Expense Bar */}
                <div
                  style={{ height: `${expenseHeight}%` }}
                  className="w-1/3 max-w-[16px] bg-indigo-500 rounded-t-md transition-all duration-300 group-hover:bg-indigo-400"
                  title={`Expenses: ${formatCurrency(item.totalExpenses, currency)}`}
                />

                {/* Savings Bar */}
                <div
                  style={{ height: `${savingsHeight}%` }}
                  className="w-1/3 max-w-[16px] bg-sky-400 rounded-t-md transition-all duration-300 group-hover:bg-sky-300"
                  title={`Savings: ${formatCurrency(item.totalSavings, currency)}`}
                />
              </div>

              {/* Month Label below bar */}
              <div className="absolute -bottom-7 flex flex-col items-center">
                <span
                  className={`text-xs font-medium whitespace-nowrap transition-colors ${
                    isSelected
                      ? 'text-indigo-600 dark:text-indigo-400 font-bold'
                      : 'text-slate-600 dark:text-slate-400 group-hover:text-slate-900 dark:group-hover:text-white'
                  }`}
                >
                  {item.label.split(' ')[0]}
                </span>
                {isSelected && (
                  <span className="w-1 h-1 rounded-full bg-indigo-600 dark:bg-indigo-400 mt-0.5" />
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
