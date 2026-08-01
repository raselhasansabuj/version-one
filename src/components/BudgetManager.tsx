import React, { useState } from 'react';
import { 
  SlidersHorizontal, 
  RotateCcw, 
  Save, 
  CheckCircle2, 
  DollarSign, 
  Calendar, 
  Layers, 
  ShieldAlert,
  Info
} from 'lucide-react';
import { BudgetPeriod, BudgetProfile, ExpenseCategory, ProfileType } from '../types';
import { CATEGORIES } from '../data/initialData';

interface BudgetManagerProps {
  currentProfile: BudgetProfile;
  profiles: BudgetProfile[];
  currency: string;
  onUpdateProfile: (updated: BudgetProfile) => void;
  onResetToDefaults: () => void;
  totalSpent: number;
}

export const BudgetManager: React.FC<BudgetManagerProps> = ({
  currentProfile,
  profiles,
  currency,
  onUpdateProfile,
  onResetToDefaults,
  totalSpent,
}) => {
  const [period, setPeriod] = useState<BudgetPeriod>(currentProfile.period);
  const [totalLimit, setTotalLimit] = useState<number>(currentProfile.totalLimit);
  const [income, setIncome] = useState<number>(currentProfile.income || 0);
  const [categoryLimits, setCategoryLimits] = useState<Partial<Record<ExpenseCategory, number>>>(
    currentProfile.categoryLimits || {}
  );
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateProfile({
      ...currentProfile,
      period,
      totalLimit,
      income,
      categoryLimits,
    });
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  const handleCategoryLimitChange = (category: ExpenseCategory, value: number) => {
    setCategoryLimits((prev) => ({
      ...prev,
      [category]: value,
    }));
  };

  const remaining = totalLimit - totalSpent;

  return (
    <div className="space-y-6 pb-20 md:pb-8 animate-fadeIn max-w-4xl mx-auto">
      
      {/* Title Header */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-sm">
        <div className="flex items-center justify-between gap-4 mb-2">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-100 dark:bg-emerald-950/80 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold">
              <SlidersHorizontal className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                Budget Management
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Configure spending limits, cycle periods, and category allocation for <span className="font-bold text-emerald-600">{currentProfile.name}</span>.
              </p>
            </div>
          </div>

          <button
            onClick={onResetToDefaults}
            className="flex items-center gap-1.5 px-3 py-1.5 border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-xl text-xs font-semibold transition-colors shrink-0"
            title="Reset All Profiles to Initial Sample State"
          >
            <RotateCcw className="w-3.5 h-3.5" /> Reset Data
          </button>
        </div>

        {savedSuccess && (
          <div className="mt-4 p-3 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 text-xs font-bold rounded-xl flex items-center gap-2 animate-fadeIn">
            <CheckCircle2 className="w-4 h-4" />
            Budget settings saved successfully!
          </div>
        )}

        <form onSubmit={handleSave} className="mt-6 space-y-6">
          
          {/* Cycle & Limits Config */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            
            {/* Period selector */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                Spending Cycle
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setPeriod('weekly')}
                  className={`py-2 px-3 text-xs font-bold rounded-xl border transition-all ${
                    period === 'weekly'
                      ? 'bg-emerald-600 text-white border-emerald-600'
                      : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                  }`}
                >
                  Weekly
                </button>
                <button
                  type="button"
                  onClick={() => setPeriod('monthly')}
                  className={`py-2 px-3 text-xs font-bold rounded-xl border transition-all ${
                    period === 'monthly'
                      ? 'bg-emerald-600 text-white border-emerald-600'
                      : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                  }`}
                >
                  Monthly
                </button>
              </div>
            </div>

            {/* Total Budget limit */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                Total Budget Limit ({currency})
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-xs">
                  {currency}
                </span>
                <input
                  type="number"
                  min="1"
                  step="10"
                  required
                  value={totalLimit}
                  onChange={(e) => setTotalLimit(Number(e.target.value))}
                  className="w-full pl-8 pr-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white text-sm font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>

            {/* Income expectation */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                Expected Income ({currency})
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-xs">
                  {currency}
                </span>
                <input
                  type="number"
                  min="0"
                  step="50"
                  value={income}
                  onChange={(e) => setIncome(Number(e.target.value))}
                  className="w-full pl-8 pr-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white text-sm font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>

          </div>

          {/* Real-time Calculation Preview */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-800 grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            <div>
              <span className="text-slate-500 dark:text-slate-400 block font-medium">Current Spent</span>
              <span className="text-base font-extrabold text-slate-900 dark:text-white">
                {currency}{totalSpent.toFixed(2)}
              </span>
            </div>
            <div>
              <span className="text-slate-500 dark:text-slate-400 block font-medium">Target Budget</span>
              <span className="text-base font-extrabold text-emerald-600 dark:text-emerald-400">
                {currency}{totalLimit.toFixed(2)}
              </span>
            </div>
            <div>
              <span className="text-slate-500 dark:text-slate-400 block font-medium">Calculated Balance</span>
              <span className={`text-base font-extrabold ${remaining < 0 ? 'text-rose-500' : 'text-slate-900 dark:text-white'}`}>
                {currency}{remaining.toFixed(2)}
              </span>
            </div>
          </div>

          {/* Category-Specific Budget Allocation */}
          <div className="pt-4 border-t border-slate-200 dark:border-slate-800">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Layers className="w-4 h-4 text-emerald-500" />
                Category Spending Caps (Optional)
              </h3>
              <span className="text-xs text-slate-500 dark:text-slate-400">
                Set max limits per category
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {CATEGORIES.map((cat) => (
                <div
                  key={cat.name}
                  className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-200/60 dark:border-slate-800 flex items-center justify-between gap-3"
                >
                  <div className="flex items-center gap-2">
                    <span className={`w-7 h-7 rounded-lg ${cat.bg} ${cat.color} flex items-center justify-center font-bold text-xs`}>
                      {cat.name.slice(0, 1)}
                    </span>
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                      {cat.name}
                    </span>
                  </div>
                  <div className="relative w-28">
                    <span className="absolute left-2 top-1/2 -translate-y-1/2 text-slate-400 text-[10px] font-bold">
                      {currency}
                    </span>
                    <input
                      type="number"
                      min="0"
                      step="10"
                      value={categoryLimits[cat.name] || ''}
                      placeholder="No Cap"
                      onChange={(e) =>
                        handleCategoryLimitChange(cat.name, Number(e.target.value))
                      }
                      className="w-full pl-6 pr-2 py-1 text-right bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Save Button */}
          <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex justify-end">
            <button
              type="submit"
              className="flex items-center gap-2 px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm rounded-xl shadow-md transition-all active:scale-95"
            >
              <Save className="w-4 h-4" /> Save Budget Settings
            </button>
          </div>

        </form>
      </div>

    </div>
  );
};
