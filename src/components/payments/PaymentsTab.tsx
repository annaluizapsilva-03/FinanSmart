import React, { useState, useMemo } from 'react';
import {
  CreditCard as CardIcon,
  Plus,
  AlertCircle,
  Calendar,
  CheckCircle2,
  Clock,
  Trash2,
  Receipt,
  FileText,
  DollarSign,
  AlertTriangle,
} from 'lucide-react';
import { useFinance } from '../../context/FinanceContext';
import { CreditCard, Bill } from '../../types/finance';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { CategoryIcon } from '../common/CategoryIcon';

export const PaymentsTab: React.FC = () => {
  const {
    cards,
    addCreditCard,
    deleteCreditCard,
    bills,
    addBill,
    markBillAsPaid,
    deleteBill,
    categories,
    addTransaction,
  } = useFinance();

  // Modals state
  const [isCardModalOpen, setIsCardModalOpen] = useState(false);
  const [isBillModalOpen, setIsBillModalOpen] = useState(false);

  // New Card Form
  const [cardName, setCardName] = useState('');
  const [cardLimit, setCardLimit] = useState('');
  const [cardClosingDay, setCardClosingDay] = useState('15');
  const [cardDueDay, setCardDueDay] = useState('22');
  const [cardBrand, setCardBrand] = useState<CreditCard['brand']>('mastercard');
  const [cardColor, setCardColor] = useState('#8b5cf6');

  // New Bill Form
  const [billTitle, setBillTitle] = useState('');
  const [billAmount, setBillAmount] = useState('');
  const [billDueDate, setBillDueDate] = useState('');
  const [billCategoryId, setBillCategoryId] = useState('');
  const [billIsRecurring, setBillIsRecurring] = useState(true);

  // Filter bills
  const [billFilter, setBillFilter] = useState<'all' | 'pending' | 'paid' | 'overdue'>('all');

  // Check today's date for overdue calculation
  const todayStr = new Date().toISOString().split('T')[0];

  // Processed bills with dynamic overdue status
  const processedBills = useMemo(() => {
    return bills.map((b) => {
      let status = b.status;
      if (status !== 'paid' && b.dueDate < todayStr) {
        status = 'overdue';
      }
      return {
        ...b,
        status,
      };
    });
  }, [bills, todayStr]);

  const filteredBills = useMemo(() => {
    return processedBills.filter((b) => {
      if (billFilter === 'all') return true;
      return b.status === billFilter;
    });
  }, [processedBills, billFilter]);

  // Totals
  const pendingTotal = processedBills
    .filter((b) => b.status === 'pending' || b.status === 'overdue')
    .reduce((acc, b) => acc + b.amount, 0);

  const overdueCount = processedBills.filter((b) => b.status === 'overdue').length;

  const totalCardBills = cards.reduce((acc, c) => acc + c.currentBill, 0);
  const totalCardLimits = cards.reduce((acc, c) => acc + c.limit, 0);

  const handleCreateCard = (e: React.FormEvent) => {
    e.preventDefault();
    const limit = parseFloat(cardLimit.replace(',', '.'));
    if (!cardName.trim() || isNaN(limit) || limit <= 0) {
      alert('Preencha os dados do cartão corretamente.');
      return;
    }
    addCreditCard({
      name: cardName.trim(),
      brand: cardBrand,
      limit,
      closingDay: parseInt(cardClosingDay, 10) || 1,
      dueDay: parseInt(cardDueDay, 10) || 10,
      color: cardColor,
    });
    setCardName('');
    setCardLimit('');
    setIsCardModalOpen(false);
  };

  const handleCreateBill = (e: React.FormEvent) => {
    e.preventDefault();
    const amount = parseFloat(billAmount.replace(',', '.'));
    if (!billTitle.trim() || isNaN(amount) || amount <= 0 || !billDueDate) {
      alert('Preencha todos os campos da conta.');
      return;
    }
    addBill({
      title: billTitle.trim(),
      amount,
      dueDate: billDueDate,
      categoryId: billCategoryId || categories[0]?.id || 'cat-moradia',
      isRecurring: billIsRecurring,
    });
    setBillTitle('');
    setBillAmount('');
    setBillDueDate('');
    setIsBillModalOpen(false);
  };

  const handlePayBill = (bill: Bill) => {
    if (confirm(`Confirmar o pagamento da conta "${bill.title}" no valor de ${formatCurrency(bill.amount)}?`)) {
      markBillAsPaid(bill.id);

      // Also optionally register as an expense in transactions if user confirms
      if (confirm('Deseja lançar este pagamento automaticamente no histórico de despesas?')) {
        addTransaction({
          description: `Pagamento: ${bill.title}`,
          amount: bill.amount,
          type: 'expense',
          categoryId: bill.categoryId,
          date: todayStr,
          expenseNature: 'fixed',
          paymentMethod: 'boleto',
        });
      }
    }
  };

  return (
    <div className="space-y-8 animate-fade-in pb-12">
      {/* 1. Credit Cards Section */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <div className="flex items-center gap-2">
              <CardIcon className="text-indigo-600" size={20} />
              <h2 className="text-lg font-bold text-slate-900">
                Cartões de Crédito & Faturas
              </h2>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Controle limites, dias de fechamento e faturas acumuladas para evitar surpresas.
            </p>
          </div>

          <button
            onClick={() => setIsCardModalOpen(true)}
            className="flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs sm:text-sm font-bold shadow-md shadow-indigo-600/20 transition-all cursor-pointer"
          >
            <Plus size={16} />
            <span>Cadastrar Cartão</span>
          </button>
        </div>

        {/* Cards Summary Banner */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between">
            <div>
              <span className="text-xs text-slate-500 block">Total de Faturas Atuais</span>
              <span className="text-xl font-extrabold text-slate-900">
                {formatCurrency(totalCardBills)}
              </span>
            </div>
            <div className="text-right">
              <span className="text-xs text-slate-500 block">Limite Total Combinado</span>
              <span className="text-sm font-bold text-slate-700">
                {formatCurrency(totalCardLimits)}
              </span>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between">
            <div>
              <span className="text-xs text-slate-500 block">Comprometimento de Limite</span>
              <span className="text-xl font-extrabold text-indigo-700">
                {totalCardLimits > 0 ? Math.round((totalCardBills / totalCardLimits) * 100) : 0}%
              </span>
            </div>
            <div className="text-right text-xs text-slate-500">
              Limite Livre Total:{' '}
              <strong className="text-emerald-600 block text-sm">
                {formatCurrency(Math.max(0, totalCardLimits - totalCardBills))}
              </strong>
            </div>
          </div>
        </div>

        {/* Visual Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {cards.map((card) => {
            const usagePercent = Math.min(100, Math.round((card.currentBill / card.limit) * 100));

            return (
              <div
                key={card.id}
                className="relative rounded-2xl p-6 text-white shadow-lg overflow-hidden flex flex-col justify-between h-56 transition-all hover:scale-[1.01]"
                style={{
                  background: `linear-gradient(135deg, ${card.color} 0%, #1e1b4b 100%)`,
                }}
              >
                {/* Chip & Brand */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-9 h-7 rounded-md bg-amber-300/80 border border-amber-200/50 shadow-inner flex items-center justify-center">
                      <div className="w-5 h-3 border border-amber-600/40 rounded-xs"></div>
                    </div>
                    <span className="text-xs font-mono tracking-widest text-white/70">CONTACTLESS</span>
                  </div>
                  <button
                    onClick={() => {
                      if (confirm(`Remover cartão ${card.name}?`)) deleteCreditCard(card.id);
                    }}
                    className="p-1 rounded-lg text-white/60 hover:text-white hover:bg-white/10"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>

                {/* Card Name */}
                <div>
                  <h4 className="text-lg font-extrabold tracking-wide">{card.name}</h4>
                  <p className="text-[11px] text-white/70 uppercase">
                    Fechamento dia {card.closingDay} • Vencimento dia {card.dueDay}
                  </p>
                </div>

                {/* Invoice and Limit Progress */}
                <div>
                  <div className="flex justify-between items-baseline text-xs mb-1">
                    <span className="text-white/80">Fatura Atual</span>
                    <span className="font-extrabold text-base">
                      {formatCurrency(card.currentBill)}
                    </span>
                  </div>

                  <div className="w-full bg-white/20 h-2 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${
                        usagePercent > 80 ? 'bg-rose-400' : 'bg-emerald-400'
                      }`}
                      style={{ width: `${usagePercent}%` }}
                    ></div>
                  </div>

                  <div className="flex justify-between text-[10px] text-white/70 mt-1">
                    <span>{usagePercent}% usado</span>
                    <span>Limite: {formatCurrency(card.limit)}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 2. Bills to Pay Section (Contas a Pagar & Boletos) */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <div className="flex items-center gap-2">
              <Receipt className="text-rose-600" size={20} />
              <h2 className="text-lg font-bold text-slate-900">
                Contas a Pagar & Boletos
              </h2>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Organize aluguel, condomínio, luz, internet e nunca mais pague juros por atraso.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsBillModalOpen(true)}
              className="flex items-center gap-1.5 px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs sm:text-sm font-bold shadow-md shadow-rose-600/20 transition-all cursor-pointer"
            >
              <Plus size={16} />
              <span>Nova Conta</span>
            </button>
          </div>
        </div>

        {/* Overdue alert banner if any */}
        {overdueCount > 0 && (
          <div className="mb-6 p-4 rounded-xl bg-rose-50 border border-rose-200 flex items-center justify-between gap-3 text-rose-800 text-xs sm:text-sm font-medium">
            <div className="flex items-center gap-2.5">
              <AlertTriangle className="text-rose-600 shrink-0" size={20} />
              <span>
                Atenção: Você possui <strong>{overdueCount} conta(s) em atraso!</strong> Pague o quanto antes para evitar juros e multas.
              </span>
            </div>
          </div>
        )}

        {/* Filter buttons */}
        <div className="flex items-center gap-2 mb-4 overflow-x-auto no-scrollbar">
          <button
            onClick={() => setBillFilter('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              billFilter === 'all'
                ? 'bg-slate-900 text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Todas ({bills.length})
          </button>
          <button
            onClick={() => setBillFilter('pending')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              billFilter === 'pending'
                ? 'bg-amber-600 text-white'
                : 'bg-amber-50 text-amber-700 hover:bg-amber-100'
            }`}
          >
            Pendentes ({processedBills.filter((b) => b.status === 'pending').length})
          </button>
          <button
            onClick={() => setBillFilter('overdue')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              billFilter === 'overdue'
                ? 'bg-rose-600 text-white'
                : 'bg-rose-50 text-rose-700 hover:bg-rose-100'
            }`}
          >
            Atrasadas ({overdueCount})
          </button>
          <button
            onClick={() => setBillFilter('paid')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              billFilter === 'paid'
                ? 'bg-emerald-600 text-white'
                : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
            }`}
          >
            Pagas ({processedBills.filter((b) => b.status === 'paid').length})
          </button>
        </div>

        {/* Bills List */}
        <div className="divide-y divide-slate-100 border border-slate-200/80 rounded-2xl overflow-hidden">
          {filteredBills.length === 0 ? (
            <div className="py-12 text-center text-slate-400 text-xs">
              Nenhuma conta para este filtro.
            </div>
          ) : (
            filteredBills.map((bill) => {
              const cat = categories.find((c) => c.id === bill.categoryId);
              const isOverdue = bill.status === 'overdue';
              const isPaid = bill.status === 'paid';

              return (
                <div
                  key={bill.id}
                  className="p-4 hover:bg-slate-50 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  <div className="flex items-center gap-3">
                    <CategoryIcon
                      name={cat?.icon || 'Receipt'}
                      color={isPaid ? '#10b981' : isOverdue ? '#ef4444' : '#f59e0b'}
                      size={18}
                    />
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-slate-900">{bill.title}</span>
                        {isPaid && (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800">
                            Pago
                          </span>
                        )}
                        {isOverdue && (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-rose-100 text-rose-800 animate-pulse">
                            Atrasado!
                          </span>
                        )}
                        {!isPaid && !isOverdue && (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-amber-100 text-amber-800">
                            A Vencer
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-3 text-xs text-slate-500 mt-0.5">
                        <span className="flex items-center gap-1">
                          <Calendar size={13} />
                          Vencimento: {formatDate(bill.dueDate)}
                        </span>
                        {bill.isRecurring && <span>• Recorrente todo mês</span>}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-3 pl-12 sm:pl-0">
                    <span className="text-base font-extrabold text-slate-900">
                      {formatCurrency(bill.amount)}
                    </span>

                    <div className="flex items-center gap-2">
                      {!isPaid && (
                        <button
                          onClick={() => handlePayBill(bill)}
                          className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-xs transition-colors cursor-pointer"
                        >
                          Marcar Pago
                        </button>
                      )}
                      <button
                        onClick={() => {
                          if (confirm(`Excluir conta "${bill.title}"?`)) deleteBill(bill.id);
                        }}
                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Modal: Novo Cartão */}
      {isCardModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white rounded-2xl p-6 shadow-2xl border border-slate-100">
            <h3 className="text-lg font-bold text-slate-900 mb-1">Cadastrar Cartão de Crédito</h3>
            <p className="text-xs text-slate-500 mb-4">Adicione seus dados para acompanhar o limite</p>
            <form onSubmit={handleCreateCard} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Nome do Cartão</label>
                <input
                  type="text"
                  required
                  value={cardName}
                  onChange={(e) => setCardName(e.target.value)}
                  placeholder="Ex: Nubank, C6 Carbon, Itaú Click"
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Limite Total (R$)</label>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={cardLimit}
                  onChange={(e) => setCardLimit(e.target.value)}
                  placeholder="Ex: 5000"
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Dia Fechamento</label>
                  <input
                    type="number"
                    min="1"
                    max="31"
                    value={cardClosingDay}
                    onChange={(e) => setCardClosingDay(e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Dia Vencimento</label>
                  <input
                    type="number"
                    min="1"
                    max="31"
                    value={cardDueDay}
                    onChange={(e) => setCardDueDay(e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Cor do Cartão</label>
                <div className="flex gap-2">
                  {['#8b5cf6', '#f97316', '#06b6d4', '#10b981', '#3b82f6', '#0f172a'].map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setCardColor(c)}
                      className={`w-7 h-7 rounded-full border-2 transition-all ${
                        cardColor === c ? 'border-indigo-600 scale-110 shadow-sm' : 'border-transparent'
                      }`}
                      style={{ backgroundColor: c }}
                    />
                  ))}
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsCardModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl cursor-pointer"
                >
                  Salvar Cartão
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Nova Conta a Pagar */}
      {isBillModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white rounded-2xl p-6 shadow-2xl border border-slate-100">
            <h3 className="text-lg font-bold text-slate-900 mb-1">Cadastrar Conta a Pagar</h3>
            <p className="text-xs text-slate-500 mb-4">Adicione boletos ou contas recorrentes para lembretes</p>
            <form onSubmit={handleCreateBill} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Título da Conta</label>
                <input
                  type="text"
                  required
                  value={billTitle}
                  onChange={(e) => setBillTitle(e.target.value)}
                  placeholder="Ex: Aluguel Imobiliária, Energia Elétrica Enel"
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-rose-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Valor (R$)</label>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={billAmount}
                  onChange={(e) => setBillAmount(e.target.value)}
                  placeholder="Ex: 1250.00"
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-rose-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Data de Vencimento</label>
                <input
                  type="date"
                  required
                  value={billDueDate}
                  onChange={(e) => setBillDueDate(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-rose-500"
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="recurring"
                  checked={billIsRecurring}
                  onChange={(e) => setBillIsRecurring(e.target.checked)}
                  className="rounded text-rose-600 focus:ring-rose-500"
                />
                <label htmlFor="recurring" className="text-xs text-slate-700 font-medium">
                  Conta fixa recorrente (repete todos os meses)
                </label>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsBillModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-xl cursor-pointer"
                >
                  Salvar Conta
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
