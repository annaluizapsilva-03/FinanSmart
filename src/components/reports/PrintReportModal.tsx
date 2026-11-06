import React from 'react';
import { X, Printer, Download, ShieldCheck, Wallet, ArrowDownRight, ArrowUpRight } from 'lucide-react';
import { useFinance } from '../../context/FinanceContext';
import { formatCurrency, formatDate, formatMonthName } from '../../utils/formatters';

interface PrintReportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PrintReportModal: React.FC<PrintReportModalProps> = ({ isOpen, onClose }) => {
  const {
    selectedMonth,
    monthMetrics,
    transactions,
    categories,
    budgetRuleBreakdown,
    healthScore,
    goals,
  } = useFinance();

  if (!isOpen) return null;

  const monthTransactions = transactions.filter((t) => t.date.startsWith(selectedMonth));

  const sortedCategories = Object.entries(monthMetrics.categoryTotals)
    .filter(([id, data]) => {
      const cat = categories.find((c) => c.id === id);
      return cat?.type === 'expense' && data.total > 0;
    })
    .sort((a, b) => b[1].total - a[1].total);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-3xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden my-8">
        {/* Modal Top Bar (hidden during print) */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50 no-print">
          <div>
            <h3 className="text-base font-bold text-slate-900">
              Relatório Financeiro Executivo
            </h3>
            <p className="text-xs text-slate-500">
              Pronto para impressão ou para salvar como arquivo PDF
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer"
            >
              <Printer size={15} />
              <span>Imprimir / Salvar em PDF</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-200 rounded-lg"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Printable Document Body */}
        <div className="p-8 space-y-6 text-slate-900 bg-white">
          {/* Header */}
          <div className="flex items-center justify-between border-b pb-4 border-slate-200">
            <div>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-emerald-600 text-white flex items-center justify-center font-bold text-sm">
                  FS
                </div>
                <h1 className="text-xl font-extrabold tracking-tight">FinanSmart</h1>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                Relatório de Fechamento Contábil & Gestão Financeira
              </p>
            </div>
            <div className="text-right">
              <span className="text-sm font-bold capitalize text-slate-800 block">
                {formatMonthName(selectedMonth)}
              </span>
              <span className="text-[11px] text-slate-400">
                Emitido em {new Date().toLocaleDateString('pt-BR')}
              </span>
            </div>
          </div>

          {/* Metric Overview Box */}
          <div className="grid grid-cols-4 gap-3 text-center">
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
              <span className="text-[11px] font-semibold text-slate-500 block">Receitas Totais</span>
              <span className="text-base font-bold text-emerald-600">
                {formatCurrency(monthMetrics.totalIncome)}
              </span>
            </div>
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
              <span className="text-[11px] font-semibold text-slate-500 block">Despesas Totais</span>
              <span className="text-base font-bold text-rose-600">
                {formatCurrency(monthMetrics.totalExpenses)}
              </span>
            </div>
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
              <span className="text-[11px] font-semibold text-slate-500 block">Saldo Líquido</span>
              <span className={`text-base font-bold ${monthMetrics.balance >= 0 ? 'text-slate-900' : 'text-rose-600'}`}>
                {formatCurrency(monthMetrics.balance)}
              </span>
            </div>
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
              <span className="text-[11px] font-semibold text-slate-500 block">Taxa de Poupança</span>
              <span className="text-base font-bold text-teal-600">
                {monthMetrics.savingsRate.toFixed(1)}%
              </span>
            </div>
          </div>

          {/* Distribution by Category */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-600 mb-2">
              1. Distribuição de Gastos por Categoria
            </h3>
            <table className="w-full text-xs text-left border border-slate-200 rounded-lg overflow-hidden">
              <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                <tr>
                  <th className="p-2.5">Categoria</th>
                  <th className="p-2.5 text-center">Transações</th>
                  <th className="p-2.5 text-right">Total Gasto</th>
                  <th className="p-2.5 text-right">% do Orçamento</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {sortedCategories.map(([id, data]) => {
                  const percent = monthMetrics.totalExpenses > 0
                    ? Math.round((data.total / monthMetrics.totalExpenses) * 100)
                    : 0;

                  return (
                    <tr key={id}>
                      <td className="p-2.5 font-medium">{data.name}</td>
                      <td className="p-2.5 text-center text-slate-500">{data.count}</td>
                      <td className="p-2.5 text-right font-bold">{formatCurrency(data.total)}</td>
                      <td className="p-2.5 text-right text-slate-600">{percent}%</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* 50/30/20 Rule Analysis */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-600 mb-2">
              2. Equilíbrio da Regra 50 / 30 / 20
            </h3>
            <div className="grid grid-cols-3 gap-3 text-xs">
              <div>
                <span className="text-slate-500 block">Necessidades (Fixos):</span>
                <strong className="text-slate-900">
                  {budgetRuleBreakdown.essentials.percent}% ({formatCurrency(budgetRuleBreakdown.essentials.spent)})
                </strong>
                <span className="text-[10px] text-slate-400 block">Ideal: até 50%</span>
              </div>
              <div>
                <span className="text-slate-500 block">Lazer & Festas (Variáveis):</span>
                <strong className="text-slate-900">
                  {budgetRuleBreakdown.lifestyle.percent}% ({formatCurrency(budgetRuleBreakdown.lifestyle.spent)})
                </strong>
                <span className="text-[10px] text-slate-400 block">Ideal: até 30%</span>
              </div>
              <div>
                <span className="text-slate-500 block">Poupança & Investimentos:</span>
                <strong className="text-emerald-700">
                  {budgetRuleBreakdown.savingsOrInvest.percent}% ({formatCurrency(budgetRuleBreakdown.savingsOrInvest.spent)})
                </strong>
                <span className="text-[10px] text-slate-400 block">Ideal: no mínimo 20%</span>
              </div>
            </div>
          </div>

          {/* Extrato Recente */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-600 mb-2">
              3. Extrato dos Principais Lançamentos do Mês
            </h3>
            <div className="border border-slate-200 rounded-lg overflow-hidden text-xs">
              <table className="w-full text-left">
                <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                  <tr>
                    <th className="p-2">Data</th>
                    <th className="p-2">Descrição</th>
                    <th className="p-2">Categoria</th>
                    <th className="p-2 text-right">Valor</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {monthTransactions.slice(0, 15).map((t) => (
                    <tr key={t.id}>
                      <td className="p-2 text-slate-500">{formatDate(t.date)}</td>
                      <td className="p-2 font-medium">{t.description}</td>
                      <td className="p-2 text-slate-500">
                        {categories.find((c) => c.id === t.categoryId)?.name || 'Geral'}
                      </td>
                      <td
                        className={`p-2 text-right font-bold ${
                          t.type === 'income' ? 'text-emerald-600' : 'text-slate-900'
                        }`}
                      >
                        {t.type === 'income' ? '+' : '-'}&nbsp;{formatCurrency(t.amount)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Footer Signature */}
          <div className="pt-6 border-t border-slate-200 flex justify-between items-center text-[11px] text-slate-400">
            <span>Gerado automaticamente por FinanSmart PRO</span>
            <span>Score Financeiro: {healthScore.score}/1000 ({healthScore.level})</span>
          </div>
        </div>
      </div>
    </div>
  );
};
