import { createContext, useContext, useEffect, useState } from 'react';
import axios from '../api/axios';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

const login = async (credentials) => {
  try {
    const res = await axios.post('/auth/login', credentials, {
      withCredentials: true, // ✅ important if you're using cookies (like your token)
    });

    // Update the context/state
    setUser(res.data);

    return { success: true };
  } catch (err) {
   if (!err.response) {
      return {
        success: false,
        message: 'Network error. Please check your internet connection.',
      };
    }

    const { status, data } = err.response;

    let message = 'Login failed. Please try again.';

    if (status === 400) {
      message = 'Please enter both email and password.';
    } else if (status === 401) {
      message = 'Invalid email or password.';
    } else if (status === 403) {
      message = 'Session expired. Please log in again.';
    } else if (data?.message) {
      message = data.message;
    }

    return { success: false, message };
  
  }
};

  const logout = async () => {
    try {
      await axios.post('/auth/logout');
    } catch (error) {
      let message = 'Login failed. Please try again.';

      if (!window.navigator.onLine) {
        message = 'No internet connection. Please check your network.';
      } else if (error.response) {
        // Server responded with an error status code
        if (error.response.status === 401) {
          message = 'Invalid email or password.';
        } else {
          message = error.response.data?.message || 'Server error occurred.';
        }
      } else if (error.request) {
        // Request was made but no response received
        message = 'Unable to reach server. Check your connection.';
      } else {
        // Something else went wrong
        message = error.message;
      }

      return { success: false, message };
    } finally {
      setUser(null);
      window.location.href = '/login';
    }
  };

  const refreshUser = async () => {
    try {
      const res = await axios.post('/auth/refresh');
      console.log(res)
      setUser(res.data.data); // Or fetch user info if only token returned
    } catch {
      setUser(null);
    }
  };

  useEffect(() => {
    refreshUser().finally(() => setLoading(false));
  }, []);

  const isAuthenticated = !!user;

  return (
    <AuthContext.Provider value={{ user, login, isAuthenticated, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
