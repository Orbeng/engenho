// src/store/financesSlice.ts
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface Transaction {
  id: string;
  type: 'income' | 'expense'; // income or expense
  amount: number;
  description: string;
  category: string;
  projectId?: string; // Optional: link to a project
  clientId?: string; // Optional: link to a client
  date: string; // ISO string
  status: 'pending' | 'completed' | 'scheduled'; // For scheduled payments
  paymentMethod?: string;
}

export interface FinancialSummary {
  totalIncome: number;
  totalExpenses: number;
  netProfit: number;
  cashFlow: { date: string; income: number; expenses: number }[];
}

interface FinancesState {
  transactions: Transaction[];
  summary: FinancialSummary | null;
  categories: string[];
  loading: boolean;
  error: string | null;
}

const initialState: FinancesState = {
  transactions: [],
  summary: null,
  categories: [
    'Materials', 
    'Transport', 
    'Software', 
    'Consulting', 
    'Equipment', 
    'Maintenance', 
    'Marketing', 
    'Tax', 
    'Other'
  ],
  loading: false,
  error: null,
};

const financesSlice = createSlice({
  name: 'finances',
  initialState,
  reducers: {
    setTransactions: (state, action: PayloadAction<Transaction[]>) => {
      state.transactions = action.payload;
    },
    addTransaction: (state, action: PayloadAction<Transaction>) => {
      state.transactions.push(action.payload);
    },
    updateTransaction: (state, action: PayloadAction<Transaction>) => {
      const index = state.transactions.findIndex(t => t.id === action.payload.id);
      if (index !== -1) {
        state.transactions[index] = action.payload;
      }
    },
    deleteTransaction: (state, action: PayloadAction<string>) => {
      state.transactions = state.transactions.filter(t => t.id !== action.payload);
    },
    setFinancialSummary: (state, action: PayloadAction<FinancialSummary>) => {
      state.summary = action.payload;
    },
    addCategory: (state, action: PayloadAction<string>) => {
      if (!state.categories.includes(action.payload)) {
        state.categories.push(action.payload);
      }
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    }
  },
});

export const { 
  setTransactions, 
  addTransaction, 
  updateTransaction, 
  deleteTransaction,
  setFinancialSummary,
  addCategory,
  setLoading,
  setError
} = financesSlice.actions;

export default financesSlice.reducer;