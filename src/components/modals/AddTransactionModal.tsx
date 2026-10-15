import React, { useState } from 'react';
import {
  Category,
  CurrencyCode,
  PaymentMethod,
  RecurringFrequency,
  SavingsGoal,
  TransactionType,
} from '../../types/finance';
import { getCategoryIcon } from '../../utils/categoryIcons';
import { X, Check, Repeat, Calendar } from 'lucide-react';

interface AddTransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  categories: Category[];
  savingsGoals: SavingsGoal[];
  currency: CurrencyCode;
  onAddTransaction: (tx: {
    amount: number;
    type: TransactionType;
    categoryId: string;
    merchant: string;
    date: string;
    paymentMethod: PaymentMethod;
    note?: string;
    isRecurring?: boolean;
    recurringFrequency?: RecurringFrequency;
  }) => void;
}

export const AddTransactionModal: React.FC<AddTransactionModalProps> = ({
  isOpen,
  onClose,
  categories,
  savingsGoals,
  currency,
  onAddTransaction,
}) => {
  const [type, setType] = useState<TransactionType>('expense');
  const [amount, setAmount] = useState<string>('');
  const [categoryId, setCategoryId] = useState<string>(categories[0]?.id || '');
  const [merchant, setMerchant] = useState<string>('');
  const [date, setDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('apple_pay');
  const [note, setNote] = useState<string>('');
  const [isRecurring, setIsRecurring] = useState<boolean>(false);
  const [recurringFrequency, setRecurringFrequency] = useState<RecurringFrequency>('monthly');
  const [error, setError] = useState<string>('');

  if (!isOpen) return null;

  // Compute calculated next due date preview
  const getNextDueDatePreview = () => {
    try {
      const [year, month, day] = date.split('-').map(Number);
      const d = new Date(year, month - 1, day);
      if (recurringFrequency === 'weekly') {
        d.setDate(d.getDate() + 7);
      } else {
        d.setMonth(d.getMonth() + 1);
      }
      return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    } catch {
      return '';
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      setError('Please enter a valid amount greater than 0.');
      return;
    }
    if (!merchant.trim()) {
      setError('Please enter a merchant, payee, or description.');
      return;
    }

    onAddTransaction({
      amount: parsedAmount,
      type,
      categoryId: type === 'savings' ? (savingsGoals[0]?.id || 'goal-emergency') : categoryId,
      merchant: merchant.trim(),
      date,
      paymentMethod,
      note: note.trim() || undefined,
      isRecurring,
      recurringFrequency: isRecurring ? recurringFrequency : undefined,
    });

    // Reset and close
    setAmount('');
    setMerchant('');
    setNote('');
    setIsRecurring(false);
    setRecurringFrequency('monthly');
    setError('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 rounded-3xl w-full max-w-lg shadow-2xl border border-slate-100 dark:border-slate-800 overflow-hidden flex flex-col max-h-[92vh] transition-colors duration-200">
        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-5 pb-3 border-b border-slate-100 dark:border-slate-800">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white tracking-tight">Log Transaction</h2>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 flex items-center justify-center text-slate-600 dark:text-slate-300 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto px-6 py-5 space-y-5">
          {error && (
            <div className="p-3 bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 text-xs rounded-xl border border-rose-200 dark:border-rose-800">
              {error}
            </div>
          )}

          {/* Segmented Type Control */}
          <div className="grid grid-cols-3 p-1 bg-slate-100 dark:bg-slate-800 rounded-2xl gap-1">
            <button
              type="button"
              onClick={() => {
                setType('expense');
                if (!categoryId.startsWith('cat-')) setCategoryId(categories[0]?.id || '');
              }}
              className={`py-2 text-xs font-semibold rounded-xl transition-all cursor-pointer ${
                type === 'expense'
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Expense
            </button>
            <button
              type="button"
              onClick={() => setType('income')}
              className={`py-2 text-xs font-semibold rounded-xl transition-all cursor-pointer ${
                type === 'income'
                  ? 'bg-white dark:bg-slate-700 text-emerald-700 dark:text-emerald-300 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Income
            </button>
            <button
              type="button"
              onClick={() => {
                setType('savings');
                if (savingsGoals.length > 0) setCategoryId(savingsGoals[0].id);
              }}
              className={`py-2 text-xs font-semibold rounded-xl transition-all cursor-pointer ${
                type === 'savings'
                  ? 'bg-white dark:bg-slate-700 text-indigo-700 dark:text-indigo-300 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Savings Deposit
            </button>
          </div>

          {/* Large Amount Field */}
          <div>
            <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">Amount</label>
            <div className="relative flex items-center">
              <span className="absolute left-4 text-2xl font-bold text-slate-400 dark:text-slate-500">
                {currency === 'USD' ? '$' : currency === 'EUR' ? '€' : currency === 'GBP' ? '£' : currency === 'INR' ? '₹' : '$'}
              </span>
              <input
                type="number"
                step="0.01"
                min="0.01"
                autoFocus
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-800 hover:bg-slate-100/70 dark:hover:bg-slate-750 focus:bg-white dark:focus:bg-slate-850 text-3xl font-extrabold text-slate-900 dark:text-white pl-11 pr-4 py-3.5 rounded-2xl border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all tabular-nums"
                required
              />
            </div>
          </div>

          {/* Merchant / Description */}
          <div>
            <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">
              {type === 'income' ? 'Source / Payer' : type === 'savings' ? 'Fund Name' : 'Merchant / Payee'}
            </label>
            <input
              type="text"
              placeholder={
                type === 'income'
                  ? 'e.g. Salary, Consulting, Bonus'
                  : type === 'savings'
                  ? 'e.g. Emergency Fund Deposit'
                  : 'e.g. Whole Foods, Uber, Apple, Rent'
              }
              value={merchant}
              onChange={(e) => setMerchant(e.target.value)}
              className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900 dark:text-white"
              required
            />
          </div>

          {/* Category Selection */}
          {type === 'expense' && (
            <div>
              <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-2">Category</label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {categories.map((cat) => {
                  const isSelected = categoryId === cat.id;
                  return (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => setCategoryId(cat.id)}
                      className={`flex items-center gap-2 p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                        isSelected
                          ? 'border-slate-900 dark:border-indigo-500 bg-slate-900 dark:bg-indigo-600 text-white shadow-xs'
                          : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-750 text-slate-700 dark:text-slate-200'
                      }`}
                    >
                      <div
                        className="w-6 h-6 rounded-lg flex items-center justify-center shrink-0"
                        style={{
                          backgroundColor: isSelected ? 'rgba(255,255,255,0.2)' : cat.bgColor,
                          color: isSelected ? '#FFFFFF' : cat.color,
                        }}
                      >
                        {getCategoryIcon(cat.iconName, { className: 'w-3.5 h-3.5' })}
                      </div>
                      <span className="text-xs font-medium truncate">{cat.name}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {type === 'savings' && (
            <div>
              <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">Target Savings Goal</label>
              <select
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900 dark:text-white cursor-pointer"
              >
                {savingsGoals.map((g) => (
                  <option key={g.id} value={g.id} className="dark:bg-slate-900">
                    {g.title} ({g.category})
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Date & Payment Method Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">Date</label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">Payment Method</label>
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
              >
                <option value="phonepe" className="dark:bg-slate-900">PhonePe UPI</option>
                <option value="apple_pay" className="dark:bg-slate-900">Apple Pay</option>
                <option value="gpay" className="dark:bg-slate-900">Google Pay (GPay)</option>
                <option value="paytm" className="dark:bg-slate-900">Paytm UPI</option>
                <option value="bhim_upi" className="dark:bg-slate-900">BHIM UPI</option>
                <option value="amazon_pay" className="dark:bg-slate-900">Amazon Pay</option>
                <option value="cred" className="dark:bg-slate-900">CRED</option>
                <option value="card" className="dark:bg-slate-900">Credit / Debit Card</option>
                <option value="bank_transfer" className="dark:bg-slate-900">Direct Bank Transfer</option>
                <option value="cash" className="dark:bg-slate-900">Cash</option>
              </select>
            </div>
          </div>

          {/* Recurring Transaction Toggle & Frequency Selector */}
          <div className="p-4 rounded-2xl bg-slate-50/80 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div
                  className={`w-7 h-7 rounded-lg flex items-center justify-center transition-colors ${
                    isRecurring ? 'bg-indigo-600 text-white' : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-400'
                  }`}
                >
                  <Repeat className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-xs font-bold text-slate-900 dark:text-white block leading-tight">
                    Recurring Bill / Schedule
                  </span>
                  <span className="text-[11px] text-slate-500 dark:text-slate-400">
                    Automatically track and schedule future bills
                  </span>
                </div>
              </div>

              {/* iOS Style Toggle Switch */}
              <button
                type="button"
                role="switch"
                aria-checked={isRecurring}
                onClick={() => setIsRecurring(!isRecurring)}
                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                  isRecurring ? 'bg-indigo-600' : 'bg-slate-300 dark:bg-slate-700'
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                    isRecurring ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            {/* Frequency Selection (Shown when recurring is enabled) */}
            {isRecurring && (
              <div className="pt-2 border-t border-slate-200/60 dark:border-slate-700/60 space-y-2 animate-in fade-in duration-200">
                <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-300">
                  Billing Cadence
                </label>
                <div className="grid grid-cols-2 gap-2 p-1 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
                  <button
                    type="button"
                    onClick={() => setRecurringFrequency('weekly')}
                    className={`py-1.5 px-3 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                      recurringFrequency === 'weekly'
                        ? 'bg-slate-900 dark:bg-indigo-600 text-white shadow-xs'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    Weekly (Every 7 days)
                  </button>
                  <button
                    type="button"
                    onClick={() => setRecurringFrequency('monthly')}
                    className={`py-1.5 px-3 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                      recurringFrequency === 'monthly'
                        ? 'bg-slate-900 dark:bg-indigo-600 text-white shadow-xs'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    Monthly (Every month)
                  </button>
                </div>

                <div className="flex items-center gap-1.5 text-[11px] text-indigo-700 dark:text-indigo-300 bg-indigo-50/80 dark:bg-indigo-950/40 px-2.5 py-1.5 rounded-lg border border-indigo-100 dark:border-indigo-800">
                  <Calendar className="w-3.5 h-3.5 shrink-0" />
                  <span>
                    Next occurrence scheduled for <strong>{getNextDueDatePreview()}</strong>
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">Note (Optional)</label>
            <input
              type="text"
              placeholder="e.g. Receipt #491, split with Sarah"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* Action Buttons */}
          <div className="pt-2 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 text-xs font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 bg-slate-900 dark:bg-indigo-600 hover:bg-slate-800 dark:hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold shadow-md active:scale-95 transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <Check className="w-3.5 h-3.5" />
              Save Transaction
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
