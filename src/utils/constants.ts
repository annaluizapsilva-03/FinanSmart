import { Category, Transaction, SavingsGoal, PiggyBank, CreditCard, Bill, Subscription, Challenge } from '../types/finance';

export const DEFAULT_CATEGORIES: Category[] = [
  // Despesas
  { id: 'cat-alimentacao', name: 'Alimentação & Mercado', icon: 'Utensils', color: '#f97316', type: 'expense', budgetLimit: 900, isEssential: true },
  { id: 'cat-festa', name: 'Festa & Lazer', icon: 'PartyPopper', color: '#ec4899', type: 'expense', budgetLimit: 400, isEssential: false },
  { id: 'cat-transporte', name: 'Transporte & Combustível', icon: 'Car', color: '#3b82f6', type: 'expense', budgetLimit: 450, isEssential: true },
  { id: 'cat-moradia', name: 'Moradia & Contas', icon: 'Home', color: '#8b5cf6', type: 'expense', budgetLimit: 1400, isEssential: true },
  { id: 'cat-saude', name: 'Saúde & Farmácia', icon: 'HeartPulse', color: '#ef4444', type: 'expense', budgetLimit: 250, isEssential: true },
  { id: 'cat-educacao', name: 'Educação & Cursos', icon: 'GraduationCap', color: '#06b6d4', type: 'expense', budgetLimit: 300, isEssential: true },
  { id: 'cat-compras', name: 'Compras & Vestuário', icon: 'ShoppingBag', color: '#eab308', type: 'expense', budgetLimit: 300, isEssential: false },
  { id: 'cat-assinaturas', name: 'Assinaturas & Serviços', icon: 'Tv', color: '#10b981', type: 'expense', budgetLimit: 120, isEssential: false },
  { id: 'cat-outros-gastos', name: 'Outras Despesas', icon: 'MoreHorizontal', color: '#64748b', type: 'expense', budgetLimit: 200, isEssential: false },

  // Receitas
  { id: 'cat-salario', name: 'Salário Fixo', icon: 'Briefcase', color: '#10b981', type: 'income', isEssential: true },
  { id: 'cat-freelance', name: 'Freelance & Extras', icon: 'Laptop', color: '#06b6d4', type: 'income', isEssential: false },
  { id: 'cat-rendimentos', name: 'Rendimentos & Dividendos', icon: 'TrendingUp', color: '#8b5cf6', type: 'income', isEssential: false },
  { id: 'cat-outras-receitas', name: 'Outras Receitas', icon: 'PiggyBank', color: '#f59e0b', type: 'income', isEssential: false },
];

export const INITIAL_TRANSACTIONS: Transaction[] = [
  // Mês atual
  { id: 'tx-1', description: 'Salário Mensal', amount: 4800, type: 'income', categoryId: 'cat-salario', date: '2026-11-01', paymentMethod: 'transfer' },
  { id: 'tx-2', description: 'Projeto Freelance Design', amount: 850, type: 'income', categoryId: 'cat-freelance', date: '2026-11-04', paymentMethod: 'pix' },
  { id: 'tx-3', description: 'Aluguel do Apartamento', amount: 1250, type: 'expense', categoryId: 'cat-moradia', date: '2026-11-02', expenseNature: 'fixed', paymentMethod: 'pix' },
  { id: 'tx-4', description: 'Supermercado Mensal', amount: 620, type: 'expense', categoryId: 'cat-alimentacao', date: '2026-11-03', expenseNature: 'variable', paymentMethod: 'debit' },
  { id: 'tx-5', description: 'Festa Balada & Drinks Fim de Semana', amount: 240, type: 'expense', categoryId: 'cat-festa', date: '2026-11-04', expenseNature: 'variable', paymentMethod: 'credit' },
  { id: 'tx-6', description: 'Abastecimento Carro Posto', amount: 180, type: 'expense', categoryId: 'cat-transporte', date: '2026-11-03', expenseNature: 'variable', paymentMethod: 'credit' },
  { id: 'tx-7', description: 'Restaurante Jantar com Amigos', amount: 165, type: 'expense', categoryId: 'cat-festa', date: '2026-11-05', expenseNature: 'variable', paymentMethod: 'credit' },
  { id: 'tx-8', description: 'Internet Fibra 500MB', amount: 119.90, type: 'expense', categoryId: 'cat-moradia', date: '2026-11-05', expenseNature: 'fixed', paymentMethod: 'boleto' },
  { id: 'tx-9', description: 'Farmácia Vitaminas', amount: 89, type: 'expense', categoryId: 'cat-saude', date: '2026-11-02', expenseNature: 'variable', paymentMethod: 'debit' },
  { id: 'tx-10', description: 'Uber para Reunião', amount: 42.50, type: 'expense', categoryId: 'cat-transporte', date: '2026-11-04', expenseNature: 'variable', paymentMethod: 'pix' },

  // Mês anterior (Outubro)
  { id: 'tx-prev-1', description: 'Salário Mensal Outubro', amount: 4800, type: 'income', categoryId: 'cat-salario', date: '2026-10-01', paymentMethod: 'transfer' },
  { id: 'tx-prev-2', description: 'Aluguel Outubro', amount: 1250, type: 'expense', categoryId: 'cat-moradia', date: '2026-10-02', expenseNature: 'fixed', paymentMethod: 'pix' },
  { id: 'tx-prev-3', description: 'Mercado Outubro', amount: 780, type: 'expense', categoryId: 'cat-alimentacao', date: '2026-10-10', expenseNature: 'variable', paymentMethod: 'debit' },
  { id: 'tx-prev-4', description: 'Balada & Chopp Halloween', amount: 390, type: 'expense', categoryId: 'cat-festa', date: '2026-10-28', expenseNature: 'variable', paymentMethod: 'credit' },
  { id: 'tx-prev-5', description: 'Gasolina Viagem', amount: 310, type: 'expense', categoryId: 'cat-transporte', date: '2026-10-15', expenseNature: 'variable', paymentMethod: 'credit' },
  { id: 'tx-prev-6', description: 'Contas Energia + Água', amount: 215, type: 'expense', categoryId: 'cat-moradia', date: '2026-10-12', expenseNature: 'fixed', paymentMethod: 'boleto' },
  { id: 'tx-prev-7', description: 'Cinema & Pipoca', amount: 110, type: 'expense', categoryId: 'cat-festa', date: '2026-10-20', expenseNature: 'variable', paymentMethod: 'credit' },

  // Setembro
  { id: 'tx-sep-1', description: 'Salário Setembro', amount: 4800, type: 'income', categoryId: 'cat-salario', date: '2026-09-01', paymentMethod: 'transfer' },
  { id: 'tx-sep-2', description: 'Despesas Gerais Setembro', amount: 2850, type: 'expense', categoryId: 'cat-moradia', date: '2026-09-15', expenseNature: 'fixed', paymentMethod: 'pix' },
];

export const INITIAL_GOALS: SavingsGoal[] = [
  { id: 'goal-1', title: 'Reserva de Emergência (6 meses)', targetAmount: 15000, currentAmount: 9400, targetDate: '2027-04-30', category: 'reserva', color: '#10b981' },
  { id: 'goal-2', title: 'Viagem de Férias para Praia', targetAmount: 3500, currentAmount: 2100, targetDate: '2027-01-15', category: 'viagem', color: '#06b6d4' },
  { id: 'goal-3', title: 'Troca de Smartphone', targetAmount: 2800, currentAmount: 950, targetDate: '2027-06-30', category: 'bens', color: '#8b5cf6' },
];

export const INITIAL_PIGGY_BANKS: PiggyBank[] = [
  {
    id: 'piggy-1',
    name: 'IPVA e Seguro do Carro',
    targetAmount: 2400,
    balance: 1600,
    color: '#3b82f6',
    icon: 'Car',
    history: [
      { id: 'p-1', amount: 600, date: '2026-09-10', type: 'deposit', note: 'Aporte de Setembro' },
      { id: 'p-2', amount: 500, date: '2026-10-10', type: 'deposit', note: 'Aporte de Outubro' },
      { id: 'p-3', amount: 500, date: '2026-11-02', type: 'deposit', note: 'Aporte do Salário' },
    ],
  },
  {
    id: 'piggy-2',
    name: 'Festa de Aniversário & Confraternização',
    targetAmount: 1200,
    balance: 750,
    color: '#ec4899',
    icon: 'Gift',
    history: [
      { id: 'p-4', amount: 350, date: '2026-10-15', type: 'deposit', note: 'Sobra do Freela' },
      { id: 'p-5', amount: 400, date: '2026-11-04', type: 'deposit', note: 'Economia da semana' },
    ],
  },
  {
    id: 'piggy-3',
    name: 'Upgrade Computador / Home Office',
    targetAmount: 3000,
    balance: 1200,
    color: '#10b981',
    icon: 'Laptop',
    history: [
      { id: 'p-6', amount: 1200, date: '2026-10-25', type: 'deposit', note: 'Aporte inicial' },
    ],
  },
];

export const INITIAL_CARDS: CreditCard[] = [
  { id: 'card-1', name: 'Nubank Roxinho', brand: 'nubank', limit: 5000, currentBill: 1450.30, closingDay: 20, dueDay: 27, color: '#8b5cf6' },
  { id: 'card-2', name: 'Inter Black', brand: 'inter', limit: 8000, currentBill: 820.00, closingDay: 15, dueDay: 22, color: '#f97316' },
];

export const INITIAL_BILLS: Bill[] = [
  { id: 'bill-1', title: 'Aluguel Imobiliária', amount: 1250, dueDate: '2026-11-10', categoryId: 'cat-moradia', status: 'pending', isRecurring: true },
  { id: 'bill-2', title: 'Energia Elétrica Enel', amount: 145.80, dueDate: '2026-11-14', categoryId: 'cat-moradia', status: 'pending', isRecurring: true },
  { id: 'bill-3', title: 'Internet Fibra 500MB', amount: 119.90, dueDate: '2026-11-05', categoryId: 'cat-moradia', status: 'paid', isRecurring: true, paidAt: '2026-11-05' },
  { id: 'bill-4', title: 'Plano Celular Claro', amount: 59.90, dueDate: '2026-11-20', categoryId: 'cat-moradia', status: 'pending', isRecurring: true },
  { id: 'bill-5', title: 'Taxa de Condomínio', amount: 320.00, dueDate: '2026-11-08', categoryId: 'cat-moradia', status: 'pending', isRecurring: true },
];

export const INITIAL_SUBSCRIPTIONS: Subscription[] = [
  { id: 'sub-1', name: 'Netflix 4K', amount: 59.90, billingCycle: 'monthly', renewalDay: 12, category: 'Lazer & Streaming', active: true, icon: 'Film' },
  { id: 'sub-2', name: 'Spotify Premium Family', amount: 34.90, billingCycle: 'monthly', renewalDay: 18, category: 'Música', active: true, icon: 'Headphones' },
  { id: 'sub-3', name: 'Amazon Prime', amount: 19.90, billingCycle: 'monthly', renewalDay: 5, category: 'Compras & Vídeo', active: true, icon: 'ShoppingBag' },
  { id: 'sub-4', name: 'Academia SmartFit', amount: 119.90, billingCycle: 'monthly', renewalDay: 10, category: 'Saúde & Esporte', active: true, icon: 'Activity' },
  { id: 'sub-5', name: 'YouTube Premium', amount: 24.90, billingCycle: 'monthly', renewalDay: 25, category: 'Lazer & Streaming', active: false, icon: 'Tv' },
];

export const INITIAL_CHALLENGES: Challenge[] = [
  { id: 'ch-1', title: 'Sem Delivery por 7 Dias', description: 'Cozinhe suas refeições em casa por 7 dias seguidos e economize até R$ 200.', difficulty: 'Fácil', rewardPoints: 150, durationDays: 7, progress: 4, target: 7, unit: 'dias', completed: false, badge: 'Chef Econômico' },
  { id: 'ch-2', title: 'Economizar R$ 300 este Mês', description: 'Direcione pelo menos R$ 300 extras diretamente para um cofrinho ou investimento.', difficulty: 'Médio', rewardPoints: 250, durationDays: 30, progress: 200, target: 300, unit: 'R$', completed: false, badge: 'Poupador Focado' },
  { id: 'ch-3', title: 'Revisão das 3 Assinaturas', description: 'Cancele ao menos 1 assinatura de streaming ou serviço que você raramente usa.', difficulty: 'Fácil', rewardPoints: 100, durationDays: 1, progress: 1, target: 1, unit: 'meta', completed: true, badge: 'Exterminador de Supérfluos' },
  { id: 'ch-4', title: 'Regra das 48 Horas', description: 'Antes de comprar qualquer item acima de R$ 100, espere 48 horas para evitar compra por impulso.', difficulty: 'Médio', rewardPoints: 200, durationDays: 14, progress: 10, target: 14, unit: 'dias', completed: false, badge: 'Mente Consciente' },
  { id: 'ch-5', title: 'Desafio das 52 Semanas', description: 'Guarde um valor progressivo toda semana para acumular R$ 1.378 no ano.', difficulty: 'Difícil', rewardPoints: 500, durationDays: 52, progress: 18, target: 52, unit: 'semanas', completed: false, badge: 'Faixa Preta da Poupança' },
];
