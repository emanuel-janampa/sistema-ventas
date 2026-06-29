import React, { createContext, useContext, useMemo, useState } from 'react';

const AuthContext = createContext(null);

const readStoredAuth = () => {
  if (typeof window === 'undefined') {
    return { token: null, role: 'CLIENTE', username: '' };
  }

  return {
    token: localStorage.getItem('token') || null,
    role: localStorage.getItem('role') || 'CLIENTE',
    username: localStorage.getItem('username') || '',
  };
};

export function AuthProvider({ children }) {
  const [auth, setAuth] = useState(readStoredAuth);

  const login = ({ token, role = 'CLIENTE', username = '' }) => {
    localStorage.setItem('token', token);
    localStorage.setItem('role', role);
    localStorage.setItem('username', username);
    setAuth({ token, role, username });
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    localStorage.removeItem('username');
    setAuth({ token: null, role: 'CLIENTE', username: '' });
  };

  const value = useMemo(() => ({
    auth,
    isAuthenticated: Boolean(auth.token),
    hasRole: (roles = []) => roles.includes(auth.role),
    login,
    logout,
  }), [auth]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
