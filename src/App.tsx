import React, { useState, useEffect } from 'react';
import { SettingsProvider } from './contexts/SettingsContext';
import * as db from './services/databaseService';
import { Transaction, BudgetGoal } from './types';

// Componentes
import Header from './components/Header';
import BottomNav from './components/BottomNav';
import LandingPage from './components/LandingPage';
import DashboardScreen from './components/DashboardScreen';
import BudgetScreen from './components/BudgetScreen';
import HistoryScreen from './components/HistoryScreen';
import AddTransactionScreen from './components/AddTransactionScreen';
import SavingsScreen from './components/SavingsScreen';

// Contenedor principal para usar el contexto
const MainApp = () => {
  // Estado de Acceso (Landing vs App)
  const [hasAccess, setHasAccess] = useState(() => {
    return localStorage.getItem('simpleBudgetHasAccess') === 'true';
  });

  // Navegación
  const [currentView, setCurrentView] = useState<'dashboard' | 'budget' | 'history'>('dashboard');
  const [showAddTransaction, setShowAddTransaction] = useState(false);
  const [showSavingsModal, setShowSavingsModal] = useState(false);
  
  // Datos Globales
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [goals, setGoals] = useState<BudgetGoal[]>([]);
  const [savingsDist, setSavingsDist] = useState<any[]>([]); 

  useEffect(() => {
    if (hasAccess) {
      loadGlobalData();
    }
  }, [hasAccess, currentView]); 

  const loadGlobalData = async () => {
    const t = await db.getAllTransactions();
    setTransactions(t);
    const g = await db.getAllGoals();
    setGoals(g);
    const s = await db.getSavingsDistribution();
    setSavingsDist(s);
  };

  const handleEnterApp = () => {
    localStorage.setItem('simpleBudgetHasAccess', 'true');
    setHasAccess(true);
  };

  // Si no tiene acceso, mostrar Landing Page
  if (!hasAccess) {
    return <LandingPage onEnterApp={handleEnterApp} />;
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 font-sans transition-colors duration-200">
      
      {/* Header fijo */}
      <Header onSettingsClick={() => alert('Configuración próximamente')} />

      {/* Contenido Principal */}
      <main className="pt-16 pb-20 min-h-screen">
        
        {currentView === 'dashboard' && (
          <DashboardScreen 
            transactions={transactions}
            goals={goals}
            onEditTransaction={(t) => {}}
            onDeleteTransaction={(id) => {}}
            onNavigateToSavings={() => setShowSavingsModal(true)}
            onAddClick={() => setShowAddTransaction(true)}
          />
        )}

        {currentView === 'budget' && (
          <BudgetScreen />
        )}

        {currentView === 'history' && (
          <HistoryScreen transactions={transactions} />
        )}

      </main>

      {/* Menú Inferior */}
      <BottomNav currentView={currentView} setView={setCurrentView} />

      {/* Modales */}
      {showAddTransaction && (
        <AddTransactionScreen 
          onClose={() => setShowAddTransaction(false)}
          onSubmit={() => {
            setShowAddTransaction(false);
            loadGlobalData(); 
          }}
        />
      )}

      {showSavingsModal && (
        <SavingsScreen 
          transactions={transactions}
          savingsDistribution={savingsDist}
          onClose={() => setShowSavingsModal(false)}
        />
      )}

    </div>
  );
};

// Wrapper para proveer el contexto
function App() {
  return (
    <SettingsProvider>
      <MainApp />
    </SettingsProvider>
  );
}

export default App;