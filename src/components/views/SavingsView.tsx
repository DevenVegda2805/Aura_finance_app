import React, { useState } from 'react';
import { FinanceStore } from '../../hooks/useFinanceStore';
import { SavingsGoal } from '../../types/finance';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { getCategoryIcon } from '../../utils/categoryIcons';
import { ProgressRing } from '../charts/ProgressRing';
import { AddSavingsGoalModal } from '../modals/AddSavingsGoalModal';
import { ContributeGoalModal } from '../modals/ContributeGoalModal';
import { Plus, PiggyBank, Calendar, Sparkles, Trash2 } from 'lucide-react';

interface SavingsViewProps {
  store: FinanceStore;
}

export const SavingsView: React.FC<SavingsViewProps> = ({ store }) => {
  const {
    savingsGoals,
    totalAccumulatedSavings,
    totalSavingsTarget,
    addSavingsGoal,
    contributeToSavingsGoal,
    deleteSavingsGoal,
    settings,
  } = store;

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [contributeTarget, setContributeTarget] = useState<SavingsGoal | null>(null);

  const overallProgress =
    totalSavingsTarget > 0
      ? Math.min(100, Math.round((totalAccumulatedSavings / totalSavingsTarget) * 100))
      : 0;

  // Calculate required monthly contribution for a goal
  const calculateMonthlyTarget = (goal: SavingsGoal) => {
    const remaining = Math.max(0, goal.targetAmount - goal.currentAmount);
    if (remaining === 0) return 0;

    const targetDate = new Date(goal.targetDate);
    const today = new Date();
    const monthsDiff =
      (targetDate.getFullYear() - today.getFullYear()) * 12 +
      (targetDate.getMonth() - today.getMonth());

    const effectiveMonths = Math.max(1, monthsDiff);
    return Math.round(remaining / effectiveMonths);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="text-xs text-slate-500 dark:text-slate-400 font-medium">
            Long-Term Wealth &amp; Milestone Tracking
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white mt-0.5">
            Savings Goals
          </h1>
        </div>

        <button
          onClick={() => setIsAddModalOpen(true)}
          className="self-start sm:self-auto px-4 py-2 bg-slate-900 dark:bg-indigo-600 hover:bg-slate-800 dark:hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold shadow-sm transition-all flex items-center gap-1.5 active:scale-95 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>New Savings Goal</span>
        </button>
      </div>

      {/* Aggregate Savings Progress Banner */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-5 w-full md:w-auto">
          <ProgressRing
            progress={overallProgress}
            size={84}
            strokeWidth={8}
            color="#34C759"
            trackColor="#334155"
          >
            <span className="text-sm font-extrabold text-slate-900 dark:text-white tabular-nums">
              {overallProgress}%
            </span>
          </ProgressRing>

          <div>
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Total Accumulated Reserves
            </span>
            <div className="flex items-baseline gap-2 mt-0.5">
              <span className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight tabular-nums">
                {formatCurrency(totalAccumulatedSavings, settings.currency)}
              </span>
              <span className="text-xs text-slate-500 dark:text-slate-400">
                of {formatCurrency(totalSavingsTarget, settings.currency)} overall milestone
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              {formatCurrency(Math.max(0, totalSavingsTarget - totalAccumulatedSavings), settings.currency)} remaining across {savingsGoals.length} life goals
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto justify-end">
          <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700/80 text-center min-w-[120px]">
            <span className="text-[11px] text-slate-500 dark:text-slate-400 block">Active Goals</span>
            <span className="text-base font-extrabold text-slate-900 dark:text-white tabular-nums">
              {savingsGoals.length}
            </span>
          </div>
          <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 rounded-2xl border border-emerald-100 dark:border-emerald-800 text-center min-w-[120px]">
            <span className="text-[11px] text-emerald-700 dark:text-emerald-300 block font-medium">Milestones</span>
            <span className="text-base font-extrabold text-emerald-800 dark:text-emerald-200 tabular-nums">
              {savingsGoals.filter((g) => g.currentAmount >= g.targetAmount).length} Reached
            </span>
          </div>
        </div>
      </div>

      {/* Goals Grid or Empty State */}
      {savingsGoals.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 p-12 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xs text-center space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 mx-auto flex items-center justify-center">
            <PiggyBank className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-slate-900 dark:text-white">Start Your First Savings Milestone</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
            Create a savings goal with a target amount and date. Aura will pace your monthly deposits and track your progress rings.
          </p>
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="px-5 py-2.5 bg-slate-900 dark:bg-indigo-600 hover:bg-slate-800 dark:hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold shadow-sm transition-all inline-flex items-center gap-1.5 active:scale-95 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Create Savings Goal</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {savingsGoals.map((goal) => {
            const pct = Math.min(100, Math.round((goal.currentAmount / goal.targetAmount) * 100));
            const monthlyTarget = calculateMonthlyTarget(goal);
            const isComplete = goal.currentAmount >= goal.targetAmount;

            return (
              <div
                key={goal.id}
                className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-col justify-between space-y-5 hover:border-slate-300 dark:hover:border-slate-700 transition-colors"
              >
                <div>
                  {/* Header: Title, Category, Delete */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <div
                        className="w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 text-white shadow-xs"
                        style={{ backgroundColor: goal.color }}
                      >
                        {getCategoryIcon(goal.iconName, { className: 'w-5 h-5' })}
                      </div>
                      <div className="min-w-0">
                        <h3 className="text-base font-bold text-slate-900 dark:text-white truncate">
                          {goal.title}
                        </h3>
                        <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
                          <span>{goal.category}</span>
                          <span aria-hidden="true">·</span>
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3 h-3 text-slate-400" />
                            Target: {formatDate(goal.targetDate)}
                          </span>
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => deleteSavingsGoal(goal.id)}
                      className="w-7 h-7 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 flex items-center justify-center transition-colors cursor-pointer"
                      title="Delete Goal"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Ring & Progress Details */}
                  <div className="mt-5 flex items-center gap-6">
                    <ProgressRing
                      progress={pct}
                      size={76}
                      strokeWidth={7}
                      color={goal.color}
                      trackColor="#334155"
                    >
                      <span className="text-xs font-bold text-slate-900 dark:text-white tabular-nums">
                        {pct}%
                      </span>
                    </ProgressRing>

                    <div className="space-y-1">
                      <div>
                        <span className="text-2xl font-extrabold text-slate-900 dark:text-white tabular-nums">
                          {formatCurrency(goal.currentAmount, settings.currency)}
                        </span>
                        <span className="text-xs text-slate-400 dark:text-slate-500 tabular-nums ml-1">
                          / {formatCurrency(goal.targetAmount, settings.currency)}
                        </span>
                      </div>

                      {isComplete ? (
                        <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-600 dark:text-emerald-400">
                          <Sparkles className="w-3.5 h-3.5" />
                          Milestone 100% Achieved!
                        </span>
                      ) : (
                        <p className="text-xs text-slate-500 dark:text-slate-400 tabular-nums">
                          Need ~<strong>{formatCurrency(monthlyTarget, settings.currency)}/mo</strong> to hit date
                        </p>
                      )}
                    </div>
                  </div>

                  {goal.notes && (
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-3 p-2.5 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-700/80">
                      {goal.notes}
                    </p>
                  )}
                </div>

                {/* Actions */}
                <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-3">
                  <span className="text-xs text-slate-400 dark:text-slate-500">
                    {Math.max(0, goal.targetAmount - goal.currentAmount) > 0
                      ? `${formatCurrency(goal.targetAmount - goal.currentAmount, settings.currency)} to go`
                      : 'Goal funded'}
                  </span>

                  <button
                    onClick={() => setContributeTarget(goal)}
                    className="px-4 py-2 bg-slate-900 dark:bg-indigo-600 hover:bg-slate-800 dark:hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold shadow-xs transition-all active:scale-95 flex items-center gap-1.5 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Deposit Funds</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modals */}
      <AddSavingsGoalModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        currency={settings.currency}
        onAddGoal={addSavingsGoal}
      />

      <ContributeGoalModal
        goal={contributeTarget}
        isOpen={!!contributeTarget}
        onClose={() => setContributeTarget(null)}
        currency={settings.currency}
        onContribute={contributeToSavingsGoal}
      />
    </div>
  );
};
