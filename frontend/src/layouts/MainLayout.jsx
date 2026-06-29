import React from 'react';
import { Navigate } from 'react-router-dom';
import Box from '@mui/material/Box';
import Toolbar from '@mui/material/Toolbar';
import CssBaseline from '@mui/material/CssBaseline';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import { useAuth } from '../context/AuthContext';
import AlertSnackbar from '../components/AlertSnackbar';
import { useEffect, useState } from 'react';

const MainLayout = ({ children, allowedRoles }) => {
  const { auth, hasRole } = useAuth();

  const [notify, setNotify] = useState({ open: false, severity: 'info', message: '' });

  useEffect(() => {
    const handler = (e) => {
      const { severity = 'info', message = '' } = e.detail || {};
      setNotify({ open: true, severity, message });
    };
    window.addEventListener('app-notify', handler);
    return () => window.removeEventListener('app-notify', handler);
  }, []);

  if (!auth.token) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !hasRole(allowedRoles)) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', background: 'linear-gradient(135deg, #f8fafc 0%, #eef2ff 100%)' }}>
      <CssBaseline />
      <Sidebar />
      <Box component="main" sx={{ flexGrow: 1 }}>
        <Navbar />
        <Toolbar />
        <Box sx={{ p: { xs: 2, md: 4 } }}>{children}</Box>
        <AlertSnackbar open={notify.open} onClose={() => setNotify((s) => ({ ...s, open: false }))} severity={notify.severity}>{notify.message}</AlertSnackbar>
      </Box>
    </Box>
  );
};

export default MainLayout;
