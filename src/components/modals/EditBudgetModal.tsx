import React, { useState } from 'react';
import { Category, CurrencyCode } from '../../types/finance';
import { getCategoryIcon } from '../../utils/categoryIcons';
import { X, Check } from 'lucide-react';

interface EditBudgetModalProps {
  category: Category | null;
  isOpen: boolean;
  onClose: () => void;
  currency: CurrencyCode;
  onUpdateLimit: (categoryId: string, newLimit: number) => void;
}

export const EditBudgetModal: React.FC<EditBudgetModalProps> = ({
  category,
  isOpen,
  onClose,
  currency,
  onUpdateLimit,
}) => {
  const [limit, setLimit] = useState<string>(category?.monthlyLimit.toString() || '500');

  // Sync state if category changes
  React.useEffect(() => {
    if (category) {
      setLimit(category.monthlyLimit.toString());
    }
  }, [category]);

  if (!isOpen || !category) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = parseFloat(limit);
    if (!isNaN(parsed) && parsed >= 0) {
      onUpdateLimit(category.id, parsed);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 rounded-3xl w-full max-w-sm shadow-2xl border border-slate-100 dark:border-slate-800 overflow-hidden flex flex-col transition-colors duration-200">
        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-5 pb-3 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <div
              className="w-8 h-8 rounded-xl flex items-center justify-center text-white"
              style={{ backgroundColor: category.color }}
            >
              {getCategoryIcon(category.iconName, { className: 'w-4 h-4' })}
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900 dark:text-white tracking-tight leading-tight">
                Edit Budget Limit
              </h2>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">{category.name}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 flex items-center justify-center text-slate-600 dark:text-slate-300 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">
              Monthly Spending Ceiling
            </label>
            <div className="relative flex items-center">
              <span className="absolute left-4 text-xl font-bold text-slate-400 dark:text-slate-500">
                {currency === 'USD' ? '$' : currency === 'EUR' ? '€' : currency === 'GBP' ? '£' : currency === 'INR' ? '₹' : '$'}
              </span>
              <input
                type="number"
                step="50"
                min="0"
                autoFocus
                value={limit}
                onChange={(e) => setLimit(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-800 hover:bg-slate-100/70 dark:hover:bg-slate-750 focus:bg-white dark:focus:bg-slate-850 text-2xl font-extrabold text-slate-900 dark:text-white pl-10 pr-4 py-3 rounded-2xl border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 tabular-nums"
                required
              />
            </div>
          </div>

          <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
            Expenses in <strong className="text-slate-800 dark:text-slate-200">{category.name}</strong> will be tracked against this monthly target, signaling early pacing warnings when you cross 80%.
          </p>

          <div className="pt-2 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 bg-slate-900 dark:bg-indigo-600 hover:bg-slate-800 dark:hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold shadow-md active:scale-95 transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <Check className="w-3.5 h-3.5" />
              Update Limit
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
