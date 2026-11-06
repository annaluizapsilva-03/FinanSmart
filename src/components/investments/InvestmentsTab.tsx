import React, { useState, useEffect } from 'react';
import {
  TrendingUp,
  LineChart,
  HelpCircle,
  Sparkles,
  Shield,
  Building2,
  DollarSign,
  ArrowRight,
  CheckCircle2,
  AlertTriangle,
  Zap,
  BookOpen,
  PieChart,
  Target,
  RefreshCw,
  Coins,
  Compass,
} from 'lucide-react';
import { formatCurrency } from '../../utils/formatters';

interface InvestmentRecommendation {
  marketOverview: string;
  bestChoicesToday: Array<{
    name: string;
    category: string;
    percentage: number;
    reason: string;
    tickerExample: string;
  }>;
  goldenTip: string;
  practicalSteps: string[];
}

export const InvestmentsTab: React.FC = () => {
  // Recommendation parameters
  const [profile, setProfile] = useState<'conservador' | 'moderado' | 'arrojado'>('moderado');
  const [amount, setAmount] = useState('1000');
  const [horizon, setHorizon] = useState('Médio Prazo (2 a 5 anos)');
  const [objective, setObjective] = useState('Renda Passiva Mensal & Multiplicação');

  const [recommendation, setRecommendation] = useState<InvestmentRecommendation | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Active sub-section view: 'today' | 'guide' | 'profile-test' | 'glossary'
  const [activeSection, setActiveSection] = useState<'today' | 'guide' | 'profile-test' | 'glossary'>('today');

  // Interactive profile quiz answers
  const [quizAnswers, setQuizAnswers] = useState<{ q1?: string; q2?: string; q3?: string }>({});

  const fetchInvestmentAdvice = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/ai/investments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          profile,
          amount: parseFloat(amount.replace(',', '.')) || 1000,
          horizon,
          objective,
        }),
      });

      if (!response.ok) throw new Error('Falha ao obter conselho de investimento.');
      const data = await response.json();
      setRecommendation(data);
    } catch (err) {
      console.error('Error fetching investments:', err);
      // Fallback data
      setRecommendation({
        marketOverview:
          'Com a taxa Selic em patamar elevado e a Bolsa de Valores com múltiplos atrativos, a combinação ideal hoje é aliar a rentabilidade segura do CDI com a renda passiva mensal dos Fundos Imobiliários e boas empresas de dividendos.',
        bestChoicesToday: [
          {
            name: 'Tesouro Selic 2029 / CDB 100%+ CDI',
            category: 'Renda Fixa & Reserva',
            percentage: profile === 'conservador' ? 65 : profile === 'moderado' ? 45 : 20,
            reason:
              'Rendimento diário atrelado à Selic com risco quase zero e liquidez para resgate a qualquer momento.',
            tickerExample: 'Tesouro Direto Selic / CDB Banco Inter ou Nubank',
          },
          {
            name: 'Fundos Imobiliários (FIIs de Tijolo e Papel)',
            category: 'Renda Passiva Mensal',
            percentage: profile === 'conservador' ? 25 : profile === 'moderado' ? 35 : 35,
            reason:
              'Receba aluguéis pingando na sua conta todo mês sem pagar um centavo de Imposto de Renda.',
            tickerExample: 'MXRF11, HGLG11, XPML11, KNCR11',
          },
          {
            name: 'Ações de Dividendos na Bolsa (B3)',
            category: 'Ações & Bolsa',
            percentage: profile === 'conservador' ? 10 : profile === 'moderado' ? 20 : 45,
            reason:
              'Seja sócio dos maiores bancos e empresas de energia do Brasil e receba parte dos lucros líquidos.',
            tickerExample: 'BBAS3, ITUB4, TAEE11, EGIE3',
          },
        ],
        goldenTip:
          'Nunca coloque na Bolsa de Valores o dinheiro que você precisará nos próximos 6 a 12 meses. Ações são para construção de patrimônio e renda no médio e longo prazo!',
        practicalSteps: [
          '1. Abra conta gratuita em uma corretora de valores taxa zero (como NuInvest/Nubank, Inter, Rico ou XP).',
          '2. Transfira o valor pretendido via PIX para sua conta de investimentos.',
          '3. Comece garantindo sua Reserva de Emergência no Tesouro Selic ou CDB com liquidez diária.',
          '4. Com o excedente, compre cotas de FIIs ou Ações pelo Home Broker digitando os códigos dos ativos.',
        ],
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchInvestmentAdvice();
  }, [profile]);

  // Quiz evaluation
  const calculateQuizProfile = () => {
    const { q1, q2, q3 } = quizAnswers;
    if (!q1 || !q2 || !q3) return null;
    let score = 0;
    if (q1 === 'c') score += 2;
    else if (q1 === 'b') score += 1;
    if (q2 === 'c') score += 2;
    else if (q2 === 'b') score += 1;
    if (q3 === 'c') score += 2;
    else if (q3 === 'b') score += 1;

    if (score <= 1) return 'conservador';
    if (score <= 4) return 'moderado';
    return 'arrojado';
  };

  const calculatedProfile = calculateQuizProfile();

  return (
    <div className="space-y-8 animate-fade-in pb-12">
      {/* 1. Market Tickers Banner (Mercado Hoje) */}
      <div className="bg-slate-900 text-white rounded-2xl p-4 sm:p-6 shadow-md border border-slate-800">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping"></span>
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">
              Painel Macroeconômico do Dia (Brasil)
            </span>
          </div>
          <span className="text-xs text-slate-400">
            Dados de referência atualizados para orientar suas decisões
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          <div className="p-3 rounded-xl bg-slate-800/70 border border-slate-700/60">
            <span className="text-[10px] text-slate-400 font-semibold block uppercase">Taxa Selic</span>
            <div className="flex items-baseline gap-1 mt-0.5">
              <span className="text-lg font-extrabold text-emerald-400">12.25%</span>
              <span className="text-[10px] text-slate-400">a.a.</span>
            </div>
            <span className="text-[10px] text-slate-400 block mt-1">Alta rentabilidade fixa</span>
          </div>

          <div className="p-3 rounded-xl bg-slate-800/70 border border-slate-700/60">
            <span className="text-[10px] text-slate-400 font-semibold block uppercase">CDI Anual</span>
            <div className="flex items-baseline gap-1 mt-0.5">
              <span className="text-lg font-extrabold text-teal-400">12.15%</span>
              <span className="text-[10px] text-slate-400">a.a.</span>
            </div>
            <span className="text-[10px] text-slate-400 block mt-1">CDBs e Contas Digitais</span>
          </div>

          <div className="p-3 rounded-xl bg-slate-800/70 border border-slate-700/60">
            <span className="text-[10px] text-slate-400 font-semibold block uppercase">IPCA (Inflação)</span>
            <div className="flex items-baseline gap-1 mt-0.5">
              <span className="text-lg font-extrabold text-amber-400">4.42%</span>
              <span className="text-[10px] text-slate-400">acum.</span>
            </div>
            <span className="text-[10px] text-slate-400 block mt-1">Ganho real de ~7.5%</span>
          </div>

          <div className="p-3 rounded-xl bg-slate-800/70 border border-slate-700/60">
            <span className="text-[10px] text-slate-400 font-semibold block uppercase">IBOVESPA (B3)</span>
            <div className="flex items-baseline gap-1 mt-0.5">
              <span className="text-lg font-extrabold text-white">132.800</span>
              <span className="text-[10px] text-emerald-400 font-bold">+0.6%</span>
            </div>
            <span className="text-[10px] text-slate-400 block mt-1">Bolsa brasileira</span>
          </div>

          <div className="p-3 rounded-xl bg-slate-800/70 border border-slate-700/60 col-span-2 sm:col-span-1">
            <span className="text-[10px] text-slate-400 font-semibold block uppercase">Dólar (USD)</span>
            <div className="flex items-baseline gap-1 mt-0.5">
              <span className="text-lg font-extrabold text-white">R$ 5.72</span>
              <span className="text-[10px] text-slate-400">comercial</span>
            </div>
            <span className="text-[10px] text-slate-400 block mt-1">Câmbio de mercado</span>
          </div>
        </div>
      </div>

      {/* Sub-nav buttons */}
      <div className="flex items-center gap-2 p-1.5 bg-slate-100 rounded-2xl max-w-2xl mx-auto border border-slate-200">
        <button
          onClick={() => setActiveSection('today')}
          className={`flex-1 py-2 px-3 rounded-xl text-xs sm:text-sm font-bold transition-all ${
            activeSection === 'today'
              ? 'bg-white text-emerald-700 shadow-sm'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <span className="flex items-center justify-center gap-1.5">
            <Zap size={15} />
            Onde Investir Hoje
          </span>
        </button>

        <button
          onClick={() => setActiveSection('guide')}
          className={`flex-1 py-2 px-3 rounded-xl text-xs sm:text-sm font-bold transition-all ${
            activeSection === 'guide'
              ? 'bg-white text-emerald-700 shadow-sm'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <span className="flex items-center justify-center gap-1.5">
            <BookOpen size={15} />
            Guia da Bolsa (B3)
          </span>
        </button>

        <button
          onClick={() => setActiveSection('profile-test')}
          className={`flex-1 py-2 px-3 rounded-xl text-xs sm:text-sm font-bold transition-all ${
            activeSection === 'profile-test'
              ? 'bg-white text-emerald-700 shadow-sm'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <span className="flex items-center justify-center gap-1.5">
            <Compass size={15} />
            Teste de Perfil
          </span>
        </button>

        <button
          onClick={() => setActiveSection('glossary')}
          className={`flex-1 py-2 px-3 rounded-xl text-xs sm:text-sm font-bold transition-all ${
            activeSection === 'glossary'
              ? 'bg-white text-emerald-700 shadow-sm'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <span className="flex items-center justify-center gap-1.5">
            <HelpCircle size={15} />
            Dicionário
          </span>
        </button>
      </div>

      {/* SECTION 1: ONDE INVESTIR HOJE */}
      {activeSection === 'today' && (
        <div className="space-y-6">
          {/* Filter / Parameters Bar */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-5 pb-4 border-b border-slate-100">
              <div>
                <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <Sparkles className="text-emerald-600" size={20} />
                  Recomendador Inteligente: O Que é Melhor Investir Hoje?
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Análise gerada por Inteligência Artificial levando em consideração seu perfil e a economia brasileira.
                </p>
              </div>

              <button
                onClick={fetchInvestmentAdvice}
                disabled={isLoading}
                className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-md shadow-emerald-600/20 transition-all cursor-pointer disabled:opacity-50 self-start md:self-auto"
              >
                <RefreshCw size={14} className={isLoading ? 'animate-spin' : ''} />
                <span>{isLoading ? 'Calculando...' : 'Recalcular Hoje'}</span>
              </button>
            </div>

            {/* Inputs: Amount, Profile, Horizon */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Seu Perfil de Investidor:
                </label>
                <div className="grid grid-cols-3 gap-1.5 p-1 bg-slate-100 rounded-xl text-xs font-bold">
                  {(['conservador', 'moderado', 'arrojado'] as const).map((p) => (
                    <button
                      key={p}
                      onClick={() => setProfile(p)}
                      className={`py-1.5 capitalize rounded-lg transition-all ${
                        profile === p
                          ? 'bg-white text-emerald-800 shadow-xs'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      {p}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Valor para Investir Hoje (R$):
                </label>
                <input
                  type="number"
                  step="50"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full px-3 py-1.5 text-sm font-bold border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Prazo Desejado:
                </label>
                <select
                  value={horizon}
                  onChange={(e) => setHorizon(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs sm:text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="Curto Prazo (até 1 ano)">Curto Prazo (até 1 ano)</option>
                  <option value="Médio Prazo (2 a 5 anos)">Médio Prazo (2 a 5 anos)</option>
                  <option value="Longo Prazo (5+ anos)">Longo Prazo (5+ anos)</option>
                </select>
              </div>
            </div>
          </div>

          {/* AI Result Card */}
          {recommendation && (
            <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs space-y-6">
              {/* Overview */}
              <div className="p-4 rounded-xl bg-emerald-50/70 border border-emerald-200/60">
                <div className="flex items-center gap-2 text-xs font-bold text-emerald-800 uppercase tracking-wide mb-1">
                  <Compass size={15} />
                  <span>Diagnóstico Estratégico de Mercado</span>
                </div>
                <p className="text-sm text-slate-800 leading-relaxed font-medium">
                  {recommendation.marketOverview}
                </p>
              </div>

              {/* Asset Allocation Breakdown */}
              <div>
                <h4 className="text-sm font-bold text-slate-900 mb-3 flex items-center gap-2">
                  <PieChart size={16} className="text-emerald-600" />
                  Divisão Recomendada para R$ {parseFloat(amount || '0').toLocaleString('pt-BR')}:
                </h4>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {(recommendation.bestChoicesToday || []).map((choice, idx) => {
                    const allocatedAmount =
                      ((parseFloat(amount || '0') || 1000) * choice.percentage) / 100;

                    return (
                      <div
                        key={idx}
                        className="p-5 rounded-2xl border border-slate-200 bg-slate-50/50 hover:bg-slate-50 transition-all flex flex-col justify-between"
                      >
                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                              {choice.category}
                            </span>
                            <span className="text-sm font-extrabold text-slate-900">
                              {choice.percentage}%
                            </span>
                          </div>

                          <h5 className="font-extrabold text-sm text-slate-900 mb-1">
                            {choice.name}
                          </h5>

                          <div className="text-xs font-bold text-emerald-700 mb-2">
                            Aporte sugerido: {formatCurrency(allocatedAmount)}
                          </div>

                          <p className="text-xs text-slate-600 leading-relaxed mb-3">
                            {choice.reason}
                          </p>
                        </div>

                        <div className="pt-3 border-t border-slate-200 text-[11px] text-slate-500">
                          Exemplos de ativos:{' '}
                          <strong className="text-slate-800 font-mono block text-xs mt-0.5">
                            {choice.tickerExample}
                          </strong>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Golden Tip */}
              {recommendation.goldenTip && (
                <div className="p-4 rounded-xl bg-amber-50 border border-amber-200/80 flex items-start gap-3">
                  <AlertTriangle className="text-amber-600 shrink-0 mt-0.5" size={18} />
                  <div className="text-xs">
                    <strong className="text-amber-900 block font-bold mb-0.5">
                      Regra de Ouro do Investidor:
                    </strong>
                    <span className="text-amber-800 leading-relaxed">{recommendation.goldenTip}</span>
                  </div>
                </div>
              )}

              {/* Practical Step-by-Step */}
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                <h5 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-2">
                  Como Executar na Prática:
                </h5>
                <ul className="text-xs text-slate-700 space-y-1.5">
                  {(recommendation.practicalSteps || []).map((step, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <CheckCircle2 size={14} className="text-emerald-600 shrink-0 mt-0.5" />
                      <span>{step}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </div>
      )}

      {/* SECTION 2: GUIA DIDÁTICO DA BOLSA (B3) */}
      {activeSection === 'guide' && (
        <div className="space-y-6">
          <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200/80 shadow-xs space-y-8">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <BookOpen className="text-emerald-600" size={22} />
                <h3 className="text-xl font-extrabold text-slate-900">
                  O Que é a Bolsa de Valores (B3) e Como Ela Funciona?
                </h3>
              </div>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed max-w-3xl">
                A Bolsa de Valores do Brasil (chamada **B3**) é um mercado digital seguro e regulamentado pela CVM onde investidores compram e vendem frações (ações) de empresas e cotas de fundos imobiliários.
              </p>
            </div>

            {/* 3 Pillars of Investing */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Card 1: Ações */}
              <div className="p-5 rounded-2xl bg-blue-50/50 border border-blue-200/70 flex flex-col justify-between">
                <div>
                  <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold mb-3 shadow-xs">
                    📈
                  </div>
                  <h4 className="text-base font-bold text-slate-900 mb-1">
                    1. Ações de Empresas
                  </h4>
                  <p className="text-xs text-slate-600 leading-relaxed mb-3">
                    Quando você compra uma ação (ex: <strong>ITUB4</strong> do Itaú ou <strong>PETR4</strong> da Petrobras), você se torna <strong>sócio</strong> do negócio.
                  </p>
                  <div className="text-xs text-blue-900 font-semibold bg-blue-100/60 p-2.5 rounded-lg space-y-1">
                    <p>• <strong>Valorização:</strong> A ação sobe conforme o lucro cresce.</p>
                    <p>• <strong>Dividendos:</strong> Parte do lucro cai na sua conta.</p>
                  </div>
                </div>
              </div>

              {/* Card 2: FIIs */}
              <div className="p-5 rounded-2xl bg-emerald-50/50 border border-emerald-200/70 flex flex-col justify-between">
                <div>
                  <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold mb-3 shadow-xs">
                    🏢
                  </div>
                  <h4 className="text-base font-bold text-slate-900 mb-1">
                    2. Fundos Imobiliários (FIIs)
                  </h4>
                  <p className="text-xs text-slate-600 leading-relaxed mb-3">
                    Em vez de comprar um imóvel físico de R$ 500 mil, você compra cotas por <strong>R$ 10 a R$ 100</strong> de shoppings, galpões de logística e hospitais.
                  </p>
                  <div className="text-xs text-emerald-900 font-semibold bg-emerald-100/60 p-2.5 rounded-lg space-y-1">
                    <p>• <strong>Aluguel Mensal:</strong> Pinga todo mês na sua conta.</p>
                    <p>• <strong>Isento de IR:</strong> Rendimentos 100% isentos de imposto.</p>
                  </div>
                </div>
              </div>

              {/* Card 3: Renda Fixa */}
              <div className="p-5 rounded-2xl bg-purple-50/50 border border-purple-200/70 flex flex-col justify-between">
                <div>
                  <div className="w-10 h-10 rounded-xl bg-purple-600 text-white flex items-center justify-center font-bold mb-3 shadow-xs">
                    🛡️
                  </div>
                  <h4 className="text-base font-bold text-slate-900 mb-1">
                    3. Renda Fixa & Tesouro
                  </h4>
                  <p className="text-xs text-slate-600 leading-relaxed mb-3">
                    Você empresta dinheiro para o Governo (Tesouro Direto) ou Bancos (CDB/LCI) e recebe juros combinados.
                  </p>
                  <div className="text-xs text-purple-900 font-semibold bg-purple-100/60 p-2.5 rounded-lg space-y-1">
                    <p>• <strong>Previsibilidade:</strong> Risco baixíssimo e sem sustos.</p>
                    <p>• <strong>Reserva:</strong> Ideal para guardar a emergência.</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Journey from zero to investor */}
            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200">
              <h4 className="text-sm font-bold text-slate-900 mb-3">
                A Jornada Correta para Investir Sem Erro:
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 text-xs">
                <div className="p-3 bg-white rounded-xl border border-slate-200">
                  <span className="font-extrabold text-emerald-600 text-sm block mb-1">Passo 1</span>
                  <strong className="block text-slate-800">Reserva de Emergência</strong>
                  <p className="text-slate-500 mt-1">Guarde de 3 a 6 meses do seu custo de vida no Tesouro Selic ou CDB com liquidez diária.</p>
                </div>

                <div className="p-3 bg-white rounded-xl border border-slate-200">
                  <span className="font-extrabold text-emerald-600 text-sm block mb-1">Passo 2</span>
                  <strong className="block text-slate-800">Conta em Corretora</strong>
                  <p className="text-slate-500 mt-1">Abra conta em corretora taxa zero (Nubank, Inter, XP, Rico). Cadastro 100% online.</p>
                </div>

                <div className="p-3 bg-white rounded-xl border border-slate-200">
                  <span className="font-extrabold text-emerald-600 text-sm block mb-1">Passo 3</span>
                  <strong className="block text-slate-800">Primeiros FIIs</strong>
                  <p className="text-slate-500 mt-1">Compre sua primeira cota de um FII diversificado (ex: MXRF11 por ~R$ 10) para ver o dividendo cair.</p>
                </div>

                <div className="p-3 bg-white rounded-xl border border-slate-200">
                  <span className="font-extrabold text-emerald-600 text-sm block mb-1">Passo 4</span>
                  <strong className="block text-slate-800">Bolsa e Dividendos</strong>
                  <p className="text-slate-500 mt-1">Adicione aos poucos empresas consolidadas de energia, saneamento e bancos que pagam bons lucros.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SECTION 3: TESTE DE PERFIL DE INVESTIDOR */}
      {activeSection === 'profile-test' && (
        <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200/80 shadow-xs space-y-6">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Compass className="text-emerald-600" size={20} />
              <h3 className="text-lg font-bold text-slate-900">
                Descubra Seu Perfil de Investidor (Suitability Rápido)
              </h3>
            </div>
            <p className="text-xs text-slate-500">
              Responda a 3 perguntas simples para saber se você é Conservador, Moderado ou Arrojado.
            </p>
          </div>

          <div className="space-y-4">
            {/* Question 1 */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
              <h4 className="text-xs sm:text-sm font-bold text-slate-900">
                1. Se o valor investido oscilar e cair 5% em um mês, o que você faz?
              </h4>
              <div className="space-y-1.5 text-xs">
                <label className="flex items-center gap-2 p-2 rounded-lg hover:bg-white cursor-pointer">
                  <input
                    type="radio"
                    name="q1"
                    checked={quizAnswers.q1 === 'a'}
                    onChange={() => setQuizAnswers({ ...quizAnswers, q1: 'a' })}
                  />
                  <span>Entro em pânico e resgato todo o dinheiro para não perder mais.</span>
                </label>
                <label className="flex items-center gap-2 p-2 rounded-lg hover:bg-white cursor-pointer">
                  <input
                    type="radio"
                    name="q1"
                    checked={quizAnswers.q1 === 'b'}
                    onChange={() => setQuizAnswers({ ...quizAnswers, q1: 'b' })}
                  />
                  <span>Fico desconfortável, mas mantenho porque sei que o foco é no médio prazo.</span>
                </label>
                <label className="flex items-center gap-2 p-2 rounded-lg hover:bg-white cursor-pointer">
                  <input
                    type="radio"
                    name="q1"
                    checked={quizAnswers.q1 === 'c'}
                    onChange={() => setQuizAnswers({ ...quizAnswers, q1: 'c' })}
                  />
                  <span>Aproveito que as ações estão mais baratas e compro mais cotas!</span>
                </label>
              </div>
            </div>

            {/* Question 2 */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
              <h4 className="text-xs sm:text-sm font-bold text-slate-900">
                2. Qual é a sua prioridade máxima com os investimentos?
              </h4>
              <div className="space-y-1.5 text-xs">
                <label className="flex items-center gap-2 p-2 rounded-lg hover:bg-white cursor-pointer">
                  <input
                    type="radio"
                    name="q2"
                    checked={quizAnswers.q2 === 'a'}
                    onChange={() => setQuizAnswers({ ...quizAnswers, q2: 'a' })}
                  />
                  <span>Segurança absoluta: não quero ver meu saldo diminuir em nenhum dia.</span>
                </label>
                <label className="flex items-center gap-2 p-2 rounded-lg hover:bg-white cursor-pointer">
                  <input
                    type="radio"
                    name="q2"
                    checked={quizAnswers.q2 === 'b'}
                    onChange={() => setQuizAnswers({ ...quizAnswers, q2: 'b' })}
                  />
                  <span>Equilíbrio: quero segurança na maior parte e um pouco de renda variável para render mais.</span>
                </label>
                <label className="flex items-center gap-2 p-2 rounded-lg hover:bg-white cursor-pointer">
                  <input
                    type="radio"
                    name="q2"
                    checked={quizAnswers.q2 === 'c'}
                    onChange={() => setQuizAnswers({ ...quizAnswers, q2: 'c' })}
                  />
                  <span>Multiplicação e renda passiva: aceito oscilações para ter grandes retornos no futuro.</span>
                </label>
              </div>
            </div>

            {/* Question 3 */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
              <h4 className="text-xs sm:text-sm font-bold text-slate-900">
                3. Por quanto tempo você planeja deixar esse dinheiro investido?
              </h4>
              <div className="space-y-1.5 text-xs">
                <label className="flex items-center gap-2 p-2 rounded-lg hover:bg-white cursor-pointer">
                  <input
                    type="radio"
                    name="q3"
                    checked={quizAnswers.q3 === 'a'}
                    onChange={() => setQuizAnswers({ ...quizAnswers, q3: 'a' })}
                  />
                  <span>Menos de 1 ano (vou precisar a qualquer momento).</span>
                </label>
                <label className="flex items-center gap-2 p-2 rounded-lg hover:bg-white cursor-pointer">
                  <input
                    type="radio"
                    name="q3"
                    checked={quizAnswers.q3 === 'b'}
                    onChange={() => setQuizAnswers({ ...quizAnswers, q3: 'b' })}
                  />
                  <span>De 2 a 5 anos (projetos futuros ou compra de bens).</span>
                </label>
                <label className="flex items-center gap-2 p-2 rounded-lg hover:bg-white cursor-pointer">
                  <input
                    type="radio"
                    name="q3"
                    checked={quizAnswers.q3 === 'c'}
                    onChange={() => setQuizAnswers({ ...quizAnswers, q3: 'c' })}
                  />
                  <span>Mais de 5 a 10 anos (aposentadoria, independência financeira).</span>
                </label>
              </div>
            </div>
          </div>

          {calculatedProfile && (
            <div className="p-5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-950 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 block mb-0.5">
                  Resultado do seu perfil:
                </span>
                <h4 className="text-xl font-extrabold capitalize text-slate-900">
                  Investidor {calculatedProfile}!
                </h4>
                <p className="text-xs text-slate-600 mt-1">
                  {calculatedProfile === 'conservador'
                    ? 'Seu foco principal é preservar o patrimônio com liquidez diária e zero oscilação negativa.'
                    : calculatedProfile === 'moderado'
                    ? 'Você busca o melhor dos dois mundos: base sólida em renda fixa com tempero de FIIs e ações para turbinar os ganhos.'
                    : 'Você entende que oscilações fazem parte e foca na multiplicação de patrimônio de longo prazo.'}
                </p>
              </div>

              <button
                onClick={() => {
                  setProfile(calculatedProfile);
                  setActiveSection('today');
                }}
                className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-md shadow-emerald-600/20 transition-all shrink-0 cursor-pointer"
              >
                Aplicar ao "Onde Investir Hoje"
              </button>
            </div>
          )}
        </div>
      )}

      {/* SECTION 4: DICIONÁRIO DO INVESTIDOR */}
      {activeSection === 'glossary' && (
        <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200/80 shadow-xs space-y-6">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <HelpCircle className="text-emerald-600" size={20} />
              <h3 className="text-lg font-bold text-slate-900">
                Dicionário Descomplicado da Bolsa & Investimentos
              </h3>
            </div>
            <p className="text-xs text-slate-500">
              Entenda os principais termos e siglas que aparecem no noticiário e nas corretoras.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
              <strong className="text-sm text-slate-900 block font-bold mb-1">
                Ticker (Código de Negociação)
              </strong>
              <p className="text-xs text-slate-600 leading-relaxed">
                As 4 letras e 1 número que identificam o ativo na B3. Exemplos: <strong>PETR4</strong> (Petrobras), <strong>VALE3</strong> (Vale), <strong>MXRF11</strong> (Fundo Imobiliário Maxi Renda).
              </p>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
              <strong className="text-sm text-slate-900 block font-bold mb-1">
                Dividend Yield (DY)
              </strong>
              <p className="text-xs text-slate-600 leading-relaxed">
                Percentual de proventos/aluguéis pagos pelo ativo nos últimos 12 meses em relação ao preço da cota. Um DY de 10% significa que você recebeu R$ 10 de proventos para cada R$ 100 investidos.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
              <strong className="text-sm text-slate-900 block font-bold mb-1">
                Home Broker
              </strong>
              <p className="text-xs text-slate-600 leading-relaxed">
                O aplicativo ou painel na sua corretora onde você digita o ticker e a quantidade de cotas que quer comprar ou vender na B3 com segurança.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
              <strong className="text-sm text-slate-900 block font-bold mb-1">
                Liquidez
              </strong>
              <p className="text-xs text-slate-600 leading-relaxed">
                A velocidade com que você consegue transformar o investimento em dinheiro vivo na sua conta. Liquidez Diária (D+0 ou D+1) significa dinheiro na mão imediatamente.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
              <strong className="text-sm text-slate-900 block font-bold mb-1">
                Tesouro Selic vs Tesouro IPCA+
              </strong>
              <p className="text-xs text-slate-600 leading-relaxed">
                O <strong>Selic</strong> acompanha a taxa de juros básica e nunca perde valor se resgatar antes do prazo. O <strong>IPCA+</strong> garante a inflação mais uma taxa fixa (ex: IPCA + 6.5%), blindando seu poder de compra.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
              <strong className="text-sm text-slate-900 block font-bold mb-1">
                Fundo Garantidor de Créditos (FGC)
              </strong>
              <p className="text-xs text-slate-600 leading-relaxed">
                Proteção oficial que garante até R$ 250.000 por CPF e por instituição caso o banco onde você colocou CDB ou LCI venha a quebrar.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
