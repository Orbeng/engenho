// src/auth/AuthContext.tsx
import React, { createContext, useContext, useEffect, useState } from 'react';
import { User } from './AuthService';
import AuthService from './AuthService';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<User | null>;
  register: (userData: Omit<User, 'id'>, password: string) => Promise<User>;
  logout: () => Promise<void>;
  updateProfile: (updates: Partial<User>) => Promise<User | null>;
  updateFiscalInfo: (businessType: User['businessType'], fiscalRegime: User['fiscalRegime']) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadUser = async () => {
      try {
        const currentUser = await AuthService.getCurrentUser();
        setUser(currentUser);
      } catch (error) {
        console.error('Failed to load user:', error);
      } finally {
        setLoading(false);
      }
    };

    loadUser();
  }, []);

  const login = async (email: string, password: string): Promise<User | null> => {
    const userData = await AuthService.login(email, password);
    setUser(userData);
    return userData;
  };

  const register = async (userData: Omit<User, 'id'>, password: string): Promise<User> => {
    const newUser = await AuthService.register(userData, password);
    setUser(newUser);
    return newUser;
  };

  const logout = async () => {
    await AuthService.logout();
    setUser(null);
  };

  const updateProfile = async (updates: Partial<User>): Promise<User | null> => {
    const updatedUser = await AuthService.updateProfile(updates);
    if (updatedUser) {
      setUser(updatedUser);
    }
    return updatedUser;
  };

  const updateFiscalInfo = async (businessType: User['businessType'], fiscalRegime: User['fiscalRegime']): Promise<void> => {
    await AuthService.updateFiscalInfo(businessType, fiscalRegime);
    const currentUser = await AuthService.getCurrentUser();
    setUser(currentUser);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        register,
        logout,
        updateProfile,
        updateFiscalInfo
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};