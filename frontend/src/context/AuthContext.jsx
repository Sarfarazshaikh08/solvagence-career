import { createContext, useContext, useState, useEffect } from 'react';
import { authAPI } from '../api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [admin, setAdmin]     = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('svg_token');
    if (token) {
      authAPI.me()
        .then(r => setAdmin(r.data.admin))
        .catch(() => localStorage.removeItem('svg_token'))
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (username, password) => {
    const r = await authAPI.login({ username, password });
    localStorage.setItem('svg_token', r.data.token);
    setAdmin(r.data.admin);
  };

  const logout = () => {
    localStorage.removeItem('svg_token');
    setAdmin(null);
  };

  return (
    <AuthContext.Provider value={{ admin, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
