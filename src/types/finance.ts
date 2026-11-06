export type TransactionType = 'income' | 'expense';
export type ExpenseNature = 'fixed' | 'variable';
export type PaymentMethod = 'pix' | 'credit' | 'debit' | 'cash' | 'transfer' | 'boleto';

export interface Category {
  id: string;
  name: string;
  icon: string;
  color: string;
  type: TransactionType;
  budgetLimit?: number;
  isEssential: boolean; // 50% Necessidades vs 30% Desejos/Lazer
}

export interface Transaction {
  id: string;
  description: string;
  amount: number;
  type: TransactionType;
  categoryId: string;
  date: string; // YYYY-MM-DD
  expenseNature?: ExpenseNature; // Fixos vs Variáveis
  paymentMethod: PaymentMethod;
  notes?: string;
}

export interface SavingsGoal {
  id: string;
  title: string;
  targetAmount: number;
  currentAmount: number;
  targetDate: string;
  category: string;
  color: string;
}

export interface PiggyBankDeposit {
  id: string;
  amount: number;
  date: string;
  type: 'deposit' | 'withdraw';
  note?: string;
}

export interface PiggyBank {
  id: string;
  name: string;
  targetAmount: number;
  balance: number;
  color: string;
  icon: string;
  history: PiggyBankDeposit[];
}

export interface CreditCard {
  id: string;
  name: string;
  brand: 'mastercard' | 'visa' | 'elo' | 'nubank' | 'inter' | 'outro';
  limit: number;
  currentBill: number;
  closingDay: number;
  dueDay: number;
  color: string;
}

export interface Bill {
  id: string;
  title: string;
  amount: number;
  dueDate: string; // YYYY-MM-DD
  categoryId: string;
  status: 'pending' | 'paid' | 'overdue';
  barcode?: string;
  isRecurring: boolean;
  paidAt?: string;
}

export interface Subscription {
  id: string;
  name: string;
  amount: number;
  billingCycle: 'monthly' | 'yearly';
  renewalDay: number;
  category: string;
  active: boolean;
  icon: string;
}

export interface Challenge {
  id: string;
  title: string;
  description: string;
  difficulty: 'Fácil' | 'Médio' | 'Difícil';
  rewardPoints: number;
  durationDays: number;
  progress: number;
  target: number;
  unit: string;
  completed: boolean;
  badge: string;
}

export interface FinancialHealthScore {
  score: number; // 0 - 1000
  level: 'Crítico' | 'Em Alerta' | 'Bom' | 'Excelente' | 'Imbatível';
  savingsRate: number; // %
  fixedExpensesRate: number; // %
  budgetAdherence: number; // %
  points: number;
}
