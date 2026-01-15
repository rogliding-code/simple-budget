import React, { useMemo } from 'react';
import { Transaction, BudgetGoal } from '../types';
import { PieChart, Plus } from 'lucide-react';
import clsx from 'clsx';

interface DashboardScreenProps {
  transactions: Transaction[];
  goals: BudgetGoal[];
  onEditTransaction: (t: Transaction) => void;
  onDeleteTransaction: (id: number) => void;
  onNavigateToSavings: () => void;
  onAddClick: () => void;
}

const DashboardScreen: React.FC<DashboardScreenProps> = ({ 
  transactions, 
  goals, 
  onNavigateToSavings,
  onAddClick
}) => {
  
  // Filtrar transacciones del mes actual
  const currentMonthData = useMemo(() => {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    return transactions.filter(t => {
      const d = new Date(t.date);
      return d.getMonth() === currentMonth && 
             d.getFullYear() === currentYear;
    });
  }, [transactions]);

  // Cálculos para Gráfica y Resumen
  const stats = useMemo(() => {
    // Gastos reales (excluyendo uso de ahorros)
    const validExpenses = currentMonthData.filter(t => !t.isSavingsExpenditure);
    const totalSpent = validExpenses.reduce((sum, t) => sum + t.amount, 0);

    // Agrupar por categoría
    const byCategory: Record<string, number> = {};
    validExpenses.forEach(t => {
      byCategory[t.category] = (byCategory[t.category] || 0) + t.amount;
    });

    // Preparar datos para lista de progreso
    const progressList = Object.keys(byCategory).map(catName => {
      const spent = byCategory[catName];
      const goal = goals.find(g => g.category === catName)?.monthly_goal_amount || 0;
      
      let status: 'ok' | 'warning' | 'danger' = 'ok';
      if (catName !== 'Ahorro') {
        if (goal === 0 && spent > 0) status = 'danger';
        else if (spent > goal) status = 'danger';
        else if (spent > goal * 0.8) status = 'warning';
      }
      return { category: catName, spent, goal, status };
    }).sort((a, b) => b.spent - a.spent);

    // Datos Pie Chart Simple (CSS Conic Gradient)
    let accumPercent = 0;
    const chartSegments = progressList.map(item => {
      const percent = (item.spent / totalSpent) * 100;
      const start = accumPercent;
      accumPercent += percent;
      const color = item.category === 'Ahorro' ? '#4f46e5' : 
                    item.status === 'danger' ? '#ef4444' : 
                    item.status === 'warning' ? '#f59e0b' : '#10b981';
      return `${color} ${start}% ${accumPercent}%`;
    }).join(', ');

    return { totalSpent, progressList, chartSegments };
  }, [currentMonthData, goals]);

  return (
    <div className="p-6 space-y-6 pb-32 relative min-h-full animate-in fade-in">
      
      {/* Resumen Cards */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white dark:bg-gray-800 p-5 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
          <p className="text-xs text-gray-500 uppercase font-bold">Gasto Total Mes</p>
          <p className="text-2xl font-bold text-gray-800 dark:text-gray-100 mt-1">
            Q{stats.totalSpent.toLocaleString()}
          </p>
        </div>
        <button 
          className="bg-indigo-600 p-5 rounded-2xl shadow-lg shadow-indigo-200 dark:shadow-none text-white flex flex-col justify-between text-left active:scale-95 transition-transform" 
          onClick={onNavigateToSavings}
        >
          <p className="text-xs uppercase font-bold opacity-80">Ahorro Acumulado</p>
          <div className="flex items-center justify-between mt-1">
            <span className="text-xl font-bold">Ver Total</span>
            <PieChart className="w-5 h-5 opacity-50" />
          </div>
        </button>
      </div>

      {/* Gráfica Pie Simple */}
      {stats.totalSpent > 0 ? (
        <div className="flex justify-center py-6">
          <div 
            className="w-48 h-48 rounded-full shadow-inner relative flex items-center justify-center bg-gray-100 dark:bg-gray-700"
            style={{ background: `conic-gradient(${stats.chartSegments})` }}
          >
            <div className="w-32 h-32 bg-gray-50 dark:bg-gray-900 rounded-full flex flex-col items-center justify-center z-10 shadow-sm">
              <span className="text-xs text-gray-400 font-medium">Total</span>
              <span className="font-bold text-gray-800 dark:text-gray-200">Q{stats.totalSpent.toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
            </div>
          </div>
        </div>
      ) : (
        <div className="py-10 text-center text-gray-400 border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-2xl">
          <p>Aún no hay gastos este mes</p>
        </div>
      )}

      {/* Lista de Progreso */}
      <div className="space-y-4">
        <h3 className="font-bold text-lg text-gray-800 dark:text-gray-200">Desglose por Categoría</h3>
        {stats.progressList.map((item) => (
          <div key={item.category} className="bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm">
            <div className="flex justify-between items-center mb-2">
              <span className="font-medium flex items-center gap-2 text-gray-700 dark:text-gray-200">
                {item.category}
                {item.status === 'danger' && <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"/>}
              </span>
              <span className="font-bold text-sm">Q{item.spent.toLocaleString()}</span>
            </div>
            {/* Barra */}
            <div className="w-full bg-gray-100 dark:bg-gray-700 h-2 rounded-full overflow-hidden">
              <div 
                className={clsx(
                  "h-full rounded-full transition-all duration-500",
                  item.category === 'Ahorro' ? "bg-indigo-500" :
                  item.status === 'danger' ? "bg-red-500" : 
                  item.status === 'warning' ? "bg-amber-400" : "bg-emerald-500"
                )}
                style={{ width: `${Math.min((item.spent / (item.goal || item.spent)) * 100, 100)}%` }}
              />
            </div>
            <div className="flex justify-between mt-1">
              <span className="text-[10px] text-gray-400">
                {item.goal > 0 ? `Meta: Q${item.goal}` : 'Sin presupuesto'}
              </span>
              <span className={clsx("text-[10px] font-bold", item.status === 'danger' ? "text-red-500" : "text-gray-400")}>
                {item.goal > 0 ? `${Math.round((item.spent/item.goal)*100)}%` : ''}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Botón Ver Estado Ahorros (Final) */}
      <button 
        onClick={onNavigateToSavings}
        className="w-full py-4 bg-gray-800 dark:bg-gray-700 text-white rounded-xl font-bold shadow-lg mt-4 mb-8"
      >
        Ver Estado de Ahorros
      </button>

      {/* FAB FLOTANTE CORREGIDO */}
      <button
        onClick={onAddClick}
        className="fixed bottom-24 right-6 bg-indigo-600 hover:bg-indigo-700 text-white rounded-full px-5 py-4 shadow-xl z-40 transition-transform active:scale-95 flex items-center justify-center gap-2"
      >
        <Plus className="w-6 h-6" />
        <span className="font-bold text-sm">Gasto</span>
      </button>

    </div>
  );
};

export default DashboardScreen;