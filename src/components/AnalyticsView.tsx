import React from 'react';
import { 
  PieChart as RechartsPieChart, 
  Pie, 
  Cell, 
  ResponsiveContainer, 
  Tooltip, 
  Legend, 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  BarChart, 
  Bar 
} from 'recharts';
import { PieChart, TrendingUp, BarChart3, Sparkles } from 'lucide-react';
import { BudgetProfile, Expense } from '../types';
import { CATEGORIES } from '../data/initialData';

interface AnalyticsViewProps {
  expenses: Expense[];
  currentProfile: BudgetProfile;
  currency: string;
}

const COLOR_PALETTE = [
  '#10b981', // emerald
  '#3b82f6', // blue
  '#a855f7', // purple
  '#f59e0b', // amber
  '#ec4899', // pink
  '#f43f5e', // rose
  '#6366f1', // indigo
  '#64748b', // slate
];

export const AnalyticsView: React.FC<AnalyticsViewProps> = ({
  expenses,
  currentProfile,
  currency,
}) => {
  const profileExpenses = expenses.filter((e) => e.profileId === currentProfile.id);

  // 1. Pie Chart Data: Category Breakdown
  const categoryTotals: Record<string, number> = {};
  profileExpenses.forEach((e) => {
    categoryTotals[e.category] = (categoryTotals[e.category] || 0) + e.amount;
  });

  const pieData = Object.entries(categoryTotals)
    .map(([name, value]) => ({ name, value }))
    .filter((d) => d.value > 0);

  // 2. Line Chart Data: Daily Spending Trend
  const dateTotals: Record<string, number> = {};
  profileExpenses.forEach((e) => {
    dateTotals[e.date] = (dateTotals[e.date] || 0) + e.amount;
  });

  const sortedDates = Object.keys(dateTotals).sort();
  let cumulative = 0;
  const lineData = sortedDates.map((date) => {
    cumulative += dateTotals[date];
    return {
      date: date.substring(5), // MM-DD format
      daily: dateTotals[date],
      cumulative,
    };
  });

  // 3. Bar Chart Data: Category Expense vs Cap
  const barData = CATEGORIES.map((cat) => {
    const actual = categoryTotals[cat.name] || 0;
    const limit = currentProfile.categoryLimits?.[cat.name] || (currentProfile.totalLimit / 8);
    return {
      category: cat.name,
      Spent: actual,
      BudgetCap: limit,
    };
  });

  // Key Analytics Callouts
  const totalSpent = profileExpenses.reduce((s, e) => s + e.amount, 0);
  let topCategory = 'None';
  let topCatAmount = 0;
  Object.entries(categoryTotals).forEach(([cat, amt]) => {
    if (amt > topCatAmount) {
      topCatAmount = amt;
      topCategory = cat;
    }
  });

  const topCategoryPercentage = totalSpent > 0 ? Math.round((topCatAmount / totalSpent) * 100) : 0;

  return (
    <div className="space-y-6 pb-20 md:pb-8 animate-fadeIn max-w-6xl mx-auto">
      
      {/* Title */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-purple-100 dark:bg-purple-950/80 text-purple-600 dark:text-purple-400 flex items-center justify-center font-bold">
            <PieChart className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">
              Spending Analytics & Insights
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Visual category distribution, daily spending trends, and budget cap comparisons for <span className="font-bold text-purple-600">{currentProfile.name}</span>.
            </p>
          </div>
        </div>
      </div>

      {/* Analytics Summary Highlights */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        
        <div className="bg-gradient-to-br from-emerald-500/10 to-teal-500/10 border border-emerald-500/20 rounded-2xl p-5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
              Top Category
            </span>
            <Sparkles className="w-4 h-4 text-emerald-500" />
          </div>
          <p className="text-xl font-extrabold text-slate-900 dark:text-white">
            {topCategory} ({topCategoryPercentage}%)
          </p>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Total of {currency}{topCatAmount.toFixed(2)} spent in {topCategory}
          </p>
        </div>

        <div className="bg-gradient-to-br from-blue-500/10 to-indigo-500/10 border border-blue-500/20 rounded-2xl p-5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
              Daily Average
            </span>
            <TrendingUp className="w-4 h-4 text-blue-500" />
          </div>
          <p className="text-xl font-extrabold text-slate-900 dark:text-white">
            {currency}
            {sortedDates.length > 0
              ? (totalSpent / sortedDates.length).toFixed(2)
              : '0.00'}
            / day
          </p>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Calculated over {sortedDates.length} recorded active days
          </p>
        </div>

        <div className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 border border-purple-500/20 rounded-2xl p-5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
              Active Category Diversity
            </span>
            <BarChart3 className="w-4 h-4 text-purple-500" />
          </div>
          <p className="text-xl font-extrabold text-slate-900 dark:text-white">
            {pieData.length} of {CATEGORIES.length} Categories
          </p>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Active spending distribution categories
          </p>
        </div>

      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Pie Chart: Expense Categories */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm">
          <h3 className="text-base font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
            <PieChart className="w-4 h-4 text-emerald-500" /> Category Breakdown
          </h3>
          <div className="h-72 w-full">
            {pieData.length === 0 ? (
              <div className="h-full flex items-center justify-center text-xs text-slate-400">
                No transaction data available to plot chart.
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <RechartsPieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={90}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={COLOR_PALETTE[index % COLOR_PALETTE.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value: any) => [`${currency}${Number(value).toFixed(2)}`, 'Spent']}
                    contentStyle={{
                      backgroundColor: '#0f172a',
                      borderColor: '#334155',
                      borderRadius: '12px',
                      color: '#fff',
                      fontSize: '12px',
                    }}
                  />
                  <Legend
                    verticalAlign="bottom"
                    height={36}
                    formatter={(val) => <span className="text-xs text-slate-700 dark:text-slate-300 font-medium">{val}</span>}
                  />
                </RechartsPieChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Line Chart: Daily Spending Trend */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm">
          <h3 className="text-base font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-blue-500" /> Daily Spending Trend
          </h3>
          <div className="h-72 w-full">
            {lineData.length === 0 ? (
              <div className="h-full flex items-center justify-center text-xs text-slate-400">
                No transaction data available to plot trend.
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={lineData}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                  <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#64748b' }} />
                  <YAxis tick={{ fontSize: 10, fill: '#64748b' }} />
                  <Tooltip
                    formatter={(val: any) => [`${currency}${Number(val).toFixed(2)}`, 'Spent']}
                    contentStyle={{
                      backgroundColor: '#0f172a',
                      borderColor: '#334155',
                      borderRadius: '12px',
                      color: '#fff',
                      fontSize: '12px',
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="daily"
                    stroke="#10b981"
                    strokeWidth={3}
                    dot={{ r: 4, fill: '#10b981' }}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

      </div>

      {/* Bar Chart: Category Expenses vs Budget Caps */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm">
        <h3 className="text-base font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
          <BarChart3 className="w-4 h-4 text-amber-500" /> Category Spent vs Budget Cap
        </h3>
        <div className="h-80 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={barData} margin={{ top: 10, right: 10, left: 0, bottom: 20 }}>
              <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
              <XAxis dataKey="category" tick={{ fontSize: 11, fill: '#64748b' }} />
              <YAxis tick={{ fontSize: 10, fill: '#64748b' }} />
              <Tooltip
                formatter={(val: any) => [`${currency}${Number(val).toFixed(2)}`, 'Amount']}
                contentStyle={{
                  backgroundColor: '#0f172a',
                  borderColor: '#334155',
                  borderRadius: '12px',
                  color: '#fff',
                  fontSize: '12px',
                }}
              />
              <Legend verticalAlign="top" height={36} />
              <Bar dataKey="Spent" fill="#10b981" radius={[6, 6, 0, 0]} />
              <Bar dataKey="BudgetCap" fill="#334155" opacity={0.5} radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

    </div>
  );
};
