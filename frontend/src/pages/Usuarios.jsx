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
import ConfirmDialog from '../components/ConfirmDialog';

import { getUsuarios, createUsuario, updateUsuario, deleteUsuario } from '../services/usuarios.service';

export default function Usuarios() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [openForm, setOpenForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [formValues, setFormValues] = useState({ username: '', nombre: '', role: 'ADMIN' });
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [toDelete, setToDelete] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, severity: 'success', message: '' });

  const fetchData = async () => {
    setLoading(true);
    try { const res = await getUsuarios(); setRows(res.data || []); }
    catch (err) { setSnackbar({ open: true, severity: 'error', message: 'No se pudieron cargar los usuarios' }); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, []);

  const handleOpenCreate = () => { setEditing(null); setFormValues({ username: '', nombre: '', role: 'ADMIN' }); setOpenForm(true); };
  const handleOpenEdit = (item) => { setEditing(item); setFormValues({ username: item.username || '', nombre: item.nombre || '', role: item.role || 'ADMIN' }); setOpenForm(true); };

  const handleSave = async () => {
    // Validaciones
    if (!formValues.username || !formValues.username.trim()) { setSnackbar({ open: true, severity: 'error', message: 'El usuario es obligatorio' }); return; }
    if (!editing) {
      if (!formValues.password || formValues.password.length < 6) { setSnackbar({ open: true, severity: 'error', message: 'La contraseña es obligatoria y debe tener al menos 6 caracteres' }); return; }
    }

    try {
      if (editing) { await updateUsuario(editing.id, formValues); setSnackbar({ open: true, severity: 'success', message: 'Usuario actualizado' }); }
      else { await createUsuario(formValues); setSnackbar({ open: true, severity: 'success', message: 'Usuario creado' }); }
      setOpenForm(false); fetchData();
    } catch (err) { setSnackbar({ open: true, severity: 'error', message: 'Error al guardar usuario' }); }
  };

  const handleDeleteClick = (item) => { setToDelete(item); setConfirmOpen(true); };
  const handleDelete = async () => { try { await deleteUsuario(toDelete.id); setSnackbar({ open: true, severity: 'success', message: 'Usuario eliminado' }); setConfirmOpen(false); fetchData(); } catch (err) { setSnackbar({ open: true, severity: 'error', message: 'Error al eliminar usuario' }); } };

  const columns = [
    { field: 'username', headerName: 'Usuario' },
    { field: 'nombre', headerName: 'Nombre' },
    { field: 'role', headerName: 'Rol' },
  ];

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5">Usuarios</Typography>
        <Button variant="contained" onClick={handleOpenCreate}>Nuevo Usuario</Button>
      </Box>

      {loading ? <Loader /> : <DataTable columns={columns} rows={rows} onEdit={(r) => handleOpenEdit(r)} onDelete={(r) => handleDeleteClick(r)} />}

      <Dialog open={openForm} onClose={() => setOpenForm(false)} fullWidth>
        <DialogTitle>{editing ? 'Editar Usuario' : 'Nuevo Usuario'}</DialogTitle>
        <DialogContent>
          <TextField autoFocus margin="normal" label="Usuario" fullWidth value={formValues.username} onChange={(e) => setFormValues((prev) => ({ ...prev, username: e.target.value }))} />
          <TextField margin="normal" label="Nombre" fullWidth value={formValues.nombre} onChange={(e) => setFormValues((prev) => ({ ...prev, nombre: e.target.value }))} />
          {!editing && (
            <TextField margin="normal" label="Contraseña" type="password" fullWidth value={formValues.password || ''} onChange={(e) => setFormValues((prev) => ({ ...prev, password: e.target.value }))} />
          )}
          <FormControl fullWidth margin="normal" size="small">
            <InputLabel>Rol</InputLabel>
            <Select value={formValues.role} label="Rol" onChange={(e) => setFormValues((prev) => ({ ...prev, role: e.target.value }))}>
              <MenuItem value="ADMIN">ADMIN</MenuItem>
              <MenuItem value="CLIENTE">CLIENTE</MenuItem>
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenForm(false)}>Cancelar</Button>
          <Button variant="contained" onClick={handleSave}>{editing ? 'Guardar' : 'Crear'}</Button>
        </DialogActions>
      </Dialog>

      <ConfirmDialog open={confirmOpen} title="Eliminar usuario" content={`¿Desea eliminar al usuario "${toDelete?.username}"?`} onCancel={() => setConfirmOpen(false)} onConfirm={handleDelete} />
      <AlertSnackbar open={snackbar.open} onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))} severity={snackbar.severity}>{snackbar.message}</AlertSnackbar>
    </Box>
  );
}
