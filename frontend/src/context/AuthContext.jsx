import { createContext, useContext, useEffect, useState } from 'react';
import axios from '../api/axios';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const login = async (credentials) => {
    const res = await axios.post('/auth/login', credentials);
    console.log(res)
    setUser(res.data);
    console.log(res.data)
  };

  const logout = async () => {
    await axios.post('/auth/logout');
    setUser(null);
  };

  const refreshUser = async () => {
    try {
      const res = await axios.post('/auth/refresh');
      setUser(res.data.user); // Or fetch user info if only token returned
    } catch {
      setUser(null);
    }
  };

  useEffect(() => {
    refreshUser().finally(() => setLoading(false));
  }, []);

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
