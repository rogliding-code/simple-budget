import { Transaction, BudgetGoal, SavingsDistribution, DEFAULT_SAVINGS_DISTRIBUTION } from '../types';

const DB_NAME = 'SimpleBudgetDB';
const DB_VERSION = 2;
let dbPromise: Promise<IDBDatabase> | null = null;

export const initDB = (): Promise<IDBDatabase> => {
  if (dbPromise) return dbPromise;
  dbPromise = new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onerror = () => reject("Error opening database");
    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains('transactions')) {
        const store = db.createObjectStore('transactions', { keyPath: 'id', autoIncrement: true });
        store.createIndex('date', 'date', { unique: false });
      }
      if (!db.objectStoreNames.contains('goals')) db.createObjectStore('goals', { keyPath: 'category' });
      if (!db.objectStoreNames.contains('savings_distribution')) {
        const s = db.createObjectStore('savings_distribution', { keyPath: 'goalName' });
        DEFAULT_SAVINGS_DISTRIBUTION.forEach(i => s.add(i));
      }
    };
    request.onsuccess = (ev) => resolve((ev.target as IDBOpenDBRequest).result);
  });
  return dbPromise;
};

export const addTransaction = async (t: Transaction) => {
  const db = await initDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(['transactions'], 'readwrite');
    const req = tx.objectStore('transactions').add(t);
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
};

export const getAllTransactions = async (): Promise<Transaction[]> => {
  const db = await initDB();
  return new Promise((resolve) => {
    const tx = db.transaction(['transactions'], 'readonly');
    tx.objectStore('transactions').getAll().onsuccess = (e) => resolve((e.target as IDBRequest).result);
  });
};

export const getAllGoals = async (): Promise<BudgetGoal[]> => {
  const db = await initDB();
  return new Promise((resolve) => {
    const tx = db.transaction(['goals'], 'readonly');
    tx.objectStore('goals').getAll().onsuccess = (e) => resolve((e.target as IDBRequest).result);
  });
};

export const updateGoal = async (g: BudgetGoal) => {
  const db = await initDB();
  const tx = db.transaction(['goals'], 'readwrite');
  tx.objectStore('goals').put(g);
};

export const getSavingsDistribution = async (): Promise<SavingsDistribution[]> => {
  const db = await initDB();
  return new Promise((resolve) => {
    if (!db.objectStoreNames.contains('savings_distribution')) return resolve(DEFAULT_SAVINGS_DISTRIBUTION);
    const tx = db.transaction(['savings_distribution'], 'readonly');
    tx.objectStore('savings_distribution').getAll().onsuccess = (e) => {
      const res = (e.target as IDBRequest).result;
      resolve(res.length ? res : DEFAULT_SAVINGS_DISTRIBUTION);
    };
  });
};

export const saveSavingsDistribution = async (items: SavingsDistribution[]) => {
  const db = await initDB();
  const tx = db.transaction(['savings_distribution'], 'readwrite');
  const store = tx.objectStore('savings_distribution');
  store.clear().onsuccess = () => items.forEach(i => store.put(i));
};

export const updateTransaction = async (t: Transaction) => {
  const db = await initDB();
  const tx = db.transaction(['transactions'], 'readwrite');
  tx.objectStore('transactions').put(t);
};