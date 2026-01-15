import React, { useState, useEffect } from 'react';
import { Transaction } from '../types';
import * as db from '../services/databaseService';

const BUDGET_CATEGORIES = ['Vivienda', 'Comida', 'Transporte', 'Servicios', 'Entretenimiento', 'Salud', 'Ahorro'];
const SAVINGS_TYPES = ['RETIRO', 'CONTINGENCIAS', 'VIVIENDA', 'TRANSPORTE', 'TECNOLOGÍA', 'VIAJES', 'INVERSIONES', 'OTROS'];

interface AddTransactionScreenProps {
    onSubmit: (transaction: any) => void;
    editingTransaction: Transaction | null;
    onClose: () => void;
}

const AddTransactionScreen: React.FC<AddTransactionScreenProps> = ({ onSubmit, editingTransaction, onClose }) => {
    const [transactionMode, setTransactionMode] = useState<'expense' | 'saving'>(
        editingTransaction?.category === 'Ahorro' ? 'saving' : 'expense'
    );
    const [amount, setAmount] = useState(editingTransaction?.amount.toString() || '');
    const [category, setCategory] = useState(editingTransaction?.category || BUDGET_CATEGORIES[0]);
    const [subcategory, setSubcategory] = useState(editingTransaction?.subcategory || '');
    const [date, setDate] = useState(editingTransaction?.date || new Date().toISOString().split('T')[0]);
    const [note, setNote] = useState(editingTransaction?.note || '');
    const [isPaidFromSavings, setIsPaidFromSavings] = useState(!!editingTransaction?.isSavingsExpenditure);
    const [savingsGoalSource, setSavingsGoalSource] = useState(editingTransaction?.subcategory || SAVINGS_TYPES[0]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        let transactionData: any = {
            amount: parseFloat(amount),
            date,
            note,
            type: 'expense'
        };

        if (transactionMode === 'saving') {
            transactionData.category = 'Ahorro';
        } else {
            transactionData.category = isPaidFromSavings ? 'Gasto de Ahorro' : category;
            transactionData.subcategory = isPaidFromSavings ? savingsGoalSource : subcategory;
            transactionData.isSavingsExpenditure = isPaidFromSavings;
        }

        if (editingTransaction?.id) {
            await db.updateTransaction({ ...transactionData, id: editingTransaction.id });
        } else {
            await db.addTransaction(transactionData);
        }
        onSubmit(transactionData);
    };

    return (
        <div className="fixed inset-0 bg-white dark:bg-gray-900 z-50 p-6 overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold">{editingTransaction ? 'Editar' : 'Nuevo'}</h1>
                <button onClick={onClose} className="p-2">✕</button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="flex gap-2 bg-gray-100 p-1 rounded-lg">
                    <button type="button" onClick={() => setTransactionMode('expense')} className={`flex-1 py-2 rounded ${transactionMode === 'expense' ? 'bg-white shadow' : ''}`}>GASTO</button>
                    <button type="button" onClick={() => setTransactionMode('saving')} className={`flex-1 py-2 rounded ${transactionMode === 'saving' ? 'bg-white shadow' : ''}`}>AHORRO</button>
                </div>

                <input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="0.00" className="w-full text-3xl font-bold border-b py-2 outline-none" required />
                
                <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="w-full p-3 bg-gray-50 rounded-lg" />

                {transactionMode === 'expense' && (
                    <>
                        <div className="flex items-center gap-2 p-3 bg-blue-50 rounded-lg">
                            <input type="checkbox" checked={isPaidFromSavings} onChange={(e) => setIsPaidFromSavings(e.target.checked)} />
                            <label className="text-sm">Pagar desde Ahorros</label>
                        </div>
                        {isPaidFromSavings ? (
                            <select value={savingsGoalSource} onChange={(e) => setSavingsGoalSource(e.target.value)} className="w-full p-3 bg-gray-50 rounded-lg">
                                {SAVINGS_TYPES.map(s => <option key={s} value={s}>{s}</option>)}
                            </select>
                        ) : (
                            <select value={category} onChange={(e) => setCategory(e.target.value)} className="w-full p-3 bg-gray-50 rounded-lg">
                                {BUDGET_CATEGORIES.filter(c => c !== 'Ahorro').map(c => <option key={c} value={c}>{c}</option>)}
                            </select>
                        )}
                    </>
                )}

                <button type="submit" className="w-full py-4 bg-indigo-600 text-white rounded-xl font-bold">GUARDAR</button>
            </form>
        </div>
    );
};

export default AddTransactionScreen;