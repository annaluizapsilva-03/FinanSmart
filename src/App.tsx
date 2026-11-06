import React, { useState } from 'react';
import { FinanceProvider, useFinance } from './context/FinanceContext';
import { Navbar, ActiveTab } from './components/layout/Navbar';
import { DashboardTab } from './components/dashboard/DashboardTab';
import { TransactionsTab } from './components/transactions/TransactionsTab';
import { PlanningTab } from './components/planning/PlanningTab';
import { InvestmentsTab } from './components/investments/InvestmentsTab';
import { AIAssistantTab } from './components/ai/AIAssistantTab';
import { PaymentsTab } from './components/payments/PaymentsTab';
import { ToolsAndGamificationTab } from './components/tools/ToolsAndGamificationTab';
import { TransactionModal } from './components/transactions/TransactionModal';
import { PrintReportModal } from './components/reports/PrintReportModal';
import { Transaction } from './types/finance';

function MainContent() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard');
  const [isTransactionModalOpen, setIsTransactionModalOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [isPrintReportOpen, setIsPrintReportOpen] = useState(false);

  const handleOpenNewTransaction = () => {
    setEditingTransaction(null);
    setIsTransactionModalOpen(true);
  };

  const handleEditTransaction = (tx: Transaction) => {
    setEditingTransaction(tx);
    setIsTransactionModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans selection:bg-emerald-500 selection:text-white">
      {/* Top Navbar with Month Selector and Global Health Score */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenNewTransaction={handleOpenNewTransaction}
        onOpenPrintReport={() => setIsPrintReportOpen(true)}
      />

      {/* Main View Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-12">
        {activeTab === 'dashboard' && (
          <DashboardTab
            setActiveTab={setActiveTab}
            onOpenNewTransaction={handleOpenNewTransaction}
          />
        )}

        {activeTab === 'transactions' && (
          <TransactionsTab
            onOpenNewTransaction={handleOpenNewTransaction}
            onEditTransaction={handleEditTransaction}
          />
        )}

        {activeTab === 'planning' && <PlanningTab />}

        {activeTab === 'investments' && <InvestmentsTab />}

        {activeTab === 'ai' && <AIAssistantTab />}

        {activeTab === 'payments' && <PaymentsTab />}

        {activeTab === 'tools' && <ToolsAndGamificationTab />}
      </main>

      {/* Transaction Modal (Add / Edit) */}
      <TransactionModal
        isOpen={isTransactionModalOpen}
        onClose={() => {
          setIsTransactionModalOpen(false);
          setEditingTransaction(null);
        }}
        editingTransaction={editingTransaction}
      />

      {/* Executive Printable Report Modal (PDF) */}
      <PrintReportModal
        isOpen={isPrintReportOpen}
        onClose={() => setIsPrintReportOpen(false)}
      />
    </div>
  );
}

export default function App() {
  return (
    <FinanceProvider>
      <MainContent />
    </FinanceProvider>
  );
}
