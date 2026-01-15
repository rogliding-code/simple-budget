import { openDB } from 'idb';
import { Transaction, SavingsDistribution } from '../types';

const DB_NAME = 'budget-db';
const STORE_NAME = 'transactions';

export const initDB = async () => {
  return openDB(DB_NAME, 1, {
    upgrade(db) {
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'id', autoIncrement: true });
      }
      if (!db.objectStoreNames.contains('settings')) {
        db.createObjectStore('settings');
      }
    },
  });
};

export const addTransaction = async (transaction: Transaction) => {
  const db = await initDB();
  return db.add(STORE_NAME, transaction);
};

export const getTransactions = async (): Promise<Transaction[]> => {
  const db = await initDB();
  return db.getAll(STORE_NAME);
};

export const updateTransaction = async (transaction: Transaction) => {
  const db = await initDB();
  return db.put(STORE_NAME, transaction);
};

export const deleteTransaction = async (id: number) => {
  const db = await initDB();
  return db.delete(STORE_NAME, id);
};

export const saveSavingsDistribution = async (dist: SavingsDistribution[]) => {
  const db = await initDB();
  return db.put('settings', dist, 'savings_dist');
};

export const getSavingsDistribution = async (): Promise<SavingsDistribution[]> => {
  const db = await initDB();
  return (await db.get('settings', 'savings_dist')) || [];
};