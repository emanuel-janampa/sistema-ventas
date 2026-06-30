import React, { useEffect, useState, useMemo } from 'react';
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
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';

import DataTable from '../components/DataTable';
import Loader from '../components/Loader';
import AlertSnackbar from '../components/AlertSnackbar';

import { getOrdenes, createOrden, getOrden, updateOrden, getDetallesOrden } from '../services/ordenes.service';
import { getClientes } from '../services/clientes.service';
import { getProductos } from '../services/productos.service';
import { useNavigate } from 'react-router-dom';

export default function Ordenes() {
  const [rows, setRows] = useState([]);
  const [clientes, setClientes] = useState([]);
  const [productos, setProductos] = useState([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const [openForm, setOpenForm] = useState(false);
  const [formValues, setFormValues] = useState({ customerId: '', notes: '', items: [], currentProductId: '', currentQuantity: 1 });

  const [snackbar, setSnackbar] = useState({ open: false, severity: 'success', message: '' });
  const [editOpen, setEditOpen] = useState(false);
  const [editOrder, setEditOrder] = useState(null);
  const [editDetails, setEditDetails] = useState([]);
  const [editStatus, setEditStatus] = useState('PENDING');

  const fetchClientes = async () => {
    try {
      const res = await getClientes();
      const clientesData = (res.data || []).map((c) => ({
        ...c,
        nombre: c.nombre || `${c.firstName || ''} ${c.lastName || ''}`.trim(),
      }));
      setClientes(clientesData);
      return clientesData;
    } catch (err) {
      return [];
    }
  };

  const fetchProductos = async () => {
    try {
      const res = await getProductos();
      const productosData = (res.data || []).map((p) => ({
        ...p,
        nombre: p.nombre || p.name || p.productName || p.productoNombre || '(sin nombre)',
        precio: p.precio ?? p.price ?? 0,
      }));
      setProductos(productosData);
      return productosData;
    } catch (err) {
      return [];
    }
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      const [clientesData, productosData] = await Promise.all([fetchClientes(), fetchProductos()]);
      const res = await getOrdenes();
      const orders = (res.data || []).map((o) => ({
        ...o,
        clienteNombre: (clientesData.find((c) => c.id === (o.customerId || o.clienteId)) || {}).nombre || '',
      }));
      setRows(orders);
    } catch (err) {
      setSnackbar({ open: true, severity: 'error', message: 'No se pudieron cargar las órdenes' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    const onOpen = () => setOpenForm(true);
    window.addEventListener('open-create-orden', onOpen);
    return () => window.removeEventListener('open-create-orden', onOpen);
  }, []);

  const handleOpenEdit = async (row) => {
    try {
      setEditOrder(null);
      setEditDetails([]);
      setEditOpen(true);
      const [orderRes, detailsRes] = await Promise.all([getOrden(row.id), getDetallesOrden(row.id)]);
      setEditOrder({ ...orderRes.data, clienteNombre: row.clienteNombre });
      setEditDetails(detailsRes.data || []);
      setEditStatus(orderRes.data.status || 'PENDING');
    } catch (err) {
      setSnackbar({ open: true, severity: 'error', message: 'No se pudo cargar la orden' });
      setEditOpen(false);
    }
  };

  const handleAddItem = () => {
    if (!formValues.currentProductId) {
      setSnackbar({ open: true, severity: 'error', message: 'Seleccione un producto para agregar al carrito' });
      return;
    }
    const quantity = Number(formValues.currentQuantity);
    if (Number.isNaN(quantity) || quantity <= 0) {
      setSnackbar({ open: true, severity: 'error', message: 'Ingrese una cantidad válida' });
      return;
    }

    const existingIndex = formValues.items.findIndex((item) => String(item.productId) === String(formValues.currentProductId));
    const newItems = [...formValues.items];
    if (existingIndex >= 0) {
      newItems[existingIndex].quantity += quantity;
    } else {
      newItems.push({ productId: formValues.currentProductId, quantity });
    }

    setFormValues((prev) => ({ ...prev, items: newItems, currentProductId: '', currentQuantity: 1 }));
  };

  const handleRemoveItem = (productId) => {
    setFormValues((prev) => ({ ...prev, items: prev.items.filter((item) => String(item.productId) !== String(productId)) }));
  };

  const cartItems = useMemo(() => {
    return formValues.items.map((item) => {
      const product = productos.find((p) => String(p.id) === String(item.productId));
      return {
        ...item,
        nombre: product?.nombre || `Producto ${item.productId}`,
        precio: product?.precio ?? 0,
        subtotal: (product?.precio ?? 0) * item.quantity,
      };
    });
  }, [formValues.items, productos]);

  const cartTotal = useMemo(() => cartItems.reduce((sum, item) => sum + item.subtotal, 0), [cartItems]);

  const subtotalValue = useMemo(() => {
    if (!editDetails || editDetails.length === 0) return 0;
    return editDetails.reduce((sum, item) => {
      const price = item.price ?? item.precio ?? 0;
      const qty = item.quantity ?? item.cantidad ?? 0;
      return sum + price * qty;
    }, 0);
  }, [editDetails]);

  const igvValue = useMemo(() => {
    if (!editOrder) return 0;
    return Number((editOrder.total - subtotalValue).toFixed(2));
  }, [editOrder, subtotalValue]);

  const handleCreate = async () => {
    if (!formValues.customerId) {
      setSnackbar({ open: true, severity: 'error', message: 'Seleccione un cliente' });
      return;
    }
    if (!formValues.items.length) {
      setSnackbar({ open: true, severity: 'error', message: 'Agregue al menos un producto al carrito' });
      return;
    }

    try {
      const response = await createOrden({
        customerId: formValues.customerId,
        items: formValues.items.map((item) => ({ productId: item.productId, quantity: item.quantity })),
        status: 'PENDING',
      });
      if (!response?.data?.id) {
        throw new Error('La orden no se creó correctamente');
      }
      setSnackbar({ open: true, severity: 'success', message: 'Orden creada' });
      setOpenForm(false);
      setFormValues({ customerId: '', notes: '', items: [], currentProductId: '', currentQuantity: 1 });
      fetchData();
    } catch (err) {
      const message = err?.response?.data?.error || err?.response?.data?.message || err?.message || 'Error al crear orden';
      console.error('Error creating order:', err);
      setSnackbar({ open: true, severity: 'error', message });
    }
  };

  const columns = [
    { field: 'orderNumber', headerName: 'Orden' },
    { field: 'clienteNombre', headerName: 'Cliente' },
    { field: 'total', headerName: 'Total' },
    { field: 'status', headerName: 'Estado' },
    { field: 'createdAt', headerName: 'Fecha' },
  ];

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5">Órdenes</Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          {clientes.length === 0 && (
            <Typography variant="body2" color="text.secondary">Debe registrar al menos un cliente antes de crear órdenes.</Typography>
          )}
          <Button variant="contained" onClick={() => setOpenForm(true)} disabled={clientes.length === 0}>Nueva Orden</Button>
        </Box>
      </Box>

      {loading ? (
        <Loader />
      ) : (
        <DataTable
          columns={columns}
          rows={rows}
          onEdit={(r) => handleOpenEdit(r)}
          onView={(r) => navigate(`/ordenes/${r.id}`)}
          emptyTitle="Sin órdenes"
          emptyDescription="No hay órdenes para mostrar."
          emptyAction={clientes.length === 0 ? (
            <Button variant="contained" onClick={() => navigate('/clientes')}>Crear Cliente</Button>
          ) : (
            <Button variant="contained" onClick={() => setOpenForm(true)}>Crear Orden</Button>
          )}
        />
      )}

        <Dialog open={editOpen} onClose={() => setEditOpen(false)} fullWidth maxWidth="sm">
          <DialogTitle>Editar Orden</DialogTitle>
          <DialogContent>
            {editOrder ? (
              <Box>
                <Typography><strong>Orden:</strong> {editOrder.orderNumber}</Typography>
                <Typography><strong>Cliente:</strong> {editOrder.cliente?.nombre || editOrder.clienteNombre}</Typography>
                <FormControl fullWidth margin="normal" size="small">
                  <InputLabel>Estado</InputLabel>
                  <Select value={editStatus} label="Estado" onChange={(e) => setEditStatus(e.target.value)}>
                    <MenuItem value="PENDING">PENDING</MenuItem>
                    <MenuItem value="PAID">PAID</MenuItem>
                    <MenuItem value="CANCELED">CANCELED</MenuItem>
                  </Select>
                </FormControl>

                <Box sx={{ mt: 2, px: 1 }}>
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>Resumen</Typography>
                  <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2, mt: 1 }}>
                    <Box sx={{ p: 2, bgcolor: 'grey.100', borderRadius: 1 }}>
                      <Typography variant="body2" color="text.secondary">Subtotal</Typography>
                      <Typography variant="h6">{subtotalValue.toFixed(2)}</Typography>
                    </Box>
                    <Box sx={{ p: 2, bgcolor: 'grey.100', borderRadius: 1 }}>
                      <Typography variant="body2" color="text.secondary">IGV</Typography>
                      <Typography variant="h6">{igvValue.toFixed(2)}</Typography>
                    </Box>
                    <Box sx={{ gridColumn: 'span 2', p: 2, bgcolor: 'primary.main', color: 'primary.contrastText', borderRadius: 1 }}>
                      <Typography variant="body2" color="inherit">Total</Typography>
                      <Typography variant="h5" color="inherit">{editOrder?.total?.toFixed(2) ?? '0.00'}</Typography>
                    </Box>
                  </Box>
                </Box>
              </Box>
            ) : (
              <Typography>Cargando...</Typography>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setEditOpen(false)}>Cerrar</Button>
            <Button variant="contained" onClick={async () => {
              try {
                await updateOrden(editOrder.id, { status: editStatus });
                setSnackbar({ open: true, severity: 'success', message: 'Estado actualizado' });
                setEditOpen(false);
                fetchData();
              } catch (err) {
                setSnackbar({ open: true, severity: 'error', message: 'Error al actualizar orden' });
              }
            }}>Guardar</Button>
          </DialogActions>
        </Dialog>

      <Dialog open={openForm} onClose={() => setOpenForm(false)} fullWidth maxWidth="md">
        <DialogTitle>Crear Orden</DialogTitle>
        <DialogContent>
          <FormControl fullWidth margin="normal" size="small">
            <InputLabel>Cliente</InputLabel>
            <Select
              value={formValues.customerId}
              label="Cliente"
              onChange={(e) => setFormValues((prev) => ({ ...prev, customerId: e.target.value }))}
            >
              <MenuItem value="">Seleccione un cliente</MenuItem>
              {clientes.map((c) => (
                <MenuItem key={c.id} value={c.id}>{c.nombre}</MenuItem>
              ))}
            </Select>
          </FormControl>

          <Typography variant="subtitle1" sx={{ mt: 2 }}>Agregar producto</Typography>
          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center' }}>
            <FormControl sx={{ flex: 1, minWidth: 200 }} size="small">
              <InputLabel>Producto</InputLabel>
              <Select
                value={formValues.currentProductId}
                label="Producto"
                onChange={(e) => setFormValues((prev) => ({ ...prev, currentProductId: e.target.value }))}
              >
                <MenuItem value="">Seleccione un producto</MenuItem>
                {productos.map((p) => (
                  <MenuItem key={p.id} value={p.id}>{p.nombre}</MenuItem>
                ))}
              </Select>
            </FormControl>

            <TextField
              sx={{ width: 120 }}
              size="small"
              label="Cantidad"
              type="number"
              inputProps={{ min: 1 }}
              value={formValues.currentQuantity}
              onChange={(e) => setFormValues((prev) => ({ ...prev, currentQuantity: Number(e.target.value) }))}
            />

            <Button variant="contained" sx={{ height: 40 }} onClick={handleAddItem}>Agregar</Button>
          </Box>

          <TableContainer component={Paper} sx={{ mt: 3, mb: 2 }}>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Producto</TableCell>
                  <TableCell align="right">Cantidad</TableCell>
                  <TableCell align="right">Precio</TableCell>
                  <TableCell align="right">Subtotal</TableCell>
                  <TableCell align="center">Quitar</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {cartItems.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} align="center">No hay productos en el carrito.</TableCell>
                  </TableRow>
                ) : (
                  cartItems.map((item) => (
                    <TableRow key={item.productId}>
                      <TableCell>{item.nombre}</TableCell>
                      <TableCell align="right">{item.quantity}</TableCell>
                      <TableCell align="right">{item.precio}</TableCell>
                      <TableCell align="right">{item.subtotal}</TableCell>
                      <TableCell align="center">
                        <Button color="error" size="small" onClick={() => handleRemoveItem(item.productId)}>Eliminar</Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
                {cartItems.length > 0 && (
                  <TableRow>
                    <TableCell colSpan={3} align="right"><strong>Total</strong></TableCell>
                    <TableCell align="right"><strong>{cartTotal}</strong></TableCell>
                    <TableCell />
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenForm(false)}>Cancelar</Button>
          <Button variant="contained" onClick={handleCreate}>Crear</Button>
        </DialogActions>
      </Dialog>

      <AlertSnackbar open={snackbar.open} onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))} severity={snackbar.severity}>{snackbar.message}</AlertSnackbar>
    </Box>
  );
}

