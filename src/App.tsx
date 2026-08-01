import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { Navigation } from './components/Navigation';
import { Dashboard } from './components/Dashboard';
import { ExpenseHistory } from './components/ExpenseHistory';
import { AnalyticsView } from './components/AnalyticsView';
import { ReportsView } from './components/ReportsView';
import { AIInsightsView } from './components/AIInsightsView';
import { BudgetManager } from './components/BudgetManager';
import { ExpenseFormModal } from './components/ExpenseFormModal';
import { NotificationDrawer } from './components/NotificationDrawer';
import { SecurityLockModal } from './components/SecurityLockModal';
import { InstallAppModal } from './components/InstallAppModal';
import { 
  BudgetProfile, 
  Expense, 
  SmartNotification, 
  ViewTab 
} from './types';
import { 
  INITIAL_EXPENSES, 
  INITIAL_NOTIFICATIONS, 
  INITIAL_PROFILES 
} from './data/initialData';
import { Smartphone, Wifi, Battery, Signal } from 'lucide-react';

export default function App() {
  // LocalStorage state initialization
  const [profiles, setProfiles] = useState<BudgetProfile[]>(() => {
    const saved = localStorage.getItem('pet_profiles');
    return saved ? JSON.parse(saved) : INITIAL_PROFILES;
  });

  const [currentProfileId, setCurrentProfileId] = useState<string>(() => {
    const saved = localStorage.getItem('pet_current_profile_id');
    return saved || 'personal';
  });

  const [expenses, setExpenses] = useState<Expense[]>(() => {
    const saved = localStorage.getItem('pet_expenses');
    return saved ? JSON.parse(saved) : INITIAL_EXPENSES;
  });

  const [notifications, setNotifications] = useState<SmartNotification[]>(() => {
    const saved = localStorage.getItem('pet_notifications');
    return saved ? JSON.parse(saved) : INITIAL_NOTIFICATIONS;
  });

  const [currency, setCurrency] = useState<string>(() => {
    return localStorage.getItem('pet_currency') || '৳';
  });

  const [darkMode, setDarkMode] = useState<boolean>(() => {
    const saved = localStorage.getItem('pet_dark_mode');
    return saved ? JSON.parse(saved) : false;
  });

  const [savedPin, setSavedPin] = useState<string | null>(() => {
    return localStorage.getItem('pet_saved_pin') || null;
  });

  const [isAppLocked, setIsAppLocked] = useState<boolean>(false);
  const [isMobileFrame, setIsMobileFrame] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<ViewTab>('dashboard');

  // Modals
  const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const [isNotificationDrawerOpen, setIsNotificationDrawerOpen] = useState(false);
  const [isPinModalOpen, setIsPinModalOpen] = useState(false);
  const [isInstallModalOpen, setIsInstallModalOpen] = useState(false);

  // Sync to localStorage
  useEffect(() => {
    localStorage.setItem('pet_profiles', JSON.stringify(profiles));
  }, [profiles]);

  useEffect(() => {
    localStorage.setItem('pet_current_profile_id', currentProfileId);
  }, [currentProfileId]);

  useEffect(() => {
    localStorage.setItem('pet_expenses', JSON.stringify(expenses));
  }, [expenses]);

  useEffect(() => {
    localStorage.setItem('pet_notifications', JSON.stringify(notifications));
  }, [notifications]);

  useEffect(() => {
    localStorage.setItem('pet_currency', currency);
  }, [currency]);

  useEffect(() => {
    localStorage.setItem('pet_dark_mode', JSON.stringify(darkMode));
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  useEffect(() => {
    if (savedPin) {
      localStorage.setItem('pet_saved_pin', savedPin);
    } else {
      localStorage.removeItem('pet_saved_pin');
    }
  }, [savedPin]);

  const currentProfile = profiles.find((p) => p.id === currentProfileId) || profiles[0];

  // Evaluate budget thresholds & push smart notifications
  const evaluateBudgetThresholds = (updatedExpenses: Expense[], profile: BudgetProfile) => {
    const profileExps = updatedExpenses.filter((e) => e.profileId === profile.id);
    const spent = profileExps.reduce((sum, e) => sum + e.amount, 0);
    const limit = profile.totalLimit;
    const pct = Math.round((spent / (limit || 1)) * 100);
    const todayStr = new Date().toISOString().split('T')[0];

    const newNotifs: SmartNotification[] = [];

    if (spent > limit) {
      const exists = notifications.some(
        (n) => n.threshold === 100 && n.date === todayStr
      );
      if (!exists) {
        newNotifs.push({
          id: `notif-exceeded-${Date.now()}`,
          title: '🚨 Budget Exceeded!',
          message: `You have exceeded your ${profile.period} budget limit of ${currency}${limit}. Total spent: ${currency}${spent.toFixed(2)}.`,
          date: todayStr,
          type: 'alert',
          threshold: 100,
          read: false,
        });
      }
    } else if (pct >= 90) {
      const exists = notifications.some((n) => n.threshold === 90 && n.date === todayStr);
      if (!exists) {
        newNotifs.push({
          id: `notif-90-${Date.now()}`,
          title: '⚠️ 90% Budget Reached',
          message: `Warning: You have used 90% of your ${profile.period} budget. Only ${currency}${(limit - spent).toFixed(2)} remaining. Spend wisely!`,
          date: todayStr,
          type: 'warning',
          threshold: 90,
          read: false,
        });
      }
    } else if (pct >= 75) {
      const exists = notifications.some((n) => n.threshold === 75 && n.date === todayStr);
      if (!exists) {
        newNotifs.push({
          id: `notif-75-${Date.now()}`,
          title: '⚡ 75% Budget Used',
          message: `You have spent 75% of your ${profile.period} limit (${currency}${spent.toFixed(2)} spent).`,
          date: todayStr,
          type: 'warning',
          threshold: 75,
          read: false,
        });
      }
    } else if (pct >= 50) {
      const exists = notifications.some((n) => n.threshold === 50 && n.date === todayStr);
      if (!exists) {
        newNotifs.push({
          id: `notif-50-${Date.now()}`,
          title: '💡 50% Budget Milestone',
          message: `Halfway through your budget (${currency}${spent.toFixed(2)} spent out of ${currency}${limit}).`,
          date: todayStr,
          type: 'info',
          threshold: 50,
          read: false,
        });
      }
    }

    if (newNotifs.length > 0) {
      setNotifications((prev) => [...newNotifs, ...prev]);
    }
  };

  // Expense Handlers
  const handleSaveExpense = (
    expenseData: Omit<Expense, 'id' | 'createdAt'>,
    id?: string
  ) => {
    let updated: Expense[];
    if (id) {
      updated = expenses.map((e) =>
        e.id === id ? { ...e, ...expenseData } : e
      );
    } else {
      const newExp: Expense = {
        ...expenseData,
        id: `exp-${Date.now()}`,
        createdAt: Date.now(),
      };
      updated = [newExp, ...expenses];
    }

    setExpenses(updated);
    evaluateBudgetThresholds(updated, currentProfile);
  };

  const handleDeleteExpense = (id: string) => {
    const updated = expenses.filter((e) => e.id !== id);
    setExpenses(updated);
  };

  const handleEditExpense = (expense: Expense) => {
    setEditingExpense(expense);
    setIsExpenseModalOpen(true);
  };

  // Profile update
  const handleUpdateProfile = (updatedProfile: BudgetProfile) => {
    setProfiles((prev) =>
      prev.map((p) => (p.id === updatedProfile.id ? updatedProfile : p))
    );
  };

  const handleResetData = () => {
    if (window.confirm('Reset all expenses, budget settings, and notifications to initial default values?')) {
      setProfiles(INITIAL_PROFILES);
      setCurrentProfileId('personal');
      setExpenses(INITIAL_EXPENSES);
      setNotifications(INITIAL_NOTIFICATIONS);
      setCurrency('৳');
    }
  };

  // Unread notifications
  const unreadCount = notifications.filter((n) => !n.read).length;

  const handleMarkAsRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };

  const handleClearAllNotifs = () => {
    setNotifications([]);
  };

  const handleManualNotificationCheck = () => {
    evaluateBudgetThresholds(expenses, currentProfile);
    setIsNotificationDrawerOpen(true);
  };

  // Main content selector
  const renderMainContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return (
          <Dashboard
            currentProfile={currentProfile}
            expenses={expenses}
            currency={currency}
            onOpenAddExpense={() => {
              setEditingExpense(null);
              setIsExpenseModalOpen(true);
            }}
            onEditExpense={handleEditExpense}
            onDeleteExpense={handleDeleteExpense}
            onSelectTab={setActiveTab}
          />
        );
      case 'transactions':
        return (
          <ExpenseHistory
            expenses={expenses}
            currentProfile={currentProfile}
            currency={currency}
            onOpenAddExpense={() => {
              setEditingExpense(null);
              setIsExpenseModalOpen(true);
            }}
            onEditExpense={handleEditExpense}
            onDeleteExpense={handleDeleteExpense}
          />
        );
      case 'analytics':
        return (
          <AnalyticsView
            expenses={expenses}
            currentProfile={currentProfile}
            currency={currency}
          />
        );
      case 'reports':
        return (
          <ReportsView
            expenses={expenses}
            currentProfile={currentProfile}
            currency={currency}
          />
        );
      case 'insights':
        return (
          <AIInsightsView
            expenses={expenses}
            currentProfile={currentProfile}
            currency={currency}
          />
        );
      case 'settings':
        return (
          <BudgetManager
            currentProfile={currentProfile}
            profiles={profiles}
            currency={currency}
            onUpdateProfile={handleUpdateProfile}
            onResetToDefaults={handleResetData}
            totalSpent={expenses
              .filter((e) => e.profileId === currentProfile.id)
              .reduce((sum, e) => sum + e.amount, 0)}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className={`min-h-screen bg-slate-100 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans transition-colors duration-200 ${isMobileFrame ? 'flex items-center justify-center py-6 px-2 bg-slate-900' : ''}`}>
      
      {/* Mobile Frame Container Option */}
      <div className={isMobileFrame ? 'w-full max-w-[420px] h-[860px] bg-white dark:bg-slate-900 rounded-[48px] border-[10px] border-slate-800 shadow-2xl flex flex-col overflow-hidden relative' : 'min-h-screen flex flex-col'}>
        
        {/* Mobile Status Bar Simulation */}
        {isMobileFrame && (
          <div className="bg-slate-900 text-white px-6 py-2 flex items-center justify-between text-[11px] font-bold select-none z-40">
            <span>9:41</span>
            <div className="w-20 h-4 bg-black rounded-full mx-auto -mt-1 shadow-inner" /> {/* Dynamic island */}
            <div className="flex items-center gap-1.5">
              <Signal className="w-3 h-3" />
              <Wifi className="w-3 h-3" />
              <Battery className="w-3.5 h-3.5" />
            </div>
          </div>
        )}

        {/* Header */}
        <Header
          currentProfile={currentProfile}
          profiles={profiles}
          onSelectProfile={(p) => setCurrentProfileId(p.id)}
          currency={currency}
          onChangeCurrency={setCurrency}
          darkMode={darkMode}
          onToggleDarkMode={() => setDarkMode(!darkMode)}
          isPinSet={!!savedPin}
          onLockApp={() => setIsAppLocked(true)}
          onOpenPinSettings={() => setIsPinModalOpen(true)}
          unreadCount={unreadCount}
          onOpenNotifications={() => setIsNotificationDrawerOpen(true)}
          isMobileFrame={isMobileFrame}
          onToggleMobileFrame={() => setIsMobileFrame(!isMobileFrame)}
          onOpenAddExpense={() => {
            setEditingExpense(null);
            setIsExpenseModalOpen(true);
          }}
          onOpenInstallModal={() => setIsInstallModalOpen(true)}
        />

        {/* Navigation Tabs */}
        <Navigation activeTab={activeTab} onSelectTab={setActiveTab} />

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto px-4 sm:px-6 py-6">
          {renderMainContent()}
        </main>

        {/* Expense Modal */}
        <ExpenseFormModal
          isOpen={isExpenseModalOpen}
          onClose={() => {
            setIsExpenseModalOpen(false);
            setEditingExpense(null);
          }}
          onSaveExpense={handleSaveExpense}
          editingExpense={editingExpense}
          currentProfile={currentProfile}
          profiles={profiles}
          currency={currency}
        />

        {/* Notification Drawer */}
        <NotificationDrawer
          isOpen={isNotificationDrawerOpen}
          onClose={() => setIsNotificationDrawerOpen(false)}
          notifications={notifications}
          onMarkAsRead={handleMarkAsRead}
          onClearAll={handleClearAllNotifs}
          onTriggerCheck={handleManualNotificationCheck}
        />

        {/* Security PIN Lock Modal */}
        <SecurityLockModal
          isOpen={isPinModalOpen || isAppLocked}
          isAppLocked={isAppLocked}
          savedPin={savedPin}
          onSetPin={setSavedPin}
          onUnlock={() => setIsAppLocked(false)}
          onClose={() => setIsPinModalOpen(false)}
        />

        {/* Install App Modal */}
        <InstallAppModal
          isOpen={isInstallModalOpen}
          onClose={() => setIsInstallModalOpen(false)}
        />

      </div>
    </div>
  );
}
