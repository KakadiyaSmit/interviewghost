// ============================================================
// FILE: client/src/context/AuthContext.jsx
// PURPOSE: Global auth state — who is logged in?
// Any component can check: const { user } = useAuth()
// ============================================================

import { createContext, useContext, useState, useEffect } from 'react';

// Create the context — like creating a global variable
const AuthContext = createContext(null);

// AuthProvider wraps the whole app
// Everything inside it can access auth state
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  // loading = true while we check if user is already logged in

  useEffect(() => {
    // When app loads, check if token exists in localStorage
    // If it does, user is already logged in
    const token = localStorage.getItem('token');
    const savedUser = localStorage.getItem('user');

    if (token && savedUser) {
      setUser(JSON.parse(savedUser));
    }
    setLoading(false);
  }, []);

  const login = (token, userData) => {
    // Save to localStorage so login persists after refresh
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(userData));
    setUser(userData);
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook — makes using context cleaner
// Usage: const { user, login, logout } = useAuth()
export const useAuth = () => useContext(AuthContext);