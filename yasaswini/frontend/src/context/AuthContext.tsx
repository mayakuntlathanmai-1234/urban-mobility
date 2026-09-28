import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, Role } from '../types';
import { authApi, LoginDTO, RegisterDTO } from '../api/authApi';

interface AuthContextType {
  user: User | null;
  token: string | null;
  role: Role | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  loading: boolean;
  login: (dto: LoginDTO) => Promise<User>;
  register: (dto: RegisterDTO) => Promise<void>;
  logout: () => void;
  setUser: (user: User | null) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    try {
      const savedToken = localStorage.getItem('urban_token');
      const savedUser = localStorage.getItem('urban_user');
      if (savedToken && savedUser) {
        setToken(savedToken);
        setUser(JSON.parse(savedUser));
      }
    } catch (e) {
      console.error('Failed to parse saved auth credentials', e);
      localStorage.removeItem('urban_token');
      localStorage.removeItem('urban_user');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const login = async (dto: LoginDTO): Promise<User> => {
    setIsLoading(true);
    try {
      const data = await authApi.login(dto);
      if (!data.user) {
        throw new Error(data.message || 'Login failed');
      }

      const loggedUser = data.user;
      const jwtToken = data.token || 'demo-jwt-token';

      setUser(loggedUser);
      setToken(jwtToken);

      localStorage.setItem('urban_token', jwtToken);
      localStorage.setItem('urban_user', JSON.stringify(loggedUser));
      localStorage.setItem('urban_user_id', loggedUser.id);

      return loggedUser;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (dto: RegisterDTO): Promise<void> => {
    setIsLoading(true);
    try {
      await authApi.register(dto);
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('urban_token');
    localStorage.removeItem('urban_user');
    localStorage.removeItem('urban_user_id');
  };

  const role = user?.role || null;
  const isAuthenticated = !!token && !!user;

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        role,
        isAuthenticated,
        isLoading,
        loading: isLoading,
        login,
        register,
        logout,
        setUser,
      }}
    >
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
