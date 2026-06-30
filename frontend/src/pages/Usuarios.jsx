import React, { useEffect, useState } from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';

import DataTable from '../components/DataTable';
import Loader from '../components/Loader';
import AlertSnackbar from '../components/AlertSnackbar';
import { getUsuarios, createUsuario, updateUsuario } from '../services/usuarios.service';
import { getClientes } from '../services/clientes.service';

export default function Usuarios() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [openForm, setOpenForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [formValues, setFormValues] = useState({ username: '', password: '', role: 'ADMIN', customerId: '' });
  const [clients, setClients] = useState([]);
  const [snackbar, setSnackbar] = useState({ open: false, severity: 'success', message: '' });

  const fetchData = async () => {
    setLoading(true);
    try {
      const [usersRes, clientsRes] = await Promise.all([getUsuarios(), getClientes()]);
      const clientMap = new Map((clientsRes.data || []).map((c) => [c.id, c.nombre || `${c.firstName} ${c.lastName}`]));
      const users = (usersRes.data || []).map((user) => ({
        ...user,
        nombre: clientMap.get(user.customerId) || 'Sin nombre',
        status: user.status || 'ACTIVO',
      }));
      setRows(users);
      setClients((clientsRes.data || []).map((c) => ({ id: c.id, nombre: c.nombre || `${c.firstName} ${c.lastName}` })));
    } catch (err) {
      setSnackbar({ open: true, severity: 'error', message: 'No se pudieron cargar los usuarios o clientes' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const handleOpenCreate = () => { setEditing(null); setFormValues({ username: '', password: '', role: 'ADMIN', customerId: '' }); setOpenForm(true); };
  const handleOpenEdit = (item) => { setEditing(item); setFormValues({ username: item.username || '', password: '', role: item.role || 'ADMIN', customerId: item.customerId || '' }); setOpenForm(true); };

  const handleSave = async () => {
    if (!formValues.username || !formValues.username.trim()) { setSnackbar({ open: true, severity: 'error', message: 'El usuario es obligatorio' }); return; }
    if (!formValues.customerId) { setSnackbar({ open: true, severity: 'error', message: 'Debe seleccionar un cliente' }); return; }
    if (!editing) {
      if (!formValues.password || formValues.password.length < 6) { setSnackbar({ open: true, severity: 'error', message: 'La contraseña es obligatoria y debe tener al menos 6 caracteres' }); return; }
    } else if (formValues.password && formValues.password.length > 0 && formValues.password.length < 6) {
      setSnackbar({ open: true, severity: 'error', message: 'La contraseña debe tener al menos 6 caracteres' }); return;
    }

    const payload = {
      username: formValues.username,
      role: formValues.role,
      customerId: Number(formValues.customerId),
    };

    if (!editing || formValues.password?.trim()) {
      payload.password = formValues.password;
    }

    try {
      if (editing) {
        await updateUsuario(editing.id, payload);
        setSnackbar({ open: true, severity: 'success', message: 'Usuario actualizado' });
      } else {
        await createUsuario(payload);
        setSnackbar({ open: true, severity: 'success', message: 'Usuario creado' });
      }
      setOpenForm(false);
      fetchData();
    } catch (err) {
      setSnackbar({ open: true, severity: 'error', message: err?.response?.data?.error || 'Error al guardar usuario' });
    }
  };

  const columns = [
    { field: 'username', headerName: 'Usuario' },
    { field: 'nombre', headerName: 'Nombre' },
    { field: 'role', headerName: 'Rol' },
    { field: 'status', headerName: 'Estado' },
  ];

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5">Usuarios</Typography>
        <Button variant="contained" onClick={handleOpenCreate}>Nuevo Usuario</Button>
      </Box>

      {loading ? <Loader /> : <DataTable columns={columns} rows={rows} onEdit={(r) => handleOpenEdit(r)} />}

      <Dialog open={openForm} onClose={() => setOpenForm(false)} fullWidth>
        <DialogTitle>{editing ? 'Editar Usuario' : 'Nuevo Usuario'}</DialogTitle>
        <DialogContent>
          <TextField autoFocus margin="normal" label="Usuario" fullWidth value={formValues.username} onChange={(e) => setFormValues((prev) => ({ ...prev, username: e.target.value }))} />
          <TextField
            margin="normal"
            label="Contraseña"
            type="password"
            fullWidth
            value={formValues.password || ''}
            onChange={(e) => setFormValues((prev) => ({ ...prev, password: e.target.value }))}
            helperText={editing ? 'Dejar vacío para mantener la contraseña actual' : ''}
          />
          <FormControl fullWidth margin="normal" size="small">
            <InputLabel>Cliente</InputLabel>
            <Select value={formValues.customerId} label="Cliente" onChange={(e) => setFormValues((prev) => ({ ...prev, customerId: e.target.value }))}>
              <MenuItem value="">Seleccionar cliente</MenuItem>
              {clients.map((client) => (
                <MenuItem key={client.id} value={client.id}>{client.nombre}</MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControl fullWidth margin="normal" size="small">
            <InputLabel>Rol</InputLabel>
            <Select value={formValues.role} label="Rol" onChange={(e) => setFormValues((prev) => ({ ...prev, role: e.target.value }))}>
              <MenuItem value="ADMIN">ADMIN</MenuItem>
              <MenuItem value="CUSTOMER">CUSTOMER</MenuItem>
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenForm(false)}>Cancelar</Button>
          <Button variant="contained" onClick={handleSave}>{editing ? 'Guardar' : 'Crear'}</Button>
        </DialogActions>
      </Dialog>
      <AlertSnackbar open={snackbar.open} onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))} severity={snackbar.severity}>{snackbar.message}</AlertSnackbar>
    </Box>
  );
}
