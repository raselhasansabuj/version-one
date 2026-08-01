import React, { useState, useMemo } from 'react';
import { 
  Search, 
  Filter, 
  Download, 
  Printer, 
  FileSpreadsheet, 
  Trash2, 
  Edit2, 
  PlusCircle, 
  Calendar,
  X,
  Receipt,
  ArrowUpDown
} from 'lucide-react';
import { BudgetProfile, Expense, ExpenseCategory } from '../types';
import { CATEGORIES } from '../data/initialData';

interface ExpenseHistoryProps {
  expenses: Expense[];
  currentProfile: BudgetProfile;
  currency: string;
  onOpenAddExpense: () => void;
  onEditExpense: (expense: Expense) => void;
  onDeleteExpense: (id: string) => void;
}

export const ExpenseHistory: React.FC<ExpenseHistoryProps> = ({
  expenses,
  currentProfile,
  currency,
  onOpenAddExpense,
  onEditExpense,
  onDeleteExpense,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedRange, setSelectedRange] = useState<string>('all'); // 'all', 'today', 'this_week', 'this_month', 'custom'
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string>('All');
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'highest' | 'lowest'>('newest');

  // Filter & Sort logic
  const filteredExpenses = useMemo(() => {
    return expenses.filter((exp) => {
      // Profile check
      if (exp.profileId !== currentProfile.id) return false;

      // Category search
      if (selectedCategory !== 'All' && exp.category !== selectedCategory) return false;

      // Payment method search
      if (selectedPaymentMethod !== 'All' && exp.paymentMethod !== selectedPaymentMethod) return false;

      // Keyword query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesNote = exp.note.toLowerCase().includes(q);
        const matchesCategory = exp.category.toLowerCase().includes(q);
        const matchesAmount = exp.amount.toString().includes(q);
        if (!matchesNote && !matchesCategory && !matchesAmount) return false;
      }

      // Date range search
      const expDate = new Date(exp.date);
      const now = new Date();
      now.setHours(0, 0, 0, 0);

      if (selectedRange === 'today') {
        const todayStr = new Date().toISOString().split('T')[0];
        if (exp.date !== todayStr) return false;
      } else if (selectedRange === 'this_week') {
        const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        if (expDate < weekAgo) return false;
      } else if (selectedRange === 'this_month') {
        if (
          expDate.getMonth() !== now.getMonth() ||
          expDate.getFullYear() !== now.getFullYear()
        ) {
          return false;
        }
      } else if (selectedRange === 'custom') {
        if (customStartDate && exp.date < customStartDate) return false;
        if (customEndDate && exp.date > customEndDate) return false;
      }

      return true;
    }).sort((a, b) => {
      if (sortBy === 'newest') return b.createdAt - a.createdAt;
      if (sortBy === 'oldest') return a.createdAt - b.createdAt;
      if (sortBy === 'highest') return b.amount - a.amount;
      if (sortBy === 'lowest') return a.amount - b.amount;
      return 0;
    });
  }, [
    expenses,
    currentProfile.id,
    selectedCategory,
    selectedPaymentMethod,
    searchQuery,
    selectedRange,
    customStartDate,
    customEndDate,
    sortBy,
  ]);

  // Total filtered amount
  const totalFilteredAmount = filteredExpenses.reduce((sum, e) => sum + e.amount, 0);

  // Group by date
  const groupedByDate = useMemo(() => {
    const map: Record<string, Expense[]> = {};
    filteredExpenses.forEach((exp) => {
      if (!map[exp.date]) map[exp.date] = [];
      map[exp.date].push(exp);
    });
    return map;
  }, [filteredExpenses]);

  // Export functions
  const handleExportCSV = () => {
    const headers = ['ID', 'Date', 'Time', 'Category', 'Note', 'Amount', 'Currency', 'Payment Method', 'Profile'];
    const rows = filteredExpenses.map((e) => [
      e.id,
      e.date,
      e.time,
      `"${e.category}"`,
      `"${e.note.replace(/"/g, '""')}"`,
      e.amount,
      currency,
      e.paymentMethod,
      currentProfile.name,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Expense_Report_${currentProfile.name}_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleExportJSON = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(filteredExpenses, null, 2));
    const link = document.createElement('a');
    link.setAttribute('href', dataStr);
    link.setAttribute('download', `Expenses_${currentProfile.name}.json`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6 pb-20 md:pb-8 animate-fadeIn max-w-6xl mx-auto">
      
      {/* Top Bar with Title and Actions */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
          <div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Receipt className="w-5 h-5 text-emerald-600" /> Expense History
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Showing {filteredExpenses.length} transactions totaling{' '}
              <span className="font-extrabold text-slate-900 dark:text-white">
                {currency}{totalFilteredAmount.toFixed(2)}
              </span>
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={handleExportCSV}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-semibold rounded-xl transition-colors"
              title="Export as CSV Spreadsheet"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" /> Export CSV
            </button>
            <button
              onClick={handleExportJSON}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-semibold rounded-xl transition-colors"
              title="Export JSON Data"
            >
              <Download className="w-3.5 h-3.5 text-blue-500" /> Export JSON
            </button>
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-semibold rounded-xl transition-colors"
              title="Print Summary / Save PDF"
            >
              <Printer className="w-3.5 h-3.5 text-purple-500" /> Print Report
            </button>
            <button
              onClick={onOpenAddExpense}
              className="flex items-center gap-1.5 px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-sm transition-all"
            >
              <PlusCircle className="w-4 h-4" /> Add Expense
            </button>
          </div>
        </div>

        {/* Filter Controls Bar */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
          
          {/* Keyword Search */}
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search keyword or note..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-medium text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          {/* Category Filter */}
          <div>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-medium text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <option value="All">All Categories</option>
              {CATEGORIES.map((c) => (
                <option key={c.name} value={c.name}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          {/* Date Range Filter */}
          <div>
            <select
              value={selectedRange}
              onChange={(e) => setSelectedRange(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-medium text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <option value="all">All Dates</option>
              <option value="today">Today</option>
              <option value="this_week">Past 7 Days</option>
              <option value="this_month">This Month</option>
              <option value="custom">Custom Date Range</option>
            </select>
          </div>

          {/* Payment Method Filter */}
          <div>
            <select
              value={selectedPaymentMethod}
              onChange={(e) => setSelectedPaymentMethod(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-medium text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <option value="All">All Payment Methods</option>
              <option value="Card">Card</option>
              <option value="Cash">Cash</option>
              <option value="Digital Wallet">Digital Wallet</option>
              <option value="Bank Transfer">Bank Transfer</option>
            </select>
          </div>

          {/* Sort Order */}
          <div>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-medium text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="highest">Highest Amount</option>
              <option value="lowest">Lowest Amount</option>
            </select>
          </div>

        </div>

        {/* Custom date range inputs if selectedRange === 'custom' */}
        {selectedRange === 'custom' && (
          <div className="flex items-center gap-3 pt-3 mt-3 border-t border-slate-100 dark:border-slate-800 text-xs">
            <span>From:</span>
            <input
              type="date"
              value={customStartDate}
              onChange={(e) => setCustomStartDate(e.target.value)}
              className="px-2.5 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
            />
            <span>To:</span>
            <input
              type="date"
              value={customEndDate}
              onChange={(e) => setCustomEndDate(e.target.value)}
              className="px-2.5 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
            />
          </div>
        )}
      </div>

      {/* Transactions List Grouped by Date */}
      <div className="space-y-4">
        {Object.keys(groupedByDate).length === 0 ? (
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-12 text-center text-slate-500 dark:text-slate-400">
            <Receipt className="w-12 h-12 mx-auto mb-3 opacity-30 text-slate-400" />
            <h3 className="text-base font-bold text-slate-800 dark:text-slate-200">
              No matching transactions found
            </h3>
            <p className="text-xs mt-1">
              Try adjusting your search query, date filter, or category selection.
            </p>
          </div>
        ) : (
          (Object.entries(groupedByDate) as [string, Expense[]][]).map(([dateStr, items]) => {
            const dayTotal = items.reduce((s, i) => s + i.amount, 0);

            return (
              <div
                key={dateStr}
                className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm"
              >
                {/* Date Header */}
                <div className="bg-slate-50 dark:bg-slate-800/80 px-5 py-3 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs font-bold text-slate-700 dark:text-slate-300">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-3.5 h-3.5 text-emerald-600" />
                    <span>{dateStr}</span>
                  </div>
                  <span>
                    Subtotal: {currency}{dayTotal.toFixed(2)}
                  </span>
                </div>

                {/* Items in this date */}
                <div className="divide-y divide-slate-100 dark:divide-slate-800">
                  {items.map((exp) => {
                    const catMeta = CATEGORIES.find((c) => c.name === exp.category) || CATEGORIES[7];
                    return (
                      <div
                        key={exp.id}
                        className="p-4 flex items-center justify-between gap-3 hover:bg-slate-50/80 dark:hover:bg-slate-800/30 transition-colors group"
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
                              <span className="font-semibold text-slate-700 dark:text-slate-300">{exp.category}</span>
                              <span>•</span>
                              <span>{exp.time}</span>
                              <span>•</span>
                              <span className="px-1.5 py-0.2 rounded bg-slate-100 dark:bg-slate-800 text-[10px]">
                                {exp.paymentMethod}
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-3 shrink-0">
                          <span className="text-base font-extrabold text-slate-900 dark:text-white">
                            -{currency}{exp.amount.toFixed(2)}
                          </span>
                          <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100 transition-opacity">
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
              </div>
            );
          })
        )}
      </div>

    </div>
  );
};
