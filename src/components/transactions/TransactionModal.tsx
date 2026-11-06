import React, { useState, useEffect } from 'react';
import { X, ArrowDownRight, ArrowUpRight, Calendar, Tag, CreditCard as CardIcon, FileText } from 'lucide-react';
import { useFinance } from '../../context/FinanceContext';
import { Transaction, TransactionType, ExpenseNature, PaymentMethod } from '../../types/finance';
import { CategoryIcon } from '../common/CategoryIcon';

interface TransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  editingTransaction?: Transaction | null;
}

export const TransactionModal: React.FC<TransactionModalProps> = ({
  isOpen,
  onClose,
  editingTransaction,
}) => {
  const { categories, addTransaction, updateTransaction, selectedMonth } = useFinance();

  const [type, setType] = useState<TransactionType>('expense');
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [date, setDate] = useState('');
  const [expenseNature, setExpenseNature] = useState<ExpenseNature>('variable');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('pix');
  const [notes, setNotes] = useState('');

  // Sync when editing or opening
  useEffect(() => {
    if (editingTransaction) {
      setType(editingTransaction.type);
      setDescription(editingTransaction.description);
      setAmount(editingTransaction.amount.toString());
      setCategoryId(editingTransaction.categoryId);
      setDate(editingTransaction.date);
      setExpenseNature(editingTransaction.expenseNature || 'variable');
      setPaymentMethod(editingTransaction.paymentMethod || 'pix');
      setNotes(editingTransaction.notes || '');
    } else {
      setType('expense');
      setDescription('');
      setAmount('');
      const today = new Date().toISOString().split('T')[0];
      // Default to today if in selected month, or first day of selected month
      setDate(today.startsWith(selectedMonth) ? today : `${selectedMonth}-01`);
      setExpenseNature('variable');
      setPaymentMethod('pix');
      setNotes('');
      // Set first matching category
      const firstCat = categories.find((c) => c.type === 'expense');
      if (firstCat) setCategoryId(firstCat.id);
    }
  }, [editingTransaction, isOpen, selectedMonth, categories]);

  // Adjust category when type changes
  useEffect(() => {
    const currentCat = categories.find((c) => c.id === categoryId);
    if (!currentCat || currentCat.type !== type) {
      const match = categories.find((c) => c.type === type);
      if (match) setCategoryId(match.id);
    }
  }, [type, categories, categoryId]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const parsedAmount = parseFloat(amount.replace(',', '.'));
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      alert('Por favor, informe um valor válido maior que zero.');
      return;
    }
    if (!description.trim()) {
      alert('Por favor, insira uma descrição.');
      return;
    }

    if (editingTransaction) {
      updateTransaction(editingTransaction.id, {
        description: description.trim(),
        amount: parsedAmount,
        type,
        categoryId,
        date,
        expenseNature: type === 'expense' ? expenseNature : undefined,
        paymentMethod,
        notes: notes.trim() || undefined,
      });
    } else {
      addTransaction({
        description: description.trim(),
        amount: parsedAmount,
        type,
        categoryId,
        date,
        expenseNature: type === 'expense' ? expenseNature : undefined,
        paymentMethod,
        notes: notes.trim() || undefined,
      });
    }

    onClose();
  };

  const filteredCategories = categories.filter((c) => c.type === type);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs transition-opacity animate-fade-in">
      <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50">
          <div>
            <h3 className="text-lg font-bold text-slate-900">
              {editingTransaction ? 'Editar Lançamento' : 'Novo Lançamento'}
            </h3>
            <p className="text-xs text-slate-500">
              Registre suas entradas ou saídas para manter o controle total
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto">
          {/* Type Toggle: Receita vs Despesa */}
          <div className="grid grid-cols-2 gap-2 p-1 bg-slate-100 rounded-xl">
            <button
              type="button"
              onClick={() => setType('expense')}
              className={`flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-semibold transition-all ${
                type === 'expense'
                  ? 'bg-rose-600 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <ArrowDownRight size={18} />
              Despesa
            </button>
            <button
              type="button"
              onClick={() => setType('income')}
              className={`flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-semibold transition-all ${
                type === 'income'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <ArrowUpRight size={18} />
              Receita
            </button>
          </div>

          {/* Valor */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1">
              Valor (R$) *
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-semibold text-lg">
                R$
              </span>
              <input
                type="number"
                step="0.01"
                min="0.01"
                required
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0,00"
                className="w-full pl-12 pr-4 py-3 text-2xl font-bold text-slate-900 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
              />
            </div>
          </div>

          {/* Descrição */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1">
              Descrição *
            </label>
            <input
              type="text"
              required
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Ex: Supermercado do mês, Chopp com amigos, Salário"
              className="w-full px-4 py-2.5 text-sm font-medium text-slate-900 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
            />
          </div>

          {/* Categoria */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1">
              Categoria *
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-44 overflow-y-auto p-1 border border-slate-200 rounded-xl bg-slate-50/50">
              {filteredCategories.map((cat) => {
                const isSelected = categoryId === cat.id;
                return (
                  <button
                    type="button"
                    key={cat.id}
                    onClick={() => setCategoryId(cat.id)}
                    className={`flex items-center gap-2 p-2 rounded-lg text-left text-xs font-medium transition-all ${
                      isSelected
                        ? 'bg-emerald-50 border-2 border-emerald-500 text-emerald-900 font-bold shadow-xs'
                        : 'bg-white border border-slate-200 text-slate-700 hover:border-slate-300'
                    }`}
                  >
                    <CategoryIcon name={cat.icon} color={cat.color} size={14} />
                    <span className="truncate">{cat.name}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Natureza da Despesa (Fixa vs Variável) */}
          {type === 'expense' && (
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1">
                Tipo de Gasto (Natureza)
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setExpenseNature('fixed')}
                  className={`px-3 py-2 rounded-xl text-xs font-semibold border transition-all text-left ${
                    expenseNature === 'fixed'
                      ? 'border-indigo-500 bg-indigo-50 text-indigo-900 font-bold ring-1 ring-indigo-500'
                      : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <span className="block">📌 Gasto Fixo</span>
                  <span className="block text-[10px] text-slate-400 font-normal">
                    Aluguel, contas, internet, mensalidades
                  </span>
                </button>
                <button
                  type="button"
                  onClick={() => setExpenseNature('variable')}
                  className={`px-3 py-2 rounded-xl text-xs font-semibold border transition-all text-left ${
                    expenseNature === 'variable'
                      ? 'border-amber-500 bg-amber-50 text-amber-900 font-bold ring-1 ring-amber-500'
                      : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <span className="block">⚡ Gasto Variável</span>
                  <span className="block text-[10px] text-slate-400 font-normal">
                    Festa, lazer, delivery, compras, uber
                  </span>
                </button>
              </div>
            </div>
          )}

          {/* Data e Forma de Pagamento */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-semibold uppercase tracking-wider text-slate-600">
                  Data *
                </label>
                <button
                  type="button"
                  onClick={() => setDate(new Date().toISOString().split('T')[0])}
                  className="text-[11px] text-emerald-600 hover:text-emerald-700 font-medium"
                >
                  Hoje
                </button>
              </div>
              <div className="relative">
                <input
                  type="date"
                  required
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full px-3 py-2 text-sm text-slate-800 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1">
                Forma de Pagamento
              </label>
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
                className="w-full px-3 py-2 text-sm text-slate-800 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <option value="pix">⚡ PIX</option>
                <option value="credit">💳 Cartão de Crédito</option>
                <option value="debit">💳 Cartão de Débito</option>
                <option value="boleto">📄 Boleto Bancário</option>
                <option value="cash">💵 Dinheiro / Espécie</option>
                <option value="transfer">🏦 Transferência Bancária</option>
              </select>
            </div>
          </div>

          {/* Anotações Opcionais */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1">
              Observações (Opcional)
            </label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Ex: Dividido em 2x com o Carlos"
              className="w-full px-3 py-2 text-xs text-slate-800 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          {/* Footer Actions */}
          <div className="pt-2 flex items-center justify-end gap-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-semibold text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-6 py-2 text-sm font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-md shadow-emerald-600/20 transition-all cursor-pointer"
            >
              {editingTransaction ? 'Atualizar' : 'Salvar Lançamento'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
