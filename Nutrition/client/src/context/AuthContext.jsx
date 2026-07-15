import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import api from '../api/client.js';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try { return JSON.parse(localStorage.getItem('nutrition_user')); } catch { return null; }
  });
  const [loading, setLoading] = useState(Boolean(localStorage.getItem('nutrition_token')));

  useEffect(() => {
    if (!localStorage.getItem('nutrition_token')) return setLoading(false);
    api.get('/auth/me')
      .then(({ data }) => {
        setUser(data.user);
        localStorage.setItem('nutrition_user', JSON.stringify(data.user));
      })
      .catch(() => setUser(null))
      .finally(() => setLoading(false));
  }, []);

  const login = async (email, password) => {
    const { data } = await api.post('/auth/login', { email, password });
    localStorage.setItem('nutrition_token', data.token);
    localStorage.setItem('nutrition_user', JSON.stringify(data.user));
    setUser(data.user);
    return data.user;
  };

  const register = async (payload) => {
    const { data } = await api.post('/auth/register', payload);
    if (data.token) {
      localStorage.setItem('nutrition_token', data.token);
      localStorage.setItem('nutrition_user', JSON.stringify(data.user));
      setUser(data.user);
    }
    return data;
  };

  const logout = () => {
    localStorage.removeItem('nutrition_token');
    localStorage.removeItem('nutrition_user');
    setUser(null);
  };

  const value = useMemo(() => ({ user, loading, login, register, logout }), [user, loading]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => useContext(AuthContext);
