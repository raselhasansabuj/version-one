import React from 'react';
import { 
  TrendingUp, 
  TrendingDown, 
  AlertTriangle, 
  Calendar, 
  PlusCircle, 
  ArrowRight, 
  Sparkles, 
  Clock, 
  CheckCircle2,
  Trash2,
  Edit2,
  Receipt
} from 'lucide-react';
import { BudgetProfile, Expense, ViewTab } from '../types';
import { CATEGORIES } from '../data/initialData';

interface DashboardProps {
  currentProfile: BudgetProfile;
  expenses: Expense[];
  currency: string;
  onOpenAddExpense: () => void;
  onEditExpense: (expense: Expense) => void;
  onDeleteExpense: (id: string) => void;
  onSelectTab: (tab: ViewTab) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({
  currentProfile,
  expenses,
  currency,
  onOpenAddExpense,
  onEditExpense,
  onDeleteExpense,
  onSelectTab,
}) => {
  // Filter expenses by profile
  const profileExpenses = expenses.filter((e) => e.profileId === currentProfile.id);

  // Total spent in this profile
  const totalSpent = profileExpenses.reduce((sum, e) => sum + e.amount, 0);
  const totalLimit = currentProfile.totalLimit;
  const remaining = totalLimit - totalSpent;
  const percentageSpent = Math.min(100, Math.round((totalSpent / (totalLimit || 1)) * 100));

  // Determine budget status color
  let progressColor = 'bg-emerald-500';
  let badgeBg = 'bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-400';
  let warningMessage: string | null = null;

  if (totalSpent > totalLimit) {
    progressColor = 'bg-rose-600';
    badgeBg = 'bg-rose-100 dark:bg-rose-950/80 text-rose-700 dark:text-rose-400';
    warningMessage = `⚠️ Budget Exceeded by ${currency}${(totalSpent - totalLimit).toFixed(2)}! Reduce non-essential spending.`;
  } else if (percentageSpent >= 90) {
    progressColor = 'bg-rose-500';
    badgeBg = 'bg-rose-100 dark:bg-rose-950/80 text-rose-700 dark:text-rose-400';
    warningMessage = `🚨 Warning: You have used ${percentageSpent}% of your ${currentProfile.period} budget. Only ${currency}${remaining.toFixed(2)} left!`;
  } else if (percentageSpent >= 75) {
    progressColor = 'bg-orange-500';
    badgeBg = 'bg-orange-100 dark:bg-orange-950/80 text-orange-700 dark:text-orange-400';
    warningMessage = `⚠️ Notice: 75% of your budget used (${currency}${totalSpent.toFixed(2)} spent).`;
  } else if (percentageSpent >= 50) {
    progressColor = 'bg-amber-500';
    badgeBg = 'bg-amber-100 dark:bg-amber-950/80 text-amber-700 dark:text-amber-400';
    warningMessage = `💡 Info: 50% of budget reached. ${currency}${remaining.toFixed(2)} remaining.`;
  }

  // Days left calculation in month / week
  const now = new Date();
  let daysLeftInPeriod = 15;
  if (currentProfile.period === 'monthly') {
    const lastDayOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
    daysLeftInPeriod = Math.max(1, lastDayOfMonth - now.getDate());
  } else {
    // weekly
    const currentDay = now.getDay(); // 0 is Sunday
    daysLeftInPeriod = Math.max(1, 7 - currentDay);
  }

  const dailyBudgetRemaining = Math.max(0, remaining / daysLeftInPeriod);

  // Top spending category
  const categoryTotals: Record<string, number> = {};
  profileExpenses.forEach((e) => {
    categoryTotals[e.category] = (categoryTotals[e.category] || 0) + e.amount;
  });

  let topCategory = 'None';
  let maxCatAmount = 0;
  Object.entries(categoryTotals).forEach(([cat, amt]) => {
    if (amt > maxCatAmount) {
      maxCatAmount = amt;
      topCategory = cat;
    }
  });

  // Recent 5 expenses
  const recentExpenses = [...profileExpenses]
    .sort((a, b) => b.createdAt - a.createdAt)
    .slice(0, 5);

  return (
    <div className="space-y-6 pb-20 md:pb-8 animate-fadeIn">
      
      {/* Alert Warning Banner if threshold hit */}
      {warningMessage && (
        <div className="bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 rounded-2xl p-4 flex items-start gap-3 shadow-sm">
          <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
          <div className="flex-1 text-sm font-medium text-amber-900 dark:text-amber-200">
            {warningMessage}
          </div>
          <button
            onClick={() => onSelectTab('settings')}
            className="text-xs font-semibold px-3 py-1 bg-amber-600 hover:bg-amber-700 text-white rounded-lg transition-colors shrink-0"
          >
            Adjust Budget
          </button>
        </div>
      )}

      {/* Main Budget Card Overview */}
      <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl relative overflow-hidden">
        {/* Subtle decorative mesh background glow */}
        <div className="absolute -right-12 -top-12 w-48 h-48 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -left-12 -bottom-12 w-48 h-48 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                {currentProfile.name} Budget ({currentProfile.period})
              </span>
              <span className={`text-xs px-2.5 py-0.5 rounded-full font-bold ${badgeBg}`}>
                {percentageSpent}% Spent
              </span>
            </div>
            <p className="text-3xl sm:text-4xl font-extrabold mt-1 tracking-tight">
              {currency}{remaining.toFixed(2)}
            </p>
            <p className="text-xs text-slate-400 mt-1 flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              Remaining balance from {currency}{totalLimit.toFixed(2)} budget
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              id="dashboard-add-expense-btn"
              onClick={onOpenAddExpense}
              className="flex items-center gap-2 px-4 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold text-sm rounded-xl shadow-lg shadow-emerald-500/25 transition-all active:scale-95"
            >
              <PlusCircle className="w-4 h-4" />
              Add Expense
            </button>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="space-y-2">
          <div className="flex justify-between text-xs font-medium text-slate-300">
            <span>Spent: {currency}{totalSpent.toFixed(2)}</span>
            <span>Limit: {currency}{totalLimit.toFixed(2)}</span>
          </div>
          <div className="w-full h-3 bg-slate-700/80 rounded-full overflow-hidden p-0.5">
            <div
              className={`h-full rounded-full transition-all duration-700 ${progressColor}`}
              style={{ width: `${Math.min(100, percentageSpent)}%` }}
            />
          </div>
        </div>

        {/* Sub metrics grid inside budget card */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-6 pt-6 border-t border-slate-700/60 text-xs">
          <div className="bg-slate-800/60 p-3 rounded-2xl border border-slate-700/40">
            <span className="text-slate-400 block mb-0.5">Safe Daily Limit</span>
            <span className="text-sm font-bold text-emerald-400">
              {currency}{dailyBudgetRemaining.toFixed(2)} / day
            </span>
          </div>
          <div className="bg-slate-800/60 p-3 rounded-2xl border border-slate-700/40">
            <span className="text-slate-400 block mb-0.5">Days Left in Cycle</span>
            <span className="text-sm font-bold text-slate-200">
              {daysLeftInPeriod} days
            </span>
          </div>
          <div className="bg-slate-800/60 p-3 rounded-2xl border border-slate-700/40 col-span-2 sm:col-span-1">
            <span className="text-slate-400 block mb-0.5">Top Category</span>
            <span className="text-sm font-bold text-amber-400 truncate block">
              {topCategory} ({currency}{maxCatAmount.toFixed(0)})
            </span>
          </div>
        </div>
      </div>

      {/* Quick Summary Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-sm hover:shadow-md transition-all">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Total Income</span>
            <TrendingUp className="w-4 h-4 text-emerald-500" />
          </div>
          <p className="text-xl font-extrabold text-slate-900 dark:text-white">
            {currency}{(currentProfile.income || 0).toFixed(2)}
          </p>
          <span className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 block">
            Expected revenue
          </span>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-sm hover:shadow-md transition-all">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Total Expenses</span>
            <TrendingDown className="w-4 h-4 text-rose-500" />
          </div>
          <p className="text-xl font-extrabold text-slate-900 dark:text-white">
            {currency}{totalSpent.toFixed(2)}
          </p>
          <span className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 block">
            {profileExpenses.length} transactions recorded
          </span>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-sm hover:shadow-md transition-all">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Estimated Savings</span>
            <Sparkles className="w-4 h-4 text-amber-500" />
          </div>
          <p className="text-xl font-extrabold text-emerald-600 dark:text-emerald-400">
            {currency}{Math.max(0, (currentProfile.income || 0) - totalSpent).toFixed(2)}
          </p>
          <span className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 block">
            Income minus Expenses
          </span>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-sm hover:shadow-md transition-all">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Avg Expense</span>
            <Receipt className="w-4 h-4 text-blue-500" />
          </div>
          <p className="text-xl font-extrabold text-slate-900 dark:text-white">
            {currency}
            {profileExpenses.length > 0
              ? (totalSpent / profileExpenses.length).toFixed(2)
              : '0.00'}
          </p>
          <span className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 block">
            Per transaction average
          </span>
        </div>

      </div>

      {/* AI Smart Insight Banner */}
      <div className="bg-gradient-to-r from-emerald-500/10 via-teal-500/10 to-blue-500/10 border border-emerald-500/20 rounded-2xl p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-sm">
            <Sparkles className="w-5 h-5 animate-spin-slow" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              AI Financial Advisor Available
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-300">
              Get personalized saving recommendations and spending trend breakdown powered by Gemini AI.
            </p>
          </div>
        </div>
        <button
          onClick={() => onSelectTab('insights')}
          className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs rounded-xl shadow-sm transition-all shrink-0"
        >
          View AI Insights
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Category Spending Progress breakdown */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base font-bold text-slate-900 dark:text-white">
            Category Breakdown
          </h3>
          <button
            onClick={() => onSelectTab('analytics')}
            className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1"
          >
            View Charts <ArrowRight className="w-3 h-3" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {CATEGORIES.map((cat) => {
            const catSpent = categoryTotals[cat.name] || 0;
            const limit = currentProfile.categoryLimits?.[cat.name] || (totalLimit / 8);
            const pct = Math.min(100, Math.round((catSpent / limit) * 100));

            return (
              <div
                key={cat.name}
                className="p-3.5 rounded-xl border border-slate-100 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-800/40"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className={`w-7 h-7 rounded-lg ${cat.bg} ${cat.color} flex items-center justify-center font-bold text-xs`}>
                      {cat.name.slice(0, 1)}
                    </span>
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                      {cat.name}
                    </span>
                  </div>
                  <span className="text-xs font-extrabold text-slate-900 dark:text-white">
                    {currency}{catSpent.toFixed(0)}
                  </span>
                </div>
                <div className="w-full h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full ${pct > 90 ? 'bg-rose-500' : pct > 70 ? 'bg-amber-500' : 'bg-emerald-500'}`}
                    style={{ width: `${pct}%` }}
                  />
                </div>
                <div className="flex justify-between text-[10px] text-slate-500 dark:text-slate-400 mt-1">
                  <span>{pct}% of cap</span>
                  <span>Limit: {currency}{limit.toFixed(0)}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Recent Transactions List */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-emerald-600" />
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Recent Transactions
            </h3>
          </div>
          <button
            onClick={() => onSelectTab('transactions')}
            className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1"
          >
            See All Transactions ({profileExpenses.length}) <ArrowRight className="w-3 h-3" />
          </button>
        </div>

        {recentExpenses.length === 0 ? (
          <div className="text-center py-10 text-slate-500 dark:text-slate-400">
            <Receipt className="w-10 h-10 mx-auto mb-2 opacity-40 text-slate-400" />
            <p className="text-sm font-medium">No expenses logged yet for this profile.</p>
            <button
              onClick={onOpenAddExpense}
              className="mt-3 inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-emerald-600 text-white text-xs font-semibold rounded-lg"
            >
              <PlusCircle className="w-4 h-4" /> Log First Expense
            </button>
          </div>
        ) : (
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {recentExpenses.map((exp) => {
              const catMeta = CATEGORIES.find((c) => c.name === exp.category) || CATEGORIES[7];
              return (
                <div
                  key={exp.id}
                  className="py-3 flex items-center justify-between gap-3 hover:bg-slate-50/80 dark:hover:bg-slate-800/40 px-2 rounded-xl transition-colors group"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className={`w-10 h-10 rounded-xl ${catMeta.bg} ${catMeta.color} flex items-center justify-center font-bold text-sm shrink-0`}>
                      {exp.category.slice(0, 2)}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-bold text-slate-900 dark:text-white truncate">
                        {exp.note || exp.category}
                      </p>
                      <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                        <span className="font-medium text-slate-700 dark:text-slate-300">{exp.category}</span>
                        <span>•</span>
                        <span>{exp.date} at {exp.time}</span>
                        <span>•</span>
                        <span className="px-1.5 py-0.2 rounded bg-slate-100 dark:bg-slate-800 text-[10px]">
                          {exp.paymentMethod}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <span className="text-sm font-extrabold text-slate-900 dark:text-white">
                      -{currency}{exp.amount.toFixed(2)}
                    </span>
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
                      <button
                        onClick={() => onEditExpense(exp)}
                        className="p-1.5 text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
                        title="Edit Expense"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => onDeleteExpense(exp.id)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
                        title="Delete Expense"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
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
