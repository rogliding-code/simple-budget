import React, { useState, useEffect } from 'react';
import { X, Save, PiggyBank, Wallet } from 'lucide-react';
import { Transaction, BudgetGoal, SavingsDistribution } from '../types';
import * as db from '../services/databaseService';
import clsx from 'clsx';

// LISTA FIJA DE CATEGORÍAS
const DEFAULT_CATEGORIES = [
  'Vivienda', 'Comida', 'Transporte', 'Servicios', 'Entretenimiento', 
  'Salud', 'Educación', 'Ropa', 'Mascotas', 'Deudas', 'Otros'
];

interface AddTransactionScreenProps {
  onClose: () => void;
  onSubmit: () => void;
  editingTransaction?: Transaction | null;
}

const AddTransactionScreen: React.FC<AddTransactionScreenProps> = ({ onClose, onSubmit, editingTransaction }) => {
  // AQUÍ ESTÁ EL TRUCO: MODO GASTO O MODO AHORRO
  const [mode, setMode] = useState<'expense' | 'savings'>('expense');
  
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('');
  const [subcategory, setSubcategory] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [note, setNote] = useState('');
  
  const [isSavingsExpenditure, setIsSavingsExpenditure] = useState(false);
  const [savingsGoalId, setSavingsGoalId] = useState('');
  
  const [categories, setCategories] = useState<string[]>([]);
  const [savingsGoals, setSavingsGoals] = useState<SavingsDistribution[]>([]);

  useEffect(() => {
    const loadData = async () => {
      try {
        const goals = await db.getAllGoals();
        const dbCategories = goals.map(g => g.category);
        const uniqueCategories = Array.from(new Set([...DEFAULT_CATEGORIES, ...dbCategories]));
        setCategories(uniqueCategories);

        const dist = await db.getSavingsDistribution();
        setSavingsGoals(dist);
      } catch (error) {
        console.error("Error cargando datos", error);
      }
    };
    loadData();

    if (editingTransaction) {
      setMode(editingTransaction.type);
      setAmount(editingTransaction.amount.toString());
      setCategory(editingTransaction.category);
      setSubcategory(editingTransaction.subcategory || '');
      setDate(editingTransaction.date);
      setNote(editingTransaction.note || '');
      setIsSavingsExpenditure(!!editingTransaction.isSavingsExpenditure);
      setSavingsGoalId(editingTransaction.savingsGoalId || '');
    }
  }, [editingTransaction]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!amount || parseFloat(amount) <= 0) {
      alert("❌ Por favor ingresa un monto válido.");
      return;
    }

    const finalCategory = mode === 'savings' ? 'Ahorro' : category;
    
    if (mode === 'expense' && !finalCategory) {
       alert("❌ Por favor escribe o selecciona una categoría.");
       return;
    }

    if (mode === 'expense' && isSavingsExpenditure && !savingsGoalId) {
      alert("❌ Si usas ahorros, selecciona de qué fondo (ej: Emergencia).");
      return;
    }

    const newTransaction: Transaction = {
      id: editingTransaction?.id,
      amount: parseFloat(amount),
      category: finalCategory,
      subcategory: mode === 'savings' ? '' : subcategory,
      date,
      note,
      type: mode,
      isSavingsExpenditure: mode === 'expense' ? isSavingsExpenditure : false,
      savingsGoalId: (mode === 'expense' && isSavingsExpenditure) ? savingsGoalId : undefined
    };

    try {
      if (editingTransaction?.id) {
        await db.updateTransaction(newTransaction);
      } else {
        await db.addTransaction(newTransaction);
      }
      onSubmit();
    } catch (error) {
      alert("Error guardando. Intenta de nuevo.");
    }
  };

  return (
    <div className="fixed inset-0 bg-white dark:bg-gray-900 z-[60] flex flex-col animate-in slide-in-from-bottom-5">
      
      {/* HEADER */}
      <div className="flex items-center justify-between p-4 border-b border-gray-100 dark:border-gray-800">
        <button onClick={onClose} className="p-2 -ml-2 text-gray-500"><X /></button>
        <h2 className="text-lg font-bold text-gray-800 dark:text-white">
          {editingTransaction ? 'Editar' : 'Nueva Transacción'}
        </h2>
        <div className="w-8" />
      </div>

      <div className="flex-1 overflow-y-auto p-6">
        <form onSubmit={handleSubmit} className="space-y-6 max-w-lg mx-auto">
          
          {/* BOTONES GRANDES (GASTO / AHORRO) */}
          <div className="bg-gray-100 dark:bg-gray-800 p-1 rounded-xl flex">
            <button
              type="button"
              onClick={() => { setMode('expense'); setCategory(''); }}
              className={clsx(
                "flex-1 py-3 rounded-lg text-sm font-bold flex items-center justify-center gap-2 transition-all",
                mode === 'expense' ? "bg-white dark:bg-gray-700 shadow-sm text-red-500" : "text-gray-500"
              )}
            >
              <Wallet className="w-4 h-4" /> GASTO
            </button>
            <button
              type="button"
              onClick={() => { setMode('savings'); setCategory('Ahorro'); }}
              className={clsx(
                "flex-1 py-3 rounded-lg text-sm font-bold flex items-center justify-center gap-2 transition-all",
                mode === 'savings' ? "bg-white dark:bg-gray-700 shadow-sm text-indigo-500" : "text-gray-500"
              )}
            >
              <PiggyBank className="w-4 h-4" /> AHORRO
            </button>
          </div>

          {/* MONTO */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-gray-400 uppercase">Monto</label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-xl font-bold text-gray-400">Q</span>
              <input
                type="number"
                inputMode="decimal"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
                className="w-full pl-10 pr-4 py-4 text-3xl font-bold bg-transparent border-b-2 border-gray-200 dark:border-gray-700 focus:border-indigo-500 outline-none dark:text-white"
              />
            </div>
          </div>

          {/* CAMPOS SOLO PARA GASTO */}
          {mode === 'expense' && (
            <>
              <div className="flex items-center space-x-3 bg-orange-50 dark:bg-orange-900/20 p-4 rounded-xl border border-orange-100 dark:border-orange-900/30">
                <input
                  type="checkbox"
                  id="useSavings"
                  checked={isSavingsExpenditure}
                  onChange={(e) => setIsSavingsExpenditure(e.target.checked)}
                  className="w-5 h-5 text-orange-500 rounded focus:ring-orange-500 accent-orange-500"
                />
                <label htmlFor="useSavings" className="text-sm font-medium text-orange-800 dark:text-orange-200">
                  ¿Pagar desde Ahorros?
                </label>
              </div>

              {isSavingsExpenditure ? (
                 <div className="space-y-2 animate-in fade-in slide-in-from-top-2">
                    <label className="text-xs font-bold text-orange-500 uppercase">¿De qué fondo?</label>
                    <select
                      value={savingsGoalId}
                      onChange={(e) => setSavingsGoalId(e.target.value)}
                      className="w-full p-4 bg-gray-50 dark:bg-gray-800 rounded-xl border-none font-medium dark:text-white"
                    >
                      <option value="">Selecciona el fondo...</option>
                      {savingsGoals.map(g => (
                        <option key={g.goalName} value={g.goalName}>{g.goalName}</option>
                      ))}
                    </select>
                 </div>
              ) : (
                <>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-400 uppercase">Categoría</label>
                    <input 
                       list="categories-list" 
                       value={category}
                       onChange={(e) => setCategory(e.target.value)}
                       placeholder="Ej: Comida, Transporte..."
                       className="w-full p-4 bg-gray-50 dark:bg-gray-800 rounded-xl border-none font-medium dark:text-white"
                    />
                    <datalist id="categories-list">
                      {categories.filter(c => c !== 'Ahorro').map(c => (
                        <option key={c} value={c} />
                      ))}
                    </datalist>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-400 uppercase">Subcategoría</label>
                    <input
                      type="text"
                      value={subcategory}
                      onChange={(e) => setSubcategory(e.target.value)}
                      placeholder="Ej: Tacos, Uber (Opcional)"
                      className="w-full p-4 bg-gray-50 dark:bg-gray-800 rounded-xl border-none font-medium dark:text-white"
                    />
                  </div>
                </>
              )}
            </>
          )}

          {/* MENSAJE CUANDO ES AHORRO */}
          {mode === 'savings' && (
            <div className="p-4 bg-indigo-50 dark:bg-indigo-900/20 rounded-xl border border-indigo-100 text-sm text-indigo-800 dark:text-indigo-200">
              Se distribuirá automáticamente en tus alcancías (Retiro, Vivienda, etc.)
            </div>
          )}

          {/* FECHA Y NOTA */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-400 uppercase">Fecha</label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full p-4 bg-gray-50 dark:bg-gray-800 rounded-xl border-none font-medium dark:text-white"
              />
            </div>
             <div className="space-y-2">
              <label className="text-xs font-bold text-gray-400 uppercase">Nota</label>
              <input
                type="text"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Opcional"
                className="w-full p-4 bg-gray-50 dark:bg-gray-800 rounded-xl border-none font-medium dark:text-white"
              />
            </div>
          </div>

          <button
            type="submit"
            className={clsx(
              "w-full py-4 rounded-xl font-bold text-white shadow-lg flex items-center justify-center gap-2 mt-8 active:scale-95 transition-all",
              mode === 'expense' ? "bg-indigo-600 hover:bg-indigo-700" : "bg-green-600 hover:bg-green-700"
            )}
          >
            <Save className="w-5 h-5" />
            {editingTransaction ? 'Actualizar' : mode === 'expense' ? 'Registrar Gasto' : 'Registrar Ahorro'}
          </button>

        </form>
      </div>
    </div>
  );
};

export default AddTransactionScreen;