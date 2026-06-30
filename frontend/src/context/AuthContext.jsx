import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';

const AuthContext = createContext(null);

const isTokenExpired = (token) => {
  if (!token) return true;
  try {
    const [, payload] = token.split('.');
    if (!payload) return true;
    const decoded = JSON.parse(atob(payload.replace(/-/g, '+').replace(/_/g, '/')));
    return decoded.exp ? decoded.exp * 1000 < Date.now() : true;
  } catch {
    return true;
  }
};

const readStoredAuth = () => {
  if (typeof window === 'undefined') {
    return { token: null, role: 'CLIENTE', username: '' };
  }

  const token = localStorage.getItem('token');
  if (!token || isTokenExpired(token)) {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    localStorage.removeItem('username');
    return { token: null, role: 'CLIENTE', username: '' };
  }

  return {
    token,
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

  React.useEffect(() => {
    const handleLogout = () => {
      logout();
    };
    window.addEventListener('app-logout', handleLogout);
    return () => window.removeEventListener('app-logout', handleLogout);
  }, []);

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
