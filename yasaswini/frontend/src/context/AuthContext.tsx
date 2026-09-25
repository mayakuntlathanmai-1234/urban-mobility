import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, Role } from '../types';
import { fetchApi } from '../services/api';

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (token: string, user: User) => void;
  logout: () => void;
  switchRole: (role: Role) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('urm_token'));
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const initAuth = async () => {
      const storedToken = localStorage.getItem('urm_token');
      if (storedToken) {
        try {
          const res = await fetchApi<{ user: User }>('/auth/me');
          setUser(res.user);
          setToken(storedToken);
        } catch (err) {
          console.error('Session expired or invalid:', err);
          localStorage.removeItem('urm_token');
          setToken(null);
          setUser(null);
        }
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  const login = (newToken: string, newUser: User) => {
    localStorage.setItem('urm_token', newToken);
    setToken(newToken);
    setUser(newUser);
  };

  const logout = () => {
    localStorage.removeItem('urm_token');
    setToken(null);
    setUser(null);
  };

  const switchRole = async (newRole: Role) => {
    // Helper to quickly log in as preset account for quick demo testing
    let presetEmail = 'passenger@urbanride.com';
    if (newRole === 'DRIVER') presetEmail = 'driver@urbanride.com';
    if (newRole === 'ADMIN') presetEmail = 'admin@urbanride.com';

    try {
      const res = await fetchApi<{ token: string; user: User }>('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email: presetEmail, password: 'password123' })
      });
      login(res.token, res.user);
    } catch (err) {
      console.error('Role switch failed:', err);
    }
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, logout, switchRole }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
