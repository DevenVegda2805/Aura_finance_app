import React, { useState } from 'react';
import { FinanceStore } from '../../hooks/useFinanceStore';
import { SavingsGoal } from '../../types/finance';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { getCategoryIcon } from '../../utils/categoryIcons';
import { ProgressRing } from '../charts/ProgressRing';
import { AddSavingsGoalModal } from '../modals/AddSavingsGoalModal';
import { ContributeGoalModal } from '../modals/ContributeGoalModal';
import { Plus, PiggyBank, Target, Calendar, Sparkles, Trash2, TrendingUp } from 'lucide-react';

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
          <div className="text-xs text-slate-500 font-medium">
            Long-Term Wealth &amp; Milestone Tracking
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 mt-0.5">
            Savings Goals
          </h1>
        </div>

        <button
          onClick={() => setIsAddModalOpen(true)}
          className="self-start sm:self-auto px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold shadow-sm transition-all flex items-center gap-1.5 active:scale-95"
        >
          <Plus className="w-4 h-4" />
          <span>New Savings Goal</span>
        </button>
      </div>

      {/* Aggregate Savings Progress Banner */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-5 w-full md:w-auto">
          <ProgressRing
            progress={overallProgress}
            size={84}
            strokeWidth={8}
            color="#34C759"
            trackColor="#E2E8F0"
          >
            <span className="text-sm font-extrabold text-slate-900 tabular-nums">
              {overallProgress}%
            </span>
          </ProgressRing>

          <div>
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Total Accumulated Reserves
            </span>
            <div className="flex items-baseline gap-2 mt-0.5">
              <span className="text-3xl font-extrabold text-slate-900 tracking-tight tabular-nums">
                {formatCurrency(totalAccumulatedSavings, settings.currency)}
              </span>
              <span className="text-xs text-slate-500">
                of {formatCurrency(totalSavingsTarget, settings.currency)} overall milestone
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              {formatCurrency(Math.max(0, totalSavingsTarget - totalAccumulatedSavings), settings.currency)} remaining across {savingsGoals.length} life goals
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto justify-end">
          <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100 text-center min-w-[120px]">
            <span className="text-[11px] text-slate-500 block">Active Goals</span>
            <span className="text-base font-extrabold text-slate-900 tabular-nums">
              {savingsGoals.length}
            </span>
          </div>
          <div className="p-3 bg-emerald-50 rounded-2xl border border-emerald-100 text-center min-w-[120px]">
            <span className="text-[11px] text-emerald-700 block font-medium">Milestones</span>
            <span className="text-base font-extrabold text-emerald-800 tabular-nums">
              {savingsGoals.filter((g) => g.currentAmount >= g.targetAmount).length} Reached
            </span>
          </div>
        </div>
      </div>

      {/* Goals Grid or Empty State */}
      {savingsGoals.length === 0 ? (
        <div className="bg-white p-12 rounded-3xl border border-slate-200/80 shadow-sm text-center space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-500 mx-auto flex items-center justify-center">
            <PiggyBank className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-slate-900">Start Your First Savings Milestone</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Create a savings goal with a target amount and date. Aura will pace your monthly deposits and track your progress rings.
          </p>
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold shadow-sm transition-all inline-flex items-center gap-1.5 active:scale-95"
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
                className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm flex flex-col justify-between space-y-5 hover:border-slate-300 transition-colors"
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
                        <h3 className="text-base font-bold text-slate-900 truncate">
                          {goal.title}
                        </h3>
                        <div className="flex items-center gap-1.5 text-xs text-slate-500">
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
                      className="w-7 h-7 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 flex items-center justify-center transition-colors"
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
                      trackColor="#F1F5F9"
                    >
                      <span className="text-xs font-bold text-slate-900 tabular-nums">
                        {pct}%
                      </span>
                    </ProgressRing>

                    <div className="space-y-1">
                      <div>
                        <span className="text-2xl font-extrabold text-slate-900 tabular-nums">
                          {formatCurrency(goal.currentAmount, settings.currency)}
                        </span>
                        <span className="text-xs text-slate-400 tabular-nums ml-1">
                          / {formatCurrency(goal.targetAmount, settings.currency)}
                        </span>
                      </div>

                      {isComplete ? (
                        <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-600">
                          <Sparkles className="w-3.5 h-3.5" />
                          Milestone 100% Achieved!
                        </span>
                      ) : (
                        <p className="text-xs text-slate-500 tabular-nums">
                          Need ~<strong>{formatCurrency(monthlyTarget, settings.currency)}/mo</strong> to hit date
                        </p>
                      )}
                    </div>
                  </div>

                  {goal.notes && (
                    <p className="text-xs text-slate-500 mt-3 p-2.5 bg-slate-50 rounded-xl border border-slate-100">
                      {goal.notes}
                    </p>
                  )}
                </div>

                {/* Actions */}
                <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-3">
                  <span className="text-xs text-slate-400">
                    {Math.max(0, goal.targetAmount - goal.currentAmount) > 0
                      ? `${formatCurrency(goal.targetAmount - goal.currentAmount, settings.currency)} to go`
                      : 'Goal funded'}
                  </span>

                  <button
                    onClick={() => setContributeTarget(goal)}
                    className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold shadow-xs transition-all active:scale-95 flex items-center gap-1.5"
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
