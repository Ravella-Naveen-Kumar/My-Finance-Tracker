export type TransactionType = 'income' | 'expense';

export type RecurrenceFrequency = 'daily' | 'weekly' | 'monthly' | 'yearly';

export interface Transaction {
  id: string;
  type: TransactionType;
  amount: number;
  category: string;
  description: string;
  date: Date;
  recurringId?: string; // Links to recurring transaction if auto-generated
}

export interface RecurringTransaction {
  id: string;
  type: TransactionType;
  amount: number;
  category: string;
  description: string;
  frequency: RecurrenceFrequency;
  startDate: Date;
  endDate?: Date; // Optional - if not set, continues indefinitely
  lastGenerated?: Date; // Track when we last generated a transaction
  isActive: boolean;
}

export interface Budget {
  category: string;
  limit: number;
}

export const expenseCategories = [
  'Food & Dining',
  'Transportation',
  'Shopping',
  'Entertainment',
  'Bills & Utilities',
  'Healthcare',
  'Education',
  'Travel',
  'Other'
];

export const incomeCategories = [
  'Salary',
  'Freelance',
  'Investment',
  'Gift',
  'Other'
];