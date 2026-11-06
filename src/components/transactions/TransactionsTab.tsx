import React, { useState, useMemo } from 'react';
import {
  Search,
  Filter,
  PlusCircle,
  ArrowDownRight,
  ArrowUpRight,
  Trash2,
  Edit2,
  Calendar,
  CreditCard,
  Tag,
  ArrowUpDown,
  Download,
} from 'lucide-react';
import { useFinance } from '../../context/FinanceContext';
import { Transaction, TransactionType } from '../../types/finance';
import { formatCurrency, formatDate, formatMonthName } from '../../utils/formatters';
import { CategoryIcon } from '../common/CategoryIcon';

interface TransactionsTabProps {
  onOpenNewTransaction: () => void;
  onEditTransaction: (tx: Transaction) => void;
}

export const TransactionsTab: React.FC<TransactionsTabProps> = ({
  onOpenNewTransaction,
  onEditTransaction,
}) => {
  const { transactions, categories, selectedMonth, deleteTransaction } = useFinance();

  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<'all' | 'income' | 'expense' | 'fixed' | 'variable'>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'date-desc' | 'date-asc' | 'amount-desc' | 'amount-asc'>('date-desc');

  // Filter by selected month first
  const monthTransactions = useMemo(() => {
    return transactions.filter((t) => t.date.startsWith(selectedMonth));
  }, [transactions, selectedMonth]);

  // Apply filters and search
  const filteredTransactions = useMemo(() => {
    return monthTransactions
      .filter((t) => {
        // Search filter
        if (searchTerm.trim()) {
          const term = searchTerm.toLowerCase();
          const matchDesc = t.description.toLowerCase().includes(term);
          const matchNotes = t.notes?.toLowerCase().includes(term);
          const cat = categories.find((c) => c.id === t.categoryId);
          const matchCat = cat?.name.toLowerCase().includes(term);
          if (!matchDesc && !matchNotes && !matchCat) return false;
        }

        // Type / Nature filter
        if (typeFilter === 'income' && t.type !== 'income') return false;
        if (typeFilter === 'expense' && t.type !== 'expense') return false;
        if (typeFilter === 'fixed' && (t.type !== 'expense' || t.expenseNature !== 'fixed')) return false;
        if (typeFilter === 'variable' && (t.type !== 'expense' || t.expenseNature !== 'variable')) return false;

        // Category filter
        if (selectedCategory !== 'all' && t.categoryId !== selectedCategory) return false;

        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'date-desc') return b.date.localeCompare(a.date);
        if (sortBy === 'date-asc') return a.date.localeCompare(b.date);
        if (sortBy === 'amount-desc') return b.amount - a.amount;
        if (sortBy === 'amount-asc') return a.amount - b.amount;
        return 0;
      });
  }, [monthTransactions, searchTerm, typeFilter, selectedCategory, sortBy, categories]);

  // Calculated totals for filtered items
  const filteredTotals = useMemo(() => {
    const totalIncome = filteredTransactions
      .filter((t) => t.type === 'income')
      .reduce((acc, t) => acc + t.amount, 0);
    const totalExpense = filteredTransactions
      .filter((t) => t.type === 'expense')
      .reduce((acc, t) => acc + t.amount, 0);
    return {
      totalIncome,
      totalExpense,
      balance: totalIncome - totalExpense,
      count: filteredTransactions.length,
    };
  }, [filteredTransactions]);

  const handleDelete = (id: string, description: string) => {
    if (confirm(`Tem certeza que deseja excluir o lançamento "${description}"?`)) {
      deleteTransaction(id);
    }
  };

  const getPaymentMethodLabel = (method: string) => {
    switch (method) {
      case 'pix':
        return '⚡ PIX';
      case 'credit':
        return '💳 Cartão de Crédito';
      case 'debit':
        return '💳 Débito';
      case 'boleto':
        return '📄 Boleto';
      case 'cash':
        return '💵 Dinheiro';
      case 'transfer':
        return '🏦 Transf.';
      default:
        return method;
    }
  };

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      {/* Top Header Card */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">
            Histórico de Lançamentos
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Visualizando transações de <strong className="text-slate-700 capitalize">{formatMonthName(selectedMonth)}</strong>
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={onOpenNewTransaction}
            className="flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm font-bold shadow-md shadow-emerald-600/20 transition-all cursor-pointer"
          >
            <PlusCircle size={16} />
            <span>Novo Lançamento</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs space-y-3">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
          {/* Search Input */}
          <div className="md:col-span-5 relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar por descrição, nota ou categoria..."
              className="w-full pl-10 pr-4 py-2 text-xs sm:text-sm text-slate-800 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          {/* Category Dropdown */}
          <div className="md:col-span-4">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full px-3 py-2 text-xs sm:text-sm text-slate-800 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <option value="all">Todas as Categorias</option>
              <optgroup label="Despesas">
                {categories
                  .filter((c) => c.type === 'expense')
                  .map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
              </optgroup>
              <optgroup label="Receitas">
                {categories
                  .filter((c) => c.type === 'income')
                  .map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
              </optgroup>
            </select>
          </div>

          {/* Sort Dropdown */}
          <div className="md:col-span-3">
            <div className="relative">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="w-full px-3 py-2 text-xs sm:text-sm text-slate-800 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <option value="date-desc">Mais Recentes Primeiro</option>
                <option value="date-asc">Mais Antigas Primeiro</option>
                <option value="amount-desc">Maior Valor</option>
                <option value="amount-asc">Menor Valor</option>
              </select>
            </div>
          </div>
        </div>

        {/* Quick Type Tabs (All, Receitas, Despesas, Fixos, Variáveis) */}
        <div className="flex items-center gap-1.5 overflow-x-auto pt-2 border-t border-slate-100 no-scrollbar">
          <button
            onClick={() => setTypeFilter('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all ${
              typeFilter === 'all'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Todos ({monthTransactions.length})
          </button>
          <button
            onClick={() => setTypeFilter('expense')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all ${
              typeFilter === 'expense'
                ? 'bg-rose-600 text-white shadow-xs'
                : 'bg-rose-50 text-rose-700 hover:bg-rose-100'
            }`}
          >
            <ArrowDownRight size={14} />
            Despesas
          </button>
          <button
            onClick={() => setTypeFilter('income')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all ${
              typeFilter === 'income'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
            }`}
          >
            <ArrowUpRight size={14} />
            Receitas
          </button>
          <button
            onClick={() => setTypeFilter('fixed')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all ${
              typeFilter === 'fixed'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'bg-indigo-50 text-indigo-700 hover:bg-indigo-100'
            }`}
          >
            📌 Gastos Fixos
          </button>
          <button
            onClick={() => setTypeFilter('variable')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all ${
              typeFilter === 'variable'
                ? 'bg-amber-600 text-white shadow-xs'
                : 'bg-amber-50 text-amber-700 hover:bg-amber-100'
            }`}
          >
            ⚡ Gastos Variáveis
          </button>
        </div>
      </div>

      {/* Filter Summary Stats Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 bg-slate-100 rounded-xl text-xs text-slate-600 font-medium">
        <div>
          Mostrando <strong>{filteredTotals.count}</strong> lançamento(s) filtrado(s)
        </div>
        <div className="flex items-center gap-4">
          <span>
            Entradas: <strong className="text-emerald-700 font-bold">{formatCurrency(filteredTotals.totalIncome)}</strong>
          </span>
          <span>
            Saídas: <strong className="text-rose-700 font-bold">{formatCurrency(filteredTotals.totalExpense)}</strong>
          </span>
          <span>
            Saldo Filtrado: <strong className={filteredTotals.balance >= 0 ? 'text-slate-900 font-bold' : 'text-rose-700 font-bold'}>{formatCurrency(filteredTotals.balance)}</strong>
          </span>
        </div>
      </div>

      {/* Transactions Table / List */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        {filteredTransactions.length === 0 ? (
          <div className="py-16 text-center text-slate-400">
            <Tag className="mx-auto mb-2 text-slate-300" size={32} />
            <p className="text-sm font-semibold text-slate-700">Nenhum lançamento encontrado</p>
            <p className="text-xs text-slate-500 mt-1">
              Tente alterar os filtros ou adicione uma nova transação.
            </p>
            <button
              onClick={onOpenNewTransaction}
              className="mt-4 px-4 py-2 bg-emerald-600 text-white text-xs font-bold rounded-xl hover:bg-emerald-700 transition-colors cursor-pointer"
            >
              + Adicionar Lançamento
            </button>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {filteredTransactions.map((tx) => {
              const cat = categories.find((c) => c.id === tx.categoryId);
              const isIncome = tx.type === 'income';

              return (
                <div
                  key={tx.id}
                  className="p-4 sm:px-6 hover:bg-slate-50/70 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3 group"
                >
                  {/* Left: Icon & Description & Tags */}
                  <div className="flex items-center gap-3">
                    <CategoryIcon
                      name={cat?.icon || 'Tag'}
                      color={cat?.color || '#3b82f6'}
                      size={18}
                    />
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-sm font-bold text-slate-900">
                          {tx.description}
                        </span>
                        {/* Fixed or Variable badge */}
                        {!isIncome && tx.expenseNature && (
                          <span
                            className={`text-[10px] font-bold px-1.5 py-0.2 rounded-md ${
                              tx.expenseNature === 'fixed'
                                ? 'bg-indigo-50 text-indigo-700 border border-indigo-200/50'
                                : 'bg-amber-50 text-amber-700 border border-amber-200/50'
                            }`}
                          >
                            {tx.expenseNature === 'fixed' ? 'Fixo' : 'Variável'}
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-2 sm:gap-3 text-xs text-slate-500 mt-0.5 flex-wrap">
                        <span className="font-medium text-slate-700">{cat?.name || 'Geral'}</span>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <Calendar size={12} />
                          {formatDate(tx.date)}
                        </span>
                        <span>•</span>
                        <span>{getPaymentMethodLabel(tx.paymentMethod)}</span>
                        {tx.notes && (
                          <>
                            <span>•</span>
                            <span className="italic text-slate-400 max-w-[200px] truncate" title={tx.notes}>
                              "{tx.notes}"
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Right: Amount & Actions */}
                  <div className="flex items-center justify-between sm:justify-end gap-4 pl-12 sm:pl-0">
                    <span
                      className={`text-base font-extrabold tracking-tight ${
                        isIncome ? 'text-emerald-600' : 'text-slate-900'
                      }`}
                    >
                      {isIncome ? '+' : '-'}&nbsp;{formatCurrency(tx.amount)}
                    </span>

                    {/* Action buttons */}
                    <div className="flex items-center gap-1 opacity-90 sm:opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => onEditTransaction(tx)}
                        className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-200/70 rounded-lg transition-colors cursor-pointer"
                        title="Editar lançamento"
                      >
                        <Edit2 size={15} />
                      </button>
                      <button
                        onClick={() => handleDelete(tx.id, tx.description)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                        title="Excluir lançamento"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
