/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useFinanceStore } from './hooks/useFinanceStore';
import { Header, ActiveTab } from './components/layout/Header';
import { MobileTabBar } from './components/layout/MobileTabBar';
import { OverviewView } from './components/views/OverviewView';
import { BudgetsView } from './components/views/BudgetsView';
import { SavingsView } from './components/views/SavingsView';
import { LedgerView } from './components/views/LedgerView';
import { AnalyticsView } from './components/views/AnalyticsView';
import { AddTransactionModal } from './components/modals/AddTransactionModal';
import { ContributeGoalModal } from './components/modals/ContributeGoalModal';
import { APKExportModal } from './components/modals/APKExportModal';
import { SettingsModal } from './components/modals/SettingsModal';
import { SavingsGoal } from './types/finance';

export default function App() {
  const store = useFinanceStore();
  const [activeTab, setActiveTab] = useState<ActiveTab>('overview');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isAPKModalOpen, setIsAPKModalOpen] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [contributeTarget, setContributeTarget] = useState<SavingsGoal | null>(null);

  return (
    <div className="min-h-screen bg-[#F5F5F7] text-slate-900 flex flex-col font-sans selection:bg-slate-900 selection:text-white pb-24 md:pb-12">
      {/* 3-Zone Desktop / Responsive Navigation Header */}
      <Header
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onOpenAddModal={() => setIsAddModalOpen(true)}
        onOpenAPKModal={() => setIsAPKModalOpen(true)}
        onOpenSettingsModal={() => setIsSettingsModalOpen(true)}
      />

      {/* Main Viewport Content Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-6 sm:pt-8 animate-in fade-in duration-200">
        {activeTab === 'overview' && (
          <OverviewView
            store={store}
            onNavigate={setActiveTab}
            onOpenAddModal={() => setIsAddModalOpen(true)}
            onContributeGoal={(goal) => setContributeTarget(goal)}
          />
        )}

        {activeTab === 'budgets' && <BudgetsView store={store} />}

        {activeTab === 'savings' && <SavingsView store={store} />}

        {activeTab === 'ledger' && (
          <LedgerView
            store={store}
            onOpenAddModal={() => setIsAddModalOpen(true)}
          />
        )}

        {activeTab === 'analytics' && <AnalyticsView store={store} />}
      </main>

      {/* Fixed Thumb-Zone Bottom Tab Bar on Mobile */}
      <MobileTabBar
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onOpenAddModal={() => setIsAddModalOpen(true)}
      />

      {/* Modals */}
      <AddTransactionModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        categories={store.categories}
        savingsGoals={store.savingsGoals}
        currency={store.settings.currency}
        onAddTransaction={store.addTransaction}
      />

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
      />

      <SettingsModal
        isOpen={isSettingsModalOpen}
        onClose={() => setIsSettingsModalOpen(false)}
        settings={store.settings}
        onUpdateSettings={store.updateSettings}
        onExportJSON={store.exportDataJSON}
        onImportJSON={store.importDataJSON}
        onResetData={store.resetToDefaults}
      />
    </div>
  );
}
