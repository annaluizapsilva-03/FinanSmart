import React from 'react';
import {
  Wallet,
  PlusCircle,
  BarChart3,
  ListOrdered,
  Target,
  Sparkles,
  CreditCard,
  Calculator,
  Printer,
  ChevronLeft,
  ChevronRight,
  Download,
  Upload,
  RefreshCw,
  LineChart,
} from 'lucide-react';
import { useFinance } from '../../context/FinanceContext';
import { formatMonthName } from '../../utils/formatters';

export type ActiveTab = 'dashboard' | 'transactions' | 'planning' | 'investments' | 'ai' | 'payments' | 'tools';

interface NavbarProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  onOpenNewTransaction: () => void;
  onOpenPrintReport: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  onOpenNewTransaction,
  onOpenPrintReport,
}) => {
  const {
    selectedMonth,
    setSelectedMonth,
    healthScore,
    resetToSampleData,
    exportDataJSON,
    importDataJSON,
  } = useFinance();

  const handlePrevMonth = () => {
    const [year, month] = selectedMonth.split('-').map(Number);
    const date = new Date(year, month - 2, 1);
    const newYear = date.getFullYear();
    const newMonth = String(date.getMonth() + 1).padStart(2, '0');
    setSelectedMonth(`${newYear}-${newMonth}`);
  };

  const handleNextMonth = () => {
    const [year, month] = selectedMonth.split('-').map(Number);
    const date = new Date(year, month, 1);
    const newYear = date.getFullYear();
    const newMonth = String(date.getMonth() + 1).padStart(2, '0');
    setSelectedMonth(`${newYear}-${newMonth}`);
  };

  const handleFileImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        const success = importDataJSON(content);
        if (success) {
          alert('Dados restaurados com sucesso!');
        } else {
          alert('Arquivo de backup inválido.');
        }
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const getHealthBadgeColor = () => {
    if (healthScore.score >= 800) return 'bg-emerald-50 text-emerald-700 border-emerald-200';
    if (healthScore.score >= 600) return 'bg-blue-50 text-blue-700 border-blue-200';
    if (healthScore.score >= 400) return 'bg-amber-50 text-amber-700 border-amber-200';
    return 'bg-rose-50 text-rose-700 border-rose-200';
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-xs no-print">
      {/* Top Banner Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-3">
          {/* Logo Brand */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white shadow-md shadow-emerald-600/20">
              <Wallet className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-xl tracking-tight text-slate-900">
                  Finan<span className="text-emerald-600">Smart</span>
                </span>
                <span className="hidden sm:inline-flex items-center text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                  PRO
                </span>
              </div>
              <p className="text-[11px] text-slate-500 hidden md:block">
                Gestão Financeira & Inteligência Artificial
              </p>
            </div>
          </div>

          {/* Month Selector in Header */}
          <div className="flex items-center bg-slate-100 rounded-xl p-1 border border-slate-200/70 shadow-xs">
            <button
              onClick={handlePrevMonth}
              title="Mês Anterior"
              className="p-1.5 hover:bg-white rounded-lg text-slate-600 hover:text-slate-900 transition-colors"
            >
              <ChevronLeft size={16} />
            </button>
            <span className="px-2 sm:px-3 text-xs sm:text-sm font-bold text-slate-800 capitalize min-w-[120px] sm:min-w-[140px] text-center">
              {formatMonthName(selectedMonth)}
            </span>
            <button
              onClick={handleNextMonth}
              title="Próximo Mês"
              className="p-1.5 hover:bg-white rounded-lg text-slate-600 hover:text-slate-900 transition-colors"
            >
              <ChevronRight size={16} />
            </button>
          </div>

          {/* Right Header Actions */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Health Score Pill */}
            <div
              className={`hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-semibold ${getHealthBadgeColor()}`}
              title="Score de Saúde Financeira baseado na sua taxa de poupança, controle de orçamentos e contas em dia"
            >
              <span className="w-2 h-2 rounded-full bg-current animate-pulse"></span>
              <span>Score: {healthScore.score}</span>
              <span className="font-normal text-[11px] opacity-80">({healthScore.level})</span>
            </div>

            {/* Print Report */}
            <button
              onClick={onOpenPrintReport}
              className="hidden md:flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl border border-slate-200 transition-colors"
              title="Gerar Relatório em PDF"
            >
              <Printer size={15} />
              <span>Relatório</span>
            </button>

            {/* Backup / Export / Reset Menu */}
            <div className="flex items-center gap-1">
              <button
                onClick={exportDataJSON}
                className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-colors"
                title="Exportar Backup (JSON)"
              >
                <Download size={16} />
              </button>
              <label
                className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
                title="Importar Backup (JSON)"
              >
                <Upload size={16} />
                <input
                  type="file"
                  accept=".json"
                  onChange={handleFileImport}
                  className="hidden"
                />
              </label>
              <button
                onClick={() => {
                  if (confirm('Deseja recarregar os dados de exemplo do FinanSmart?')) {
                    resetToSampleData();
                  }
                }}
                className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-colors"
                title="Restaurar dados de exemplo"
              >
                <RefreshCw size={15} />
              </button>
            </div>

            {/* Primary Action: Novo Lançamento */}
            <button
              onClick={onOpenNewTransaction}
              className="flex items-center gap-2 px-3.5 sm:px-4 py-2 bg-emerald-600 hover:bg-emerald-700 active:scale-98 text-white rounded-xl text-xs sm:text-sm font-bold shadow-md shadow-emerald-600/20 transition-all cursor-pointer"
            >
              <PlusCircle size={16} />
              <span className="hidden sm:inline">Novo Lançamento</span>
              <span className="sm:hidden">Novo</span>
            </button>
          </div>
        </div>

        {/* Tab Navigation Navigation Bar */}
        <nav className="flex items-center gap-1 sm:gap-2 overflow-x-auto py-2 -mx-4 px-4 sm:mx-0 sm:px-0 border-t border-slate-100 no-scrollbar">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all ${
              activeTab === 'dashboard'
                ? 'bg-emerald-50 text-emerald-800 border border-emerald-200/80 shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
            }`}
          >
            <BarChart3 size={16} className={activeTab === 'dashboard' ? 'text-emerald-600' : 'text-slate-400'} />
            Dashboard
          </button>

          <button
            onClick={() => setActiveTab('transactions')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all ${
              activeTab === 'transactions'
                ? 'bg-emerald-50 text-emerald-800 border border-emerald-200/80 shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
            }`}
          >
            <ListOrdered size={16} className={activeTab === 'transactions' ? 'text-emerald-600' : 'text-slate-400'} />
            Lançamentos
          </button>

          <button
            onClick={() => setActiveTab('planning')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all ${
              activeTab === 'planning'
                ? 'bg-emerald-50 text-emerald-800 border border-emerald-200/80 shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
            }`}
          >
            <Target size={16} className={activeTab === 'planning' ? 'text-emerald-600' : 'text-slate-400'} />
            Orçamento & Metas
          </button>

          <button
            onClick={() => setActiveTab('investments')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all ${
              activeTab === 'investments'
                ? 'bg-emerald-50 text-emerald-800 border border-emerald-200/80 shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
            }`}
          >
            <LineChart size={16} className={activeTab === 'investments' ? 'text-emerald-600' : 'text-slate-400'} />
            Investimentos & Bolsa
            <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${activeTab === 'investments' ? 'bg-emerald-200 text-emerald-900' : 'bg-emerald-100 text-emerald-800'}`}>
              B3
            </span>
          </button>

          <button
            onClick={() => setActiveTab('ai')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all ${
              activeTab === 'ai'
                ? 'bg-gradient-to-r from-teal-500 to-emerald-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
            }`}
          >
            <Sparkles size={16} className={activeTab === 'ai' ? 'text-white' : 'text-teal-600'} />
            IA & Economia
            <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-extrabold ${activeTab === 'ai' ? 'bg-white/20 text-white' : 'bg-teal-100 text-teal-800'}`}>
              Gemini
            </span>
          </button>

          <button
            onClick={() => setActiveTab('payments')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all ${
              activeTab === 'payments'
                ? 'bg-emerald-50 text-emerald-800 border border-emerald-200/80 shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
            }`}
          >
            <CreditCard size={16} className={activeTab === 'payments' ? 'text-emerald-600' : 'text-slate-400'} />
            Contas & Cartões
          </button>

          <button
            onClick={() => setActiveTab('tools')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all ${
              activeTab === 'tools'
                ? 'bg-emerald-50 text-emerald-800 border border-emerald-200/80 shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
            }`}
          >
            <Calculator size={16} className={activeTab === 'tools' ? 'text-emerald-600' : 'text-slate-400'} />
            Simuladores & Desafios
          </button>
        </nav>
      </div>
    </header>
  );
};
