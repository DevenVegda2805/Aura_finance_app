import React, { useState } from 'react';
import { CurrencyCode, SavingsGoal } from '../../types/finance';
import { formatCurrency } from '../../utils/formatters';
import { X, Plus, PiggyBank } from 'lucide-react';

interface ContributeGoalModalProps {
  goal: SavingsGoal | null;
  isOpen: boolean;
  onClose: () => void;
  currency: CurrencyCode;
  onContribute: (goalId: string, amount: number) => void;
}

const QUICK_AMOUNTS = [50, 100, 250, 500];

export const ContributeGoalModal: React.FC<ContributeGoalModalProps> = ({
  goal,
  isOpen,
  onClose,
  currency,
  onContribute,
}) => {
  const [amount, setAmount] = useState<string>('100');
  const [error, setError] = useState<string>('');

  if (!isOpen || !goal) return null;

  const remaining = Math.max(0, goal.targetAmount - goal.currentAmount);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = parseFloat(amount);
    if (isNaN(parsed) || parsed <= 0) {
      setError('Please enter a valid contribution amount.');
      return;
    }
    onContribute(goal.id, parsed);
    setAmount('100');
    setError('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 rounded-3xl w-full max-w-sm shadow-2xl border border-slate-100 dark:border-slate-800 overflow-hidden flex flex-col transition-colors duration-200">
        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-5 pb-3 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center text-white shadow-xs"
              style={{ backgroundColor: goal.color }}
            >
              <PiggyBank className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900 dark:text-white tracking-tight leading-tight">Add to Goal</h2>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate max-w-[180px]">{goal.title}</p>
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
          {error && (
            <div className="p-2.5 bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 text-xs rounded-xl border border-rose-200 dark:border-rose-800">
              {error}
            </div>
          )}

          <div className="bg-slate-50 dark:bg-slate-800/80 p-3 rounded-2xl border border-slate-100 dark:border-slate-700 flex items-center justify-between text-xs">
            <span className="text-slate-500 dark:text-slate-400">Currently Saved</span>
            <span className="font-bold text-slate-900 dark:text-white tabular-nums">
              {formatCurrency(goal.currentAmount, currency)} / {formatCurrency(goal.targetAmount, currency)}
            </span>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">Deposit Amount</label>
            <div className="relative flex items-center">
              <span className="absolute left-4 text-xl font-bold text-slate-400 dark:text-slate-500">
                {currency === 'USD' ? '$' : currency === 'EUR' ? '€' : currency === 'GBP' ? '£' : currency === 'INR' ? '₹' : '$'}
              </span>
              <input
                type="number"
                step="10"
                min="1"
                autoFocus
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-800 hover:bg-slate-100/70 dark:hover:bg-slate-750 focus:bg-white dark:focus:bg-slate-850 text-2xl font-extrabold text-slate-900 dark:text-white pl-10 pr-4 py-3 rounded-2xl border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 tabular-nums"
                required
              />
            </div>
          </div>

          {/* Quick Amount Chips */}
          <div className="flex items-center gap-2">
            {QUICK_AMOUNTS.map((q) => (
              <button
                key={q}
                type="button"
                onClick={() => setAmount(q.toString())}
                className="flex-1 py-1.5 text-xs font-medium bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 rounded-xl transition-colors tabular-nums cursor-pointer"
              >
                +{formatCurrency(q, currency)}
              </button>
            ))}
          </div>

          {remaining > 0 && (
            <p className="text-[11px] text-slate-400 dark:text-slate-500 text-center">
              {formatCurrency(remaining, currency)} remaining to reach this milestone.
            </p>
          )}

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
              <Plus className="w-3.5 h-3.5" />
              Deposit Funds
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
