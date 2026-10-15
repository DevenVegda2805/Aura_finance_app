import React, { useState } from 'react';
import { FinanceStore } from '../../hooks/useFinanceStore';
import { formatCurrency } from '../../utils/formatters';
import { getPaymentMethodInfo } from '../../utils/paymentMethodHelpers';
import {
  Smartphone,
  Zap,
  CheckCircle2,
  Clock,
  ArrowRight,
  Edit2,
  Check,
  Sparkles,
  ClipboardPaste,
  AlertCircle,
  Tag,
} from 'lucide-react';
import { DetectedExpense } from '../../types/finance';

interface PaymentIntegrationViewProps {
  store: FinanceStore;
  onOpenCategorizeModal: (expense: DetectedExpense) => void;
}

export const PaymentIntegrationView: React.FC<PaymentIntegrationViewProps> = ({
  store,
  onOpenCategorizeModal,
}) => {
  const {
    linkedPaymentApps,
    detectedExpenses,
    pendingDetectedExpenses,
    merchantRules,
    categoryMap,
    settings,
    toggleLinkedPaymentApp,
    updateLinkedPaymentApp,
    detectExpenseFromText,
    simulateIncomingPayment,
  } = store;

  const [editingAppId, setEditingAppId] = useState<string | null>(null);
  const [editingUpiId, setEditingUpiId] = useState('');
  const [pasteText, setPasteText] = useState('');
  const [pasteError, setPasteError] = useState('');
  const [pasteSuccess, setPasteSuccess] = useState(false);

  const handleStartEdit = (appId: string, currentUpiId?: string) => {
    setEditingAppId(appId);
    setEditingUpiId(currentUpiId || '');
  };

  const handleSaveEdit = (appId: string) => {
    updateLinkedPaymentApp(appId, editingUpiId.trim() || 'user@upi');
    setEditingAppId(null);
  };

  const handleParsePastedText = (e: React.FormEvent) => {
    e.preventDefault();
    setPasteError('');
    if (!pasteText.trim()) {
      setPasteError('Please paste an SMS alert or payment confirmation text.');
      return;
    }

    const detected = detectExpenseFromText(pasteText.trim());
    if (detected) {
      setPasteSuccess(true);
      setPasteText('');
      setTimeout(() => {
        setPasteSuccess(false);
        onOpenCategorizeModal(detected);
      }, 400);
    } else {
      setPasteError(
        'Could not detect an expense amount in that text. Try pasting a bank alert like: "Paid Rs. 420 to Swiggy via PhonePe UPI".'
      );
    }
  };

  const handleTriggerSimulation = (
    preset: 'phonepe_swiggy' | 'applepay_starbucks' | 'gpay_fuel' | 'paytm_groceries'
  ) => {
    const detected = simulateIncomingPayment(preset);
    onOpenCategorizeModal(detected);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 font-medium">
            <span>Payment Automation</span>
            <span aria-hidden="true">·</span>
            <span className="font-semibold text-slate-700 dark:text-slate-300">{settings.userName}</span>
            <span aria-hidden="true">·</span>
            <span className="inline-flex items-center gap-1 text-[11px] text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800 font-semibold">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Live UPI Listener Ready
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white mt-1">
            UPI &amp; Mobile Payment Apps
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-2xl">
            Integrate PhonePe, Apple Pay, Google Pay, and Paytm. Aura automatically detects incoming expenses, prompts you for the category in 1 tap, and handles all ledger entries and reports.
          </p>
        </div>

        {/* Quick Pending Alert Pill */}
        {pendingDetectedExpenses.length > 0 && (
          <div className="bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 p-3 rounded-2xl flex items-center gap-3 shrink-0 shadow-xs">
            <div className="w-8 h-8 rounded-xl bg-amber-500 text-white flex items-center justify-center font-bold text-xs">
              {pendingDetectedExpenses.length}
            </div>
            <div>
              <span className="text-xs font-bold text-amber-950 dark:text-amber-300 block">Pending Categorization</span>
              <button
                onClick={() => onOpenCategorizeModal(pendingDetectedExpenses[0])}
                className="text-[11px] font-semibold text-amber-800 dark:text-amber-300 hover:text-amber-950 dark:hover:text-amber-200 underline cursor-pointer"
              >
                Categorize next expense &rarr;
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Section 1: Connected Payment Apps */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-slate-900 dark:bg-indigo-600 text-white flex items-center justify-center shadow-xs">
              <Smartphone className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white tracking-tight">
                Linked Payment Apps &amp; UPI IDs
              </h2>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Active apps automatically monitored for expense notifications
              </p>
            </div>
          </div>
          <span className="text-[10px] font-semibold text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 px-2.5 py-1 rounded-full border border-slate-200 dark:border-slate-700">
            {linkedPaymentApps.filter((a) => a.isEnabled).length} of {linkedPaymentApps.length} Active
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 pt-2">
          {linkedPaymentApps.map((app) => {
            const methodInfo = getPaymentMethodInfo(app.appType);
            const isEditing = editingAppId === app.id;

            return (
              <div
                key={app.id}
                className={`p-4 rounded-2xl border transition-all ${
                  app.isEnabled
                    ? 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/80 hover:border-slate-300 dark:hover:border-slate-600 shadow-xs'
                    : 'border-slate-100 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-850/40 opacity-60'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div
                      className="w-8 h-8 rounded-xl flex items-center justify-center shadow-xs font-bold text-xs"
                      style={{ backgroundColor: app.iconBgColor, color: app.textColor }}
                    >
                      {methodInfo.icon}
                    </div>
                    <div>
                      <h3 className="text-xs font-bold text-slate-900 dark:text-white">{app.name}</h3>
                      <span className="text-[10px] text-slate-400 dark:text-slate-500">
                        {app.isEnabled ? 'Auto-Detection On' : 'Paused'}
                      </span>
                    </div>
                  </div>

                  {/* Toggle Switch */}
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={app.isEnabled}
                      onChange={() => toggleLinkedPaymentApp(app.id)}
                      className="sr-only peer"
                    />
                    <div className="w-9 h-5 bg-slate-200 dark:bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-slate-900 dark:peer-checked:bg-indigo-600"></div>
                  </label>
                </div>

                <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-700/60 flex items-center justify-between text-xs">
                  {isEditing ? (
                    <div className="flex items-center gap-1.5 w-full">
                      <input
                        type="text"
                        value={editingUpiId}
                        onChange={(e) => setEditingUpiId(e.target.value)}
                        placeholder="e.g. deven@ybl"
                        className="flex-1 px-2.5 py-1 text-xs border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500"
                        autoFocus
                      />
                      <button
                        onClick={() => handleSaveEdit(app.id)}
                        className="p-1.5 bg-slate-900 dark:bg-indigo-600 text-white rounded-lg text-xs cursor-pointer"
                      >
                        <Check className="w-3 h-3" />
                      </button>
                    </div>
                  ) : (
                    <>
                      <div className="text-[11px] text-slate-600 dark:text-slate-300 truncate max-w-[170px]">
                        <span className="text-slate-400 dark:text-slate-500 block text-[9px] uppercase tracking-wider font-semibold">
                          ID / Handle
                        </span>
                        <span className="font-mono font-medium">{app.upiId || 'Not configured'}</span>
                      </div>
                      <button
                        onClick={() => handleStartEdit(app.id, app.upiId)}
                        className="text-[11px] font-semibold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white flex items-center gap-1 cursor-pointer"
                        title="Edit UPI ID"
                      >
                        <Edit2 className="w-3 h-3 text-slate-400" />
                        <span>Edit</span>
                      </button>
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Section 2: Interactive Simulation & Fast Test Triggers */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Card A: 1-Click Payment Simulator */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-amber-500" />
              <h2 className="text-sm font-bold text-slate-900 dark:text-white">
                Simulate Live UPI Payments (1-Click Test)
              </h2>
            </div>
            <span className="text-[10px] font-bold text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/40 px-2 py-0.5 rounded-full border border-amber-200 dark:border-amber-800">
              Try It Out
            </span>
          </div>

          <p className="text-slate-600 dark:text-slate-400 text-xs leading-relaxed">
            Tap any button below to trigger an incoming payment alert. Aura will instantly see the expense, extract details, and <strong>ask you only which category to store it in</strong>:
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
            <button
              onClick={() => handleTriggerSimulation('phonepe_swiggy')}
              className="p-3 rounded-2xl border border-purple-200 dark:border-purple-800/60 bg-purple-50/50 dark:bg-purple-950/30 hover:bg-purple-100/60 dark:hover:bg-purple-900/40 text-left transition-all active:scale-[0.98] group cursor-pointer flex items-center justify-between"
            >
              <div>
                <div className="flex items-center gap-1.5 text-xs font-bold text-purple-950 dark:text-purple-300">
                  <span className="w-2 h-2 rounded-full bg-purple-600 dark:bg-purple-400" />
                  PhonePe UPI
                </div>
                <div className="text-[11px] text-purple-900 dark:text-purple-200 font-semibold mt-0.5">
                  Swiggy · ₹420.00
                </div>
                <span className="text-[9px] text-purple-700 dark:text-purple-400 block mt-0.5">
                  Food &amp; Dining alert
                </span>
              </div>
              <ArrowRight className="w-4 h-4 text-purple-600 dark:text-purple-400 group-hover:translate-x-0.5 transition-transform" />
            </button>

            <button
              onClick={() => handleTriggerSimulation('applepay_starbucks')}
              className="p-3 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-750 text-left transition-all active:scale-[0.98] group cursor-pointer flex items-center justify-between"
            >
              <div>
                <div className="flex items-center gap-1.5 text-xs font-bold text-slate-950 dark:text-slate-200">
                  <span className="w-2 h-2 rounded-full bg-slate-900 dark:bg-white" />
                  Apple Pay
                </div>
                <div className="text-[11px] text-slate-900 dark:text-slate-200 font-semibold mt-0.5">
                  Starbucks Coffee · $14.50
                </div>
                <span className="text-[9px] text-slate-500 dark:text-slate-400 block mt-0.5">
                  Apple Wallet alert
                </span>
              </div>
              <ArrowRight className="w-4 h-4 text-slate-600 dark:text-slate-300 group-hover:translate-x-0.5 transition-transform" />
            </button>

            <button
              onClick={() => handleTriggerSimulation('gpay_fuel')}
              className="p-3 rounded-2xl border border-blue-200 dark:border-blue-800/60 bg-blue-50/50 dark:bg-blue-950/30 hover:bg-blue-100/60 dark:hover:bg-blue-900/40 text-left transition-all active:scale-[0.98] group cursor-pointer flex items-center justify-between"
            >
              <div>
                <div className="flex items-center gap-1.5 text-xs font-bold text-blue-950 dark:text-blue-300">
                  <span className="w-2 h-2 rounded-full bg-blue-600 dark:bg-blue-400" />
                  Google Pay
                </div>
                <div className="text-[11px] text-blue-900 dark:text-blue-200 font-semibold mt-0.5">
                  Shell Petrol · ₹650.00
                </div>
                <span className="text-[9px] text-blue-700 dark:text-blue-400 block mt-0.5">
                  Transit &amp; Fuel alert
                </span>
              </div>
              <ArrowRight className="w-4 h-4 text-blue-600 dark:text-blue-400 group-hover:translate-x-0.5 transition-transform" />
            </button>

            <button
              onClick={() => handleTriggerSimulation('paytm_groceries')}
              className="p-3 rounded-2xl border border-sky-200 dark:border-sky-800/60 bg-sky-50/50 dark:bg-sky-950/30 hover:bg-sky-100/60 dark:hover:bg-sky-900/40 text-left transition-all active:scale-[0.98] group cursor-pointer flex items-center justify-between"
            >
              <div>
                <div className="flex items-center gap-1.5 text-xs font-bold text-sky-950 dark:text-sky-300">
                  <span className="w-2 h-2 rounded-full bg-sky-600 dark:bg-sky-400" />
                  Paytm UPI
                </div>
                <div className="text-[11px] text-sky-900 dark:text-sky-200 font-semibold mt-0.5">
                  Blinkit Market · ₹380.00
                </div>
                <span className="text-[9px] text-sky-700 dark:text-sky-400 block mt-0.5">
                  Grocery notification
                </span>
              </div>
              <ArrowRight className="w-4 h-4 text-sky-600 dark:text-sky-400 group-hover:translate-x-0.5 transition-transform" />
            </button>
          </div>
        </div>

        {/* Card B: Paste Bank SMS or Notification Text */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-2">
                <ClipboardPaste className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                <h2 className="text-sm font-bold text-slate-900 dark:text-white">
                  Paste Bank SMS or UPI Notification
                </h2>
              </div>
              <span className="text-[10px] font-semibold text-indigo-700 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-950/40 px-2 py-0.5 rounded-full border border-indigo-200 dark:border-indigo-800">
                Auto-Parser
              </span>
            </div>
            <p className="text-slate-600 dark:text-slate-400 text-xs">
              Copy-paste any payment notification text from your phone or bank SMS. Aura extracts the amount, payee, and payment method instantly:
            </p>
          </div>

          <form onSubmit={handleParsePastedText} className="space-y-3">
            <textarea
              rows={3}
              value={pasteText}
              onChange={(e) => setPasteText(e.target.value)}
              placeholder="e.g. Paid Rs. 850.00 to Zomato via PhonePe UPI on 14-Oct. UPI Ref 38291048291..."
              className="w-full p-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-800 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all font-mono"
            />

            {pasteError && (
              <div className="flex items-center gap-1.5 text-[11px] text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40 p-2 rounded-lg border border-rose-200 dark:border-rose-800">
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                <span>{pasteError}</span>
              </div>
            )}

            <button
              type="submit"
              className="w-full py-2.5 bg-slate-900 dark:bg-indigo-600 hover:bg-slate-800 dark:hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold shadow-xs flex items-center justify-center gap-2 transition-all active:scale-[0.98] cursor-pointer"
            >
              {pasteSuccess ? (
                <>
                  <Check className="w-4 h-4 text-emerald-300" />
                  <span>Expense Detected! Opening Category Prompt...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Detect &amp; Categorize Expense</span>
                </>
              )}
            </button>
          </form>
        </div>
      </div>

      {/* Section 3: Learned Auto-Categorization Rules & Pending Queue */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Recent Detected Alerts History (2 cols) */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-slate-600 dark:text-slate-400" />
              <h2 className="text-sm font-bold text-slate-900 dark:text-white">
                Recent Detected Expenses
              </h2>
            </div>
            <span className="text-[11px] text-slate-500 dark:text-slate-400">
              {detectedExpenses.length} Total Alerts Detected
            </span>
          </div>

          {detectedExpenses.length === 0 ? (
            <div className="py-8 text-center text-slate-400 dark:text-slate-500 text-xs space-y-2">
              <Smartphone className="w-8 h-8 text-slate-300 dark:text-slate-600 mx-auto" />
              <p>No incoming expenses detected yet.</p>
              <p className="text-[11px] text-slate-400 dark:text-slate-500">
                Click one of the 1-click test buttons above or paste an SMS notification to see how it works!
              </p>
            </div>
          ) : (
            <div className="space-y-2.5">
              {detectedExpenses.slice(0, 8).map((exp) => {
                const methodInfo = getPaymentMethodInfo(exp.paymentMethod);
                const isPending = exp.status === 'pending';
                const cat = exp.suggestedCategoryId ? categoryMap.get(exp.suggestedCategoryId) : null;

                return (
                  <div
                    key={exp.id}
                    className={`p-3.5 rounded-2xl border flex items-center justify-between gap-3 transition-colors ${
                      isPending
                        ? 'border-amber-200 dark:border-amber-800/80 bg-amber-50/40 dark:bg-amber-950/30'
                        : 'border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-9 h-9 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center shrink-0 shadow-xs">
                        {methodInfo.icon}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-slate-900 dark:text-white truncate">
                            {exp.merchant}
                          </span>
                          <span
                            className={`text-[9px] font-semibold px-2 py-0.5 rounded-full border ${methodInfo.badgeBg} ${methodInfo.textColor} ${methodInfo.borderColor}`}
                          >
                            {methodInfo.shortName}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-[10px] text-slate-400 dark:text-slate-500 mt-0.5">
                          <span>{exp.date}</span>
                          {exp.time && <span>· {exp.time}</span>}
                          {exp.referenceId && <span>· Ref: {exp.referenceId}</span>}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                      <span className="text-sm font-extrabold text-slate-900 dark:text-white tabular-nums">
                        {formatCurrency(exp.amount, settings.currency)}
                      </span>

                      {isPending ? (
                        <button
                          onClick={() => onOpenCategorizeModal(exp)}
                          className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl text-xs shadow-xs transition-colors cursor-pointer"
                        >
                          Categorize Now
                        </button>
                      ) : (
                        <div className="flex items-center gap-1 text-[11px] font-semibold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-lg border border-emerald-200 dark:border-emerald-800">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                          <span>{cat ? cat.name : 'Categorized'}</span>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Right Column: Learned Auto-Categorization Rules (1 col) */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Tag className="w-4 h-4 text-slate-600 dark:text-slate-400" />
              <h2 className="text-sm font-bold text-slate-900 dark:text-white">
                Learned Merchant Rules
              </h2>
            </div>
            <span className="text-[10px] font-bold text-indigo-700 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-950/40 px-2 py-0.5 rounded-full border border-indigo-200 dark:border-indigo-800">
              Smart Memory
            </span>
          </div>

          <p className="text-slate-500 dark:text-slate-400 text-[11px] leading-relaxed">
            Whenever you categorize an expense, Aura remembers it for next time to automatically suggest the exact category.
          </p>

          <div className="space-y-2 pt-1 max-h-[380px] overflow-y-auto">
            {merchantRules.map((rule, idx) => {
              const cat = categoryMap.get(rule.categoryId);
              return (
                <div
                  key={idx}
                  className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-700/60 flex items-center justify-between text-xs"
                >
                  <span className="font-semibold text-slate-800 dark:text-slate-200 capitalize">
                    {rule.merchantKeyword}
                  </span>
                  <div className="flex items-center gap-1.5">
                    <ArrowRight className="w-3 h-3 text-slate-400" />
                    <span
                      className="text-[10px] font-semibold px-2 py-0.5 rounded-md"
                      style={{
                        backgroundColor: cat?.bgColor || '#f1f5f9',
                        color: cat?.color || '#334155',
                      }}
                    >
                      {cat?.name || rule.categoryId}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
