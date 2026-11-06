import React, { useState, useMemo } from 'react';
import confetti from 'canvas-confetti';
import {
  Calculator,
  TrendingUp,
  PiggyBank,
  Tv,
  Trophy,
  Plus,
  ArrowRight,
  Sparkles,
  CheckCircle2,
  DollarSign,
  ArrowUpRight,
  ArrowDownRight,
  Flame,
  Percent,
  Calendar,
  Layers,
  Trash2,
} from 'lucide-react';
import { useFinance } from '../../context/FinanceContext';
import { PiggyBank as PiggyType, Subscription, Challenge } from '../../types/finance';
import { formatCurrency } from '../../utils/formatters';

export const ToolsAndGamificationTab: React.FC = () => {
  const {
    piggyBanks,
    addPiggyBank,
    depositPiggyBank,
    withdrawPiggyBank,
    deletePiggyBank,
    subscriptions,
    addSubscription,
    toggleSubscription,
    deleteSubscription,
    challenges,
    updateChallengeProgress,
    healthScore,
  } = useFinance();

  // Active sub-tool tab: 'simulators' | 'piggy' | 'subscriptions' | 'gamification'
  const [activeTool, setActiveTool] = useState<'simulators' | 'piggy' | 'subscriptions' | 'gamification'>('simulators');

  // --- 1. Calculadora de Parcelamentos State ---
  const [cashPrice, setCashPrice] = useState('1000');
  const [cashDiscount, setCashDiscount] = useState('10'); // % de desconto à vista
  const [installmentCount, setInstallmentCount] = useState('10'); // parcelas
  const [installmentAmount, setInstallmentAmount] = useState('100'); // valor de cada parcela
  const [opportunityRate, setOpportunityRate] = useState('12'); // % CDI ao ano

  const installmentComparison = useMemo(() => {
    const cash = parseFloat(cashPrice.replace(',', '.')) || 0;
    const discount = parseFloat(cashDiscount.replace(',', '.')) || 0;
    const n = parseInt(installmentCount, 10) || 1;
    const parcelValue = parseFloat(installmentAmount.replace(',', '.')) || 0;
    const cdiAnnual = parseFloat(opportunityRate.replace(',', '.')) || 0;

    const actualCashPrice = cash * (1 - discount / 100);
    const totalInstallmentPrice = n * parcelValue;
    const monthlyRate = Math.pow(1 + cdiAnnual / 100, 1 / 12) - 1;

    // Simulation: if paying in installments and leaving the cash invested
    let investedCapital = actualCashPrice;
    for (let i = 0; i < n; i++) {
      investedCapital = investedCapital * (1 + monthlyRate) - parcelValue;
    }

    const difference = totalInstallmentPrice - actualCashPrice;
    const recommendation =
      actualCashPrice < totalInstallmentPrice && (difference / (cash || 1)) * 100 > 5
        ? 'Pagar à vista com desconto é a melhor opção!'
        : 'Parcelar sem juros mantendo o dinheiro investido pode ser mais vantajoso.';

    return {
      actualCashPrice,
      totalInstallmentPrice,
      difference,
      recommendation,
      isCashBetter: actualCashPrice < totalInstallmentPrice,
    };
  }, [cashPrice, cashDiscount, installmentCount, installmentAmount, opportunityRate]);

  // --- 2. Simulador de Investimentos State (Juros Compostos CDI vs Selic vs Poupança) ---
  const [initialInvestment, setInitialInvestment] = useState('1000');
  const [monthlyContribution, setMonthlyContribution] = useState('300');
  const [investmentMonths, setInvestmentMonths] = useState('24');
  const [selicRate, setSelicRate] = useState('12.25'); // Taxa Selic anual %

  const investmentSimulation = useMemo(() => {
    const p0 = parseFloat(initialInvestment.replace(',', '.')) || 0;
    const pm = parseFloat(monthlyContribution.replace(',', '.')) || 0;
    const months = parseInt(investmentMonths, 10) || 12;
    const annualSelic = (parseFloat(selicRate.replace(',', '.')) || 10) / 100;

    // CDI / Tesouro Selic (100% CDI ~ Selic - 0.10%)
    const monthlyCdi = Math.pow(1 + annualSelic, 1 / 12) - 1;
    // Poupança (TR + 0.5% ao mês ou 70% Selic)
    const annualPoupança = annualSelic <= 0.085 ? annualSelic * 0.7 : 0.0617;
    const monthlyPoupança = Math.pow(1 + annualPoupança, 1 / 12) - 1;

    let balanceCdb = p0;
    let balancePoupança = p0;
    let totalInvested = p0;

    const timeline = [];

    for (let m = 1; m <= months; m++) {
      balanceCdb = balanceCdb * (1 + monthlyCdi) + pm;
      balancePoupança = balancePoupança * (1 + monthlyPoupança) + pm;
      totalInvested += pm;

      if (m % Math.max(1, Math.floor(months / 6)) === 0 || m === months) {
        timeline.push({
          month: m,
          invested: totalInvested,
          cdb: balanceCdb,
          poupança: balancePoupança,
        });
      }
    }

    const netInterestCdb = balanceCdb - totalInvested;
    const netInterestPoupança = balancePoupança - totalInvested;

    return {
      totalInvested,
      finalCdb: balanceCdb,
      finalPoupança: balancePoupança,
      netInterestCdb,
      netInterestPoupança,
      advantage: balanceCdb - balancePoupança,
      timeline,
    };
  }, [initialInvestment, monthlyContribution, investmentMonths, selicRate]);

  // --- 3. Cofrinhos State ---
  const [isPiggyModalOpen, setIsPiggyModalOpen] = useState(false);
  const [newPiggyName, setNewPiggyName] = useState('');
  const [newPiggyTarget, setNewPiggyTarget] = useState('');
  const [newPiggyColor, setNewPiggyColor] = useState('#3b82f6');

  const [activePiggyAction, setActivePiggyAction] = useState<{
    id: string;
    type: 'deposit' | 'withdraw';
  } | null>(null);
  const [piggyActionAmount, setPiggyActionAmount] = useState('');

  const handleCreatePiggy = (e: React.FormEvent) => {
    e.preventDefault();
    const target = parseFloat(newPiggyTarget.replace(',', '.'));
    if (!newPiggyName.trim() || isNaN(target) || target <= 0) return;
    addPiggyBank({
      name: newPiggyName.trim(),
      targetAmount: target,
      color: newPiggyColor,
      icon: 'PiggyBank',
    });
    setNewPiggyName('');
    setNewPiggyTarget('');
    setIsPiggyModalOpen(false);
  };

  const handleExecutePiggyAction = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activePiggyAction) return;
    const val = parseFloat(piggyActionAmount.replace(',', '.'));
    if (isNaN(val) || val <= 0) return;

    if (activePiggyAction.type === 'deposit') {
      depositPiggyBank(activePiggyAction.id, val);
      confetti({ particleCount: 40, spread: 60, origin: { y: 0.7 } });
    } else {
      withdrawPiggyBank(activePiggyAction.id, val);
    }

    setPiggyActionAmount('');
    setActivePiggyAction(null);
  };

  // --- 4. Assinaturas Totais ---
  const [isSubModalOpen, setIsSubModalOpen] = useState(false);
  const [newSubName, setNewSubName] = useState('');
  const [newSubAmount, setNewSubAmount] = useState('');
  const [newSubRenewal, setNewSubRenewal] = useState('10');
  const [newSubCategory, setNewSubCategory] = useState('Streaming');

  const handleCreateSub = (e: React.FormEvent) => {
    e.preventDefault();
    const val = parseFloat(newSubAmount.replace(',', '.'));
    if (!newSubName.trim() || isNaN(val) || val <= 0) return;
    addSubscription({
      name: newSubName.trim(),
      amount: val,
      billingCycle: 'monthly',
      renewalDay: parseInt(newSubRenewal, 10) || 1,
      category: newSubCategory,
      active: true,
      icon: 'Tv',
    });
    setNewSubName('');
    setNewSubAmount('');
    setIsSubModalOpen(false);
  };

  const activeSubscriptionsTotal = subscriptions
    .filter((s) => s.active)
    .reduce((acc, s) => acc + s.amount, 0);

  // Trigger celebration confetti on challenge completion
  const handleCompleteChallenge = (id: string) => {
    updateChallengeProgress(id, 100);
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
    });
  };

  return (
    <div className="space-y-8 animate-fade-in pb-12">
      {/* Sub-navigation Tabs */}
      <div className="flex items-center gap-2 p-1 bg-slate-100 rounded-2xl max-w-xl mx-auto border border-slate-200">
        <button
          onClick={() => setActiveTool('simulators')}
          className={`flex-1 py-2 px-3 rounded-xl text-xs sm:text-sm font-bold transition-all ${
            activeTool === 'simulators'
              ? 'bg-white text-slate-900 shadow-sm'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <span className="flex items-center justify-center gap-1.5">
            <Calculator size={15} />
            Simuladores
          </span>
        </button>

        <button
          onClick={() => setActiveTool('piggy')}
          className={`flex-1 py-2 px-3 rounded-xl text-xs sm:text-sm font-bold transition-all ${
            activeTool === 'piggy'
              ? 'bg-white text-slate-900 shadow-sm'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <span className="flex items-center justify-center gap-1.5">
            <PiggyBank size={15} />
            Cofrinhos
          </span>
        </button>

        <button
          onClick={() => setActiveTool('subscriptions')}
          className={`flex-1 py-2 px-3 rounded-xl text-xs sm:text-sm font-bold transition-all ${
            activeTool === 'subscriptions'
              ? 'bg-white text-slate-900 shadow-sm'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <span className="flex items-center justify-center gap-1.5">
            <Tv size={15} />
            Assinaturas
          </span>
        </button>

        <button
          onClick={() => setActiveTool('gamification')}
          className={`flex-1 py-2 px-3 rounded-xl text-xs sm:text-sm font-bold transition-all ${
            activeTool === 'gamification'
              ? 'bg-white text-slate-900 shadow-sm'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <span className="flex items-center justify-center gap-1.5">
            <Trophy size={15} />
            Desafios
          </span>
        </button>
      </div>

      {/* VIEW 1: SIMULADORES (PARCELAMENTO E INVESTIMENTOS) */}
      {activeTool === 'simulators' && (
        <div className="space-y-8">
          {/* Calculadora de Parcelamento */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs">
            <div className="flex items-center gap-2 mb-2">
              <Percent className="text-emerald-600" size={20} />
              <h3 className="text-lg font-bold text-slate-900">
                Calculadora de Parcelamento: À Vista com Desconto vs A Prazo
              </h3>
            </div>
            <p className="text-xs text-slate-500 mb-6">
              Descubra se compensa pagar à vista com desconto ou parcelar no cartão e render o dinheiro no CDI.
            </p>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Form Inputs */}
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Preço Nominal (R$)
                    </label>
                    <input
                      type="number"
                      value={cashPrice}
                      onChange={(e) => setCashPrice(e.target.value)}
                      className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Desconto à Vista (%)
                    </label>
                    <input
                      type="number"
                      value={cashDiscount}
                      onChange={(e) => setCashDiscount(e.target.value)}
                      className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Número de Parcelas
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="48"
                      value={installmentCount}
                      onChange={(e) => setInstallmentCount(e.target.value)}
                      className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Valor da Parcela (R$)
                    </label>
                    <input
                      type="number"
                      value={installmentAmount}
                      onChange={(e) => setInstallmentAmount(e.target.value)}
                      className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Taxa de Rendimento (CDI / Selic % ao ano)
                  </label>
                  <input
                    type="number"
                    step="0.25"
                    value={opportunityRate}
                    onChange={(e) => setOpportunityRate(e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              {/* Result Summary */}
              <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200/80 flex flex-col justify-between">
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-500 block mb-2">
                    Comparativo Financeiro
                  </span>

                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div className="p-3 rounded-xl bg-white border border-slate-200">
                      <span className="text-[11px] text-slate-500 block">Total À Vista:</span>
                      <strong className="text-base text-emerald-600 block">
                        {formatCurrency(installmentComparison.actualCashPrice)}
                      </strong>
                    </div>

                    <div className="p-3 rounded-xl bg-white border border-slate-200">
                      <span className="text-[11px] text-slate-500 block">
                        Total a Prazo ({installmentCount}x):
                      </span>
                      <strong className="text-base text-slate-900 block">
                        {formatCurrency(installmentComparison.totalInstallmentPrice)}
                      </strong>
                    </div>
                  </div>

                  <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900">
                    <div className="flex items-center gap-2 font-bold text-xs mb-1">
                      <Sparkles size={16} className="text-emerald-600" />
                      <span>Veredito FinanSmart:</span>
                    </div>
                    <p className="text-xs leading-relaxed">{installmentComparison.recommendation}</p>
                    {installmentComparison.difference > 0 && (
                      <p className="text-[11px] text-emerald-700 mt-2">
                        Economia direta de <strong>{formatCurrency(installmentComparison.difference)}</strong> pagando à vista.
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Simulador de Investimentos (Poupança vs Tesouro Selic / 100% CDI) */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="text-teal-600" size={20} />
              <h3 className="text-lg font-bold text-slate-900">
                Simulador de Investimentos: Poupança vs 100% CDI / Tesouro Selic
              </h3>
            </div>
            <p className="text-xs text-slate-500 mb-6">
              Simule quanto seu dinheiro rende com aportes mensais e o poder dos juros compostos.
            </p>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Aporte Inicial (R$)
                </label>
                <input
                  type="number"
                  value={initialInvestment}
                  onChange={(e) => setInitialInvestment(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Aporte Mensal (R$)
                </label>
                <input
                  type="number"
                  value={monthlyContribution}
                  onChange={(e) => setMonthlyContribution(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Prazo em Meses
                </label>
                <input
                  type="number"
                  min="3"
                  max="120"
                  value={investmentMonths}
                  onChange={(e) => setInvestmentMonths(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500"
                />
              </div>
            </div>

            {/* Results Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                <span className="text-xs text-slate-500 block">Total Investido do Bolso</span>
                <span className="text-xl font-extrabold text-slate-800">
                  {formatCurrency(investmentSimulation.totalInvested)}
                </span>
              </div>

              <div className="p-4 rounded-xl bg-teal-50 border border-teal-200">
                <span className="text-xs text-teal-700 font-semibold block">
                  Final no 100% CDI / Selic
                </span>
                <span className="text-xl font-extrabold text-teal-900">
                  {formatCurrency(investmentSimulation.finalCdb)}
                </span>
                <span className="text-[11px] text-teal-700 block mt-1">
                  Rendeu: +{formatCurrency(investmentSimulation.netInterestCdb)} em juros!
                </span>
              </div>

              <div className="p-4 rounded-xl bg-amber-50 border border-amber-200">
                <span className="text-xs text-amber-700 font-semibold block">Final na Poupança</span>
                <span className="text-xl font-extrabold text-amber-900">
                  {formatCurrency(investmentSimulation.finalPoupança)}
                </span>
                <span className="text-[11px] text-amber-700 block mt-1">
                  Você deixaria de ganhar: {formatCurrency(investmentSimulation.advantage)}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* VIEW 2: COFRINHOS (PIGGY BANKS) */}
      {activeTool === 'piggy' && (
        <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div>
              <div className="flex items-center gap-2">
                <PiggyBank className="text-pink-600" size={20} />
                <h3 className="text-lg font-bold text-slate-900">
                  Cofrinhos para Objetivos Específicos
                </h3>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                Separe dinheiro para o IPVA, festas, presentes ou viagens sem misturar com sua conta corrente.
              </p>
            </div>

            <button
              onClick={() => setIsPiggyModalOpen(true)}
              className="flex items-center gap-1.5 px-4 py-2 bg-pink-600 hover:bg-pink-700 text-white rounded-xl text-xs sm:text-sm font-bold shadow-md shadow-pink-600/20 transition-all cursor-pointer"
            >
              <Plus size={16} />
              <span>Novo Cofrinho</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {piggyBanks.map((piggy) => {
              const percent = Math.min(
                100,
                Math.round((piggy.balance / (piggy.targetAmount || 1)) * 100)
              );

              return (
                <div
                  key={piggy.id}
                  className="p-5 rounded-2xl border border-slate-200/80 bg-slate-50/50 hover:bg-slate-50 transition-all flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div className="flex items-center gap-2">
                        <div
                          className="w-8 h-8 rounded-xl flex items-center justify-center text-white"
                          style={{ backgroundColor: piggy.color }}
                        >
                          <PiggyBank size={18} />
                        </div>
                        <h4 className="font-bold text-sm text-slate-900">{piggy.name}</h4>
                      </div>
                      <button
                        onClick={() => {
                          if (confirm(`Remover cofrinho "${piggy.name}"?`)) deletePiggyBank(piggy.id);
                        }}
                        className="text-slate-400 hover:text-rose-600 p-1"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>

                    <div className="flex items-baseline gap-2 mb-3 mt-2">
                      <span className="text-2xl font-extrabold text-slate-900">
                        {formatCurrency(piggy.balance)}
                      </span>
                      <span className="text-xs text-slate-500">
                        de {formatCurrency(piggy.targetAmount)}
                      </span>
                    </div>

                    {/* Progress Bar */}
                    <div className="space-y-1.5 mb-3">
                      <div className="flex justify-between text-xs font-semibold text-slate-600">
                        <span>Acumulado</span>
                        <span className="text-pink-600 font-bold">{percent}%</span>
                      </div>
                      <div className="w-full bg-slate-200 h-2.5 rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all duration-500"
                          style={{
                            width: `${percent}%`,
                            backgroundColor: piggy.color,
                          }}
                        ></div>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 pt-3 border-t border-slate-200/60">
                    <button
                      onClick={() => setActivePiggyAction({ id: piggy.id, type: 'deposit' })}
                      className="flex-1 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl transition-colors cursor-pointer"
                    >
                      + Guardar
                    </button>
                    <button
                      onClick={() => setActivePiggyAction({ id: piggy.id, type: 'withdraw' })}
                      className="flex-1 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-700 text-xs font-bold rounded-xl transition-colors cursor-pointer"
                    >
                      Resgatar
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* VIEW 3: CONTROLE DE ASSINATURAS */}
      {activeTool === 'subscriptions' && (
        <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div>
              <div className="flex items-center gap-2">
                <Tv className="text-purple-600" size={20} />
                <h3 className="text-lg font-bold text-slate-900">
                  Controle de Assinaturas & Recorrências
                </h3>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                Netflix, Spotify, Prime e academias: acompanhe o impacto acumulado no ano.
              </p>
            </div>

            <button
              onClick={() => setIsSubModalOpen(true)}
              className="flex items-center gap-1.5 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs sm:text-sm font-bold shadow-md shadow-purple-600/20 transition-all cursor-pointer"
            >
              <Plus size={16} />
              <span>Nova Assinatura</span>
            </button>
          </div>

          {/* Subscriptions Metrics Banner */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
            <div className="p-4 rounded-xl bg-purple-50/60 border border-purple-100 flex items-center justify-between">
              <div>
                <span className="text-xs text-purple-700 font-semibold block">Total Mensal</span>
                <span className="text-2xl font-extrabold text-purple-950">
                  {formatCurrency(activeSubscriptionsTotal)} / mês
                </span>
              </div>
              <span className="text-xs text-purple-600">
                {subscriptions.filter((s) => s.active).length} ativas
              </span>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
              <div>
                <span className="text-xs text-slate-500 font-semibold block">Custo Projetado Anual</span>
                <span className="text-2xl font-extrabold text-slate-900">
                  {formatCurrency(activeSubscriptionsTotal * 12)} / ano
                </span>
              </div>
              <span className="text-xs text-slate-500">12 meses</span>
            </div>
          </div>

          {/* Subscriptions List */}
          <div className="divide-y divide-slate-100 border border-slate-200/80 rounded-2xl overflow-hidden">
            {subscriptions.map((sub) => (
              <div
                key={sub.id}
                className="p-4 hover:bg-slate-50 flex items-center justify-between gap-3"
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-xs ${
                      sub.active ? 'bg-purple-100 text-purple-700' : 'bg-slate-100 text-slate-400'
                    }`}
                  >
                    <Tv size={16} />
                  </div>
                  <div>
                    <h4
                      className={`text-sm font-bold ${
                        sub.active ? 'text-slate-900' : 'text-slate-400 line-through'
                      }`}
                    >
                      {sub.name}
                    </h4>
                    <span className="text-xs text-slate-500">
                      Renovação todo dia {sub.renewalDay} • {sub.category}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <span
                    className={`text-sm font-extrabold ${
                      sub.active ? 'text-slate-900' : 'text-slate-400'
                    }`}
                  >
                    {formatCurrency(sub.amount)}
                  </span>

                  <button
                    onClick={() => toggleSubscription(sub.id)}
                    className={`px-3 py-1 rounded-xl text-xs font-bold transition-all ${
                      sub.active
                        ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {sub.active ? 'Ativa' : 'Pausada'}
                  </button>

                  <button
                    onClick={() => {
                      if (confirm(`Remover assinatura "${sub.name}"?`)) deleteSubscription(sub.id);
                    }}
                    className="p-1 text-slate-400 hover:text-rose-600"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* VIEW 4: GAMIFICAÇÃO & DESAFIOS DE ECONOMIA */}
      {activeTool === 'gamification' && (
        <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div>
              <div className="flex items-center gap-2">
                <Trophy className="text-amber-500" size={20} />
                <h3 className="text-lg font-bold text-slate-900">
                  Desafios de Economia & Conquistas
                </h3>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                Transforme hábitos financeiros em metas divertidas e suba de nível!
              </p>
            </div>

            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs font-bold">
              <Sparkles size={16} className="text-amber-600" />
              <span>Pontos Acumulados: {healthScore.points} pts</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {challenges.map((ch) => {
              const percent = Math.min(100, Math.round((ch.progress / ch.target) * 100));

              return (
                <div
                  key={ch.id}
                  className={`p-5 rounded-2xl border transition-all ${
                    ch.completed
                      ? 'border-emerald-200 bg-emerald-50/40'
                      : 'border-slate-200/80 bg-slate-50/50 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-base font-bold text-slate-900">{ch.title}</span>
                        {ch.completed && (
                          <span className="flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                            <CheckCircle2 size={12} /> Concluído
                          </span>
                        )}
                      </div>
                      <span className="text-[11px] text-amber-700 font-semibold block">
                        Medalha: "{ch.badge}" • +{ch.rewardPoints} pts
                      </span>
                    </div>

                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                        ch.difficulty === 'Fácil'
                          ? 'bg-blue-100 text-blue-800'
                          : ch.difficulty === 'Médio'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-rose-100 text-rose-800'
                      }`}
                    >
                      {ch.difficulty}
                    </span>
                  </div>

                  <p className="text-xs text-slate-600 mb-3">{ch.description}</p>

                  <div className="space-y-1.5 mb-4">
                    <div className="flex justify-between text-xs text-slate-500">
                      <span>Progresso: {ch.progress} / {ch.target} {ch.unit}</span>
                      <span className="font-bold">{percent}%</span>
                    </div>
                    <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all ${
                          ch.completed ? 'bg-emerald-500' : 'bg-amber-500'
                        }`}
                        style={{ width: `${percent}%` }}
                      ></div>
                    </div>
                  </div>

                  {!ch.completed && (
                    <button
                      onClick={() => handleCompleteChallenge(ch.id)}
                      className="w-full py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer flex items-center justify-center gap-1.5"
                    >
                      <Sparkles size={14} />
                      <span>Concluir Desafio</span>
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Modal: Novo Cofrinho */}
      {isPiggyModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="w-full max-w-sm bg-white rounded-2xl p-6 shadow-2xl border border-slate-100">
            <h3 className="text-lg font-bold text-slate-900 mb-1">Criar Novo Cofrinho</h3>
            <p className="text-xs text-slate-500 mb-4">Separe uma reserva com valor alvo</p>
            <form onSubmit={handleCreatePiggy} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Nome do Cofrinho</label>
                <input
                  type="text"
                  required
                  value={newPiggyName}
                  onChange={(e) => setNewPiggyName(e.target.value)}
                  placeholder="Ex: Reforma do Quarto, IPVA 2027"
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-pink-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Valor Alvo (R$)</label>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={newPiggyTarget}
                  onChange={(e) => setNewPiggyTarget(e.target.value)}
                  placeholder="Ex: 2000"
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-pink-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsPiggyModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-bold text-white bg-pink-600 hover:bg-pink-700 rounded-xl cursor-pointer"
                >
                  Criar Cofrinho
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Aporte ou Resgate em Cofrinho */}
      {activePiggyAction && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="w-full max-w-sm bg-white rounded-2xl p-6 shadow-2xl border border-slate-100">
            <h3 className="text-lg font-bold text-slate-900 mb-1">
              {activePiggyAction.type === 'deposit' ? 'Guardar no Cofrinho' : 'Resgatar do Cofrinho'}
            </h3>
            <p className="text-xs text-slate-500 mb-4">Informe o valor da transação</p>
            <form onSubmit={handleExecutePiggyAction} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Valor (R$)</label>
                <input
                  type="number"
                  step="0.01"
                  required
                  autoFocus
                  value={piggyActionAmount}
                  onChange={(e) => setPiggyActionAmount(e.target.value)}
                  placeholder="Ex: 100.00"
                  className="w-full px-3 py-2 text-lg font-bold border border-slate-200 rounded-xl focus:ring-2 focus:ring-pink-500"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setActivePiggyAction(null)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-bold text-white bg-pink-600 hover:bg-pink-700 rounded-xl cursor-pointer"
                >
                  Confirmar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Nova Assinatura */}
      {isSubModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="w-full max-w-sm bg-white rounded-2xl p-6 shadow-2xl border border-slate-100">
            <h3 className="text-lg font-bold text-slate-900 mb-1">Adicionar Assinatura</h3>
            <p className="text-xs text-slate-500 mb-4">Controle serviços mensais recorrentes</p>
            <form onSubmit={handleCreateSub} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Nome do Serviço</label>
                <input
                  type="text"
                  required
                  value={newSubName}
                  onChange={(e) => setNewSubName(e.target.value)}
                  placeholder="Ex: Disney+, Gympass, ChatGPT"
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Valor Mensal (R$)</label>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={newSubAmount}
                  onChange={(e) => setNewSubAmount(e.target.value)}
                  placeholder="Ex: 39.90"
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Dia de Renovação</label>
                <input
                  type="number"
                  min="1"
                  max="31"
                  value={newSubRenewal}
                  onChange={(e) => setNewSubRenewal(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsSubModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-bold text-white bg-purple-600 hover:bg-purple-700 rounded-xl cursor-pointer"
                >
                  Salvar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
