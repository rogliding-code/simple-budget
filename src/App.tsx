import React, { useState, useEffect } from 'react';
import { Transaction } from './types';
import * as db from './services/databaseService';
import AddTransactionScreen from './components/AddTransactionScreen';

const App: React.FC = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [showAddScreen, setShowAddScreen] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const data = await db.getTransactions();
    setTransactions(data.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-gray-100">
      <header className="p-6 bg-white dark:bg-gray-900 shadow-sm">
        <h1 className="text-xl font-black tracking-tight">MI PRESUPUESTO</h1>
      </header>

      <main className="p-4 max-w-lg mx-auto pb-24">
        {/* Aquí irán los balances y lista que recuperaremos luego */}
        <div className="space-y-4">
          {transactions.map(t => (
            <div key={t.id} className="p-4 bg-white dark:bg-gray-900 rounded-2xl shadow-sm flex justify-between">
              <div>
                <p className="font-bold">{t.category}</p>
                <p className="text-xs text-gray-500">{t.date}</p>
              </div>
              <p className="font-black text-red-500">-${t.amount}</p>
            </div>
          ))}
        </div>
      </main>

      <button 
        onClick={() => setShowAddScreen(true)}
        className="fixed bottom-8 right-8 w-16 h-16 bg-indigo-600 text-white rounded-full shadow-2xl text-3xl font-bold flex items-center justify-center"
      >
        +
      </button>

      {showAddScreen && (
        <AddTransactionScreen 
          onClose={() => setShowAddScreen(false)} 
          onSubmit={() => { setShowAddScreen(false); loadData(); }}
          editingTransaction={null}
        />
      )}
    </div>
  );
};

export default App;
//cambio