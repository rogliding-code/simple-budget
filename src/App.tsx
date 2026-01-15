
import React, { useState, useEffect, useCallback, useContext } from 'react';
import { Transaction, BudgetGoal, View, SavingsDistribution } from './types';
import * as db from './services/databaseService';
import Header from './components/Header';
import DeletionAlert from './components/DeletionAlert';
import SettingsScreen from './components/SettingsScreen';
import DashboardScreen from './components/DashboardScreen';
import BudgetScreen from './components/BudgetScreen';
import AddTransactionScreen from './components/AddTransactionScreen';
import HistoryScreen from './components/HistoryScreen';
import SavingsScreen from './components/SavingsScreen';
import BottomNav from './components/BottomNav';
import LandingPage from './components/LandingPage';
import { SettingsContext } from './contexts/SettingsContext';

const App: React.FC = () => {
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [goals, setGoals] = useState<BudgetGoal[]>([]);
    const [savingsDistribution, setSavingsDistribution] = useState<SavingsDistribution[]>([]);
    const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
    const [showDeletionAlert, setShowDeletionAlert] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [view, setView] = useState<View>('dashboard');
    const [showSavings, setShowSavings] = useState(false);
    const { isDarkMode } = useContext(SettingsContext);

    const [isUnlocked, setIsUnlocked] = useState(false);
    const [isAuthLoading, setIsAuthLoading] = useState(true);

    const refreshData = useCallback(async () => {
        setIsLoading(true);
        try {
            const [fetchedTransactions, fetchedGoals, fetchedDistribution] = await Promise.all([
                db.getAllTransactions(),
                db.getAllGoals(),
                db.getSavingsDistribution(),
            ]);
            setTransactions(fetchedTransactions.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
            setGoals(fetchedGoals);
            setSavingsDistribution(fetchedDistribution);
        } catch (error) {
            console.error("Error refreshing data:", error);
        } finally {
            setIsLoading(false);
        }
    }, []);

    // Check for access on initial load
    useEffect(() => {
        const checkAccess = () => {
            try {
                if (localStorage.getItem('app_unlocked') === 'true') {
                    setIsUnlocked(true);
                }
            } catch (e) {
                console.error("Could not access localStorage", e);
            } finally {
                setIsAuthLoading(false);
            }
        };
        checkAccess();
    }, []);

    // Initialize DB and load data only after access is granted
    useEffect(() => {
        if (!isUnlocked) return;

        const initializeApp = async () => {
            await db.initDB();
            const deletedCount = await db.deleteOldTransactions();
            if (deletedCount > 0) {
                console.log(`Successfully deleted ${deletedCount} old transaction(s).`);
            }
            const needsAlert = await db.checkDeletionAlert();
            setShowDeletionAlert(needsAlert);
            await refreshData();
        };

        initializeApp();
    }, [isUnlocked, refreshData]);

    const handleEnterApp = () => {
        try {
            localStorage.setItem('app_unlocked', 'true');
        } catch(e) {
            console.error("Could not save to localStorage", e);
        }
        setIsUnlocked(true);
    };

    const handleAddOrUpdateTransaction = async (transaction: Omit<Transaction, 'id'> | Transaction) => {
        if ('id' in transaction && transaction.id) {
            await db.updateTransaction(transaction);
        } else {
            await db.addTransaction(transaction as Omit<Transaction, 'id'>);
        }
        setEditingTransaction(null);
        setView('dashboard');
        await refreshData();
    };

    const handleDeleteTransaction = async (id: number) => {
        await db.deleteTransaction(id);
        await refreshData();
    };
    
    const handleEditTransaction = (transaction: Transaction) => {
        setEditingTransaction(transaction);
        setView('addTransaction');
    };
    
    const handleBatchUpdateGoals = async (updatedGoals: BudgetGoal[]) => {
        await Promise.all(updatedGoals.map(goal => db.updateGoal(goal)));
        await refreshData();
    };

    const handleSaveDistribution = async (distribution: SavingsDistribution[]) => {
        await db.saveSavingsDistribution(distribution);
        await refreshData();
    };

    const renderMainView = () => {
        if (isLoading) {
            return (
                 <div className="flex justify-center items-center h-full pt-16">
                    <p className="text-lg text-gray-500 dark:text-gray-400">Loading your financial data...</p>
                </div>
            )
        }
        switch (view) {
            case 'dashboard':
                return <DashboardScreen 
                            transactions={transactions} 
                            goals={goals} 
                            onEditTransaction={handleEditTransaction} 
                            onDeleteTransaction={handleDeleteTransaction} 
                            onNavigateToSavings={() => setShowSavings(true)}
                            onAddTransaction={() => setView('addTransaction')}
                        />;
            case 'budget':
                return <BudgetScreen 
                            goals={goals} 
                            onBatchUpdateGoals={handleBatchUpdateGoals}
                            savingsDistribution={savingsDistribution}
                            onSaveDistribution={handleSaveDistribution}
                        />;
            case 'history':
                return <HistoryScreen transactions={transactions} />;
            default:
                return <DashboardScreen 
                            transactions={transactions} 
                            goals={goals} 
                            onEditTransaction={handleEditTransaction} 
                            onDeleteTransaction={handleDeleteTransaction} 
                            onNavigateToSavings={() => setShowSavings(true)} 
                            onAddTransaction={() => setView('addTransaction')}
                        />;
        }
    }

    if (isAuthLoading) {
        return <div className="min-h-screen bg-gray-50 dark:bg-gray-900" />;
    }

    if (!isUnlocked) {
        return <LandingPage onEnterApp={handleEnterApp} />;
    }

    return (
        <div className={`min-h-screen ${isDarkMode ? 'dark bg-gray-900' : 'bg-white'} text-gray-800 dark:text-gray-200`}>
            <Header onSettingsClick={() => setView('settings')} />
            <main className="container mx-auto p-4 pb-24">
                {showDeletionAlert && <DeletionAlert onClose={() => setShowDeletionAlert(false)} />}
                {renderMainView()}
            </main>
            
            { (view === 'dashboard' || view === 'budget' || view === 'history') && <BottomNav currentView={view} setView={setView} /> }

            {view === 'addTransaction' && (
                <AddTransactionScreen 
                    onClose={() => { setEditingTransaction(null); setView('dashboard'); }}
                    onSubmit={handleAddOrUpdateTransaction}
                    editingTransaction={editingTransaction}
                />
            )}
            {view === 'settings' && <SettingsScreen onClose={() => setView('dashboard')} />}
            {showSavings && (
                <SavingsScreen 
                    transactions={transactions}
                    savingsDistribution={savingsDistribution}
                    onClose={() => setShowSavings(false)}
                />
            )}
        </div>
    );
};

export default App;