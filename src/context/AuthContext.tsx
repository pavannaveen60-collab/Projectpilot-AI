import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { UserSession } from '../types';
import { authService } from '../services/auth';

interface AuthContextType {
  currentUser: UserSession | null;
  loading: boolean;
  login: (email: string, password?: string) => Promise<{ error?: string }>;
  register: (name: string, email: string, password?: string) => Promise<{ error?: string }>;
  updateDisplayName: (name: string) => Promise<void>;
  loginAsDemoStudent: () => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [currentUser, setCurrentUser] = useState<UserSession | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const user = authService.getCurrentUser();
    if (user) {
      setCurrentUser(user);
    }
    setLoading(false);
  }, []);

  const login = async (email: string, password?: string) => {
    const res = await authService.login(email, password);
    if (res.user) {
      setCurrentUser(res.user);
      return {};
    }
    return { error: res.error };
  };

  const register = async (name: string, email: string, password?: string) => {
    const res = await authService.register(name, email, password);
    if (res.user) {
      setCurrentUser(res.user);
      return {};
    }
    return { error: res.error };
  };

  const updateDisplayName = async (name: string) => {
    const updated = await authService.updateDisplayName(name);
    if (updated) {
      setCurrentUser({ ...updated });
    }
  };

  const loginAsDemoStudent = async () => {
    const demo = await authService.loginAsDemoStudent();
    setCurrentUser(demo);
  };

  const logout = async () => {
    await authService.logout();
    setCurrentUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        loading,
        login,
        register,
        updateDisplayName,
        loginAsDemoStudent,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
