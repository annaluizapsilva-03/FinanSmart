import React, { useState, useEffect, useRef } from 'react';
import {
  Sparkles,
  Bot,
  Send,
  AlertTriangle,
  Lightbulb,
  TrendingDown,
  ShieldCheck,
  RefreshCw,
  CheckCircle2,
  DollarSign,
  HelpCircle,
  Scissors,
} from 'lucide-react';
import { useFinance } from '../../context/FinanceContext';
import { formatCurrency, formatMonthName } from '../../utils/formatters';

interface Message {
  role: 'user' | 'model';
  content: string;
}

interface AIDiagnosis {
  healthScore?: number;
  summary: string;
  alerts: string[];
  tips: string[];
  potentialSavings: number;
  cutOpportunities?: Array<{
    category: string;
    suggestedCutPercent: number;
    reason: string;
  }>;
}

export const AIAssistantTab: React.FC = () => {
  const {
    selectedMonth,
    monthMetrics,
    categories,
    transactions,
    goals,
    bills,
    healthScore,
  } = useFinance();

  // Diagnosis State
  const [diagnosis, setDiagnosis] = useState<AIDiagnosis | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisError, setAnalysisError] = useState<string | null>(null);

  // Chat State
  const [chatMessages, setChatMessages] = useState<Message[]>([
    {
      role: 'model',
      content:
        'Olá! Eu sou o FinanBot, seu consultor financeiro de inteligência artificial. Estou conectado aos seus dados deste mês. Como posso te ajudar a cortar gastos ou planejar seu dinheiro hoje?',
    },
  ]);
  const [inputQuery, setInputQuery] = useState('');
  const [isSending, setIsSending] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [chatMessages]);

  // Generate AI Analysis
  const runAIAnalysis = async () => {
    setIsAnalyzing(true);
    setAnalysisError(null);

    const monthTransactions = transactions.filter((t) => t.date.startsWith(selectedMonth));

    const categorySummary = Object.entries(monthMetrics.categoryTotals).map(([id, item]) => ({
      name: item.name,
      total: item.total,
      limit: item.limit,
    }));

    try {
      const response = await fetch('/api/ai/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          monthlyIncome: monthMetrics.totalIncome,
          monthlyExpenses: monthMetrics.totalExpenses,
          categories: categorySummary,
          recentTransactions: monthTransactions.slice(0, 15).map((t) => ({
            desc: t.description,
            amount: t.amount,
            type: t.type,
            nature: t.expenseNature,
          })),
        }),
      });

      if (!response.ok) {
        throw new Error('Falha na resposta do servidor.');
      }

      const data = await response.json();
      setDiagnosis(data);
    } catch (err: any) {
      console.error('Error fetching diagnosis', err);
      // Fallback local heuristic
      setDiagnosis({
        healthScore: healthScore.score,
        summary: `Você gastou ${formatCurrency(monthMetrics.totalExpenses)} de uma renda de ${formatCurrency(monthMetrics.totalIncome)}. Seus gastos variáveis representam ${Math.round((monthMetrics.variableExpenses / (monthMetrics.totalExpenses || 1)) * 100)}% das despesas.`,
        alerts:
          monthMetrics.totalExpenses > monthMetrics.totalIncome
            ? ['Suas despesas superaram suas receitas neste mês. Risco iminente de endividamento no rotativo.']
            : ['Fique atento às despesas de fim de semana com festas e delivery que tendem a fugir do controle.'],
        tips: [
          'Reduza pedidos de delivery e baladas em 25% para economizar até R$ 250 a R$ 400 por mês.',
          'Mantenha despesas fixas (moradia e contas básicas) abaixo de 50% dos seus ganhos totais.',
          'Automatize uma transferência para a sua Reserva de Emergência assim que o salário cair na conta.',
        ],
        potentialSavings: Math.round(monthMetrics.totalExpenses * 0.15),
        cutOpportunities: [
          {
            category: 'Festa & Lazer',
            suggestedCutPercent: 30,
            reason: 'Gastos discricionários que podem ser reduzidos sem afetar sua qualidade de vida básica.',
          },
          {
            category: 'Alimentação & Mercado',
            suggestedCutPercent: 15,
            reason: 'Planejar cardápio semanal e evitar compras impulsivas reduz drasticamente o desperdício.',
          },
        ],
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Run initial analysis on first load if not loaded
  useEffect(() => {
    if (!diagnosis) {
      runAIAnalysis();
    }
  }, [selectedMonth]);

  // Handle Send Chat
  const handleSendMessage = async (customMessage?: string) => {
    const textToSend = customMessage || inputQuery;
    if (!textToSend.trim() || isSending) return;

    const userMsg: Message = { role: 'user', content: textToSend.trim() };
    setChatMessages((prev) => [...prev, userMsg]);
    if (!customMessage) setInputQuery('');
    setIsSending(true);

    try {
      const response = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: textToSend.trim(),
          history: chatMessages.slice(-6),
          context: {
            monthlyIncome: monthMetrics.totalIncome,
            monthlyExpenses: monthMetrics.totalExpenses,
            topCategories: Object.values(monthMetrics.categoryTotals)
              .filter((c) => c.total > 0)
              .sort((a, b) => b.total - a.total)
              .slice(0, 4)
              .map((c) => `${c.name}: R$ ${c.total}`),
            goals: goals.map((g) => `${g.title} (R$ ${g.currentAmount}/${g.targetAmount})`),
            pendingBills: bills.filter((b) => b.status === 'pending').map((b) => `${b.title} (R$ ${b.amount})`),
          },
        }),
      });

      const data = await response.json();
      setChatMessages((prev) => [
        ...prev,
        { role: 'model', content: data.reply || 'Entendido. Continue acompanhando suas metas no FinanSmart!' },
      ]);
    } catch (err) {
      console.error('Chat error:', err);
      setChatMessages((prev) => [
        ...prev,
        {
          role: 'model',
          content:
            'Tive uma instabilidade ao conectar à rede, mas deixo uma dica de ouro: revise suas faturas de cartão de crédito e tente cortar 2 assinaturas ou saídas supérfluas essa semana!',
        },
      ]);
    } finally {
      setIsSending(false);
    }
  };

  const quickPrompts = [
    'Onde estou gastando mais e como posso economizar?',
    'Como montar uma reserva de emergência com o meu salário atual?',
    'Vale mais a pena pagar a fatura à vista ou parcelar?',
    'Quais hábitos simples podem me economizar R$ 500 no mês?',
  ];

  return (
    <div className="space-y-8 animate-fade-in pb-12">
      {/* 1. AI Analysis & Diagnosis Banner */}
      <div className="bg-gradient-to-br from-slate-900 via-teal-950 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
        {/* Ambient glow */}
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-teal-500/20 rounded-full blur-3xl pointer-events-none"></div>

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 relative z-10">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="p-2 rounded-xl bg-teal-500/20 border border-teal-400/30 text-teal-300">
                <Sparkles size={20} />
              </span>
              <span className="text-xs font-bold uppercase tracking-wider text-teal-400">
                Auditoria Financeira por Inteligência Artificial
              </span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Diagnóstico do Mês: <span className="capitalize">{formatMonthName(selectedMonth)}</span>
            </h2>
          </div>

          <button
            onClick={runAIAnalysis}
            disabled={isAnalyzing}
            className="flex items-center gap-2 px-4 py-2.5 bg-teal-500 hover:bg-teal-400 text-slate-950 rounded-xl text-xs sm:text-sm font-extrabold transition-all shadow-md shadow-teal-500/20 cursor-pointer disabled:opacity-50 self-start md:self-auto"
          >
            <RefreshCw size={16} className={isAnalyzing ? 'animate-spin' : ''} />
            <span>{isAnalyzing ? 'Analisando gastos...' : 'Atualizar Diagnóstico'}</span>
          </button>
        </div>

        {diagnosis && (
          <div className="space-y-6 relative z-10">
            {/* Executive Summary */}
            <div className="p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xs">
              <p className="text-sm sm:text-base text-slate-200 leading-relaxed">
                {diagnosis.summary}
              </p>
              {diagnosis.potentialSavings > 0 && (
                <div className="mt-3 flex items-center gap-2 text-xs font-bold text-teal-300">
                  <Scissors size={15} />
                  <span>
                    Potencial estimado de economia identificada: <strong>{formatCurrency(diagnosis.potentialSavings)}/mês</strong>
                  </span>
                </div>
              )}
            </div>

            {/* Alerts & Critical notices */}
            {diagnosis.alerts && diagnosis.alerts.length > 0 && (
              <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-200 space-y-2">
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-rose-300">
                  <AlertTriangle size={16} />
                  <span>Pontos de Atenção Crítica</span>
                </div>
                <ul className="list-disc list-inside text-xs sm:text-sm space-y-1 text-rose-100">
                  {diagnosis.alerts.map((alert, idx) => (
                    <li key={idx}>{alert}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Smart actionable tips */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {diagnosis.tips?.map((tip, idx) => (
                <div
                  key={idx}
                  className="p-4 rounded-2xl bg-white/5 border border-white/10 hover:border-teal-500/40 transition-all flex flex-col justify-between"
                >
                  <div className="flex items-center gap-2 text-teal-400 text-xs font-bold mb-2">
                    <Lightbulb size={16} />
                    <span>Dica #{idx + 1}</span>
                  </div>
                  <p className="text-xs sm:text-sm text-slate-200 leading-relaxed">
                    {tip}
                  </p>
                </div>
              ))}
            </div>

            {/* Category Cut Opportunities */}
            {diagnosis.cutOpportunities && diagnosis.cutOpportunities.length > 0 && (
              <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
                <h4 className="text-xs font-bold text-teal-300 uppercase tracking-wider mb-3">
                  Oportunidades de Corte Direto Sugeridas
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {diagnosis.cutOpportunities.map((opp, idx) => (
                    <div key={idx} className="p-3 rounded-xl bg-slate-800/60 border border-slate-700/60 text-xs">
                      <div className="flex justify-between items-center mb-1">
                        <strong className="text-white text-sm">{opp.category}</strong>
                        <span className="px-2 py-0.5 rounded-md bg-rose-500/20 text-rose-300 font-bold">
                          Cortar ~{opp.suggestedCutPercent}%
                        </span>
                      </div>
                      <p className="text-slate-300 text-[11px]">{opp.reason}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* 2. Interactive AI Financial Assistant (FinanBot) */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden flex flex-col h-[560px]">
        {/* Chat Header */}
        <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-teal-600 text-white flex items-center justify-center shadow-xs">
              <Bot size={20} />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                FinanBot - Consultor de Inteligência Artificial
                <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              </h3>
              <p className="text-xs text-slate-500">
                Tire dúvidas sobre seu orçamento, dívidas, cartões e investimentos
              </p>
            </div>
          </div>
        </div>

        {/* Chat Message Scroll */}
        <div className="flex-1 p-4 sm:p-6 overflow-y-auto space-y-4 bg-slate-50/30">
          {chatMessages.map((msg, idx) => {
            const isUser = msg.role === 'user';
            return (
              <div
                key={idx}
                className={`flex gap-3 max-w-[85%] ${isUser ? 'ml-auto flex-row-reverse' : ''}`}
              >
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-xs font-bold ${
                    isUser
                      ? 'bg-slate-900 text-white'
                      : 'bg-teal-600 text-white'
                  }`}
                >
                  {isUser ? 'Você' : <Bot size={15} />}
                </div>

                <div
                  className={`p-3.5 rounded-2xl text-xs sm:text-sm leading-relaxed shadow-xs whitespace-pre-wrap ${
                    isUser
                      ? 'bg-emerald-600 text-white rounded-tr-none'
                      : 'bg-white border border-slate-200/80 text-slate-800 rounded-tl-none'
                  }`}
                >
                  {msg.content}
                </div>
              </div>
            );
          })}

          {isSending && (
            <div className="flex gap-3 max-w-[85%]">
              <div className="w-8 h-8 rounded-full bg-teal-600 text-white flex items-center justify-center shrink-0">
                <Bot size={15} />
              </div>
              <div className="p-3.5 rounded-2xl bg-white border border-slate-200/80 rounded-tl-none text-xs text-slate-500 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-teal-500 animate-ping"></span>
                <span>FinanBot está analisando seus números...</span>
              </div>
            </div>
          )}

          <div ref={chatEndRef} />
        </div>

        {/* Suggested Prompts */}
        <div className="p-2 sm:px-4 bg-slate-50 border-t border-slate-100 flex items-center gap-2 overflow-x-auto no-scrollbar">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider shrink-0 flex items-center gap-1">
            <HelpCircle size={12} /> Perguntas:
          </span>
          {quickPrompts.map((prompt, i) => (
            <button
              key={i}
              onClick={() => handleSendMessage(prompt)}
              className="px-2.5 py-1 rounded-lg bg-white border border-slate-200 hover:border-teal-500 hover:text-teal-700 text-slate-600 text-xs whitespace-nowrap transition-colors cursor-pointer shrink-0 shadow-2xs"
            >
              {prompt}
            </button>
          ))}
        </div>

        {/* Input Bar */}
        <div className="p-4 border-t border-slate-100 bg-white">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="flex items-center gap-2"
          >
            <input
              type="text"
              value={inputQuery}
              onChange={(e) => setInputQuery(e.target.value)}
              placeholder="Pergunte ao FinanBot (ex: Como cortar gastos com alimentação este mês?)..."
              disabled={isSending}
              className="flex-1 px-4 py-2.5 text-xs sm:text-sm text-slate-900 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500 disabled:opacity-60"
            />
            <button
              type="submit"
              disabled={isSending || !inputQuery.trim()}
              className="px-4 py-2.5 bg-teal-600 hover:bg-teal-700 text-white rounded-xl font-bold shadow-md shadow-teal-600/20 transition-all cursor-pointer disabled:opacity-50 flex items-center gap-1.5"
            >
              <Send size={16} />
              <span className="hidden sm:inline">Enviar</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
