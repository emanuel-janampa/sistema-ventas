import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import Stack from '@mui/material/Stack';
import Alert from '@mui/material/Alert';
import CircularProgress from '@mui/material/CircularProgress';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('Iniciando sesión...');

    try {
      const response = await api.post('/auth/login', { username, password });
      const token = response?.data?.token;
      const role = response?.data?.role || 'CLIENTE';

      if (!token) {
        throw new Error('No se recibió token');
      }

      login({ token, role, username });
      setMessage('Sesión iniciada');
      navigate('/dashboard', { replace: true });
    } catch (err) {
      setMessage('Error en las credenciales de acceso.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: 'linear-gradient(135deg, #eff6ff 0%, #f8fafc 100%)', p: 3 }}>
      <Card sx={{ width: '100%', maxWidth: 420, borderRadius: 4, boxShadow: '0 20px 45px rgba(15,23,42,0.12)' }}>
        <CardContent sx={{ p: { xs: 3, md: 4 } }}>
          <Stack spacing={2} alignItems="center" sx={{ mb: 3 }}>
            <Typography variant="h4" sx={{ fontWeight: 700, color: 'primary.main' }}>Sistema Ventas</Typography>
            <Typography color="text.secondary" textAlign="center">Ingresa tus credenciales para continuar</Typography>
          </Stack>

          <Box component="form" onSubmit={handleLogin}>
            <TextField label="Usuario" fullWidth margin="normal" value={username} onChange={(e) => setUsername(e.target.value)} required />
            <TextField label="Contraseña" type="password" fullWidth margin="normal" value={password} onChange={(e) => setPassword(e.target.value)} required />
            <Button type="submit" variant="contained" fullWidth sx={{ mt: 2, py: 1.2 }} disabled={loading}>
              {loading ? <CircularProgress size={22} color="inherit" /> : 'Ingresar al Sistema'}
            </Button>
          </Box>

          {message ? (
            <Alert severity={message.includes('Error') ? 'error' : 'success'} sx={{ mt: 2 }}>
              {message}
            </Alert>
          ) : null}
        </CardContent>
      </Card>
    </Box>
  );
}
