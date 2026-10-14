import React, { useState, useMemo } from 'react';
import { FinanceStore } from '../../hooks/useFinanceStore';
import { Transaction, TransactionType } from '../../types/finance';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { getCategoryIcon } from '../../utils/categoryIcons';
import {
  Search,
  Download,
  Trash2,
  Plus,
  Repeat,
  Calendar,
  Clock,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';

interface LedgerViewProps {
  store: FinanceStore;
  onOpenAddModal: () => void;
}

export const LedgerView: React.FC<LedgerViewProps> = ({ store, onOpenAddModal }) => {
  const {
    transactions,
    categoryMap,
    categories,
    recurringBills,
    deleteTransaction,
    exportTransactionsCSV,
    triggerRecurringBillNow,
    toggleRecurringBill,
    deleteRecurringBill,
    totalMonthlyRecurring,
    settings,
  } = store;

  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<'all' | TransactionType | 'recurring'>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [sortOrder, setSortOrder] = useState<'date-desc' | 'date-asc' | 'amount-desc' | 'amount-asc'>('date-desc');
  const [showRecurringDrawer, setShowRecurringDrawer] = useState(false);

  // Filtered & sorted transaction feed
  const filteredTransactions = useMemo(() => {
    return transactions
      .filter((tx) => {
        // Search text
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matchMerchant = tx.merchant.toLowerCase().includes(q);
          const matchNote = tx.note?.toLowerCase().includes(q);
          const catName = categoryMap.get(tx.categoryId)?.name.toLowerCase() || '';
          if (!matchMerchant && !matchNote && !catName.includes(q)) return false;
        }

        // Type / Recurring filter
        if (typeFilter === 'recurring') {
          if (!tx.isRecurring) return false;
        } else if (typeFilter !== 'all' && tx.type !== typeFilter) {
          return false;
        }

        // Category filter
        if (categoryFilter !== 'all' && tx.categoryId !== categoryFilter) {
          return false;
        }

        return true;
      })
      .sort((a, b) => {
        if (sortOrder === 'date-desc') {
          return b.date.localeCompare(a.date);
        }
        if (sortOrder === 'date-asc') {
          return a.date.localeCompare(b.date);
        }
        if (sortOrder === 'amount-desc') {
          return b.amount - a.amount;
        }
        if (sortOrder === 'amount-asc') {
          return a.amount - b.amount;
        }
        return 0;
      });
  }, [transactions, searchQuery, typeFilter, categoryFilter, sortOrder, categoryMap]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="text-xs text-slate-500 font-medium">
            Financial Ledger &amp; Scheduled Bills
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 mt-0.5">
            Transaction History
          </h1>
        </div>

        <div className="flex items-center gap-2.5 self-start sm:self-auto">
          <button
            onClick={exportTransactionsCSV}
            className="px-3.5 py-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-semibold shadow-xs transition-colors flex items-center gap-1.5"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download CSV</span>
          </button>

          <button
            onClick={onOpenAddModal}
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold shadow-sm transition-all flex items-center gap-1.5 active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>Log Transaction</span>
          </button>
        </div>
      </div>

      {/* Scheduled Recurring Bills Summary Banner */}
      <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-sm space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <Repeat className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900">
                Scheduled Recurring Bills &amp; Subscriptions
              </h2>
              <p className="text-xs text-slate-500">
                {recurringBills.filter((b) => b.isActive).length} active schedules ·{' '}
                <strong className="text-slate-800 tabular-nums">
                  ~{formatCurrency(totalMonthlyRecurring, settings.currency)}/mo
                </strong>{' '}
                committed
              </p>
            </div>
          </div>

          <button
            onClick={() => setShowRecurringDrawer(!showRecurringDrawer)}
            className="px-3 py-1.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 rounded-xl text-xs font-medium flex items-center gap-1 transition-colors"
          >
            <span>{showRecurringDrawer ? 'Hide Schedule' : 'Manage Schedules'}</span>
            {showRecurringDrawer ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>
        </div>

        {/* Expandable Scheduled Bills List */}
        {showRecurringDrawer && (
          <div className="pt-3 border-t border-slate-100 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 animate-in fade-in duration-200">
            {recurringBills.length === 0 ? (
              <p className="text-xs text-slate-400 py-3 col-span-full">No recurring bills scheduled yet.</p>
            ) : (
              recurringBills.map((bill) => {
                const cat = categoryMap.get(bill.categoryId);
                return (
                  <div
                    key={bill.id}
                    className={`p-3.5 rounded-2xl border flex flex-col justify-between space-y-3 transition-colors ${
                      bill.isActive
                        ? 'bg-slate-50/70 border-slate-200/80'
                        : 'bg-slate-100/50 border-dashed border-slate-300 opacity-60'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div
                          className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0"
                          style={{ backgroundColor: cat?.bgColor || '#EEF0FF', color: cat?.color || '#5856D6' }}
                        >
                          {getCategoryIcon(cat?.iconName || 'repeat', { className: 'w-3.5 h-3.5' })}
                        </div>
                        <div className="min-w-0">
                          <h4 className="text-xs font-bold text-slate-900 truncate">{bill.merchant}</h4>
                          <span className="text-[10px] text-slate-500 capitalize">
                            {bill.frequency} · {cat?.name || 'General'}
                          </span>
                        </div>
                      </div>

                      <span className="text-xs font-extrabold text-slate-900 tabular-nums shrink-0">
                        {formatCurrency(bill.amount, settings.currency)}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-slate-500 pt-2 border-t border-slate-200/60">
                      <div className="flex items-center gap-1 text-indigo-700">
                        <Clock className="w-3 h-3" />
                        <span>Due {formatDate(bill.nextDueDate)}</span>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => triggerRecurringBillNow(bill.id)}
                          className="px-2 py-0.5 bg-white border border-slate-200 hover:bg-slate-900 hover:text-white rounded-lg text-[10px] font-semibold text-slate-800 transition-colors"
                          title="Log this bill as paid now"
                        >
                          Log Due Bill
                        </button>
                        <button
                          onClick={() => deleteRecurringBill(bill.id)}
                          className="text-slate-400 hover:text-rose-600 transition-colors"
                          title="Remove recurring schedule"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}
      </div>

      {/* Control Bar: Search & Filters */}
      <div className="bg-white p-4 rounded-3xl border border-slate-200/80 shadow-sm space-y-3">
        <div className="flex flex-col md:flex-row items-center gap-3">
          {/* Search Input */}
          <div className="relative w-full md:flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search by merchant, note, or category..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900"
            />
          </div>

          {/* Type Segmented Buttons */}
          <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-xl w-full md:w-auto overflow-x-auto no-scrollbar">
            <button
              onClick={() => setTypeFilter('all')}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all whitespace-nowrap ${
                typeFilter === 'all'
                  ? 'bg-white text-slate-900 shadow-xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              All Types
            </button>
            <button
              onClick={() => setTypeFilter('expense')}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all whitespace-nowrap ${
                typeFilter === 'expense'
                  ? 'bg-white text-slate-900 shadow-xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Expenses
            </button>
            <button
              onClick={() => setTypeFilter('income')}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all whitespace-nowrap ${
                typeFilter === 'income'
                  ? 'bg-white text-emerald-700 shadow-xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Income
            </button>
            <button
              onClick={() => setTypeFilter('savings')}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all whitespace-nowrap ${
                typeFilter === 'savings'
                  ? 'bg-white text-indigo-700 shadow-xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Savings
            </button>
            <button
              onClick={() => setTypeFilter('recurring')}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all whitespace-nowrap flex items-center gap-1 ${
                typeFilter === 'recurring'
                  ? 'bg-white text-purple-700 shadow-xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Repeat className="w-3 h-3" />
              <span>Recurring</span>
            </button>
          </div>

          {/* Category Dropdown */}
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="w-full md:w-44 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-900 cursor-pointer"
          >
            <option value="all">All Categories</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>

          {/* Sort Dropdown */}
          <select
            value={sortOrder}
            onChange={(e) => setSortOrder(e.target.value as any)}
            className="w-full md:w-40 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-900 cursor-pointer"
          >
            <option value="date-desc">Newest First</option>
            <option value="date-asc">Oldest First</option>
            <option value="amount-desc">Highest Amount</option>
            <option value="amount-asc">Lowest Amount</option>
          </select>
        </div>

        {/* Active Filters Bar */}
        <div className="flex items-center justify-between text-xs text-slate-500 pt-1 px-1">
          <span>
            Showing <strong className="text-slate-800 tabular-nums">{filteredTransactions.length}</strong> of{' '}
            <strong className="text-slate-800 tabular-nums">{transactions.length}</strong> records
          </span>

          {(searchQuery || typeFilter !== 'all' || categoryFilter !== 'all') && (
            <button
              onClick={() => {
                setSearchQuery('');
                setTypeFilter('all');
                setCategoryFilter('all');
              }}
              className="text-xs text-indigo-600 hover:underline font-medium"
            >
              Clear filters
            </button>
          )}
        </div>
      </div>

      {/* Transactions Table / List View */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden">
        {filteredTransactions.length === 0 ? (
          <div className="p-12 text-center text-slate-400 space-y-2">
            <p className="text-sm font-semibold text-slate-600">No transactions match your search</p>
            <p className="text-xs">Try adjusting your filters or search terms.</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {filteredTransactions.map((tx) => {
              const cat = categoryMap.get(tx.categoryId);
              const isIncome = tx.type === 'income';
              const isSavings = tx.type === 'savings';

              return (
                <div
                  key={tx.id}
                  className="p-4 flex items-center justify-between gap-4 hover:bg-slate-50/80 transition-colors group"
                >
                  <div className="flex items-center gap-3.5 min-w-0">
                    <div
                      className="w-10 h-10 rounded-2xl flex items-center justify-center shrink-0"
                      style={{
                        backgroundColor: isIncome ? '#EBF9EE' : isSavings ? '#EEF0FF' : (cat?.bgColor || '#F1F5F9'),
                        color: isIncome ? '#16A34A' : isSavings ? '#5856D6' : (cat?.color || '#475569'),
                      }}
                    >
                      {getCategoryIcon(cat?.iconName || (isIncome ? 'briefcase' : isSavings ? 'piggybank' : 'dollar'), {
                        className: 'w-5 h-5',
                      })}
                    </div>

                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-slate-900 truncate">
                          {tx.merchant}
                        </span>
                        <span className="text-[11px] text-slate-400 font-mono hidden sm:inline">
                          {tx.paymentMethod.replace('_', ' ')}
                        </span>
                        {tx.isRecurring && (
                          <span className="inline-flex items-center gap-1 text-[11px] text-indigo-600 font-medium">
                            <Repeat className="w-3 h-3" />
                            <span className="capitalize">{tx.recurringFrequency}</span>
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-0.5">
                        <span className="font-medium text-slate-700">
                          {cat?.name || (isIncome ? 'Direct Income' : 'Savings Deposit')}
                        </span>
                        <span aria-hidden="true">·</span>
                        <span className="tabular-nums">{formatDate(tx.date)}</span>
                        {tx.note && (
                          <>
                            <span aria-hidden="true">·</span>
                            <span className="text-slate-400 truncate max-w-[200px]">{tx.note}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Right: Amount & Delete affordance */}
                  <div className="flex items-center gap-4 shrink-0">
                    <div className="text-right">
                      <span
                        className={`text-sm sm:text-base font-extrabold tabular-nums tracking-tight ${
                          isIncome
                            ? 'text-emerald-600'
                            : isSavings
                            ? 'text-indigo-600'
                            : 'text-slate-900'
                        }`}
                      >
                        {isIncome ? '+' : isSavings ? '' : '-'}
                        {formatCurrency(tx.amount, settings.currency)}
                      </span>
                      <span className="block text-[10px] text-slate-400 uppercase tracking-wider">
                        {tx.type}
                      </span>
                    </div>

                    <button
                      onClick={() => deleteTransaction(tx.id)}
                      className="opacity-0 group-hover:opacity-100 focus:opacity-100 p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all"
                      title="Delete Transaction"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
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
