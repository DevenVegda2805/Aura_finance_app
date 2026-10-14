import React, { useState } from 'react';
import { CurrencyCode, SavingsGoal } from '../../types/finance';
import { X, Check } from 'lucide-react';

interface AddSavingsGoalModalProps {
  isOpen: boolean;
  onClose: () => void;
  currency: CurrencyCode;
  onAddGoal: (goal: Omit<SavingsGoal, 'id' | 'currentAmount'>) => void;
}

const COLOR_OPTIONS = [
  '#34C759', // Emerald
  '#007AFF', // Blue
  '#5856D6', // Indigo
  '#FF2D55', // Coral Red
  '#FF9500', // Orange
  '#AF52DE', // Purple
  '#30B0C7', // Teal
];

const ICON_OPTIONS = [
  { name: 'shieldcheck', label: 'Emergency Fund' },
  { name: 'plane', label: 'Travel & Trips' },
  { name: 'home', label: 'Home / Real Estate' },
  { name: 'laptop', label: 'Tech & Gear' },
  { name: 'car', label: 'Vehicle' },
  { name: 'piggybank', label: 'General Reserve' },
  { name: 'gift', label: 'Special Occasion' },
];

export const AddSavingsGoalModal: React.FC<AddSavingsGoalModalProps> = ({
  isOpen,
  onClose,
  currency,
  onAddGoal,
}) => {
  const [title, setTitle] = useState('');
  const [targetAmount, setTargetAmount] = useState('');
  const [targetDate, setTargetDate] = useState('2026-12-31');
  const [category, setCategory] = useState('Safety');
  const [color, setColor] = useState(COLOR_OPTIONS[0]);
  const [iconName, setIconName] = useState('shieldcheck');
  const [notes, setNotes] = useState('');
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const target = parseFloat(targetAmount);
    if (isNaN(target) || target <= 0) {
      setError('Please enter a valid target savings amount.');
      return;
    }
    if (!title.trim()) {
      setError('Please provide a goal title.');
      return;
    }

    onAddGoal({
      title: title.trim(),
      targetAmount: target,
      targetDate,
      category,
      color,
      iconName,
      notes: notes.trim() || undefined,
    });

    setTitle('');
    setTargetAmount('');
    setError('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl border border-slate-100 overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-5 pb-3 border-b border-slate-100">
          <h2 className="text-lg font-bold text-slate-900 tracking-tight">Create Savings Goal</h2>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-600 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
          {error && (
            <div className="p-3 bg-rose-50 text-rose-700 text-xs rounded-xl border border-rose-200">
              {error}
            </div>
          )}

          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1">Goal Title</label>
            <input
              type="text"
              placeholder="e.g. Dream Tokyo Vacation, Emergency Reserve"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-slate-900 text-slate-900"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1">Target Savings Goal ({currency})</label>
            <input
              type="number"
              step="10"
              min="1"
              placeholder="5000"
              value={targetAmount}
              onChange={(e) => setTargetAmount(e.target.value)}
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-slate-900 text-slate-900 tabular-nums font-semibold"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1">Target Date</label>
              <input
                type="date"
                value={targetDate}
                onChange={(e) => setTargetDate(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-900"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1">Type / Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-900"
              >
                <option value="Safety">Safety & Emergency</option>
                <option value="Travel">Travel & Adventure</option>
                <option value="Asset">Asset & Real Estate</option>
                <option value="Tech">Tech & Gadgets</option>
                <option value="Personal">Personal Milestone</option>
              </select>
            </div>
          </div>

          {/* Icon Style */}
          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1">Icon Style</label>
            <div className="grid grid-cols-4 gap-2">
              {ICON_OPTIONS.map((item) => (
                <button
                  key={item.name}
                  type="button"
                  onClick={() => setIconName(item.name)}
                  className={`p-2 text-xs rounded-xl border text-center transition-all ${
                    iconName === item.name
                      ? 'border-slate-900 bg-slate-900 text-white shadow-sm'
                      : 'border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700'
                  }`}
                >
                  <span className="truncate block text-[11px]">{item.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Color Tag */}
          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1">Theme Color</label>
            <div className="flex items-center gap-3">
              {COLOR_OPTIONS.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setColor(c)}
                  style={{ backgroundColor: c }}
                  className={`w-7 h-7 rounded-full transition-transform ${
                    color === c ? 'ring-2 ring-offset-2 ring-slate-900 scale-110' : 'opacity-80 hover:opacity-100'
                  }`}
                />
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1">Notes (Optional)</label>
            <input
              type="text"
              placeholder="e.g. Monthly transfer on 1st of month"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-900"
            />
          </div>

          <div className="pt-2 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 text-xs font-medium text-slate-600 hover:text-slate-900"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold shadow-md active:scale-95 transition-all flex items-center gap-1.5"
            >
              <Check className="w-3.5 h-3.5" />
              Start Goal
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
