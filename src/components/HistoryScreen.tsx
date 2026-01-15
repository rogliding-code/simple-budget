import React, { useState, useMemo } from 'react';
import { Transaction } from '../types';
import { format, subMonths, isSameMonth, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';
import clsx from 'clsx';
import { TrendingDown, TrendingUp, AlertCircle } from 'lucide-react';

interface HistoryScreenProps { transactions: Transaction[]; }

const HistoryScreen: React.FC<HistoryScreenProps> = ({ transactions }) => {
  const availableMonths = useMemo(() => {
    const dates = [];
    for (let i = 0; i < 12; i++) { dates.push(subMonths(new Date(), i)); }
    return dates;
  }, []);

  const [selectedMonth, setSelectedMonth] = useState<Date>(availableMonths[0]);

  const monthData = useMemo(() => {
    return transactions.filter(t => isSameMonth(parseISO(t.date), selectedMonth));
  }, [transactions, selectedMonth]);

  const stats = useMemo(() => {
    const operationalExpenses = monthData.filter(t => t.type === 'expense' && !t.isSavingsExpenditure).reduce((sum, t) => sum + t.amount, 0);
    const totalSaved = monthData.filter(t => t.type === 'savings').reduce((sum, t) => sum + t.amount, 0);
    const savingsUsed = monthData.filter(t => t.isSavingsExpenditure).reduce((sum, t) => sum + t.amount, 0);
    return { operationalExpenses, totalSaved, savingsUsed };
  }, [monthData]);

  return (
    <div className="pb-24 pt-4 space-y-6 animate-in fade-in">
      <div className="px-6">
        <label className="text-xs font-bold text-gray-400 uppercase mb-2 block">Seleccionar Periodo</label>
        <select 
          className="w-full p-3 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 font-bold dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none" 
          value={selectedMonth.toISOString()} 
          onChange={(e) => setSelectedMonth(new Date(e.target.value))}
        >
          {availableMonths.map(date => (
            <option key={date.toISOString()} value={date.toISOString()}>
              {format(date, 'MMMM yyyy', { locale: es }).toUpperCase()}
            </option>
          ))}
        </select>
      </div>

      <div className="px-6 grid grid-cols-2 gap-3">
        <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-2xl border border-red-100 dark:border-red-800">
          <div className="flex items-center gap-2 mb-1">
            <TrendingDown className="w-4 h-4 text-red-500" />
            <span className="text-xs font-bold text-red-700 dark:text-red-300 uppercase">Gastado</span>
          </div>
          <p className="text-xl font-bold text-red-800 dark:text-red-200">Q{stats.operationalExpenses.toLocaleString()}</p>
        </div>
        <div className="bg-emerald-50 dark:bg-emerald-900/20 p-4 rounded-2xl border border-emerald-100 dark:border-emerald-800">
          <div className="flex items-center gap-2 mb-1">
            <TrendingUp className="w-4 h-4 text-emerald-500" />
            <span className="text-xs font-bold text-emerald-700 dark:text-emerald-300 uppercase">Ahorrado</span>
          </div>
          <p className="text-xl font-bold text-emerald-800 dark:text-emerald-200">Q{stats.totalSaved.toLocaleString()}</p>
        </div>
      </div>
      
      {stats.savingsUsed > 0 && (
        <div className="mx-6 bg-orange-50 dark:bg-orange-900/20 p-3 rounded-xl border border-orange-100 dark:border-orange-800 flex justify-between items-center">
          <span className="text-xs font-bold text-orange-700 dark:text-orange-300 uppercase flex items-center gap-2">
            <AlertCircle className="w-4 h-4" /> Uso de Reservas
          </span>
          <span className="font-bold text-orange-800 dark:text-orange-200">Q{stats.savingsUsed.toLocaleString()}</span>
        </div>
      )}

      <div className="px-6">
        <h3 className="text-sm font-bold text-gray-400 uppercase mb-4">Movimientos</h3>
        <div className="space-y-3">
          {monthData.length === 0 ? <p className="text-center text-gray-400 py-8">No hay registros en este mes.</p> : 
            monthData.sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime()).map(t => (
              <div key={t.id} className="bg-white dark:bg-gray-800 p-4 rounded-xl flex justify-between items-center shadow-sm border border-gray-50 dark:border-gray-700">
                <div>
                  <p className="font-bold text-gray-800 dark:text-gray-200">
                    {t.category === 'Ahorro' ? 'Aporte a Ahorro' : t.category}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {format(parseISO(t.date), 'dd MMM', { locale: es })} 
                    {t.subcategory && ` • ${t.subcategory}`} 
                    {t.isSavingsExpenditure && ` • Usando: ${t.savingsGoalId}`}
                  </p>
                </div>
                <span className={clsx("font-bold text-lg", t.type === 'savings' ? "text-emerald-600" : t.isSavingsExpenditure ? "text-orange-500" : "text-red-500")}>
                  Q{Math.abs(t.amount).toLocaleString()}
                </span>
              </div>
            ))
          }
        </div>
      </div>
    </div>
  );
};
export default HistoryScreen;