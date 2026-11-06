import React, { useMemo } from 'react';
import {
  TrendingUp,
  TrendingDown,
  Wallet,
  PiggyBank,
  AlertTriangle,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Calendar,
  Layers,
  Flame,
  CheckCircle2,
} from 'lucide-react';
import { useFinance } from '../../context/FinanceContext';
import { formatCurrency, formatMonthName, getCurrentYearMonth, getDaysLeftInMonth } from '../../utils/formatters';
import { CategoryIcon } from '../common/CategoryIcon';
import { ActiveTab } from '../layout/Navbar';

interface DashboardTabProps {
  setActiveTab: (tab: ActiveTab) => void;
  onOpenNewTransaction: () => void;
}

export const DashboardTab: React.FC<DashboardTabProps> = ({ setActiveTab, onOpenNewTransaction }) => {
  const {
    selectedMonth,
    monthMetrics,
    globalMonthlyBudget,
    budgetRuleBreakdown,
    transactions,
    categories,
    healthScore,
    bills,
  } = useFinance();

  // Multi-month comparison for the last 4 months
  const monthlyComparison = useMemo(() => {
    // Generate previous 4 months relative to selectedMonth
    const [year, month] = selectedMonth.split('-').map(Number);
    const monthsList: string[] = [];

    for (let i = 3; i >= 0; i--) {
      const d = new Date(year, month - 1 - i, 1);
      const y = d.getFullYear();
      const m = String(d.getMonth() + 1).padStart(2, '0');
      monthsList.push(`${y}-${m}`);
    }

    return monthsList.map((ym) => {
      const txs = transactions.filter((t) => t.date.startsWith(ym));
      const income = txs.filter((t) => t.type === 'income').reduce((acc, t) => acc + t.amount, 0);
      const expense = txs.filter((t) => t.type === 'expense').reduce((acc, t) => acc + t.amount, 0);
      return {
        monthKey: ym,
        label: formatMonthName(ym).split(' ')[0], // just month name
        income,
        expense,
        balance: income - expense,
        isCurrent: ym === selectedMonth,
      };
    });
  }, [selectedMonth, transactions]);

  // Max value for bar chart scaling
  const maxBarValue = useMemo(() => {
    const values = monthlyComparison.flatMap((m) => [m.income, m.expense]);
    return Math.max(...values, 1000);
  }, [monthlyComparison]);

  // Top spending categories sorted
  const sortedExpenseCategories = useMemo(() => {
    const list = Object.entries(monthMetrics.categoryTotals)
      .filter(([id, data]) => {
        const cat = categories.find((c) => c.id === id);
        return cat?.type === 'expense' && data.total > 0;
      })
      .map(([id, data]) => ({
        id,
        ...data,
        percent:
          monthMetrics.totalExpenses > 0
            ? Math.round((data.total / monthMetrics.totalExpenses) * 100)
            : 0,
      }))
      .sort((a, b) => b.total - a.total);

    return list;
  }, [monthMetrics, categories]);

  // Upcoming pending bills
  const upcomingBills = useMemo(() => {
    return bills
      .filter((b) => b.status === 'pending')
      .sort((a, b) => a.dueDate.localeCompare(b.dueDate))
      .slice(0, 3);
  }, [bills]);

  const budgetUsagePercent =
    globalMonthlyBudget > 0 ? Math.round((monthMetrics.totalExpenses / globalMonthlyBudget) * 100) : 0;

  const isCurrentMonth = selectedMonth === getCurrentYearMonth();
  const daysLeft = getDaysLeftInMonth();

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      {/* Top Banner Alert (if overspending or close) */}
      {monthMetrics.overspentCategories.length > 0 && (
        <div className="bg-amber-50 border border-amber-200/80 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-amber-100 text-amber-800 shrink-0">
              <AlertTriangle size={20} />
            </div>
            <div>
              <p className="text-xs sm:text-sm font-bold text-amber-900">
                Alerta de Orçamento: {monthMetrics.overspentCategories.length} categoria(s) ultrapassaram o teto!
              </p>
              <p className="text-xs text-amber-700">
                {monthMetrics.overspentCategories.map((c) => `${c.category.name} (+${formatCurrency(c.overBy)})`).join(', ')}
              </p>
            </div>
          </div>
          <button
            onClick={() => setActiveTab('planning')}
            className="text-xs font-bold text-amber-900 bg-amber-200/80 hover:bg-amber-300/80 px-3 py-1.5 rounded-xl transition-colors shrink-0 self-start sm:self-auto cursor-pointer"
          >
            Ajustar Metas
          </button>
        </div>
      )}

      {/* Main Metric Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Saldo Disponível */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs relative overflow-hidden flex flex-col justify-between">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Saldo do Mês
            </span>
            <div className={`p-2 rounded-xl ${monthMetrics.balance >= 0 ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
              <Wallet size={18} />
            </div>
          </div>
          <div>
            <h3 className={`text-2xl sm:text-3xl font-extrabold tracking-tight ${monthMetrics.balance >= 0 ? 'text-slate-900' : 'text-rose-600'}`}>
              {formatCurrency(monthMetrics.balance)}
            </h3>
            <div className="flex items-center gap-2 mt-2">
              <span className={`inline-flex items-center text-xs font-bold px-2 py-0.5 rounded-md ${monthMetrics.balance >= 0 ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'}`}>
                {monthMetrics.balance >= 0 ? 'Superávit' : 'Déficit'}
              </span>
              {isCurrentMonth && (
                <span className="text-[11px] text-slate-500" title="Estimativa considerando o ritmo diário de despesas">
                  Prev. fim do mês: <strong className="text-slate-700">{formatCurrency(monthMetrics.projectedEndMonthBalance)}</strong>
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Card 2: Receitas */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs relative overflow-hidden flex flex-col justify-between">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Receitas Totais
            </span>
            <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600">
              <TrendingUp size={18} />
            </div>
          </div>
          <div>
            <h3 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
              {formatCurrency(monthMetrics.totalIncome)}
            </h3>
            <p className="text-[11px] text-slate-500 mt-2">
              Entradas registradas em {formatMonthName(selectedMonth)}
            </p>
          </div>
        </div>

        {/* Card 3: Despesas Totais */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs relative overflow-hidden flex flex-col justify-between">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Despesas Totais
            </span>
            <div className="p-2 rounded-xl bg-rose-50 text-rose-600">
              <TrendingDown size={18} />
            </div>
          </div>
          <div>
            <h3 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
              {formatCurrency(monthMetrics.totalExpenses)}
            </h3>
            <div className="flex items-center gap-2 mt-2 text-[11px] text-slate-500">
              <span>Fixos: <strong className="text-slate-700">{formatCurrency(monthMetrics.fixedExpenses)}</strong></span>
              <span>•</span>
              <span>Variáveis: <strong className="text-slate-700">{formatCurrency(monthMetrics.variableExpenses)}</strong></span>
            </div>
          </div>
        </div>

        {/* Card 4: Taxa de Poupança */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs relative overflow-hidden flex flex-col justify-between">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Taxa de Poupança
            </span>
            <div className="p-2 rounded-xl bg-teal-50 text-teal-600">
              <PiggyBank size={18} />
            </div>
          </div>
          <div>
            <div className="flex items-baseline gap-2">
              <h3 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
                {monthMetrics.savingsRate.toFixed(1)}%
              </h3>
              <span className="text-xs text-slate-500">guardados</span>
            </div>
            <div className="w-full bg-slate-100 h-2 rounded-full mt-2 overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  monthMetrics.savingsRate >= 20 ? 'bg-emerald-500' : monthMetrics.savingsRate >= 10 ? 'bg-amber-500' : 'bg-rose-500'
                }`}
                style={{ width: `${Math.min(100, monthMetrics.savingsRate)}%` }}
              ></div>
            </div>
          </div>
        </div>
      </div>

      {/* Charts Section: 2 Columns */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Monthly Evolution Bar Chart (2 cols) */}
        <div className="lg:col-span-2 bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h4 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Layers size={18} className="text-emerald-600" />
                Evolução Mensal: Receitas vs Despesas
              </h4>
              <p className="text-xs text-slate-500">
                Comparativo automático do seu histórico financeiro recente
              </p>
            </div>
            <div className="flex items-center gap-3 text-xs">
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-xs bg-emerald-500"></span>
                <span className="text-slate-600">Receitas</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-xs bg-rose-500"></span>
                <span className="text-slate-600">Despesas</span>
              </div>
            </div>
          </div>

          {/* SVG Custom Bar Chart */}
          <div className="h-64 flex items-end justify-between gap-4 pt-6 pb-2 px-2 border-b border-slate-100">
            {monthlyComparison.map((item) => {
              const incomeHeight = Math.max(8, (item.income / maxBarValue) * 190);
              const expenseHeight = Math.max(8, (item.expense / maxBarValue) * 190);

              return (
                <div key={item.monthKey} className="flex-1 flex flex-col items-center gap-2 h-full justify-end group">
                  {/* Tooltip on Hover */}
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity absolute -translate-y-48 bg-slate-900 text-white text-[11px] p-2 rounded-lg pointer-events-none z-20 shadow-xl whitespace-nowrap">
                    <p className="font-bold border-b border-slate-700 pb-1 mb-1">{formatMonthName(item.monthKey)}</p>
                    <p className="text-emerald-400">Entradas: {formatCurrency(item.income)}</p>
                    <p className="text-rose-400">Saídas: {formatCurrency(item.expense)}</p>
                    <p className="text-slate-200">Saldo: {formatCurrency(item.balance)}</p>
                  </div>

                  {/* Bars side by side */}
                  <div className="flex items-end gap-1.5 sm:gap-2.5 w-full justify-center h-48">
                    {/* Income Bar */}
                    <div
                      className="w-4 sm:w-8 bg-gradient-to-t from-emerald-600 to-emerald-400 rounded-t-md transition-all duration-500 group-hover:brightness-110 relative"
                      style={{ height: `${incomeHeight}px` }}
                    ></div>
                    {/* Expense Bar */}
                    <div
                      className="w-4 sm:w-8 bg-gradient-to-t from-rose-600 to-rose-400 rounded-t-md transition-all duration-500 group-hover:brightness-110 relative"
                      style={{ height: `${expenseHeight}px` }}
                    ></div>
                  </div>

                  {/* Month Label */}
                  <div className={`text-xs font-semibold capitalize text-center ${item.isCurrent ? 'text-emerald-600 font-bold' : 'text-slate-500'}`}>
                    {item.label}
                    {item.isCurrent && <span className="block text-[9px] text-emerald-600 font-normal">Atual</span>}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Quick summary below chart */}
          <div className="grid grid-cols-3 gap-2 mt-4 pt-2 text-center text-xs">
            <div className="p-2 rounded-xl bg-slate-50">
              <span className="text-slate-500 block text-[11px]">Média de Entradas</span>
              <span className="font-bold text-slate-800">
                {formatCurrency(
                  monthlyComparison.reduce((acc, m) => acc + m.income, 0) / monthlyComparison.length
                )}
              </span>
            </div>
            <div className="p-2 rounded-xl bg-slate-50">
              <span className="text-slate-500 block text-[11px]">Média de Despesas</span>
              <span className="font-bold text-slate-800">
                {formatCurrency(
                  monthlyComparison.reduce((acc, m) => acc + m.expense, 0) / monthlyComparison.length
                )}
              </span>
            </div>
            <div className="p-2 rounded-xl bg-slate-50">
              <span className="text-slate-500 block text-[11px]">Taxa Média Poupança</span>
              <span className="font-bold text-emerald-600">
                {Math.max(
                  0,
                  Math.round(
                    ((monthlyComparison.reduce((acc, m) => acc + m.balance, 0) /
                      (monthlyComparison.reduce((acc, m) => acc + m.income, 0) || 1)) *
                      100)
                  )
                )}%
              </span>
            </div>
          </div>
        </div>

        {/* Right Column: Global Monthly Budget Tracker */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <ShieldCheck size={18} className="text-teal-600" />
                Teto de Gastos do Mês
              </h4>
              <button
                onClick={() => setActiveTab('planning')}
                className="text-xs font-semibold text-emerald-600 hover:text-emerald-700"
              >
                Editar
              </button>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 mb-4">
              <div className="flex items-baseline justify-between mb-1">
                <span className="text-xs text-slate-600 font-medium">Consumido até agora</span>
                <span className="text-sm font-bold text-slate-900">
                  {formatCurrency(monthMetrics.totalExpenses)} / {formatCurrency(globalMonthlyBudget)}
                </span>
              </div>
              <div className="w-full bg-slate-200 h-3 rounded-full overflow-hidden mt-2">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    budgetUsagePercent > 100
                      ? 'bg-rose-600'
                      : budgetUsagePercent > 80
                      ? 'bg-amber-500'
                      : 'bg-emerald-500'
                  }`}
                  style={{ width: `${Math.min(100, budgetUsagePercent)}%` }}
                ></div>
              </div>
              <div className="flex justify-between items-center text-[11px] text-slate-500 mt-2">
                <span>{budgetUsagePercent}% utilizado</span>
                <span>
                  {globalMonthlyBudget - monthMetrics.totalExpenses >= 0
                    ? `Resta ${formatCurrency(globalMonthlyBudget - monthMetrics.totalExpenses)}`
                    : `Estourou por ${formatCurrency(monthMetrics.totalExpenses - globalMonthlyBudget)}`}
                </span>
              </div>
            </div>

            {/* Daily Burn Rate Indicator */}
            {isCurrentMonth && (
              <div className="p-3 rounded-xl bg-orange-50/60 border border-orange-200/60 flex items-center gap-3 mb-4">
                <Flame size={20} className="text-orange-500 shrink-0" />
                <div className="text-xs">
                  <span className="text-orange-900 font-bold block">Ritmo Diário de Consumo</span>
                  <span className="text-orange-700">
                    Você gasta em média <strong>{formatCurrency(monthMetrics.dailyExpenseBurn)}/dia</strong>. Faltam {daysLeft} dias no mês.
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* AI Shortcut Card */}
          <div className="p-4 rounded-xl bg-gradient-to-br from-teal-500/10 via-emerald-500/10 to-transparent border border-emerald-200/70">
            <div className="flex items-center gap-2 mb-2">
              <Sparkles size={16} className="text-teal-600" />
              <span className="text-xs font-bold text-teal-900">Dica Inteligente FinanBot</span>
            </div>
            <p className="text-xs text-slate-700 mb-3 leading-relaxed">
              {monthMetrics.variableExpenses > monthMetrics.fixedExpenses
                ? 'Seus gastos variáveis (lazer, delivery, compras) estão superando suas despesas fixas. Ajuste para manter o equilíbrio.'
                : 'Excelente controle das despesas fixas! Considere transferir 10% do saldo restante hoje para um dos seus Cofrinhos.'}
            </p>
            <button
              onClick={() => setActiveTab('ai')}
              className="w-full flex items-center justify-center gap-2 py-2 text-xs font-bold text-white bg-teal-600 hover:bg-teal-700 rounded-xl transition-all cursor-pointer shadow-xs"
            >
              <span>Ver Diagnóstico Completo da IA</span>
              <ArrowRight size={14} />
            </button>
          </div>
        </div>
      </div>

      {/* Row 2: Category Breakdown and 50/30/20 Rule */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Category Breakdown (2 cols) */}
        <div className="lg:col-span-2 bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h4 className="text-base font-bold text-slate-900">
                Divisão por Categorias
              </h4>
              <p className="text-xs text-slate-500">
                Veja detalhadamente onde seu dinheiro está indo (Alimentação, Festa, Transporte etc.)
              </p>
            </div>
            <button
              onClick={onOpenNewTransaction}
              className="text-xs font-bold text-emerald-600 hover:text-emerald-700 flex items-center gap-1 cursor-pointer"
            >
              + Lançar
            </button>
          </div>

          {sortedExpenseCategories.length === 0 ? (
            <div className="py-12 text-center text-slate-400">
              <p className="text-sm font-medium">Nenhuma despesa registrada neste mês.</p>
              <button
                onClick={onOpenNewTransaction}
                className="mt-3 text-xs font-bold text-emerald-600 underline cursor-pointer"
              >
                Cadastrar primeiro gasto
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {sortedExpenseCategories.map((cat) => {
                const categoryObj = categories.find((c) => c.id === cat.id);
                const limit = categoryObj?.budgetLimit;
                const isOver = limit && cat.total > limit;

                return (
                  <div
                    key={cat.id}
                    className="p-3 rounded-xl border border-slate-100 hover:border-slate-200 bg-slate-50/50 hover:bg-slate-50 transition-all"
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center gap-2.5">
                        <CategoryIcon name={cat.icon} color={cat.color} size={15} />
                        <div>
                          <span className="text-xs sm:text-sm font-bold text-slate-900 block">
                            {cat.name}
                          </span>
                          <span className="text-[10px] text-slate-400">
                            {cat.count} {cat.count === 1 ? 'transação' : 'transações'}
                          </span>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="text-xs sm:text-sm font-extrabold text-slate-900 block">
                          {formatCurrency(cat.total)}
                        </span>
                        <span className="text-[11px] font-semibold text-slate-500">
                          {cat.percent}% do total
                        </span>
                      </div>
                    </div>

                    {/* Progress Bar relative to Category Budget */}
                    {limit && limit > 0 && (
                      <div className="mt-2">
                        <div className="flex justify-between text-[10px] text-slate-500 mb-1">
                          <span>
                            Meta: {formatCurrency(limit)}{' '}
                            {isOver && <span className="text-rose-600 font-bold">(Estourou!)</span>}
                          </span>
                          <span>{Math.round((cat.total / limit) * 100)}%</span>
                        </div>
                        <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all ${
                              isOver ? 'bg-rose-500' : 'bg-emerald-500'
                            }`}
                            style={{
                              width: `${Math.min(100, (cat.total / limit) * 100)}%`,
                            }}
                          ></div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* 50/30/20 Rule Breakdown Card (1 col) */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-base font-bold text-slate-900">
                Regra 50 / 30 / 20
              </h4>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700">
                Saúde Financeira
              </span>
            </div>
            <p className="text-xs text-slate-500 mb-4">
              Metodologia clássica de equilíbrio entre necessidades, lazer e futuro.
            </p>

            <div className="space-y-4">
              {/* 50% Necessidades */}
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                <div className="flex justify-between items-center text-xs mb-1">
                  <span className="font-bold text-slate-800">50% Necessidades (Fixos)</span>
                  <span className="font-extrabold text-slate-900">
                    {budgetRuleBreakdown.essentials.percent}% ({formatCurrency(budgetRuleBreakdown.essentials.spent)})
                  </span>
                </div>
                <p className="text-[10px] text-slate-500 mb-2">Moradia, contas básicas, mercado e saúde</p>
                <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all ${
                      budgetRuleBreakdown.essentials.percent <= 50 ? 'bg-emerald-500' : 'bg-amber-500'
                    }`}
                    style={{ width: `${Math.min(100, budgetRuleBreakdown.essentials.percent)}%` }}
                  ></div>
                </div>
              </div>

              {/* 30% Desejos e Lazer */}
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                <div className="flex justify-between items-center text-xs mb-1">
                  <span className="font-bold text-slate-800">30% Lazer & Festas</span>
                  <span className="font-extrabold text-slate-900">
                    {budgetRuleBreakdown.lifestyle.percent}% ({formatCurrency(budgetRuleBreakdown.lifestyle.spent)})
                  </span>
                </div>
                <p className="text-[10px] text-slate-500 mb-2">Baladas, restaurantes, delivery e compras</p>
                <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all ${
                      budgetRuleBreakdown.lifestyle.percent <= 30 ? 'bg-emerald-500' : 'bg-rose-500'
                    }`}
                    style={{ width: `${Math.min(100, budgetRuleBreakdown.lifestyle.percent)}%` }}
                  ></div>
                </div>
              </div>

              {/* 20% Poupança */}
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                <div className="flex justify-between items-center text-xs mb-1">
                  <span className="font-bold text-slate-800">20% Poupança & Investimentos</span>
                  <span className="font-extrabold text-emerald-600">
                    {budgetRuleBreakdown.savingsOrInvest.percent}% ({formatCurrency(budgetRuleBreakdown.savingsOrInvest.spent)})
                  </span>
                </div>
                <p className="text-[10px] text-slate-500 mb-2">Reserva de emergência e metas de longo prazo</p>
                <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-teal-500 rounded-full transition-all"
                    style={{ width: `${Math.min(100, budgetRuleBreakdown.savingsOrInvest.percent)}%` }}
                  ></div>
                </div>
              </div>
            </div>
          </div>

          {/* Upcoming Bills Snippet */}
          <div className="mt-4 pt-3 border-t border-slate-100">
            <div className="flex items-center justify-between text-xs font-bold text-slate-800 mb-2">
              <span>Próximas Contas a Pagar</span>
              <button
                onClick={() => setActiveTab('payments')}
                className="text-emerald-600 hover:text-emerald-700 text-[11px]"
              >
                Ver todas ({bills.filter((b) => b.status === 'pending').length})
              </button>
            </div>
            {upcomingBills.length === 0 ? (
              <p className="text-xs text-slate-400">Nenhuma conta pendente para este mês! 🎉</p>
            ) : (
              <div className="space-y-1.5">
                {upcomingBills.map((b) => (
                  <div key={b.id} className="flex justify-between items-center text-xs p-2 rounded-lg bg-slate-50">
                    <span className="truncate max-w-[150px] font-medium text-slate-700">{b.title}</span>
                    <span className="font-bold text-slate-900">{formatCurrency(b.amount)}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
