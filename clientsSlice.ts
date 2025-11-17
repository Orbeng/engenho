// src/store/clientsSlice.ts
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface Client {
  id: string;
  name: string;
  cpfCnpj: string;
  email: string;
  phone: string;
  address: string;
  tags: string[];
  projectHistory: string[]; // Project IDs
  paymentHistory: PaymentHistory[];
  nextFollowUp: string | null;
}

export interface PaymentHistory {
  date: string;
  amount: number;
  status: 'paid' | 'pending' | 'overdue';
}

interface ClientsState {
  clients: Client[];
  loading: boolean;
  error: string | null;
}

const initialState: ClientsState = {
  clients: [],
  loading: false,
  error: null,
};

const clientsSlice = createSlice({
  name: 'clients',
  initialState,
  reducers: {
    setClients: (state, action: PayloadAction<Client[]>) => {
      state.clients = action.payload;
    },
    addClient: (state, action: PayloadAction<Client>) => {
      state.clients.push(action.payload);
    },
    updateClient: (state, action: PayloadAction<Client>) => {
      const index = state.clients.findIndex(c => c.id === action.payload.id);
      if (index !== -1) {
        state.clients[index] = action.payload;
      }
    },
    deleteClient: (state, action: PayloadAction<string>) => {
      state.clients = state.clients.filter(c => c.id !== action.payload);
    },
    addTagToClient: (state, action: PayloadAction<{ clientId: string; tag: string }>) => {
      const client = state.clients.find(c => c.id === action.payload.clientId);
      if (client && !client.tags.includes(action.payload.tag)) {
        client.tags.push(action.payload.tag);
      }
    },
    removeTagFromClient: (state, action: PayloadAction<{ clientId: string; tag: string }>) => {
      const client = state.clients.find(c => c.id === action.payload.clientId);
      if (client) {
        client.tags = client.tags.filter(t => t !== action.payload.tag);
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
  setClients, 
  addClient, 
  updateClient, 
  deleteClient,
  addTagToClient,
  removeTagFromClient,
  setLoading,
  setError
} = clientsSlice.actions;

export default clientsSlice.reducer;