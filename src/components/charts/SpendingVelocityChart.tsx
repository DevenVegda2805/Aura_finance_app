import React, { useMemo } from 'react';
import { Transaction, CurrencyCode } from '../../types/finance';
import { formatCurrency, formatCompactCurrency } from '../../utils/formatters';

interface SpendingVelocityChartProps {
  transactions: Transaction[];
  monthKey: string;
  monthlyLimit: number;
  currency: CurrencyCode;
}

export const SpendingVelocityChart: React.FC<SpendingVelocityChartProps> = ({
  transactions,
  monthKey,
  monthlyLimit,
  currency,
}) => {
  // Days in selected month
  const [year, month] = monthKey.split('-').map(Number);
  const daysInMonth = new Date(year, month, 0).getDate();

  // Current day of month (or last day if viewing a past month)
  const today = new Date();
  const currentMonthKey = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`;
  const isCurrentMonth = monthKey === currentMonthKey;
  const activeDay = isCurrentMonth ? Math.min(today.getDate(), daysInMonth) : daysInMonth;

  // Aggregate spending by day
  const { cumulativeSpending, totalSpentSoFar, pointsString, areaString, targetPointsString } = useMemo(() => {
    const dailyExpenses: number[] = new Array(daysInMonth + 1).fill(0);

    transactions
      .filter((t) => t.date.startsWith(monthKey) && t.type === 'expense')
      .forEach((t) => {
        const day = parseInt(t.date.split('-')[2], 10);
        if (day >= 1 && day <= daysInMonth) {
          dailyExpenses[day] += t.amount;
        }
      });

    // Compute cumulative curve
    const cumulative: number[] = [0];
    let running = 0;
    for (let day = 1; day <= daysInMonth; day++) {
      if (day <= activeDay) {
        running += dailyExpenses[day];
        cumulative.push(Number(running.toFixed(2)));
      } else {
        cumulative.push(running); // Projected flatline for future days
      }
    }

    const spentSoFar = cumulative[activeDay] || 0;

    // SVG coordinates
    const width = 600;
    const height = 180;
    const padding = { top: 20, right: 20, bottom: 25, left: 45 };
    const chartW = width - padding.left - padding.right;
    const chartH = height - padding.top - padding.bottom;

    const maxScale = Math.max(monthlyLimit * 1.15, running * 1.15, 1000);

    const getX = (day: number) => padding.left + ((day - 1) / (daysInMonth - 1)) * chartW;
    const getY = (val: number) => padding.top + chartH - (val / maxScale) * chartH;

    // Actual spending points up to activeDay
    const points: string[] = [];
    for (let d = 1; d <= activeDay; d++) {
      points.push(`${getX(d)},${getY(cumulative[d])}`);
    }

    const ptsStr = points.join(' ');

    // Area closed path
    const areaStr =
      points.length > 0
        ? `M ${getX(1)},${getY(0)} L ${ptsStr} L ${getX(activeDay)},${getY(0)} Z`
        : '';

    // Linear Target runway points (Day 1 to End of Month)
    const targetStart = `${getX(1)},${getY(0)}`;
    const targetEnd = `${getX(daysInMonth)},${getY(monthlyLimit)}`;
    const targetStr = `${targetStart} ${targetEnd}`;

    return {
      cumulativeSpending: cumulative,
      totalSpentSoFar: spentSoFar,
      pointsString: ptsStr,
      areaString: areaStr,
      targetPointsString: targetStr,
    };
  }, [transactions, monthKey, monthlyLimit, daysInMonth, activeDay]);

  const targetSafeBudgetAtDay = (monthlyLimit / daysInMonth) * activeDay;
  const isPacingWell = totalSpentSoFar <= targetSafeBudgetAtDay;

  return (
    <div className="w-full">
      {/* Top Velocity KPI Callout */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4 text-xs">
        <div className="flex items-center gap-2">
          <span
            className={`w-2 h-2 rounded-full ${
              isPacingWell ? 'bg-emerald-500' : 'bg-amber-500'
            }`}
          />
          <span className="font-semibold text-slate-800">
            {isPacingWell ? 'Safe Spending Velocity' : 'Approaching Pace Warning'}
          </span>
          <span className="text-slate-400">
            · Day {activeDay} of {daysInMonth}
          </span>
        </div>

        <div className="flex items-center gap-4 text-slate-500">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-0.5 bg-indigo-600 rounded-full" />
            <span>Actual Spend</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 border-t-2 border-dashed border-slate-400" />
            <span>Budget Ceiling</span>
          </div>
        </div>
      </div>

      {/* Responsive SVG Chart */}
      <div className="w-full h-44 relative bg-slate-50/60 rounded-xl p-2 border border-slate-100">
        <svg
          viewBox="0 0 600 180"
          className="w-full h-full overflow-visible"
          preserveAspectRatio="none"
        >
          <defs>
            <linearGradient id="velocityGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stop-color="#6366F1" stop-opacity="0.25" />
              <stop offset="100%" stop-color="#6366F1" stop-opacity="0.0" />
            </linearGradient>
          </defs>

          {/* Area fill */}
          {areaString && (
            <path d={areaString} fill="url(#velocityGrad)" />
          )}

          {/* Target ceiling line (dashed) */}
          <polyline
            points={targetPointsString}
            fill="none"
            stroke="#94A3B8"
            strokeWidth="1.5"
            strokeDasharray="4 4"
          />

          {/* Actual spending curve */}
          <polyline
            points={pointsString}
            fill="none"
            stroke="#4F46E5"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Current day indicator pulse */}
          {pointsString && (
            <circle
              cx={pointsString.split(' ').pop()?.split(',')[0]}
              cy={pointsString.split(' ').pop()?.split(',')[1]}
              r="4.5"
              fill="#4F46E5"
              stroke="#FFFFFF"
              strokeWidth="2"
            />
          )}
        </svg>

        {/* X-axis indicators */}
        <div className="flex justify-between items-center px-8 mt-1 text-[10px] text-slate-400">
          <span>Day 1</span>
          <span>Day 15</span>
          <span>Day {daysInMonth}</span>
        </div>
      </div>

      <div className="flex items-center justify-between mt-3 text-xs text-slate-500 px-1">
        <span>Current Month Spend: <strong className="text-slate-900 tabular-nums">{formatCurrency(totalSpentSoFar, currency)}</strong></span>
        <span>Monthly Allocation: <strong className="text-slate-900 tabular-nums">{formatCurrency(monthlyLimit, currency)}</strong></span>
      </div>
    </div>
  );
};
