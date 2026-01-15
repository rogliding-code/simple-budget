import React, { useState } from 'react';
import { X, Save } from 'lucide-react';
import * as db from '../services/databaseService';

const AddTransactionScreen = ({ onClose, onSubmit }: any) => {
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('');
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount) return;
    await db.addTransaction({
      amount: parseFloat(amount),
      category: category || 'General',
      date: new Date().toISOString(),
      type: 'expense'
    });
    onSubmit();
  };

  return (
    <div className="fixed inset-0 bg-white dark:bg-gray-900 z-50 flex flex-col p-6">
      <button onClick={onClose} className="self-end p-2"><X /></button>
      <h2 className="text-2xl font-bold mb-6">Nuevo Gasto</h2>
      <input type="number" placeholder="0.00" className="text-4xl font-bold bg-transparent border-b border-gray-700 mb-6 w-full outline-none" value={amount} onChange={e=>setAmount(e.target.value)} />
      <input type="text" placeholder="Categoría" className="p-4 bg-gray-100 dark:bg-gray-800 rounded-xl mb-6 w-full" value={category} onChange={e=>setCategory(e.target.value)} />
      <button onClick={handleSubmit} className="w-full py-4 bg-indigo-600 text-white rounded-xl font-bold flex justify-center gap-2"><Save /> Guardar</button>
    </div>
  );
};
export default AddTransactionScreen;