export type TransactionType = 'expense' | 'savings';

export interface Transaction {
  id?: number;
  amount: number;
  category: string;
  subcategory?: string;
  date: string;
  note?: string;
  type: TransactionType;
  isSavingsExpenditure?: boolean;
  savingsGoalId?: string;
}

export interface BudgetGoal {
  id?: number;
  category: string;
  monthly_goal_amount: number;
}

export interface SavingsDistribution {
  id?: number;
  goalName: string;
  percentage: number;
}

export interface AppSettings {
  isDarkMode: boolean;
  language: 'es' | 'en';
  currencySymbol: string;
  lastExportDate?: string;
}

export const DEFAULT_SAVINGS_DISTRIBUTION: SavingsDistribution[] = [
  { goalName: 'Fondo de Emergencia', percentage: 50 },
  { goalName: 'Retiro', percentage: 30 },
  { goalName: 'Viajes/Gustos', percentage: 20 },
];