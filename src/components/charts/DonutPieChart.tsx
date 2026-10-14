import React, { useState, useMemo } from 'react';
import { MonthlyCategorySpending, CurrencyCode } from '../../types/finance';
import { formatCurrency } from '../../utils/formatters';
import { getCategoryIcon } from '../../utils/categoryIcons';

interface DonutPieChartProps {
  categories: MonthlyCategorySpending[];
  totalExpenses: number;
  currency: CurrencyCode;
  onSelectCategory?: (categoryId: string | null) => void;
  selectedCategoryId?: string | null;
}

export const DonutPieChart: React.FC<DonutPieChartProps> = ({
  categories,
  totalExpenses,
  currency,
  onSelectCategory,
  selectedCategoryId,
}) => {
  const [hoveredCategoryId, setHoveredCategoryId] = useState<string | null>(null);

  // Active category is either hovered or explicitly selected
  const activeCategoryId = hoveredCategoryId || selectedCategoryId;

  // Filter categories with spending > 0
  const activeSlices = useMemo(() => {
    return categories.filter((c) => c.spent > 0);
  }, [categories]);

  // Compute SVG arcs
  const radius = 96;
  const strokeWidth = 28;
  const center = 120;
  const circumference = 2 * Math.PI * radius;

  // Compute slice angles & stroke dash properties
  const slicesData = useMemo(() => {
    if (totalExpenses <= 0 || activeSlices.length === 0) {
      return [];
    }

    let accumulatedAngle = -90; // Start at top (12 o'clock)

    return activeSlices.map((item) => {
      const fraction = item.spent / totalExpenses;
      const arcLength = fraction * circumference;
      const angle = fraction * 360;
      const startAngle = accumulatedAngle;
      accumulatedAngle += angle;

      return {
        ...item,
        fraction,
        percentage: Math.round(fraction * 100),
        arcLength,
        strokeDasharray: `${arcLength} ${circumference - arcLength}`,
        strokeDashoffset: -((startAngle + 90) / 360) * circumference,
      };
    });
  }, [activeSlices, totalExpenses, circumference]);

  // Active item details for donut center display
  const activeItem = useMemo(() => {
    if (!activeCategoryId) return null;
    return slicesData.find((s) => s.categoryId === activeCategoryId) || null;
  }, [activeCategoryId, slicesData]);

  const handleSliceClick = (catId: string) => {
    if (onSelectCategory) {
      onSelectCategory(selectedCategoryId === catId ? null : catId);
    }
  };

  return (
    <div className="flex flex-col lg:flex-row items-center gap-6 w-full">
      {/* SVG Donut Visualizer */}
      <div className="relative w-60 h-60 shrink-0 flex items-center justify-center">
        <svg
          viewBox="0 0 240 240"
          className="w-full h-full transform -rotate-90 origin-center transition-all duration-300"
        >
          {/* Background circle track */}
          <circle
            cx={center}
            cy={center}
            r={radius}
            fill="none"
            stroke="#E2E8F0"
            strokeWidth={strokeWidth}
            opacity={0.35}
          />

          {/* Empty state fallback track */}
          {slicesData.length === 0 && (
            <circle
              cx={center}
              cy={center}
              r={radius}
              fill="none"
              stroke="#CBD5E1"
              strokeWidth={strokeWidth}
              strokeDasharray="4 8"
            />
          )}

          {/* Slices */}
          {slicesData.map((slice) => {
            const isHighlighted = activeCategoryId === slice.categoryId;
            const isFaded = activeCategoryId && !isHighlighted;

            return (
              <circle
                key={slice.categoryId}
                cx={center}
                cy={center}
                r={radius}
                fill="none"
                stroke={slice.color}
                strokeWidth={isHighlighted ? strokeWidth + 6 : strokeWidth}
                strokeDasharray={slice.strokeDasharray}
                strokeDashoffset={slice.strokeDashoffset}
                strokeLinecap="round"
                className="cursor-pointer transition-all duration-300"
                style={{
                  opacity: isFaded ? 0.35 : 1,
                  filter: isHighlighted ? `drop-shadow(0 0 8px ${slice.color}66)` : 'none',
                }}
                onMouseEnter={() => setHoveredCategoryId(slice.categoryId)}
                onMouseLeave={() => setHoveredCategoryId(null)}
                onClick={() => handleSliceClick(slice.categoryId)}
              />
            );
          })}
        </svg>

        {/* Center Card Metric (Apple Wallet Style) */}
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-center px-4">
          {activeItem ? (
            <div className="animate-in fade-in zoom-in-95 duration-150">
              <div className="flex items-center justify-center mb-1 text-slate-500">
                {getCategoryIcon(activeItem.iconName, { className: 'w-4 h-4', style: { color: activeItem.color } })}
              </div>
              <p className="text-xs font-medium text-slate-500 truncate max-w-[120px]">
                {activeItem.categoryName}
              </p>
              <p className="text-lg font-bold text-slate-900 tabular-nums">
                {formatCurrency(activeItem.spent, currency)}
              </p>
              <p className="text-[11px] font-semibold tabular-nums" style={{ color: activeItem.color }}>
                {activeItem.percentage}% of total
              </p>
            </div>
          ) : (
            <div>
              <p className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">
                Total Expenses
              </p>
              <p className="text-xl font-bold text-slate-900 tabular-nums mt-0.5">
                {formatCurrency(totalExpenses, currency)}
              </p>
              <p className="text-xs text-slate-500 mt-0.5">
                {activeSlices.length} active {activeSlices.length === 1 ? 'category' : 'categories'}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Category Breakdown List */}
      <div className="flex-1 w-full space-y-2">
        <div className="flex items-center justify-between text-xs text-slate-500 pb-1 border-b border-slate-100">
          <span>Category Breakdown</span>
          <span>Share / Spent</span>
        </div>

        {slicesData.length === 0 ? (
          <p className="text-xs text-slate-400 py-4 text-center">No expenses recorded for this month yet.</p>
        ) : (
          <div className="space-y-1.5 max-h-[220px] overflow-y-auto pr-1 no-scrollbar">
            {slicesData.map((slice) => {
              const isSelected = activeCategoryId === slice.categoryId;
              return (
                <div
                  key={slice.categoryId}
                  onClick={() => handleSliceClick(slice.categoryId)}
                  onMouseEnter={() => setHoveredCategoryId(slice.categoryId)}
                  onMouseLeave={() => setHoveredCategoryId(null)}
                  className={`flex items-center justify-between p-2 rounded-xl cursor-pointer transition-colors ${
                    isSelected ? 'bg-slate-100/90' : 'hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span
                      className="w-2.5 h-2.5 rounded-full shrink-0"
                      style={{ backgroundColor: slice.color }}
                      aria-hidden="true"
                    />
                    <span className="text-xs font-medium text-slate-800 truncate">
                      {slice.categoryName}
                    </span>
                    <span className="text-[11px] text-slate-400 tabular-nums shrink-0">
                      · {slice.transactionCount} {slice.transactionCount === 1 ? 'tx' : 'txs'}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-xs font-semibold text-slate-900 tabular-nums">
                      {formatCurrency(slice.spent, currency)}
                    </span>
                    <span className="text-[11px] font-medium text-slate-500 tabular-nums w-8 text-right">
                      {slice.percentage}%
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
