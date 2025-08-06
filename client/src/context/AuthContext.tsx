import React, { createContext, useContext, useState, useEffect } from 'react';
import { apiClient } from '../lib/api';
import type { User } from '@shared/schema';

interface AuthContextType {
  currentUser: User | null;
  login: (email: string, password: string) => Promise<User | null>;
  logout: () => Promise<void>;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  setCurrentUser: (user: User | null) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // For demo purposes, check localStorage for stored user session
    const checkStoredUser = () => {
      try {
        const storedUser = localStorage.getItem('currentUser');
        if (storedUser) {
          setCurrentUser(JSON.parse(storedUser));
        }
      } catch (error) {
        console.error('Error checking stored user:', error);
      } finally {
        setIsLoading(false);
      }
    };

    checkStoredUser();

    // Listen for storage changes to handle demo login
    const handleStorageChange = () => {
      checkStoredUser();
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const login = async (email: string, password: string): Promise<User | null> => {
    try {
      setError(null);
      setIsLoading(true);

      const response = (await apiClient.login(email, password)) as { user: User };
      const user = response.user;

      setCurrentUser(user);
      localStorage.setItem('currentUser', JSON.stringify(user));

      return user;
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Login failed');
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async (): Promise<void> => {
    try {
      setCurrentUser(null);
      localStorage.removeItem('currentUser');
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Logout failed');
    }
  };

  const setCurrentUserDirect = (user: User | null) => {
    setCurrentUser(user);
    if (user) {
      localStorage.setItem('currentUser', JSON.stringify(user));
    } else {
      localStorage.removeItem('currentUser');
    }
  };

  const value: AuthContextType = {
    currentUser,
    login,
    logout,
    isAuthenticated: !!currentUser,
    isLoading,
    error,
    setCurrentUser: setCurrentUserDirect,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
