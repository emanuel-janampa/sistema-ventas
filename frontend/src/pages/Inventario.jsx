import React, { useEffect, useState } from 'react';
import Autocomplete from '@mui/material/Autocomplete';
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

import { getStock, registerMovimiento, getMovimientos } from '../services/inventario.service';
import { getProductos } from '../services/productos.service';

export default function Inventario() {
  const [stock, setStock] = useState([]);
  const [movimientos, setMovimientos] = useState([]);
  const [productos, setProductos] = useState([]);
  const [loading, setLoading] = useState(false);

  const [openForm, setOpenForm] = useState(false);
  const [formValues, setFormValues] = useState({ productoId: '', tipo: 'ENTRADA', cantidad: 0, nota: '' });

  const [snackbar, setSnackbar] = useState({ open: false, severity: 'success', message: '' });

  const fetchStock = async () => {
    setLoading(true);
    try { const res = await getStock(); setStock(res.data || []); }
    catch (err) { setSnackbar({ open: true, severity: 'error', message: 'No se pudo cargar el stock' }); }
    finally { setLoading(false); }
  };

  const fetchMovimientos = async () => {
    try { const res = await getMovimientos(); setMovimientos(res.data || []); }
    catch (err) { /* ignore */ }
  };

  const fetchProductos = async () => {
    try {
      const res = await getProductos();
      const items = res.data || [];
      const normalized = items.map((product) => ({
        id: product.id || product.productId || product.productoId || product._id,
        nombre: product.name || product.nombre || product.productName || product.productoNombre || '(sin nombre)',
      })).filter((item) => item.id != null);
      setProductos(normalized);
      return normalized;
    } catch (err) {
      setSnackbar({ open: true, severity: 'error', message: 'No se pudieron cargar los productos' });
      return [];
    }
  };

  const loadInventory = async () => {
    setLoading(true);
    try {
      const products = await fetchProductos();
      const productMap = new Map(products.map((item) => [String(item.id), item]));
      const [stockRes, movimientosRes] = await Promise.all([getStock(), getMovimientos()]);

      const stockData = (stockRes.data || []).map((item) => {
        const productId = item.productoId || item.productId;
        const product = productMap.get(String(productId));
        return {
          ...item,
          producto: product,
          productoNombre: product?.nombre || item.productoNombre || item.productName || item.nombre || '',
          stock: item.stock ?? item.cantidad ?? item.quantity ?? 0,
        };
      });

      const movData = (movimientosRes.data || []).map((item) => {
        const productId = item.productoId || item.productId;
        const product = productMap.get(String(productId));
        return {
          ...item,
          producto: product,
          productoNombre: product?.nombre || item.productoNombre || item.productName || item.nombre || '',
          cantidad: item.cantidad ?? item.quantity ?? 0,
          nota: item.nota || item.note || item.reason || '',
          tipo: item.tipo || item.type || '',
        };
      }).reverse();

      setStock(stockData);
      setMovimientos(movData);
    } catch (err) {
      setSnackbar({ open: true, severity: 'error', message: 'Error cargando inventario' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadInventory();
  }, []);

  useEffect(() => {
    const onOpen = () => setOpenForm(true);
    window.addEventListener('open-create-movimiento', onOpen);
    return () => window.removeEventListener('open-create-movimiento', onOpen);
  }, []);

  const handleRegister = async () => {
    if (!formValues.productoId) {
      setSnackbar({ open: true, severity: 'error', message: 'Seleccione un producto' });
      return;
    }

    const cantidad = Number(formValues.cantidad);
    if (Number.isNaN(cantidad) || cantidad <= 0) {
      setSnackbar({ open: true, severity: 'error', message: 'La cantidad debe ser mayor a 0' });
      return;
    }

    try {
      await registerMovimiento({
        productoId: formValues.productoId,
        tipo: formValues.tipo,
        cantidad,
        nota: formValues.nota,
      });
      setSnackbar({ open: true, severity: 'success', message: 'Movimiento registrado' });
      setOpenForm(false);
      loadInventory();
    } catch (err) {
      setSnackbar({ open: true, severity: 'error', message: 'Error al registrar movimiento' });
    }
  };

  const stockColumns = [
    { field: 'productoId', headerName: 'Producto', render: (r) => r.producto?.nombre || r.productoNombre || r.productoId },
    {
      field: 'estado',
      headerName: 'Estado',
      render: (r) => {
        const stockValue = Number(r.stock ?? r.cantidad ?? 0);
        if (stockValue > 50) return 'Stock Alto 🟢';
        if (stockValue > 10) return 'Disponible 🟡';
        return 'Stock Crítico (Reponer) 🔴';
      },
    },
    { field: 'stock', headerName: 'Stock' },
  ];

  const movColumns = [
    { field: 'producto', headerName: 'Producto', render: (r) => r.producto?.nombre || r.productoNombre || r.productoId },
    { field: 'tipo', headerName: 'Tipo' },
    { field: 'cantidad', headerName: 'Cantidad' },
    { field: 'nota', headerName: 'Nota' },
  ];

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5">Inventario</Typography>
        <Button variant="contained" onClick={() => setOpenForm(true)}>Registrar Movimiento</Button>
      </Box>

      {loading ? <Loader /> : (
        <>
          <Typography variant="h6" sx={{ mb: 1 }}>Stock Actual</Typography>
          <DataTable columns={stockColumns} rows={stock} emptyTitle="Sin stock" emptyDescription="No hay registros de stock." emptyAction={<Button variant="contained" component={"a"} href="/productos">Crear Producto</Button>} />

          <Typography variant="h6" sx={{ mt: 4, mb: 1 }}>Historial de Movimientos</Typography>
          <DataTable columns={movColumns} rows={movimientos} emptyTitle="Sin movimientos" emptyDescription="No hay movimientos registrados." emptyAction={<Button variant="contained" component={"a"} href="/productos">Crear Producto</Button>} />
        </>
      )}

      <Dialog open={openForm} onClose={() => setOpenForm(false)} fullWidth>
        <DialogTitle>Registrar Movimiento</DialogTitle>
        <DialogContent>
          <Autocomplete
            options={productos}
            getOptionLabel={(option) => option.nombre || `Producto ${option.id}`}
            value={productos.find((option) => String(option.id) === String(formValues.productoId)) || null}
            onChange={(_, option) => setFormValues((prev) => ({ ...prev, productoId: option?.id || '' }))}
            renderInput={(params) => <TextField {...params} label="Producto" margin="normal" fullWidth />}
            isOptionEqualToValue={(option, value) => String(option.id) === String(value?.id)}
            noOptionsText="No hay productos coincidentes"
          />

          <FormControl fullWidth margin="normal" size="small">
            <InputLabel>Tipo</InputLabel>
            <Select value={formValues.tipo} label="Tipo" onChange={(e) => setFormValues((prev) => ({ ...prev, tipo: e.target.value }))}>
              <MenuItem value="ENTRADA">Entrada</MenuItem>
              <MenuItem value="SALIDA">Salida</MenuItem>
            </Select>
          </FormControl>
          <TextField margin="normal" label="Cantidad" type="number" fullWidth value={formValues.cantidad} onChange={(e) => setFormValues((prev) => ({ ...prev, cantidad: e.target.value }))} />
          <TextField margin="normal" label="Nota" fullWidth value={formValues.nota} onChange={(e) => setFormValues((prev) => ({ ...prev, nota: e.target.value }))} />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenForm(false)}>Cancelar</Button>
          <Button variant="contained" onClick={handleRegister}>Registrar</Button>
        </DialogActions>
      </Dialog>

      <AlertSnackbar open={snackbar.open} onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))} severity={snackbar.severity}>{snackbar.message}</AlertSnackbar>
    </Box>
  );
}