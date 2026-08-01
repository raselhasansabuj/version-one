import React, { useState } from 'react';
import { 
  FileText, 
  Award, 
  TrendingUp, 
  TrendingDown, 
  CheckCircle2, 
  AlertCircle, 
  Calendar, 
  Printer, 
  Download,
  Smile,
  Zap
} from 'lucide-react';
import { BudgetProfile, Expense } from '../types';
import { CATEGORIES } from '../data/initialData';

interface ReportsViewProps {
  expenses: Expense[];
  currentProfile: BudgetProfile;
  currency: string;
}

export const ReportsView: React.FC<ReportsViewProps> = ({
  expenses,
  currentProfile,
  currency,
}) => {
  const [reportPeriod, setReportPeriod] = useState<'monthly' | 'weekly'>('monthly');

  const profileExpenses = expenses.filter((e) => e.profileId === currentProfile.id);

  const totalSpent = profileExpenses.reduce((s, e) => s + e.amount, 0);
  const totalLimit = currentProfile.totalLimit;
  const income = currentProfile.income || 0;
  const netSavings = Math.max(0, income - totalSpent);
  const budgetSaved = totalLimit - totalSpent;

  // Category breakdown
  const categoryTotals: Record<string, number> = {};
  profileExpenses.forEach((e) => {
    categoryTotals[e.category] = (categoryTotals[e.category] || 0) + e.amount;
  });

  // Motivational message generation
  let motivationalHeading = 'Outstanding Budget Management!';
  let motivationalMessage = `Great job! You saved ${currency}${Math.abs(budgetSaved).toFixed(2)} compared to your planned limit. Keep up the disciplined financial habits!`;
  let badgeColor = 'bg-emerald-500 text-white';

  if (budgetSaved < 0) {
    motivationalHeading = 'Budget Overrun Notice';
    motivationalMessage = `Caution: You went ${currency}${Math.abs(budgetSaved).toFixed(2)} over your planned budget. Review high-spending categories below to make adjustments.`;
    badgeColor = 'bg-rose-500 text-white';
  } else if (budgetSaved === 0) {
    motivationalHeading = 'Target Met Exactly!';
    motivationalMessage = `You spent exactly your budgeted limit of ${currency}${totalLimit.toFixed(2)}. Perfectly balanced!`;
    badgeColor = 'bg-blue-500 text-white';
  }

  const handlePrintReport = () => {
    window.print();
  };

  return (
    <div className="space-y-6 pb-20 md:pb-8 animate-fadeIn max-w-5xl mx-auto">
      
      {/* Header */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-teal-100 dark:bg-teal-950/80 text-teal-600 dark:text-teal-400 flex items-center justify-center font-bold">
            <FileText className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">
              Financial Summary & Savings Report
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              End-of-period spending statement for <span className="font-bold text-teal-600">{currentProfile.name}</span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={handlePrintReport}
            className="flex items-center gap-1.5 px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-bold rounded-xl transition-colors"
          >
            <Printer className="w-3.5 h-3.5" /> Print Statement
          </button>
        </div>
      </div>

      {/* Motivational Savings Summary Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl relative overflow-hidden">
        <div className="flex items-start gap-4">
          <div className={`w-12 h-12 rounded-2xl ${badgeColor} flex items-center justify-center shrink-0 shadow-lg mt-1`}>
            <Award className="w-6 h-6" />
          </div>
          <div className="flex-1">
            <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">
              End of Period Savings Summary
            </span>
            <h3 className="text-xl font-extrabold mt-0.5">
              {motivationalHeading}
            </h3>
            <p className="text-sm text-slate-300 mt-2 leading-relaxed">
              {motivationalMessage}
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-6 border-t border-slate-700/60 text-xs">
              <div>
                <span className="text-slate-400 block">Planned Budget</span>
                <span className="text-base font-extrabold text-white">
                  {currency}{totalLimit.toFixed(2)}
                </span>
              </div>
              <div>
                <span className="text-slate-400 block">Actual Expenses</span>
                <span className="text-base font-extrabold text-slate-200">
                  {currency}{totalSpent.toFixed(2)}
                </span>
              </div>
              <div>
                <span className="text-slate-400 block">Budget Difference</span>
                <span className={`text-base font-extrabold ${budgetSaved >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {budgetSaved >= 0 ? '+' : ''}{currency}{budgetSaved.toFixed(2)}
                </span>
              </div>
              <div>
                <span className="text-slate-400 block">Income Saved</span>
                <span className="text-base font-extrabold text-amber-400">
                  {currency}{netSavings.toFixed(2)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Income vs Expense Financial Statement Table */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-6">
        <h3 className="text-base font-bold text-slate-900 dark:text-white border-b border-slate-100 dark:border-slate-800 pb-3">
          Income vs Expense Statement
        </h3>

        <div className="space-y-3 text-sm">
          <div className="flex justify-between items-center py-2 border-b border-slate-100 dark:border-slate-800/60">
            <span className="font-medium text-slate-600 dark:text-slate-400 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-emerald-500" /> Total Expected Income
            </span>
            <span className="font-extrabold text-slate-900 dark:text-white">
              +{currency}{income.toFixed(2)}
            </span>
          </div>

          <div className="flex justify-between items-center py-2 border-b border-slate-100 dark:border-slate-800/60">
            <span className="font-medium text-slate-600 dark:text-slate-400 flex items-center gap-2">
              <TrendingDown className="w-4 h-4 text-rose-500" /> Total Actual Expenses
            </span>
            <span className="font-extrabold text-rose-600 dark:text-rose-400">
              -{currency}{totalSpent.toFixed(2)}
            </span>
          </div>

          <div className="flex justify-between items-center py-3 bg-slate-50 dark:bg-slate-800/60 px-4 rounded-xl text-base font-extrabold">
            <span className="text-slate-900 dark:text-white">Net Financial Surplus (Savings)</span>
            <span className="text-emerald-600 dark:text-emerald-400">
              {currency}{netSavings.toFixed(2)}
            </span>
          </div>
        </div>
      </div>

      {/* Category Breakdown Table */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm">
        <h3 className="text-base font-bold text-slate-900 dark:text-white mb-4">
          Detailed Category Statement
        </h3>

        <div className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
          {CATEGORIES.map((cat) => {
            const spent = categoryTotals[cat.name] || 0;
            const limit = currentProfile.categoryLimits?.[cat.name] || (totalLimit / 8);
            const pct = Math.round((spent / (totalSpent || 1)) * 100);

            return (
              <div key={cat.name} className="py-3 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-lg ${cat.bg} ${cat.color} flex items-center justify-center font-bold text-xs`}>
                    {cat.name.slice(0, 1)}
                  </div>
                  <div>
                    <span className="font-bold text-slate-900 dark:text-white block">
                      {cat.name}
                    </span>
                    <span className="text-[10px] text-slate-500 dark:text-slate-400">
                      Cap: {currency}{limit.toFixed(0)} • {pct}% of total spending
                    </span>
                  </div>
                </div>

                <div className="text-right">
                  <span className="font-extrabold text-slate-900 dark:text-white text-sm block">
                    {currency}{spent.toFixed(2)}
                  </span>
                  <span className={`text-[10px] font-semibold ${spent > limit ? 'text-rose-500' : 'text-emerald-500'}`}>
                    {spent > limit ? 'Over Cap' : 'Within Cap'}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
};
