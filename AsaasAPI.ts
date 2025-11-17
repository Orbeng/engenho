// src/utils/AsaasAPI.ts
import { Transaction } from '../store/financesSlice';

interface AsaasCustomer {
  id: string;
  name: string;
  email: string;
  cpfCnpj: string;
  phone: string;
  mobilePhone: string;
  address: {
    address: string;
    addressNumber: string;
    complement: string;
    province: string;
    postalCode: string;
  };
}

interface AsaasPayment {
  id: string;
  customer: string; // Customer ID
  billingType: 'BOLETO' | 'CREDIT_CARD' | 'PIX';
  dueDate: string; // YYYY-MM-DD
  value: number;
  description: string;
  externalReference: string; // Could be our transaction ID
  status: 'PENDING' | 'RECEIVED' | 'OVERDUE' | 'REFUNDED' | 'RECEIVED_IN_CASH' | 'DELETED' | 'IN_PROTEST' | 'CHARGEBACK' | 'IN_ANALYSIS_CHARGEBACK' | 'AWAITING_CHARGEBACK_REVERSAL';
}

interface AsaasInvoice {
  id: string;
  payment: string; // Payment ID
  value: number;
  status: 'ISSUED' | 'FAILED' | 'IN_PROCESS' | 'SENT_TO_SEFAZ' | 'AUTHORIZED' | 'CANCELLED' | 'DENIED';
  issueDate: string; // YYYY-MM-DD
  series: string;
  number: string;
  pdf?: {
    available: boolean;
    link: string;
  };
}

class AsaasAPI {
  private apiKey: string;
  private baseUrl = 'https://api.asaas.com/v3';
  
  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }
  
  // Customers
  async createCustomer(customerData: Omit<AsaasCustomer, 'id'>): Promise<AsaasCustomer> {
    try {
      const response = await fetch(`${this.baseUrl}/customers`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'access_token': this.apiKey,
        },
        body: JSON.stringify(customerData),
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error creating customer in Asaas:', error);
      throw error;
    }
  }
  
  async getCustomer(customerId: string): Promise<AsaasCustomer> {
    try {
      const response = await fetch(`${this.baseUrl}/customers/${customerId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'access_token': this.apiKey,
        },
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error getting customer from Asaas:', error);
      throw error;
    }
  }
  
  // Payments
  async createPayment(paymentData: Omit<AsaasPayment, 'id' | 'status'>): Promise<AsaasPayment> {
    try {
      const response = await fetch(`${this.baseUrl}/payments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'access_token': this.apiKey,
        },
        body: JSON.stringify(paymentData),
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error creating payment in Asaas:', error);
      throw error;
    }
  }
  
  async getPayment(paymentId: string): Promise<AsaasPayment> {
    try {
      const response = await fetch(`${this.baseUrl}/payments/${paymentId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'access_token': this.apiKey,
        },
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error getting payment from Asaas:', error);
      throw error;
    }
  }
  
  async updatePayment(paymentId: string, paymentData: Partial<AsaasPayment>): Promise<AsaasPayment> {
    try {
      const response = await fetch(`${this.baseUrl}/payments/${paymentId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'access_token': this.apiKey,
        },
        body: JSON.stringify(paymentData),
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error updating payment in Asaas:', error);
      throw error;
    }
  }
  
  // Invoices (NFS-e)
  async createInvoice(invoiceData: Omit<AsaasInvoice, 'id' | 'status' | 'issueDate' | 'series' | 'number' | 'pdf'>): Promise<AsaasInvoice> {
    try {
      const response = await fetch(`${this.baseUrl}/invoices`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'access_token': this.apiKey,
        },
        body: JSON.stringify(invoiceData),
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error creating invoice in Asaas:', error);
      throw error;
    }
  }
  
  async getInvoice(invoiceId: string): Promise<AsaasInvoice> {
    try {
      const response = await fetch(`${this.baseUrl}/invoices/${invoiceId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'access_token': this.apiKey,
        },
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error getting invoice from Asaas:', error);
      throw error;
    }
  }
  
  // Synchronize our transaction with Asaas payment
  async syncTransactionToAsaas(transaction: Transaction): Promise<AsaasPayment> {
    // First, ensure the customer exists in Asaas
    let asaasCustomerId = '';
    if (transaction.clientId) {
      // In a real implementation, you would have mapped customer IDs
      // For this example, we'll just create/assume a customer exists
      // You would typically store the Asaas customer ID when creating/syncing customers
    }
    
    // Create a payment in Asaas for this transaction
    const paymentData: Omit<AsaasPayment, 'id' | 'status'> = {
      customer: asaasCustomerId, // You would use actual Asaas customer ID
      billingType: 'BOLETO', // Default for demo
      dueDate: transaction.date.split('T')[0], // Use transaction date as due date
      value: transaction.amount,
      description: transaction.description,
      externalReference: transaction.id, // Link to our transaction ID
    };
    
    return this.createPayment(paymentData);
  }
  
  // Get all payments for a specific customer
  async getCustomerPayments(customerId: string): Promise<AsaasPayment[]> {
    try {
      const response = await fetch(`${this.baseUrl}/payments?customer=${customerId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'access_token': this.apiKey,
        },
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      return data.data || [];
    } catch (error) {
      console.error('Error getting customer payments from Asaas:', error);
      throw error;
    }
  }
}

export default AsaasAPI;