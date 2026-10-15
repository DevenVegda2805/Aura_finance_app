import React, { useState } from 'react';
import { Category, CurrencyCode, DetectedExpense } from '../../types/finance';
import { formatCurrency } from '../../utils/formatters';
import { getCategoryIcon } from '../../utils/categoryIcons';
import { getPaymentMethodInfo } from '../../utils/paymentMethodHelpers';
import { X, Check, Sparkles, ChevronRight, Zap } from 'lucide-react';

interface CategorizeExpenseModalProps {
  detectedExpense: DetectedExpense | null;
  categories: Category[];
  currency: CurrencyCode;
  onCategorize: (detectedExpenseId: string, categoryId: string, rememberRule: boolean) => void;
  onDismiss: (id: string) => void;
}

export const CategorizeExpenseModal: React.FC<CategorizeExpenseModalProps> = ({
  detectedExpense,
  categories,
  currency,
  onCategorize,
  onDismiss,
}) => {
  const [rememberRule, setRememberRule] = useState(true);
  const [completedCategory, setCompletedCategory] = useState<string | null>(null);

  if (!detectedExpense) return null;

  const paymentInfo = getPaymentMethodInfo(detectedExpense.paymentMethod);

  const handleSelectCategory = (categoryId: string) => {
    const selectedCat = categories.find((c) => c.id === categoryId);
    setCompletedCategory(selectedCat?.name || 'Selected Category');
    setTimeout(() => {
      onCategorize(detectedExpense.id, categoryId, rememberRule);
      setCompletedCategory(null);
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 rounded-3xl w-full max-w-md shadow-2xl border border-slate-100 dark:border-slate-800 overflow-hidden flex flex-col max-h-[92vh] animate-in zoom-in-95 duration-150 transition-colors duration-200">
        {/* Top Payment Banner */}
        <div className="p-6 bg-gradient-to-b from-slate-50 to-white dark:from-slate-850 dark:to-slate-900 border-b border-slate-100 dark:border-slate-800 flex flex-col items-center text-center relative">
          <button
            onClick={() => onDismiss(detectedExpense.id)}
            className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-750 flex items-center justify-center text-slate-500 dark:text-slate-400 transition-colors cursor-pointer"
            title="Dismiss notification"
          >
            <X className="w-4 h-4" />
          </button>

          {/* Payment Method Chip */}
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border shadow-xs mb-3 bg-white dark:bg-slate-800 dark:border-slate-700">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping mr-0.5" />
            <span className="flex items-center gap-1">
              {paymentInfo.icon}
              <span className={paymentInfo.textColor}>{paymentInfo.name}</span>
            </span>
            <span className="text-slate-400 dark:text-slate-500">·</span>
            <span className="text-[11px] text-slate-500 dark:text-slate-400">Live Expense Detected</span>
          </div>

          {/* Amount Display */}
          <div className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight tabular-nums">
            {formatCurrency(detectedExpense.amount, currency)}
          </div>

          {/* Merchant & Timestamp */}
          <div className="text-base font-bold text-slate-800 dark:text-slate-200 mt-1">
            {detectedExpense.merchant}
          </div>
          <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            {detectedExpense.date} {detectedExpense.time ? `at ${detectedExpense.time}` : ''}
            {detectedExpense.referenceId ? ` · Ref: ${detectedExpense.referenceId}` : ''}
          </div>
        </div>

        {/* Content Body: Only asks for category! */}
        <div className="p-6 overflow-y-auto space-y-4">
          {completedCategory ? (
            <div className="py-8 text-center space-y-3 animate-in zoom-in duration-150">
              <div className="w-14 h-14 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto shadow-xs">
                <Check className="w-7 h-7 stroke-[3]" />
              </div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Stored in {completedCategory}!
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Updating your monthly category limit, spending reports, and budget runway...
              </p>
            </div>
          ) : (
            <>
              <div className="text-center">
                <span className="inline-block text-[11px] font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/50 px-2.5 py-0.5 rounded-full mb-1">
                  Single-Tap Action
                </span>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  Which category to store this expense in?
                </h3>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                  Tap a category below. Aura records the transaction, adjusts limits, and visualizes reports automatically.
                </p>
              </div>

              {/* Category Grid Buttons */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                {categories.map((cat) => {
                  const isSuggested = detectedExpense.suggestedCategoryId === cat.id;

                  return (
                    <button
                      key={cat.id}
                      onClick={() => handleSelectCategory(cat.id)}
                      className={`p-3 rounded-2xl border text-left transition-all active:scale-[0.98] flex items-center justify-between group cursor-pointer ${
                        isSuggested
                          ? 'border-indigo-500 dark:border-indigo-400 bg-indigo-50/60 dark:bg-indigo-950/40 ring-2 ring-indigo-500/20 shadow-xs'
                          : 'border-slate-200/80 dark:border-slate-750 bg-white dark:bg-slate-800/80 hover:bg-slate-50 dark:hover:bg-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div
                          className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0"
                          style={{ backgroundColor: cat.bgColor, color: cat.color }}
                        >
                          {getCategoryIcon(cat.iconName, { className: 'w-4 h-4' })}
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5">
                            <span className="text-xs font-bold text-slate-900 dark:text-white truncate">
                              {cat.name}
                            </span>
                            {isSuggested && (
                              <span className="shrink-0 text-[9px] font-extrabold text-indigo-700 dark:text-indigo-300 bg-indigo-100 dark:bg-indigo-900/60 px-1.5 py-0.2 rounded-md flex items-center gap-0.5">
                                <Sparkles className="w-2.5 h-2.5" />
                                Suggested
                              </span>
                            )}
                          </div>
                          <span className="text-[10px] text-slate-400 dark:text-slate-500 block tabular-nums">
                            Limit: {formatCurrency(cat.monthlyLimit, currency)}
                          </span>
                        </div>
                      </div>
                      <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-slate-700 dark:group-hover:text-slate-200 shrink-0" />
                    </button>
                  );
                })}
              </div>

              {/* Remember Merchant Rule Toggle */}
              <label className="flex items-center gap-2 p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200/80 dark:border-slate-700 cursor-pointer hover:bg-slate-100/60 dark:hover:bg-slate-800 transition-colors mt-3">
                <input
                  type="checkbox"
                  checked={rememberRule}
                  onChange={(e) => setRememberRule(e.target.checked)}
                  className="rounded border-slate-300 dark:border-slate-600 text-indigo-600 focus:ring-indigo-500 w-4 h-4 cursor-pointer"
                />
                <span className="text-[11px] text-slate-600 dark:text-slate-300 leading-snug">
                  Always remember this category for future transactions from <strong>{detectedExpense.merchant}</strong>
                </span>
              </label>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="p-3.5 bg-slate-50 dark:bg-slate-850 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 px-6">
          <span className="flex items-center gap-1">
            <Zap className="w-3.5 h-3.5 text-amber-500" />
            Automatic budget ledger sync
          </span>
          <button
            type="button"
            onClick={() => onDismiss(detectedExpense.id)}
            className="text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white font-medium cursor-pointer"
          >
            Skip for now
          </button>
        </div>
      </div>
    </div>
  );
};
