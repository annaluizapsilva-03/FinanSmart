import React, { createContext, useContext, useState, useEffect, useMemo, ReactNode } from 'react';
import {
  Transaction,
  Category,
  SavingsGoal,
  PiggyBank,
  CreditCard,
  Bill,
  Subscription,
  Challenge,
  FinancialHealthScore,
} from '../types/finance';
import {
  DEFAULT_CATEGORIES,
  INITIAL_TRANSACTIONS,
  INITIAL_GOALS,
  INITIAL_PIGGY_BANKS,
  INITIAL_CARDS,
  INITIAL_BILLS,
  INITIAL_SUBSCRIPTIONS,
  INITIAL_CHALLENGES,
} from '../utils/constants';
import { getCurrentYearMonth, getDaysLeftInMonth } from '../utils/formatters';

interface FinanceContextType {
  selectedMonth: string;
  setSelectedMonth: (month: string) => void;
  transactions: Transaction[];
  categories: Category[];
  goals: SavingsGoal[];
  piggyBanks: PiggyBank[];
  cards: CreditCard[];
  bills: Bill[];
  subscriptions: Subscription[];
  challenges: Challenge[];
  globalMonthlyBudget: number;
  setGlobalMonthlyBudget: (val: number) => void;

  // Transaction Actions
  addTransaction: (tx: Omit<Transaction, 'id'>) => void;
  updateTransaction: (id: string, tx: Partial<Transaction>) => void;
  deleteTransaction: (id: string) => void;

  // Category Actions
  updateCategoryLimit: (categoryId: string, limit: number) => void;
  addCategory: (cat: Omit<Category, 'id'>) => void;

  // Goals & Piggy Banks
  addGoal: (goal: Omit<SavingsGoal, 'id' | 'currentAmount'>) => void;
  updateGoalProgress: (id: string, amount: number) => void;
  deleteGoal: (id: string) => void;

  addPiggyBank: (piggy: Omit<PiggyBank, 'id' | 'balance' | 'history'>) => void;
  depositPiggyBank: (id: string, amount: number, note?: string) => void;
  withdrawPiggyBank: (id: string, amount: number, note?: string) => void;
  deletePiggyBank: (id: string) => void;

  // Cards & Bills
  addCreditCard: (card: Omit<CreditCard, 'id' | 'currentBill'>) => void;
  deleteCreditCard: (id: string) => void;

  addBill: (bill: Omit<Bill, 'id' | 'status'>) => void;
  markBillAsPaid: (id: string) => void;
  deleteBill: (id: string) => void;

  // Subscriptions
  addSubscription: (sub: Omit<Subscription, 'id'>) => void;
  toggleSubscription: (id: string) => void;
  deleteSubscription: (id: string) => void;

  // Challenges
  updateChallengeProgress: (id: string, increment: number) => void;

  // Computed Metrics for Selected Month
  monthMetrics: {
    totalIncome: number;
    totalExpenses: number;
    balance: number;
    savingsRate: number;
    fixedExpenses: number;
    variableExpenses: number;
    categoryTotals: Record<string, { total: number; count: number; name: string; color: string; icon: string; limit?: number }>;
    projectedEndMonthBalance: number;
    dailyExpenseBurn: number;
    overspentCategories: Array<{ category: Category; spent: number; limit: number; overBy: number }>;
  };

  // Rule 50/30/20 breakdown
  budgetRuleBreakdown: {
    essentials: { spent: number; percent: number; targetPercent: 50 };
    lifestyle: { spent: number; percent: number; targetPercent: 30 };
    savingsOrInvest: { spent: number; percent: number; targetPercent: 20 };
  };

  healthScore: FinancialHealthScore;

  // Data management
  resetToSampleData: () => void;
  exportDataJSON: () => void;
  importDataJSON: (jsonStr: string) => boolean;
}

const FinanceContext = createContext<FinanceContextType | undefined>(undefined);

export const FinanceProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [selectedMonth, setSelectedMonth] = useState<string>(() => {
    return getCurrentYearMonth();
  });

  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    const saved = localStorage.getItem('finansmart_transactions');
    return saved ? JSON.parse(saved) : INITIAL_TRANSACTIONS;
  });

  const [categories, setCategories] = useState<Category[]>(() => {
    const saved = localStorage.getItem('finansmart_categories');
    return saved ? JSON.parse(saved) : DEFAULT_CATEGORIES;
  });

  const [globalMonthlyBudget, setGlobalMonthlyBudget] = useState<number>(() => {
    const saved = localStorage.getItem('finansmart_global_budget');
    return saved ? JSON.parse(saved) : 4000;
  });

  const [goals, setGoals] = useState<SavingsGoal[]>(() => {
    const saved = localStorage.getItem('finansmart_goals');
    return saved ? JSON.parse(saved) : INITIAL_GOALS;
  });

  const [piggyBanks, setPiggyBanks] = useState<PiggyBank[]>(() => {
    const saved = localStorage.getItem('finansmart_piggy');
    return saved ? JSON.parse(saved) : INITIAL_PIGGY_BANKS;
  });

  const [cards, setCards] = useState<CreditCard[]>(() => {
    const saved = localStorage.getItem('finansmart_cards');
    return saved ? JSON.parse(saved) : INITIAL_CARDS;
  });

  const [bills, setBills] = useState<Bill[]>(() => {
    const saved = localStorage.getItem('finansmart_bills');
    return saved ? JSON.parse(saved) : INITIAL_BILLS;
  });

  const [subscriptions, setSubscriptions] = useState<Subscription[]>(() => {
    const saved = localStorage.getItem('finansmart_subscriptions');
    return saved ? JSON.parse(saved) : INITIAL_SUBSCRIPTIONS;
  });

  const [challenges, setChallenges] = useState<Challenge[]>(() => {
    const saved = localStorage.getItem('finansmart_challenges');
    return saved ? JSON.parse(saved) : INITIAL_CHALLENGES;
  });

  // Local storage synchronization
  useEffect(() => {
    localStorage.setItem('finansmart_transactions', JSON.stringify(transactions));
  }, [transactions]);

  useEffect(() => {
    localStorage.setItem('finansmart_categories', JSON.stringify(categories));
  }, [categories]);

  useEffect(() => {
    localStorage.setItem('finansmart_global_budget', JSON.stringify(globalMonthlyBudget));
  }, [globalMonthlyBudget]);

  useEffect(() => {
    localStorage.setItem('finansmart_goals', JSON.stringify(goals));
  }, [goals]);

  useEffect(() => {
    localStorage.setItem('finansmart_piggy', JSON.stringify(piggyBanks));
  }, [piggyBanks]);

  useEffect(() => {
    localStorage.setItem('finansmart_cards', JSON.stringify(cards));
  }, [cards]);

  useEffect(() => {
    localStorage.setItem('finansmart_bills', JSON.stringify(bills));
  }, [bills]);

  useEffect(() => {
    localStorage.setItem('finansmart_subscriptions', JSON.stringify(subscriptions));
  }, [subscriptions]);

  useEffect(() => {
    localStorage.setItem('finansmart_challenges', JSON.stringify(challenges));
  }, [challenges]);

  // Transaction Handlers
  const addTransaction = (tx: Omit<Transaction, 'id'>) => {
    const newTx: Transaction = {
      ...tx,
      id: 'tx-' + Date.now() + '-' + Math.random().toString(36).substring(2, 7),
    };
    setTransactions((prev) => [newTx, ...prev]);
  };

  const updateTransaction = (id: string, updated: Partial<Transaction>) => {
    setTransactions((prev) =>
      prev.map((item) => (item.id === id ? { ...item, ...updated } : item))
    );
  };

  const deleteTransaction = (id: string) => {
    setTransactions((prev) => prev.filter((item) => item.id !== id));
  };

  // Category Handlers
  const updateCategoryLimit = (categoryId: string, limit: number) => {
    setCategories((prev) =>
      prev.map((c) => (c.id === categoryId ? { ...c, budgetLimit: limit } : c))
    );
  };

  const addCategory = (cat: Omit<Category, 'id'>) => {
    const newCat: Category = {
      ...cat,
      id: 'cat-custom-' + Date.now(),
    };
    setCategories((prev) => [...prev, newCat]);
  };

  // Goals Handlers
  const addGoal = (goal: Omit<SavingsGoal, 'id' | 'currentAmount'>) => {
    const newGoal: SavingsGoal = {
      ...goal,
      id: 'goal-' + Date.now(),
      currentAmount: 0,
    };
    setGoals((prev) => [...prev, newGoal]);
  };

  const updateGoalProgress = (id: string, amount: number) => {
    setGoals((prev) =>
      prev.map((g) =>
        g.id === id ? { ...g, currentAmount: Math.max(0, g.currentAmount + amount) } : g
      )
    );
  };

  const deleteGoal = (id: string) => {
    setGoals((prev) => prev.filter((g) => g.id !== id));
  };

  // Piggy Banks Handlers
  const addPiggyBank = (piggy: Omit<PiggyBank, 'id' | 'balance' | 'history'>) => {
    const newPiggy: PiggyBank = {
      ...piggy,
      id: 'piggy-' + Date.now(),
      balance: 0,
      history: [],
    };
    setPiggyBanks((prev) => [...prev, newPiggy]);
  };

  const depositPiggyBank = (id: string, amount: number, note?: string) => {
    if (amount <= 0) return;
    setPiggyBanks((prev) =>
      prev.map((p) => {
        if (p.id !== id) return p;
        const newBalance = p.balance + amount;
        const record = {
          id: 'dep-' + Date.now(),
          amount,
          date: new Date().toISOString().split('T')[0],
          type: 'deposit' as const,
          note: note || 'Aporte manual',
        };
        return {
          ...p,
          balance: newBalance,
          history: [record, ...p.history],
        };
      })
    );
  };

  const withdrawPiggyBank = (id: string, amount: number, note?: string) => {
    if (amount <= 0) return;
    setPiggyBanks((prev) =>
      prev.map((p) => {
        if (p.id !== id) return p;
        const newBalance = Math.max(0, p.balance - amount);
        const record = {
          id: 'wth-' + Date.now(),
          amount,
          date: new Date().toISOString().split('T')[0],
          type: 'withdraw' as const,
          note: note || 'Resgate manual',
        };
        return {
          ...p,
          balance: newBalance,
          history: [record, ...p.history],
        };
      })
    );
  };

  const deletePiggyBank = (id: string) => {
    setPiggyBanks((prev) => prev.filter((p) => p.id !== id));
  };

  // Cards & Bills Handlers
  const addCreditCard = (card: Omit<CreditCard, 'id' | 'currentBill'>) => {
    const newCard: CreditCard = {
      ...card,
      id: 'card-' + Date.now(),
      currentBill: 0,
    };
    setCards((prev) => [...prev, newCard]);
  };

  const deleteCreditCard = (id: string) => {
    setCards((prev) => prev.filter((c) => c.id !== id));
  };

  const addBill = (bill: Omit<Bill, 'id' | 'status'>) => {
    const newBill: Bill = {
      ...bill,
      id: 'bill-' + Date.now(),
      status: 'pending',
    };
    setBills((prev) => [...prev, newBill]);
  };

  const markBillAsPaid = (id: string) => {
    setBills((prev) =>
      prev.map((b) =>
        b.id === id
          ? {
              ...b,
              status: 'paid',
              paidAt: new Date().toISOString().split('T')[0],
            }
          : b
      )
    );
  };

  const deleteBill = (id: string) => {
    setBills((prev) => prev.filter((b) => b.id !== id));
  };

  // Subscriptions
  const addSubscription = (sub: Omit<Subscription, 'id'>) => {
    const newSub: Subscription = {
      ...sub,
      id: 'sub-' + Date.now(),
    };
    setSubscriptions((prev) => [...prev, newSub]);
  };

  const toggleSubscription = (id: string) => {
    setSubscriptions((prev) =>
      prev.map((s) => (s.id === id ? { ...s, active: !s.active } : s))
    );
  };

  const deleteSubscription = (id: string) => {
    setSubscriptions((prev) => prev.filter((s) => s.id !== id));
  };

  // Challenges
  const updateChallengeProgress = (id: string, increment: number) => {
    setChallenges((prev) =>
      prev.map((c) => {
        if (c.id !== id) return c;
        const newProgress = Math.min(c.target, c.progress + increment);
        return {
          ...c,
          progress: newProgress,
          completed: newProgress >= c.target,
        };
      })
    );
  };

  // Computed Metrics for Selected Month
  const monthMetrics = useMemo(() => {
    const monthTransactions = transactions.filter((t) => t.date.startsWith(selectedMonth));

    let totalIncome = 0;
    let totalExpenses = 0;
    let fixedExpenses = 0;
    let variableExpenses = 0;

    const categoryMap: Record<
      string,
      { total: number; count: number; name: string; color: string; icon: string; limit?: number }
    > = {};

    categories.forEach((cat) => {
      categoryMap[cat.id] = {
        total: 0,
        count: 0,
        name: cat.name,
        color: cat.color,
        icon: cat.icon,
        limit: cat.budgetLimit,
      };
    });

    monthTransactions.forEach((tx) => {
      if (tx.type === 'income') {
        totalIncome += tx.amount;
      } else {
        totalExpenses += tx.amount;
        if (tx.expenseNature === 'fixed') {
          fixedExpenses += tx.amount;
        } else {
          variableExpenses += tx.amount;
        }
      }

      if (categoryMap[tx.categoryId]) {
        categoryMap[tx.categoryId].total += tx.amount;
        categoryMap[tx.categoryId].count += 1;
      } else {
        categoryMap[tx.categoryId] = {
          total: tx.amount,
          count: 1,
          name: 'Outros',
          color: '#64748b',
          icon: 'MoreHorizontal',
        };
      }
    });

    const balance = totalIncome - totalExpenses;
    const savingsRate = totalIncome > 0 ? Math.max(0, (balance / totalIncome) * 100) : 0;

    // Check category overspending
    const overspentCategories: Array<{
      category: Category;
      spent: number;
      limit: number;
      overBy: number;
    }> = [];

    categories.forEach((cat) => {
      if (cat.type === 'expense' && cat.budgetLimit && cat.budgetLimit > 0) {
        const spent = categoryMap[cat.id]?.total || 0;
        if (spent > cat.budgetLimit) {
          overspentCategories.push({
            category: cat,
            spent,
            limit: cat.budgetLimit,
            overBy: spent - cat.budgetLimit,
          });
        }
      }
    });

    // Burn rate and projection
    const now = new Date();
    const isCurrentMonth = selectedMonth === getCurrentYearMonth();
    const dayOfMonth = isCurrentMonth ? Math.max(1, now.getDate()) : 30;
    const daysLeft = isCurrentMonth ? getDaysLeftInMonth() : 0;

    const dailyExpenseBurn = totalExpenses / dayOfMonth;
    const projectedEndMonthBalance = isCurrentMonth
      ? totalIncome - (totalExpenses + dailyExpenseBurn * daysLeft)
      : balance;

    return {
      totalIncome,
      totalExpenses,
      balance,
      savingsRate,
      fixedExpenses,
      variableExpenses,
      categoryTotals: categoryMap,
      projectedEndMonthBalance,
      dailyExpenseBurn,
      overspentCategories,
    };
  }, [transactions, categories, selectedMonth]);

  // 50/30/20 Rule Breakdown
  const budgetRuleBreakdown = useMemo(() => {
    const monthExpenses = transactions.filter(
      (t) => t.date.startsWith(selectedMonth) && t.type === 'expense'
    );

    let essentials = 0;
    let lifestyle = 0;

    monthExpenses.forEach((tx) => {
      const cat = categories.find((c) => c.id === tx.categoryId);
      if (cat?.isEssential || tx.expenseNature === 'fixed') {
        essentials += tx.amount;
      } else {
        lifestyle += tx.amount;
      }
    });

    const totalSpent = monthMetrics.totalExpenses || 1;
    const incomeBase = monthMetrics.totalIncome > 0 ? monthMetrics.totalIncome : totalSpent;

    return {
      essentials: {
        spent: essentials,
        percent: Math.min(100, Math.round((essentials / incomeBase) * 100)),
        targetPercent: 50 as const,
      },
      lifestyle: {
        spent: lifestyle,
        percent: Math.min(100, Math.round((lifestyle / incomeBase) * 100)),
        targetPercent: 30 as const,
      },
      savingsOrInvest: {
        spent: Math.max(0, monthMetrics.balance),
        percent: Math.min(100, Math.round((Math.max(0, monthMetrics.balance) / incomeBase) * 100)),
        targetPercent: 20 as const,
      },
    };
  }, [transactions, categories, selectedMonth, monthMetrics]);

  // Overall Financial Health Score (0 - 1000)
  const healthScore = useMemo<FinancialHealthScore>(() => {
    let score = 500;

    // 1. Savings rate weight (up to +250 or -200)
    if (monthMetrics.savingsRate >= 20) {
      score += 250;
    } else if (monthMetrics.savingsRate >= 10) {
      score += 150;
    } else if (monthMetrics.savingsRate > 0) {
      score += 50;
    } else {
      score -= 200; // Spending more than earning
    }

    // 2. Budget adherence (+150 or -150)
    if (globalMonthlyBudget > 0) {
      if (monthMetrics.totalExpenses <= globalMonthlyBudget) {
        score += 150;
      } else {
        const excessPercent = ((monthMetrics.totalExpenses - globalMonthlyBudget) / globalMonthlyBudget) * 100;
        score -= Math.min(200, Math.round(excessPercent * 2));
      }
    }

    // 3. Category limits (+100 or -20 per overspent category)
    if (monthMetrics.overspentCategories.length === 0) {
      score += 100;
    } else {
      score -= monthMetrics.overspentCategories.length * 25;
    }

    // Clamp between 100 and 1000
    const finalScore = Math.max(100, Math.min(1000, Math.round(score)));

    let level: FinancialHealthScore['level'] = 'Bom';
    if (finalScore >= 850) level = 'Imbatível';
    else if (finalScore >= 700) level = 'Excelente';
    else if (finalScore >= 500) level = 'Bom';
    else if (finalScore >= 350) level = 'Em Alerta';
    else level = 'Crítico';

    const fixedRate =
      monthMetrics.totalIncome > 0
        ? Math.round((monthMetrics.fixedExpenses / monthMetrics.totalIncome) * 100)
        : 0;

    const budgetAdherence =
      globalMonthlyBudget > 0
        ? Math.round((monthMetrics.totalExpenses / globalMonthlyBudget) * 100)
        : 0;

    return {
      score: finalScore,
      level,
      savingsRate: Math.round(monthMetrics.savingsRate),
      fixedExpensesRate: fixedRate,
      budgetAdherence,
      points: challenges.filter((c) => c.completed).reduce((acc, c) => acc + c.rewardPoints, 0),
    };
  }, [monthMetrics, globalMonthlyBudget, challenges]);

  const resetToSampleData = () => {
    setTransactions(INITIAL_TRANSACTIONS);
    setCategories(DEFAULT_CATEGORIES);
    setGoals(INITIAL_GOALS);
    setPiggyBanks(INITIAL_PIGGY_BANKS);
    setCards(INITIAL_CARDS);
    setBills(INITIAL_BILLS);
    setSubscriptions(INITIAL_SUBSCRIPTIONS);
    setChallenges(INITIAL_CHALLENGES);
    setGlobalMonthlyBudget(4000);
  };

  const exportDataJSON = () => {
    const data = {
      transactions,
      categories,
      goals,
      piggyBanks,
      cards,
      bills,
      subscriptions,
      challenges,
      globalMonthlyBudget,
      exportDate: new Date().toISOString(),
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `finansmart_backup_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const importDataJSON = (jsonStr: string): boolean => {
    try {
      const data = JSON.parse(jsonStr);
      if (Array.isArray(data.transactions)) setTransactions(data.transactions);
      if (Array.isArray(data.categories)) setCategories(data.categories);
      if (Array.isArray(data.goals)) setGoals(data.goals);
      if (Array.isArray(data.piggyBanks)) setPiggyBanks(data.piggyBanks);
      if (Array.isArray(data.cards)) setCards(data.cards);
      if (Array.isArray(data.bills)) setBills(data.bills);
      if (Array.isArray(data.subscriptions)) setSubscriptions(data.subscriptions);
      if (data.globalMonthlyBudget) setGlobalMonthlyBudget(data.globalMonthlyBudget);
      return true;
    } catch (e) {
      console.error('Failed to import JSON', e);
      return false;
    }
  };

  return (
    <FinanceContext.Provider
      value={{
        selectedMonth,
        setSelectedMonth,
        transactions,
        categories,
        goals,
        piggyBanks,
        cards,
        bills,
        subscriptions,
        challenges,
        globalMonthlyBudget,
        setGlobalMonthlyBudget,
        addTransaction,
        updateTransaction,
        deleteTransaction,
        updateCategoryLimit,
        addCategory,
        addGoal,
        updateGoalProgress,
        deleteGoal,
        addPiggyBank,
        depositPiggyBank,
        withdrawPiggyBank,
        deletePiggyBank,
        addCreditCard,
        deleteCreditCard,
        addBill,
        markBillAsPaid,
        deleteBill,
        addSubscription,
        toggleSubscription,
        deleteSubscription,
        updateChallengeProgress,
        monthMetrics,
        budgetRuleBreakdown,
        healthScore,
        resetToSampleData,
        exportDataJSON,
        importDataJSON,
      }}
    >
      {children}
    </FinanceContext.Provider>
  );
};

export const useFinance = () => {
  const context = useContext(FinanceContext);
  if (!context) {
    throw new Error('useFinance must be used within a FinanceProvider');
  }
  return context;
};
