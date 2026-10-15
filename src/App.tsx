/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useFinanceStore } from './hooks/useFinanceStore';
import { Header, ActiveTab } from './components/layout/Header';
import { MobileTabBar } from './components/layout/MobileTabBar';
import { OverviewView } from './components/views/OverviewView';
import { PaymentIntegrationView } from './components/views/PaymentIntegrationView';
import { BudgetsView } from './components/views/BudgetsView';
import { SavingsView } from './components/views/SavingsView';
import { LedgerView } from './components/views/LedgerView';
import { AnalyticsView } from './components/views/AnalyticsView';
import { AddTransactionModal } from './components/modals/AddTransactionModal';
import { ContributeGoalModal } from './components/modals/ContributeGoalModal';
import { APKExportModal } from './components/modals/APKExportModal';
import { SettingsModal } from './components/modals/SettingsModal';
import { CategorizeExpenseModal } from './components/modals/CategorizeExpenseModal';
import { EditBudgetModal } from './components/modals/EditBudgetModal';
import { BudgetAlertBanner } from './components/alerts/BudgetAlertBanner';
import { BudgetAlertToast } from './components/alerts/BudgetAlertToast';
import { BudgetAlertsDrawer } from './components/alerts/BudgetAlertsDrawer';
import { Category, DetectedExpense, SavingsGoal } from './types/finance';
import { formatCurrency } from './utils/formatters';
import { getPaymentMethodInfo } from './utils/paymentMethodHelpers';
import { Zap, Sparkles, X } from 'lucide-react';

export default function App() {
  const store = useFinanceStore();
  const [activeTab, setActiveTab] = useState<ActiveTab>('overview');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isAPKModalOpen, setIsAPKModalOpen] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [isAlertsDrawerOpen, setIsAlertsDrawerOpen] = useState(false);
  const [adjustingCategory, setAdjustingCategory] = useState<Category | null>(null);
  const [activeDetectedExpense, setActiveDetectedExpense] = useState<DetectedExpense | null>(null);
  const [contributeTarget, setContributeTarget] = useState<SavingsGoal | null>(null);

  const currentAppUrl =
    typeof window !== 'undefined' && window.location.origin && !window.location.origin.includes('localhost')
      ? window.location.href
      : 'https://ais-dev-xya2klilgvskgzulkkfimt-211067390459.asia-northeast1.run.app';

  // The first pending detected expense for quick floating action
  const topPendingExpense = store.pendingDetectedExpenses[0] || null;

  const handleAdjustLimitFromAlert = (categoryId: string) => {
    const cat = store.categoryMap.get(categoryId);
    if (cat) {
      setAdjustingCategory(cat);
    } else {
      setActiveTab('budgets');
    }
  };

  return (
    <div className="min-h-screen bg-[#F5F5F7] dark:bg-[#0A0D14] text-slate-900 dark:text-slate-100 flex flex-col font-sans selection:bg-indigo-600 selection:text-white pb-24 md:pb-12 transition-colors duration-200">
      {/* 3-Zone Desktop / Responsive Navigation Header */}
      <Header
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onOpenAddModal={() => setIsAddModalOpen(true)}
        onOpenAPKModal={() => setIsAPKModalOpen(true)}
        onOpenSettingsModal={() => setIsSettingsModalOpen(true)}
        userName={store.settings.userName}
        isStoragePersistent={store.isStoragePersistent}
        pendingExpensesCount={store.pendingDetectedExpenses.length}
        activeAlertsCount={store.unDismissedBudgetAlerts.length}
        onOpenAlertsDrawer={() => setIsAlertsDrawerOpen(true)}
        darkMode={store.settings.darkMode}
        onToggleDarkMode={store.toggleDarkMode}
      />

      {/* Main Viewport Content Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-6 sm:pt-8 space-y-6 animate-in fade-in duration-200">
        {/* Global Budget Alert Banner (when categories are approaching or exceeding limit) */}
        {store.unDismissedBudgetAlerts.length > 0 && (
          <BudgetAlertBanner
            alerts={store.unDismissedBudgetAlerts}
            currency={store.settings.currency}
            onOpenAlertsDrawer={() => setIsAlertsDrawerOpen(true)}
            onAdjustLimit={handleAdjustLimitFromAlert}
            onDismissAlert={store.dismissBudgetAlert}
          />
        )}

        {activeTab === 'overview' && (
          <OverviewView
            store={store}
            onNavigate={setActiveTab}
            onOpenAddModal={() => setIsAddModalOpen(true)}
            onContributeGoal={(goal) => setContributeTarget(goal)}
            onOpenCategorizeModal={(exp) => setActiveDetectedExpense(exp)}
            onOpenAlertsDrawer={() => setIsAlertsDrawerOpen(true)}
          />
        )}

        {activeTab === 'payments' && (
          <PaymentIntegrationView
            store={store}
            onOpenCategorizeModal={(exp) => setActiveDetectedExpense(exp)}
          />
        )}

        {activeTab === 'budgets' && (
          <BudgetsView
            store={store}
            onOpenAlertsDrawer={() => setIsAlertsDrawerOpen(true)}
          />
        )}

        {activeTab === 'savings' && <SavingsView store={store} />}

        {activeTab === 'ledger' && (
          <LedgerView
            store={store}
            onOpenAddModal={() => setIsAddModalOpen(true)}
          />
        )}

        {activeTab === 'analytics' && <AnalyticsView store={store} />}
      </main>

      {/* Real-time Interactive Budget Alert Toast Notification */}
      <BudgetAlertToast
        alert={store.latestBudgetNotification}
        currency={store.settings.currency}
        onClose={store.clearLatestBudgetNotification}
        onAdjustLimit={handleAdjustLimitFromAlert}
        onViewBudgets={() => setActiveTab('budgets')}
      />

      {/* Floating Pending UPI Expense Alert Bar */}
      {store.settings.dashboardWidgets?.showFloatingUpiPopup !== false && topPendingExpense && !activeDetectedExpense && (
        <div className="fixed bottom-20 md:bottom-6 left-4 right-4 max-w-lg mx-auto z-40 animate-in slide-in-from-bottom duration-200">
          <div
            onClick={() => setActiveDetectedExpense(topPendingExpense)}
            className="p-3.5 bg-slate-900 text-white rounded-2xl shadow-xl flex items-center justify-between gap-3 cursor-pointer hover:bg-slate-850 border border-slate-700/80 active:scale-[0.99] transition-all"
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-xl bg-purple-500/20 text-purple-300 border border-purple-400/30 flex items-center justify-center shrink-0">
                <Zap className="w-4 h-4 text-purple-300" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-1.5 text-xs font-bold truncate">
                  <span>{topPendingExpense.merchant}</span>
                  <span className="text-slate-400">·</span>
                  <span className="text-emerald-400 tabular-nums">
                    {formatCurrency(topPendingExpense.amount, store.settings.currency)}
                  </span>
                </div>
                <span className="text-[10px] text-slate-400 block truncate">
                  Detected from {getPaymentMethodInfo(topPendingExpense.paymentMethod).name}. Tap to categorize!
                </span>
              </div>
            </div>

            <div className="flex items-center gap-1.5 shrink-0">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setActiveDetectedExpense(topPendingExpense);
                }}
                className="px-3 py-1.5 bg-white text-slate-900 font-bold rounded-xl text-xs shadow-xs flex items-center gap-1 hover:bg-slate-100 cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                <span>Categorize</span>
              </button>

              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  store.dismissDetectedExpense(topPendingExpense.id);
                }}
                title="Dismiss this notification"
                aria-label="Dismiss notification"
                className="w-7 h-7 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Fixed Thumb-Zone Bottom Tab Bar on Mobile */}
      <MobileTabBar
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onOpenAddModal={() => setIsAddModalOpen(true)}
        pendingExpensesCount={store.pendingDetectedExpenses.length}
        activeAlertsCount={store.unDismissedBudgetAlerts.length}
      />

      {/* Budget Alerts Management Drawer */}
      <BudgetAlertsDrawer
        isOpen={isAlertsDrawerOpen}
        onClose={() => setIsAlertsDrawerOpen(false)}
        alerts={store.activeBudgetAlerts}
        allAlertsCount={store.activeBudgetAlerts.length}
        currency={store.settings.currency}
        settings={store.settings}
        onAdjustLimit={handleAdjustLimitFromAlert}
        onDismissAlert={store.dismissBudgetAlert}
        onResetDismissedAlerts={store.resetDismissedAlerts}
        onUpdateAlertSettings={store.updateBudgetAlertSettings}
        onNavigateToBudgets={() => setActiveTab('budgets')}
      />

      {/* Modals */}
      <CategorizeExpenseModal
        detectedExpense={activeDetectedExpense}
        categories={store.categories}
        currency={store.settings.currency}
        onCategorize={(id, catId, remember) => {
          store.categorizeExpense(id, catId, remember);
          setActiveDetectedExpense(null);
        }}
        onDismiss={(id) => {
          store.dismissDetectedExpense(id);
          setActiveDetectedExpense(null);
        }}
      />

      <AddTransactionModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        categories={store.categories}
        savingsGoals={store.savingsGoals}
        currency={store.settings.currency}
        onAddTransaction={store.addTransaction}
      />

      {/* Quick Edit Budget Modal from Alerts */}
      {adjustingCategory && (
        <EditBudgetModal
          category={adjustingCategory}
          isOpen={!!adjustingCategory}
          onClose={() => setAdjustingCategory(null)}
          currency={store.settings.currency}
          onUpdateLimit={store.updateCategoryLimit}
        />
      )}

      <ContributeGoalModal
        goal={contributeTarget}
        isOpen={!!contributeTarget}
        onClose={() => setContributeTarget(null)}
        currency={store.settings.currency}
        onContribute={store.contributeToSavingsGoal}
      />

      <APKExportModal
        isOpen={isAPKModalOpen}
        onClose={() => setIsAPKModalOpen(false)}
        userBackupData={{
          transactions: store.transactions,
          categories: store.categories,
          savingsGoals: store.savingsGoals,
          recurringBills: store.recurringBills,
          settings: store.settings,
          linkedPaymentApps: store.linkedPaymentApps,
          detectedExpenses: store.detectedExpenses,
        }}
      />

      <SettingsModal
        isOpen={isSettingsModalOpen}
        onClose={() => setIsSettingsModalOpen(false)}
        settings={store.settings}
        isStoragePersistent={store.isStoragePersistent}
        lastSavedTimestamp={store.lastSavedTimestamp}
        transactionsCount={store.transactions.length}
        savingsGoalsCount={store.savingsGoals.length}
        recurringBillsCount={store.recurringBills.length}
        onUpdateSettings={store.updateSettings}
        onExportJSON={store.exportDataJSON}
        onDownloadAPK={() => store.exportDataAPK(currentAppUrl)}
        onImportJSON={store.importDataJSON}
        onResetData={store.resetToDefaults}
        onLoadSampleData={store.loadSampleTestData}
      />
    </div>
  );
}
