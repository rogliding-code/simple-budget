import React, { useState, useEffect } from 'react';
import { DollarSign, PieChart, ArrowLeft } from 'lucide-react';
import { BudgetGoal, SavingsDistribution, DEFAULT_SAVINGS_DISTRIBUTION } from '../types';
import * as db from '../services/databaseService';

const BudgetScreen: React.FC = () => {
  const [viewMode, setViewMode] = useState<'menu' | 'budget' | 'savings'>('menu');
  const [goals, setGoals] = useState<BudgetGoal[]>([]);
  const [savingsDist, setSavingsDist] = useState<SavingsDistribution[]>([]);

  // Categorías sugeridas
  const categoriesList = ['Vivienda', 'Comida', 'Transporte', 'Servicios', 'Entretenimiento', 'Salud', 'Educación', 'Ropa', 'Mascotas', 'Deudas', 'Otros'];

  useEffect(() => {
    const loadData = async () => {
      const loadedGoals = await db.getAllGoals();
      // Fusionar metas guardadas con la lista por defecto
      const mergedGoals = categoriesList.map(cat => {
        const existing = loadedGoals.find(g => g.category === cat);
        return existing || { category: cat, monthly_goal_amount: 0 };
      });
      setGoals(mergedGoals);

      const loadedSavings = await db.getSavingsDistribution();
      setSavingsDist(loadedSavings.length > 0 ? loadedSavings : DEFAULT_SAVINGS_DISTRIBUTION);
    };
    loadData();
  }, []);

  const handleGoalChange = (category: string, value: string) => {
    const num = parseFloat(value) || 0;
    setGoals(prev => prev.map(g => g.category === category ? { ...g, monthly_goal_amount: num } : g));
  };

  const handleSavingsChange = (index: number, newVal: number) => {
    const newDist = [...savingsDist];
    newDist[index].percentage = newVal;
    setSavingsDist(newDist);
  };

  const saveBudget = async () => {
    for (const goal of goals) { await db.updateGoal(goal); }
    alert("¡Presupuesto actualizado con éxito!");
    setViewMode('menu');
  };

  const saveSavings = async () => {
    const total = savingsDist.reduce((sum, item) => sum + item.percentage, 0);
    if (total !== 100) {
      alert(`Error: Los porcentajes deben sumar 100%. Actualmente suman: ${total}%`);
      return;
    }
    await db.saveSavingsDistribution(savingsDist);
    alert("¡Distribución de ahorro guardada!");
    setViewMode('menu');
  };

  // VISTA 1: MENÚ
  if (viewMode === 'menu') {
    return (
      <div className="p-6 space-y-6 flex flex-col items-center justify-center min-h-[70vh] animate-in fade-in">
        <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-4">Planificación</h2>
        
        <button onClick={() => setViewMode('budget')} className="w-full max-w-sm p-6 bg-white dark:bg-gray-800 rounded-3xl shadow-md flex items-center gap-4 hover:scale-105 transition-transform border border-gray-100 dark:border-gray-700">
          <div className="bg-indigo-100 dark:bg-indigo-900/30 p-4 rounded-2xl"><DollarSign className="w-8 h-8 text-indigo-600 dark:text-indigo-400" /></div>
          <div className="text-left">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">Presupuesto Mensual</h3>
            <p className="text-gray-500 dark:text-gray-400 text-xs">Define límites por categoría</p>
          </div>
        </button>

        <button onClick={() => setViewMode('savings')} className="w-full max-w-sm p-6 bg-white dark:bg-gray-800 rounded-3xl shadow-md flex items-center gap-4 hover:scale-105 transition-transform border border-gray-100 dark:border-gray-700">
          <div className="bg-emerald-100 dark:bg-emerald-900/30 p-4 rounded-2xl"><PieChart className="w-8 h-8 text-emerald-600 dark:text-emerald-400" /></div>
          <div className="text-left">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">Metas de Ahorro</h3>
            <p className="text-gray-500 dark:text-gray-400 text-xs">Distribuye tus ahorros</p>
          </div>
        </button>
      </div>
    );
  }

  // VISTA 2: EDITORES
  return (
    <div className="pb-24 pt-4 animate-in slide-in-from-right">
      <div className="flex items-center gap-4 px-6 mb-6">
        <button onClick={() => setViewMode('menu')} className="p-2 -ml-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-300">
          <ArrowLeft />
        </button>
        <h2 className="text-xl font-bold text-gray-900 dark:text-white">
          {viewMode === 'budget' ? 'Metas Mensuales' : 'Distribución Ahorro'}
        </h2>
      </div>

      <div className="px-6 space-y-4">
        {viewMode === 'budget' ? (
          // EDITOR PRESUPUESTO
          goals.map((goal) => (
            <div key={goal.category} className="flex items-center justify-between bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-100 dark:border-gray-700">
              <span className="font-medium text-gray-700 dark:text-gray-200">{goal.category}</span>
              <div className="relative w-32">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 font-bold text-sm">Q</span>
                <input 
                  type="number" 
                  value={goal.monthly_goal_amount || ''} 
                  onChange={(e) => handleGoalChange(goal.category, e.target.value)} 
                  placeholder="0" 
                  className="w-full pl-8 pr-3 py-2 bg-gray-50 dark:bg-gray-700 rounded-lg text-right font-bold outline-none dark:text-white focus:ring-2 focus:ring-indigo-500" 
                />
              </div>
            </div>
          ))
        ) : (
          // EDITOR AHORRO
          <div className="space-y-6">
             <div className="bg-indigo-50 dark:bg-indigo-900/20 p-4 rounded-xl text-sm text-indigo-800 dark:text-indigo-200">
               El dinero que ingreses como "Ahorro" se dividirá automáticamente así:
             </div>
             {savingsDist.map((item, index) => (
              <div key={index} className="space-y-2">
                <div className="flex justify-between font-bold text-gray-700 dark:text-gray-200">
                  <span>{item.goalName}</span>
                  <span className="text-indigo-600 dark:text-indigo-400">{item.percentage}%</span>
                </div>
                <input 
                  type="range" min="0" max="100" 
                  value={item.percentage} 
                  onChange={(e) => handleSavingsChange(index, parseInt(e.target.value))} 
                  className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer accent-indigo-600" 
                />
              </div>
            ))}
            <div className="flex justify-between items-center pt-4 border-t border-gray-200 dark:border-gray-700 font-bold text-gray-900 dark:text-white">
              <span>TOTAL</span>
              <span className={savingsDist.reduce((a,b)=>a+b.percentage,0) === 100 ? 'text-green-500' : 'text-red-500'}>
                {savingsDist.reduce((a,b)=>a+b.percentage,0)}%
              </span>
            </div>
          </div>
        )}
      </div>

      <div className="fixed bottom-24 left-6 right-6 z-10">
        <button 
          onClick={viewMode === 'budget' ? saveBudget : saveSavings} 
          className="w-full py-4 bg-indigo-600 text-white rounded-xl font-bold shadow-lg hover:bg-indigo-700 active:scale-95 transition-all"
        >
          GUARDAR CAMBIOS
        </button>
      </div>
    </div>
  );
};
export default BudgetScreen;