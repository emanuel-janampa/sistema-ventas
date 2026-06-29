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

import { getCategorias, createCategoria, updateCategoria, deleteCategoria } from '../services/categorias.service';

export default function Categorias() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);

  const [openForm, setOpenForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [formValues, setFormValues] = useState({ nombre: '', descripcion: '' });

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [toDelete, setToDelete] = useState(null);

  const [snackbar, setSnackbar] = useState({ open: false, severity: 'success', message: '' });

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await getCategorias();
      setRows(res.data || []);
    } catch (err) {
      setSnackbar({ open: true, severity: 'error', message: 'No se pudieron cargar las categorías' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  useEffect(() => {
    const onOpen = () => handleOpenCreate();
    window.addEventListener('open-create-categoria', onOpen);
    return () => window.removeEventListener('open-create-categoria', onOpen);
  }, []);

  const handleOpenCreate = () => { setEditing(null); setFormValues({ nombre: '', descripcion: '' }); setOpenForm(true); };
  const handleOpenEdit = (item) => { setEditing(item); setFormValues({ nombre: item.nombre || '', descripcion: item.descripcion || '' }); setOpenForm(true); };

  const handleSave = async () => {
    // Validaciones
    if (!formValues.nombre || !formValues.nombre.trim()) {
      setSnackbar({ open: true, severity: 'error', message: 'El nombre es obligatorio' });
      return;
    }
    if (formValues.nombre.trim().length < 2) {
      setSnackbar({ open: true, severity: 'error', message: 'El nombre debe tener al menos 2 caracteres' });
      return;
    }

    try {
      if (editing) {
        await updateCategoria(editing.id, formValues);
        setSnackbar({ open: true, severity: 'success', message: 'Categoría actualizada' });
      } else {
        await createCategoria(formValues);
        setSnackbar({ open: true, severity: 'success', message: 'Categoría creada' });
      }
      setOpenForm(false);
      fetchData();
    } catch (err) {
      setSnackbar({ open: true, severity: 'error', message: 'Error al guardar la categoría' });
    }
  };

  const handleDeleteClick = (item) => { setToDelete(item); setConfirmOpen(true); };
  const handleDelete = async () => {
    try {
      await deleteCategoria(toDelete.id);
      setSnackbar({ open: true, severity: 'success', message: 'Categoría eliminada' });
      setConfirmOpen(false);
      fetchData();
    } catch (err) {
      setSnackbar({ open: true, severity: 'error', message: 'Error al eliminar la categoría' });
    }
  };

  const columns = [
    { field: 'nombre', headerName: 'Nombre' },
    { field: 'descripcion', headerName: 'Descripción' },
  ];

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5">Categorías</Typography>
        <Button variant="contained" onClick={handleOpenCreate}>Nueva Categoría</Button>
      </Box>

      {loading ? <Loader /> : (
        <DataTable columns={columns} rows={rows} onEdit={(r) => handleOpenEdit(r)} onDelete={(r) => handleDeleteClick(r)} />
      )}

      <Dialog open={openForm} onClose={() => setOpenForm(false)} fullWidth>
        <DialogTitle>{editing ? 'Editar Categoría' : 'Nueva Categoría'}</DialogTitle>
        <DialogContent>
          <TextField autoFocus margin="normal" label="Nombre" fullWidth value={formValues.nombre} onChange={(e) => setFormValues((prev) => ({ ...prev, nombre: e.target.value }))} />
          <TextField margin="normal" label="Descripción" fullWidth multiline rows={3} value={formValues.descripcion} onChange={(e) => setFormValues((prev) => ({ ...prev, descripcion: e.target.value }))} />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenForm(false)}>Cancelar</Button>
          <Button variant="contained" onClick={handleSave}>{editing ? 'Guardar' : 'Crear'}</Button>
        </DialogActions>
      </Dialog>

      <ConfirmDialog open={confirmOpen} title="Eliminar categoría" content={`¿Desea eliminar la categoría "${toDelete?.nombre}"?`} onCancel={() => setConfirmOpen(false)} onConfirm={handleDelete} />
      <AlertSnackbar open={snackbar.open} onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))} severity={snackbar.severity}>{snackbar.message}</AlertSnackbar>
    </Box>
  );
}
