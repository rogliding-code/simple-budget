import React, { useState, useEffect } from 'react';
import { Transaction } from '../types';
import * as db from '../services/databaseService';
import { BUDGET_CATEGORIES, SAVINGS_TYPES } from '../constants'; // Importación correcta

interface AddTransactionScreenProps {
    onSubmit: (transaction: any) => void;
    editingTransaction: Transaction | null;
    onClose: () => void;
}

const AddTransactionScreen: React.FC<AddTransactionScreenProps> = ({ onSubmit, editingTransaction, onClose }) => {
    const t = (key: string) => {
        const labels: any = {
            form_addTransactionTitle: 'Nueva Transacción',
            form_editTransactionTitle: 'Editar Transacción',
            form_type_expense: 'GASTO',
            form_type_saving: 'AHORRO',
            form_amount: 'Monto',
            form_date: 'Fecha',
            form_subcategory_placeholder: 'Ej: Tacos, Gasolina...',
            form_note_placeholder: 'Opcional',
            btn_cancel: 'Cancelar',
            btn_addTransaction: 'Guardar',
            btn_updateTransaction: 'Actualizar'
        };
        return labels[key] || key;
    };

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
            type: transactionMode === 'saving' ? 'saving' : 'expense'
        };

        if (transactionMode === 'saving') {
            transactionData.category = 'Ahorro';
            transactionData.subcategory = savingsGoalSource;
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
            <div className="max-w-xl mx-auto">
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-2xl font-bold dark:text-white">{editingTransaction ? t('form_editTransactionTitle') : t('form_addTransactionTitle')}</h1>
                    <button onClick={onClose} className="p-2 text-gray-500">✕</button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="bg-gray-100 dark:bg-gray-800 p-1 rounded-xl flex">
                        <button type="button" onClick={() => setTransactionMode('expense')} className={`flex-1 py-3 rounded-lg font-bold transition-all ${transactionMode === 'expense' ? 'bg-white shadow text-indigo-600' : 'text-gray-500'}`}>{t('form_type_expense')}</button>
                        <button type="button" onClick={() => setTransactionMode('saving')} className={`flex-1 py-3 rounded-lg font-bold transition-all ${transactionMode === 'saving' ? 'bg-white shadow text-teal-600' : 'text-gray-500'}`}>{t('form_type_saving')}</button>
                    </div>

                    <div>
                        <label className="text-xs font-bold text-gray-400 uppercase">{t('form_amount')}</label>
                        <input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="0.00" className="w-full text-4xl font-bold border-b-2 border-gray-100 dark:border-gray-700 py-2 outline-none dark:bg-transparent dark:text-white" required />
                    </div>

                    <div>
                        <label className="text-xs font-bold text-gray-400 uppercase">{t('form_date')}</label>
                        <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="w-full p-3 bg-gray-50 dark:bg-gray-800 rounded-lg dark:text-white border-none" />
                    </div>

                    {transactionMode === 'saving' ? (
                        <div>
                            <label className="text-xs font-bold text-gray-400 uppercase">Destino del Ahorro</label>
                            <select value={savingsGoalSource} onChange={(e) => setSavingsGoalSource(e.target.value)} className="w-full p-4 bg-gray-50 dark:bg-gray-800 rounded-xl border-none dark:text-white mt-1">
                                {SAVINGS_TYPES.map(s => <option key={s} value={s}>{s}</option>)}
                            </select>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            <div className="flex items-center gap-2 p-3 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg">
                                <input type="checkbox" checked={isPaidFromSavings} onChange={(e) => setIsPaidFromSavings(e.target.checked)} className="w-4 h-4" />
                                <label className="text-sm font-medium dark:text-indigo-200">Pagar con fondo de Ahorros</label>
                            </div>
                            {isPaidFromSavings ? (
                                <select value={savingsGoalSource} onChange={(e) => setSavingsGoalSource(e.target.value)} className="w-full p-4 bg-gray-50 dark:bg-gray-800 rounded-xl border-none dark:text-white">
                                    {SAVINGS_TYPES.map(s => <option key={s} value={s}>{s}</option>)}
                                </select>
                            ) : (
                                <div className="grid gap-4">
                                    <select value={category} onChange={(e) => setCategory(e.target.value)} className="w-full p-4 bg-gray-50 dark:bg-gray-800 rounded-xl border-none dark:text-white">
                                        {BUDGET_CATEGORIES.filter(c => c !== 'Ahorro').map(c => <option key={c} value={c}>{c}</option>)}
                                    </select>
                                    <input type="text" value={subcategory} onChange={(e) => setSubcategory(e.target.value)} placeholder={t('form_subcategory_placeholder')} className="w-full p-4 bg-gray-50 dark:bg-gray-800 rounded-xl border-none dark:text-white" />
                                </div>
                            )}
                        </div>
                    )}

                    <textarea value={note} onChange={(e) => setNote(e.target.value)} placeholder={t('form_note_placeholder')} className="w-full p-4 bg-gray-50 dark:bg-gray-800 rounded-xl border-none dark:text-white" rows={2} />

                    <div className="flex gap-3 pt-4">
                        <button type="button" onClick={onClose} className="flex-1 py-4 bg-gray-100 dark:bg-gray-800 text-gray-500 rounded-2xl font-bold">{t('btn_cancel')}</button>
                        <button type="submit" className="flex-[2] py-4 bg-indigo-600 text-white rounded-2xl font-bold shadow-lg">{editingTransaction ? t('btn_updateTransaction') : t('btn_addTransaction')}</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AddTransactionScreen;