// src/auth/AuthService.ts
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface User {
  id: string;
  name: string;
  email: string;
  cpfCnpj: string;
  businessType: 'MEI' | 'EPP' | 'Individual'; // MEI, EPP, or Individual Professional
  fiscalRegime: 'MEI' | 'Simples Nacional' | 'Lucro Presumido' | 'Lucro Real';
}

class AuthService {
  private static instance: AuthService;
  private currentUser: User | null = null;
  
  private constructor() {}

  public static getInstance(): AuthService {
    if (!AuthService.instance) {
      AuthService.instance = new AuthService();
    }
    return AuthService.instance;
  }

  async login(email: string, password: string): Promise<User | null> {
    // In a real app, this would be an API call to your backend
    // For now, we'll simulate authentication
    
    // Simulating an API call with a delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Dummy user data for simulation
    const dummyUser: User = {
      id: '1',
      name: 'Engenheiro Teste',
      email: email,
      cpfCnpj: '12345678901',
      businessType: 'MEI',
      fiscalRegime: 'MEI'
    };
    
    this.currentUser = dummyUser;
    await AsyncStorage.setItem('user', JSON.stringify(dummyUser));
    
    return dummyUser;
  }

  async register(userData: Omit<User, 'id'>, password: string): Promise<User> {
    // In a real app, this would be an API call to your backend
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const newUser: User = {
      id: Math.random().toString(),
      ...userData
    };
    
    this.currentUser = newUser;
    await AsyncStorage.setItem('user', JSON.stringify(newUser));
    
    return newUser;
  }

  async logout(): Promise<void> {
    this.currentUser = null;
    await AsyncStorage.removeItem('user');
  }

  async getCurrentUser(): Promise<User | null> {
    if (this.currentUser) {
      return this.currentUser;
    }
    
    const userData = await AsyncStorage.getItem('user');
    if (userData) {
      this.currentUser = JSON.parse(userData);
      return this.currentUser;
    }
    
    return null;
  }

  async isAuthenticated(): Promise<boolean> {
    const user = await this.getCurrentUser();
    return user !== null;
  }

  async updateProfile(updates: Partial<User>): Promise<User | null> {
    if (!this.currentUser) {
      throw new Error('User not authenticated');
    }

    const updatedUser = { ...this.currentUser, ...updates };
    this.currentUser = updatedUser;
    await AsyncStorage.setItem('user', JSON.stringify(updatedUser));
    
    return updatedUser;
  }

  async updateFiscalInfo(businessType: User['businessType'], fiscalRegime: User['fiscalRegime']): Promise<void> {
    if (!this.currentUser) {
      throw new Error('User not authenticated');
    }

    this.currentUser = { 
      ...this.currentUser, 
      businessType,
      fiscalRegime 
    };
    
    await AsyncStorage.setItem('user', JSON.stringify(this.currentUser));
  }
}

export default AuthService.getInstance();