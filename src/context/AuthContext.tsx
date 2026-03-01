'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';

export type User = {
  id: string;
  username: string;
  firstName: string;
  lastName: string;
  email: string;
  roles: string[];
  profileImage?: string;
};

type AuthContextType = {
  user: User | null;
  token: string | null;
  login: (userData: any) => void;
  updateUser: (userData: Partial<User>) => void;
  logout: () => void;
  isAuthenticated: boolean;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const savedToken = localStorage.getItem('farmconnect_token');
    const savedUser = localStorage.getItem('farmconnect_user');
    
    if (savedToken && savedUser) {
      try {
        setToken(savedToken);
        setUser(JSON.parse(savedUser));
      } catch (e) {
        localStorage.removeItem('farmconnect_token');
        localStorage.removeItem('farmconnect_user');
      }
    }
    setMounted(true);
  }, []);

  const login = useCallback((data: any) => {
    const { token, type, ...userData } = data;
    const fullToken = `${type} ${token}`;
    
    setToken(fullToken);
    setUser(userData);
    
    localStorage.setItem('farmconnect_token', fullToken);
    localStorage.setItem('farmconnect_user', JSON.stringify(userData));
  }, []);

  const updateUser = useCallback((userData: Partial<User>) => {
    setUser(prev => {
      if (!prev) return null;
      const updated = { ...prev, ...userData };
      localStorage.setItem('farmconnect_user', JSON.stringify(updated));
      return updated;
    });
  }, []);

  const logout = useCallback(() => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('farmconnect_token');
    localStorage.removeItem('farmconnect_user');
    router.push('/');
  }, [router]);

  const isAuthenticated = !!token;

  const contextValue = useMemo(() => ({
    user,
    token,
    login,
    updateUser,
    logout,
    isAuthenticated
  }), [user, token, login, updateUser, logout, isAuthenticated]);

  return (
    <AuthContext.Provider value={contextValue}>
      {mounted ? children : null}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
