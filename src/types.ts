export type ExpenseCategory =
  | 'Food'
  | 'Transport'
  | 'Shopping'
  | 'Bills'
  | 'Entertainment'
  | 'Health'
  | 'Education'
  | 'Others';

export type PaymentMethod = 'Cash' | 'Card' | 'Digital Wallet' | 'Bank Transfer';

export type BudgetPeriod = 'weekly' | 'monthly';

export type ProfileType = 'Personal' | 'Family' | 'Business';

export interface Expense {
  id: string;
  amount: number;
  category: ExpenseCategory;
  note: string;
  date: string; // YYYY-MM-DD format
  time: string; // HH:mm format
  paymentMethod: PaymentMethod;
  profileId: string;
  createdAt: number;
}

export interface BudgetProfile {
  id: string;
  name: ProfileType;
  period: BudgetPeriod;
  totalLimit: number;
  categoryLimits?: Partial<Record<ExpenseCategory, number>>;
  currency: string;
  income: number;
}

export interface SmartNotification {
  id: string;
  title: string;
  message: string;
  date: string;
  type: 'info' | 'warning' | 'alert' | 'success';
  read: boolean;
  threshold?: number; // e.g., 50, 75, 90, 100
}

export interface AISpendingInsight {
  overview: string;
  score: number; // 0 - 100 health score
  savingsTips: string[];
  warnings: string[];
  suggestedAction: string;
}

export interface CurrencyConfig {
  code: string;
  symbol: string;
  name: string;
}

export type ViewTab = 'dashboard' | 'transactions' | 'analytics' | 'reports' | 'insights' | 'settings';
