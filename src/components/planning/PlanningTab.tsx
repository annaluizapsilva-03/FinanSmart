import React, { useState } from 'react';
import {
  Target,
  Shield,
  Plus,
  TrendingUp,
  AlertCircle,
  CheckCircle,
  Calendar,
  Sparkles,
  Edit3,
  DollarSign,
  Trash2,
} from 'lucide-react';
import { useFinance } from '../../context/FinanceContext';
import { formatCurrency, formatMonthName, getCurrentYearMonth, getDaysLeftInMonth } from '../../utils/formatters';
import { CategoryIcon } from '../common/CategoryIcon';
import { SavingsGoal } from '../../types/finance';

export const PlanningTab: React.FC = () => {
  const {
    selectedMonth,
    globalMonthlyBudget,
    setGlobalMonthlyBudget,
    categories,
    updateCategoryLimit,
    goals,
    addGoal,
    updateGoalProgress,
    deleteGoal,
    monthMetrics,
  } = useFinance();

  // Editing state for Global Budget
  const [isEditingGlobal, setIsEditingGlobal] = useState(false);
  const [tempGlobalBudget, setTempGlobalBudget] = useState(globalMonthlyBudget.toString());

  // Editing category limits
  const [editingCatId, setEditingCatId] = useState<string | null>(null);
  const [tempCatLimit, setTempCatLimit] = useState('');

  // Modal for new Savings Goal
  const [isGoalModalOpen, setIsGoalModalOpen] = useState(false);
  const [newGoalTitle, setNewGoalTitle] = useState('');
  const [newGoalTarget, setNewGoalTarget] = useState('');
  const [newGoalDate, setNewGoalDate] = useState('');
  const [newGoalCategory, setNewGoalCategory] = useState('reserva');

  // Modal for Goal Deposit
  const [depositGoalId, setDepositGoalId] = useState<string | null>(null);
  const [depositAmount, setDepositAmount] = useState('');

  const isCurrentMonth = selectedMonth === getCurrentYearMonth();
  const daysLeft = getDaysLeftInMonth();
  const budgetUsagePercent =
    globalMonthlyBudget > 0 ? Math.round((monthMetrics.totalExpenses / globalMonthlyBudget) * 100) : 0;

  const handleSaveGlobalBudget = () => {
    const val = parseFloat(tempGlobalBudget.replace(',', '.'));
    if (!isNaN(val) && val >= 0) {
      setGlobalMonthlyBudget(val);
      setIsEditingGlobal(false);
    }
  };

  const handleSaveCatLimit = (catId: string) => {
    const val = parseFloat(tempCatLimit.replace(',', '.'));
    if (!isNaN(val) && val >= 0) {
      updateCategoryLimit(catId, val);
      setEditingCatId(null);
    }
  };

  const handleCreateGoal = (e: React.FormEvent) => {
    e.preventDefault();
    const target = parseFloat(newGoalTarget.replace(',', '.'));
    if (!newGoalTitle.trim() || isNaN(target) || target <= 0) {
      alert('Informe um título e valor alvo válido.');
      return;
    }
    addGoal({
      title: newGoalTitle.trim(),
      targetAmount: target,
      targetDate: newGoalDate || '2027-12-31',
      category: newGoalCategory,
      color: '#10b981',
    });
    setNewGoalTitle('');
    setNewGoalTarget('');
    setNewGoalDate('');
    setIsGoalModalOpen(false);
  };

  const handleDepositToGoal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!depositGoalId) return;
    const val = parseFloat(depositAmount.replace(',', '.'));
    if (isNaN(val) || val <= 0) return;
    updateGoalProgress(depositGoalId, val);
    setDepositAmount('');
    setDepositGoalId(null);
  };

  const expenseCategories = categories.filter((c) => c.type === 'expense');

  return (
    <div className="space-y-8 animate-fade-in pb-12">
      {/* 1. Global Monthly Budget Section */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2">
              <Shield className="text-emerald-600" size={20} />
              <h2 className="text-lg font-bold text-slate-900">
                Orçamento Mensal Global
              </h2>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Defina o teto máximo que você planeja gastar em {formatMonthName(selectedMonth)}.
            </p>
          </div>

          <div className="flex items-center gap-3">
            {isEditingGlobal ? (
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  step="10"
                  value={tempGlobalBudget}
                  onChange={(e) => setTempGlobalBudget(e.target.value)}
                  className="w-32 px-3 py-1.5 text-sm font-bold border border-emerald-500 rounded-xl focus:outline-none"
                  autoFocus
                />
                <button
                  onClick={handleSaveGlobalBudget}
                  className="px-3 py-1.5 text-xs font-bold text-white bg-emerald-600 rounded-xl hover:bg-emerald-700"
                >
                  Salvar
                </button>
                <button
                  onClick={() => setIsEditingGlobal(false)}
                  className="px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancelar
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <span className="text-2xl font-extrabold text-slate-900">
                  {formatCurrency(globalMonthlyBudget)}
                </span>
                <button
                  onClick={() => {
                    setTempGlobalBudget(globalMonthlyBudget.toString());
                    setIsEditingGlobal(true);
                  }}
                  className="p-1.5 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors cursor-pointer"
                  title="Alterar Orçamento Global"
                >
                  <Edit3 size={16} />
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Global Progress Bar */}
        <div className="mt-5 space-y-2">
          <div className="flex items-baseline justify-between text-xs">
            <span className="font-semibold text-slate-700">
              Total gasto até o momento: <strong>{formatCurrency(monthMetrics.totalExpenses)}</strong>
            </span>
            <span
              className={`font-bold ${
                budgetUsagePercent > 100
                  ? 'text-rose-600'
                  : budgetUsagePercent > 80
                  ? 'text-amber-600'
                  : 'text-emerald-600'
              }`}
            >
              {budgetUsagePercent}% do teto
            </span>
          </div>
          <div className="w-full bg-slate-100 h-3.5 rounded-full overflow-hidden">
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
        </div>

        {/* Forecast Card: Previsão no final do mês */}
        {isCurrentMonth && (
          <div className="mt-6 p-4 rounded-xl bg-slate-50 border border-slate-200/60 grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div>
              <span className="text-slate-500 block">Ritmo Diário Atual:</span>
              <strong className="text-sm font-bold text-slate-900">
                {formatCurrency(monthMetrics.dailyExpenseBurn)} / dia
              </strong>
            </div>
            <div>
              <span className="text-slate-500 block">Dias restantes no mês:</span>
              <strong className="text-sm font-bold text-slate-900">{daysLeft} dias</strong>
            </div>
            <div>
              <span className="text-slate-500 block">Previsão de Saldo ao final:</span>
              <strong
                className={`text-sm font-bold ${
                  monthMetrics.projectedEndMonthBalance >= 0 ? 'text-emerald-600' : 'text-rose-600'
                }`}
              >
                {formatCurrency(monthMetrics.projectedEndMonthBalance)}
              </strong>
            </div>
          </div>
        )}
      </div>

      {/* 2. Category Limits Section */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <div className="flex items-center gap-2">
              <Target className="text-indigo-600" size={20} />
              <h2 className="text-lg font-bold text-slate-900">
                Limites por Categoria de Gasto
              </h2>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Estipule um teto mensal para cada categoria (Alimentação, Festa, Transporte, Moradia etc.)
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {expenseCategories.map((cat) => {
            const spent = monthMetrics.categoryTotals[cat.id]?.total || 0;
            const limit = cat.budgetLimit || 0;
            const hasLimit = limit > 0;
            const percent = hasLimit ? Math.round((spent / limit) * 100) : 0;
            const isOver = hasLimit && spent > limit;
            const isEditing = editingCatId === cat.id;

            return (
              <div
                key={cat.id}
                className={`p-4 rounded-2xl border transition-all ${
                  isOver
                    ? 'border-rose-300 bg-rose-50/30'
                    : 'border-slate-200/80 bg-slate-50/50 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2.5">
                    <CategoryIcon name={cat.icon} color={cat.color} size={15} />
                    <span className="text-sm font-bold text-slate-900">{cat.name}</span>
                  </div>

                  {isEditing ? (
                    <div className="flex items-center gap-1">
                      <input
                        type="number"
                        step="10"
                        value={tempCatLimit}
                        onChange={(e) => setTempCatLimit(e.target.value)}
                        placeholder="R$"
                        className="w-20 px-2 py-1 text-xs font-bold border border-emerald-500 rounded-lg focus:outline-none"
                        autoFocus
                      />
                      <button
                        onClick={() => handleSaveCatLimit(cat.id)}
                        className="text-xs font-bold text-emerald-600 px-1"
                      >
                        OK
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => {
                        setEditingCatId(cat.id);
                        setTempCatLimit(limit ? limit.toString() : '');
                      }}
                      className="text-xs text-slate-400 hover:text-slate-700 flex items-center gap-1 cursor-pointer"
                    >
                      <Edit3 size={13} />
                      <span>{hasLimit ? formatCurrency(limit) : 'Definir'}</span>
                    </button>
                  )}
                </div>

                <div className="space-y-1.5">
                  <div className="flex items-baseline justify-between text-xs">
                    <span className="text-slate-600">Gasto: <strong className="text-slate-900">{formatCurrency(spent)}</strong></span>
                    {hasLimit && (
                      <span className={`font-bold ${isOver ? 'text-rose-600' : 'text-slate-600'}`}>
                        {percent}%
                      </span>
                    )}
                  </div>

                  {hasLimit ? (
                    <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all ${
                          isOver ? 'bg-rose-500' : percent > 80 ? 'bg-amber-500' : 'bg-emerald-500'
                        }`}
                        style={{ width: `${Math.min(100, percent)}%` }}
                      ></div>
                    </div>
                  ) : (
                    <div className="text-[11px] text-slate-400 italic">Nenhum teto configurado</div>
                  )}

                  {hasLimit && (
                    <div className="text-[10px] text-slate-500 pt-1 flex justify-between">
                      <span>{isOver ? 'Excedeu em:' : 'Disponível:'}</span>
                      <strong className={isOver ? 'text-rose-600' : 'text-emerald-600'}>
                        {formatCurrency(Math.abs(limit - spent))}
                      </strong>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 3. Savings Goals Section (Metas de Economia) */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <div className="flex items-center gap-2">
              <TrendingUp className="text-teal-600" size={20} />
              <h2 className="text-lg font-bold text-slate-900">
                Metas de Economia
              </h2>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Acompanhe o progresso das suas conquistas (Reserva de Emergência, Viagens, Carro, etc.)
            </p>
          </div>

          <button
            onClick={() => setIsGoalModalOpen(true)}
            className="flex items-center gap-1.5 px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs sm:text-sm font-bold shadow-md shadow-teal-600/20 transition-all cursor-pointer"
          >
            <Plus size={16} />
            <span>Nova Meta</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {goals.map((goal) => {
            const percent = Math.min(100, Math.round((goal.currentAmount / goal.targetAmount) * 100));

            return (
              <div
                key={goal.id}
                className="p-5 rounded-2xl border border-slate-200/80 bg-slate-50/50 hover:bg-slate-50 transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <h4 className="font-bold text-sm text-slate-900">{goal.title}</h4>
                    <button
                      onClick={() => {
                        if (confirm(`Deseja remover a meta "${goal.title}"?`)) deleteGoal(goal.id);
                      }}
                      className="text-slate-400 hover:text-rose-600 p-1 rounded-md"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>

                  <div className="flex items-baseline gap-2 mb-3">
                    <span className="text-2xl font-extrabold text-slate-900">
                      {formatCurrency(goal.currentAmount)}
                    </span>
                    <span className="text-xs text-slate-500">
                      de {formatCurrency(goal.targetAmount)}
                    </span>
                  </div>

                  {/* Progress */}
                  <div className="space-y-1.5 mb-3">
                    <div className="flex justify-between text-xs font-semibold text-slate-600">
                      <span>Progresso</span>
                      <span className="text-teal-700 font-bold">{percent}%</span>
                    </div>
                    <div className="w-full bg-slate-200 h-2.5 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-teal-500 to-emerald-500 rounded-full transition-all duration-500"
                        style={{ width: `${percent}%` }}
                      ></div>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 text-[11px] text-slate-500">
                    <Calendar size={13} />
                    <span>Prazo: {goal.targetDate}</span>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-200/60 flex items-center justify-between">
                  <span className="text-xs text-slate-500">
                    Faltam {formatCurrency(Math.max(0, goal.targetAmount - goal.currentAmount))}
                  </span>
                  <button
                    onClick={() => {
                      setDepositGoalId(goal.id);
                      setDepositAmount('');
                    }}
                    className="px-3 py-1.5 text-xs font-bold text-teal-700 bg-teal-100/70 hover:bg-teal-200 rounded-xl transition-colors cursor-pointer"
                  >
                    + Aportar
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Modal: Nova Meta */}
      {isGoalModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white rounded-2xl p-6 shadow-2xl border border-slate-100">
            <h3 className="text-lg font-bold text-slate-900 mb-1">Criar Nova Meta</h3>
            <p className="text-xs text-slate-500 mb-4">Defina o que você quer conquistar e o valor alvo</p>
            <form onSubmit={handleCreateGoal} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Título da Meta</label>
                <input
                  type="text"
                  required
                  value={newGoalTitle}
                  onChange={(e) => setNewGoalTitle(e.target.value)}
                  placeholder="Ex: Reserva de Emergência, Viagem Disney"
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Valor Alvo (R$)</label>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={newGoalTarget}
                  onChange={(e) => setNewGoalTarget(e.target.value)}
                  placeholder="Ex: 5000"
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Data Estimada</label>
                <input
                  type="date"
                  value={newGoalDate}
                  onChange={(e) => setNewGoalDate(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsGoalModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-bold text-white bg-teal-600 hover:bg-teal-700 rounded-xl cursor-pointer"
                >
                  Salvar Meta
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Aportar na Meta */}
      {depositGoalId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="w-full max-w-sm bg-white rounded-2xl p-6 shadow-2xl border border-slate-100">
            <h3 className="text-lg font-bold text-slate-900 mb-1">Guardar Dinheiro na Meta</h3>
            <p className="text-xs text-slate-500 mb-4">Quanto você quer transferir para esta meta?</p>
            <form onSubmit={handleDepositToGoal} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Valor do Aporte (R$)</label>
                <input
                  type="number"
                  step="0.01"
                  required
                  autoFocus
                  value={depositAmount}
                  onChange={(e) => setDepositAmount(e.target.value)}
                  placeholder="Ex: 150.00"
                  className="w-full px-3 py-2 text-lg font-bold border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setDepositGoalId(null)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-bold text-white bg-teal-600 hover:bg-teal-700 rounded-xl cursor-pointer"
                >
                  Confirmar Aporte
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
