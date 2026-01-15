import React, { useMemo } from 'react';
import { X, PiggyBank } from 'lucide-react';
import { Transaction, SavingsDistribution } from '../types';

interface SavingsScreenProps {
  transactions: Transaction[];
  savingsDistribution: SavingsDistribution[];
  onClose: () => void;
}

const SavingsScreen: React.FC<SavingsScreenProps> = ({ transactions, savingsDistribution, onClose }) => {
  const savingsData = useMemo(() => {
    const totalSavingsInput = transactions
      .filter(t => t.category === 'Ahorro' && t.type === 'savings')
      .reduce((sum, t) => sum + t.amount, 0);

    const breakdown = savingsDistribution.map(goal => {
      const allocated = totalSavingsInput * (goal.percentage / 100);
      const spent = transactions
        .filter(t => t.isSavingsExpenditure && t.savingsGoalId === goal.goalName)
        .reduce((sum, t) => sum + t.amount, 0);
      return { name: goal.goalName, percentage: goal.percentage, balance: allocated - spent, allocated, spent };
    });

    const totalBalance = breakdown.reduce((sum, item) => sum + item.balance, 0);
    return { totalBalance, breakdown };
  }, [transactions, savingsDistribution]);

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in">
      <div className="bg-white dark:bg-gray-900 w-full max-w-lg h-[85vh] sm:h-auto rounded-t-3xl sm:rounded-3xl flex flex-col shadow-2xl animate-in slide-in-from-bottom-10">
        <div className="flex items-center justify-between p-6 border-b border-gray-100 dark:border-gray-800">
          <h2 className="text-xl font-bold flex items-center gap-2 text-gray-800 dark:text-white">
            <PiggyBank className="text-indigo-600" /> Bóveda de Ahorros
          </h2>
          <button onClick={onClose} className="p-2 bg-gray-100 dark:bg-gray-800 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-500">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          <div className="text-center py-4">
            <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Patrimonio Total</span>
            <div className="text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-emerald-500 to-teal-700 mt-2">
              Q{savingsData.totalBalance.toLocaleString()}
            </div>
          </div>

          <div className="grid gap-4">
            {savingsData.breakdown.map((item) => (
              <div key={item.name} className="bg-gray-50 dark:bg-gray-800 p-5 rounded-2xl border border-gray-100 dark:border-gray-700 relative overflow-hidden">
                <div className="flex justify-between items-start mb-2 relative z-10">
                  <div>
                    <h3 className="font-bold text-lg text-gray-800 dark:text-gray-200">{item.name}</h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{item.percentage}% de tus aportes</p>
                  </div>
                  <div className="bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 px-3 py-1 rounded-full text-xs font-bold">
                    Q{item.balance.toLocaleString()}
                  </div>
                </div>
                {/* Visual Bar */}
                <div className="w-full bg-gray-200 dark:bg-gray-700 h-1.5 rounded-full mt-4">
                  <div className="bg-indigo-500 h-full rounded-full" style={{ width: '100%' }} />
                </div>
                <div className="flex justify-between mt-3 text-xs text-gray-400">
                  <span>Aportado: Q{item.allocated.toLocaleString(undefined, {maximumFractionDigits:0})}</span>
                  <span>Usado: Q{item.spent.toLocaleString(undefined, {maximumFractionDigits:0})}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
export default SavingsScreen;