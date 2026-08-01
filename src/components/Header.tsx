import React from 'react';
import { 
  Bell, 
  Lock, 
  Moon, 
  Sun, 
  Wallet, 
  Smartphone, 
  Monitor, 
  ShieldCheck, 
  PlusCircle,
  Download
} from 'lucide-react';
import { BudgetProfile, CurrencyConfig } from '../types';
import { CURRENCIES } from '../data/initialData';

interface HeaderProps {
  currentProfile: BudgetProfile;
  profiles: BudgetProfile[];
  onSelectProfile: (profile: BudgetProfile) => void;
  currency: string;
  onChangeCurrency: (symbol: string) => void;
  darkMode: boolean;
  onToggleDarkMode: () => void;
  isPinSet: boolean;
  onLockApp: () => void;
  onOpenPinSettings: () => void;
  unreadCount: number;
  onOpenNotifications: () => void;
  isMobileFrame: boolean;
  onToggleMobileFrame: () => void;
  onOpenAddExpense: () => void;
  onOpenInstallModal: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentProfile,
  profiles,
  onSelectProfile,
  currency,
  onChangeCurrency,
  darkMode,
  onToggleDarkMode,
  isPinSet,
  onLockApp,
  onOpenPinSettings,
  unreadCount,
  onOpenNotifications,
  isMobileFrame,
  onToggleMobileFrame,
  onOpenAddExpense,
  onOpenInstallModal,
}) => {
  return (
    <header className="sticky top-0 z-30 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-2">
        
        {/* Brand & App Title */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-white flex items-center justify-center shadow-md shadow-emerald-500/20">
            <Wallet className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-slate-900 dark:text-white leading-none flex items-center gap-2">
              ExpenseTracker
              <span className="text-[10px] px-2 py-0.5 rounded-full font-medium bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
                PRO
              </span>
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-0.5">
              Smart Daily Spending & Budget
            </p>
          </div>
        </div>

        {/* Right side controls */}
        <div className="flex items-center gap-2 sm:gap-3">
          
          {/* Install App Button */}
          <button
            id="install-app-btn"
            onClick={onOpenInstallModal}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-medium text-xs rounded-lg border border-slate-200 dark:border-slate-700 transition-all active:scale-95"
            title="Install App / Mobile Transfer Options"
          >
            <Download className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <span className="hidden sm:inline font-bold">Install App</span>
          </button>

          {/* Add Expense Button */}
          <button
            id="quick-add-expense-btn"
            onClick={onOpenAddExpense}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-xs sm:text-sm rounded-lg shadow-sm transition-all active:scale-95"
            title="Add New Expense"
          >
            <PlusCircle className="w-4 h-4" />
            <span className="hidden sm:inline">Add Expense</span>
          </button>

          {/* Profile Switcher Dropdown */}
          <div className="relative">
            <select
              id="profile-select-header"
              value={currentProfile.id}
              onChange={(e) => {
                const found = profiles.find((p) => p.id === e.target.value);
                if (found) onSelectProfile(found);
              }}
              className="appearance-none bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 text-xs font-semibold px-2.5 py-1.5 pr-6 rounded-lg border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer"
            >
              {profiles.map((p) => (
                <option key={p.id} value={p.id}>
                  📁 {p.name}
                </option>
              ))}
            </select>
            <div className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 text-xs">
              ▼
            </div>
          </div>

          {/* Currency Switcher */}
          <div className="relative hidden sm:block">
            <select
              id="currency-select-header"
              value={currency}
              onChange={(e) => onChangeCurrency(e.target.value)}
              className="appearance-none bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 text-xs font-semibold px-2.5 py-1.5 pr-6 rounded-lg border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer"
            >
              {CURRENCIES.map((c) => (
                <option key={c.code} value={c.symbol}>
                  {c.code} ({c.symbol})
                </option>
              ))}
            </select>
            <div className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 text-xs">
              ▼
            </div>
          </div>

          {/* Notification Bell */}
          <button
            id="notifications-toggle-btn"
            onClick={onOpenNotifications}
            className="relative p-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            title="Smart Notifications"
          >
            <Bell className="w-5 h-5" />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-rose-500 text-white text-[10px] font-bold flex items-center justify-center animate-pulse">
                {unreadCount}
              </span>
            )}
          </button>

          {/* Device Frame View Toggle (Mobile / Fullscreen) */}
          <button
            id="device-frame-toggle-btn"
            onClick={onToggleMobileFrame}
            className={`p-2 rounded-lg transition-colors hidden md:flex items-center gap-1 text-xs font-medium ${
              isMobileFrame
                ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800'
                : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
            title={isMobileFrame ? 'Switch to Desktop Layout' : 'Simulate Mobile Device Frame'}
          >
            {isMobileFrame ? <Smartphone className="w-4 h-4" /> : <Monitor className="w-4 h-4" />}
          </button>

          {/* Security PIN Lock button */}
          <button
            id="security-lock-btn"
            onClick={() => {
              if (isPinSet) {
                onLockApp();
              } else {
                onOpenPinSettings();
              }
            }}
            className="p-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            title={isPinSet ? 'Lock Application with PIN' : 'Setup Security PIN'}
          >
            {isPinSet ? <Lock className="w-5 h-5 text-emerald-500" /> : <ShieldCheck className="w-5 h-5" />}
          </button>

          {/* Dark/Light mode toggle */}
          <button
            id="theme-toggle-btn"
            onClick={onToggleDarkMode}
            className="p-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            title="Toggle Light / Dark Mode"
          >
            {darkMode ? <Sun className="w-5 h-5 text-amber-400" /> : <Moon className="w-5 h-5" />}
          </button>

        </div>
      </div>
    </header>
  );
};
