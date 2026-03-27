import { createContext, useState, useContext, useEffect } from 'react';
import { apiRequest, getAuthToken, setAuthToken } from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const initializeAuth = async () => {
      const token = getAuthToken();

      if (!token) {
        setIsLoading(false);
        return;
      }

      try {
        const userData = await apiRequest('/auth/me');
        setUser(userData);
      } catch {
        setAuthToken(null);
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();
  }, []);

  const signup = async (email, password, fullName, role = 'user') => {
    setError(null);
    try {
      const data = await apiRequest('/auth/signup', {
        method: 'POST',
        auth: false,
        body: { email, password, fullName, role },
      });

      setAuthToken(data.token);
      setUser(data.user);
      return data.user;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const login = async (email, password) => {
    setError(null);
    try {
      const data = await apiRequest('/auth/login', {
        method: 'POST',
        auth: false,
        body: { email, password },
      });

      setAuthToken(data.token);
      setUser(data.user);
      return data.user;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const logout = () => {
    setUser(null);
    setAuthToken(null);
    setError(null);
  };

  const updateProfile = async (updates) => {
    try {
      const data = await apiRequest(`/users/${user._id}`, {
        method: 'PUT',
        body: updates,
      });

      setUser(data.user);
      return data.user;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const value = {
    user,
    isLoading,
    error,
    signup,
    login,
    logout,
    updateProfile,
    isAuthenticated: !!user,
    isAdmin: user?.role === 'admin',
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
