import { createContext, useContext, useState, useCallback } from 'react';
import api from '../api/axios';

// Centralized auth state via Context API — the logged-in user, the JWT,
// and the login/register/logout actions every page needs. This is the
// single source of truth instead of each page re-reading localStorage.
const AuthContext = createContext(null);

function readStoredUser() {
  try {
    const raw = localStorage.getItem('cp_user');
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(readStoredUser());
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const login = useCallback(async (email, password) => {
    setLoading(true);
    setError('');
    try {
      const { data } = await api.post('/auth/login', { email, password });
      const loggedInUser = { id: data.id, name: data.name, role: data.role };
      localStorage.setItem('cp_token', data.token);
      localStorage.setItem('cp_user', JSON.stringify(loggedInUser));
      setUser(loggedInUser);
      return loggedInUser;
    } catch (err) {
      const msg = err.response?.data?.error || 'Login failed. Please try again.';
      setError(msg);
      throw new Error(msg);
    } finally {
      setLoading(false);
    }
  }, []);

  const register = useCallback(async (name, email, password, department) => {
    setLoading(true);
    setError('');
    try {
      await api.post('/auth/register', { name, email, password, department });
    } catch (err) {
      const msg = err.response?.data?.error || 'Registration failed. Please try again.';
      setError(msg);
      throw new Error(msg);
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('cp_token');
    localStorage.removeItem('cp_user');
    setUser(null);
  }, []);

  const value = { user, loading, error, login, register, logout, isAuthenticated: !!user };
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
}
