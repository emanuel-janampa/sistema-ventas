import React, { useEffect, useState } from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';

import DataTable from '../components/DataTable';
import Loader from '../components/Loader';
import AlertSnackbar from '../components/AlertSnackbar';
import ConfirmDialog from '../components/ConfirmDialog';

import { getClientes, createCliente, updateCliente, deleteCliente } from '../services/clientes.service';

export default function Clientes() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);

  const [openForm, setOpenForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [formValues, setFormValues] = useState({ firstName: '', lastName: '', email: '', phone: '' });

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [toDelete, setToDelete] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, severity: 'success', message: '' });

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await getClientes();
      setRows(res.data || []);
    } catch (err) {
      setSnackbar({ open: true, severity: 'error', message: 'No se pudieron cargar los clientes' });
    } finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, []);

  useEffect(() => {
    const onOpen = () => handleOpenCreate();
    window.addEventListener('open-create-cliente', onOpen);
    return () => window.removeEventListener('open-create-cliente', onOpen);
  }, []);

  const handleOpenCreate = () => { setEditing(null); setFormValues({ firstName: '', lastName: '', email: '', phone: '' }); setOpenForm(true); };
  const handleOpenEdit = (item) => { setEditing(item); setFormValues({ firstName: item.firstName || '', lastName: item.lastName || '', email: item.email || '', phone: item.phone || '' }); setOpenForm(true); };

  const handleSave = async () => {
    // Validaciones
    if (!formValues.firstName || !formValues.firstName.trim()) { setSnackbar({ open: true, severity: 'error', message: 'El nombre es obligatorio' }); return; }
    if (!formValues.lastName || !formValues.lastName.trim()) { setSnackbar({ open: true, severity: 'error', message: 'El apellido es obligatorio' }); return; }
    if (!formValues.email || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(formValues.email)) { setSnackbar({ open: true, severity: 'error', message: 'Email inválido' }); return; }
    if (formValues.phone && !/^[0-9]+$/.test(formValues.phone)) { setSnackbar({ open: true, severity: 'error', message: 'El teléfono debe contener solo números' }); return; }

    try {
      const payload = {
        ...formValues,
        phone: formValues.phone?.trim() || null,
      };

      if (editing) {
        await updateCliente(editing.id, payload);
        setSnackbar({ open: true, severity: 'success', message: 'Cliente actualizado' });
      } else {
        await createCliente(payload);
        setSnackbar({ open: true, severity: 'success', message: 'Cliente creado' });
      }
      setOpenForm(false);
      fetchData();
} catch (err) {
        const message = err?.response?.data?.message || err?.response?.data?.error || 'Error al guardar cliente';
        setSnackbar({ open: true, severity: 'error', message });
      }
    };

    const handleDeleteClick = (item) => { setToDelete(item); setConfirmOpen(true); };
    const handleDelete = async () => {
      try { await deleteCliente(toDelete.id); setSnackbar({ open: true, severity: 'success', message: 'Cliente eliminado' }); setConfirmOpen(false); fetchData(); }
      catch (err) { const message = err?.response?.data?.message || err?.response?.data?.error || 'Error al eliminar cliente'; setSnackbar({ open: true, severity: 'error', message }); }
    };

  const columns = [
    { field: 'firstName', headerName: 'Nombre' },
    { field: 'lastName', headerName: 'Apellido' },
    { field: 'email', headerName: 'Email' },
    { field: 'phone', headerName: 'Teléfono' },
  ];

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5">Clientes</Typography>
        <Button variant="contained" onClick={handleOpenCreate}>Nuevo Cliente</Button>
      </Box>

      {loading ? <Loader /> : <DataTable columns={columns} rows={rows} onEdit={(r) => handleOpenEdit(r)} onDelete={(r) => handleDeleteClick(r)} emptyTitle="Sin clientes" emptyDescription="No hay clientes registrados." emptyAction={<Button variant="contained" onClick={handleOpenCreate}>Crear Cliente</Button>} />}

      <Dialog open={openForm} onClose={() => setOpenForm(false)} fullWidth>
        <DialogTitle>{editing ? 'Editar Cliente' : 'Nuevo Cliente'}</DialogTitle>
        <DialogContent>
          <TextField autoFocus margin="normal" label="Nombre" fullWidth value={formValues.firstName} onChange={(e) => setFormValues((prev) => ({ ...prev, firstName: e.target.value }))} />
          <TextField margin="normal" label="Apellido" fullWidth value={formValues.lastName} onChange={(e) => setFormValues((prev) => ({ ...prev, lastName: e.target.value }))} />
          <TextField margin="normal" label="Email" fullWidth value={formValues.email} onChange={(e) => setFormValues((prev) => ({ ...prev, email: e.target.value }))} />
          <TextField margin="normal" label="Teléfono" fullWidth value={formValues.phone} onChange={(e) => setFormValues((prev) => ({ ...prev, phone: e.target.value }))} />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenForm(false)}>Cancelar</Button>
          <Button variant="contained" onClick={handleSave}>{editing ? 'Guardar' : 'Crear'}</Button>
        </DialogActions>
      </Dialog>

      <ConfirmDialog open={confirmOpen} title="Eliminar cliente" content={`¿Desea eliminar el cliente "${toDelete?.nombre}"?`} onCancel={() => setConfirmOpen(false)} onConfirm={handleDelete} />
      <AlertSnackbar open={snackbar.open} onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))} severity={snackbar.severity}>{snackbar.message}</AlertSnackbar>
    </Box>
  );
}
