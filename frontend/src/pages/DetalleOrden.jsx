import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import Loader from '../components/Loader';
import AlertSnackbar from '../components/AlertSnackbar';

import { getOrden, getDetallesOrden } from '../services/ordenes.service';
import { getProductos } from '../services/productos.service';

export default function DetalleOrden() {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, severity: 'info', message: '' });

  useEffect(() => {
    const fetch = async () => {
      setLoading(true);
      try {
        const [orderRes, detailsRes] = await Promise.all([getOrden(id), getDetallesOrden(id)]);
        const orderData = orderRes.data;
        const details = detailsRes.data || [];
        const productos = (await getProductos()).data || [];
        const mappedItems = details.map((it) => {
          const product = productos.find((p) => String(p.id) === String(it.productId || it.productoId));
          return {
            ...it,
            productoNombre: product?.nombre || product?.name || `#${it.productId || it.productoId}`,
            cantidad: it.quantity ?? it.cantidad ?? 0,
            precio: it.price ?? it.precio ?? 0,
          };
        });
        setOrder({ ...orderData, items: mappedItems });
      } catch (err) {
        setSnackbar({ open: true, severity: 'error', message: 'No se pudo cargar la orden' });
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [id]);

  const subtotal = order?.items?.reduce((sum, item) => sum + Number(item.precio) * Number(item.cantidad), 0) ?? 0;
  const total = Number(order?.total ?? 0);
  const igv = Number((total - subtotal).toFixed(2));

  if (loading) return <Loader />;

  return (
    <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
      <Box sx={{ width: 'min(960px, 95%)', bgcolor: 'background.paper', borderRadius: 3, boxShadow: 3, p: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 3, flexWrap: 'wrap', gap: 2 }}>
          <Box>
            <Typography variant="h4">Recibo de Venta</Typography>
            <Typography variant="subtitle2" color="text.secondary">Orden #{order?.orderNumber || id}</Typography>
          </Box>
          <Box sx={{ textAlign: 'right' }}>
            <Typography variant="body2" color="text.secondary">Estado</Typography>
            <Typography variant="h6" sx={{ textTransform: 'uppercase' }}>{order?.status || 'N/A'}</Typography>
          </Box>
        </Box>

        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2, mb: 4 }}>
          <Box sx={{ p: 3, bgcolor: 'grey.100', borderRadius: 2 }}>
            <Typography variant="subtitle2" color="text.secondary" gutterBottom>Cliente</Typography>
            <Typography>{order?.cliente?.nombre || order?.clienteNombre || 'Sin nombre'}</Typography>
            {order?.cliente?.email && <Typography variant="body2" color="text.secondary">{order.cliente.email}</Typography>}
          </Box>
          <Box sx={{ p: 3, bgcolor: 'grey.100', borderRadius: 2 }}>
            <Typography variant="subtitle2" color="text.secondary" gutterBottom>Detalles</Typography>
            <Typography variant="body2">Fecha: {order?.createdAt ? new Date(order.createdAt).toLocaleString() : '-'}</Typography>
            <Typography variant="body2">Orden ID: {order?.id}</Typography>
          </Box>
        </Box>

        <TableContainer component={Paper} sx={{ mb: 4 }}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Producto</TableCell>
                <TableCell align="center">Cantidad</TableCell>
                <TableCell align="right">Precio</TableCell>
                <TableCell align="right">Subtotal</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {(order?.items || []).map((item, index) => (
                <TableRow key={index}>
                  <TableCell>{item.productoNombre}</TableCell>
                  <TableCell align="center">{item.cantidad}</TableCell>
                  <TableCell align="right">{Number(item.precio).toFixed(2)}</TableCell>
                  <TableCell align="right">{(Number(item.precio) * Number(item.cantidad)).toFixed(2)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>

        <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
          <Box sx={{ width: 320, p: 3, bgcolor: 'grey.100', borderRadius: 2 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
              <Typography variant="body2" color="text.secondary">Subtotal</Typography>
              <Typography variant="body2">{subtotal.toFixed(2)}</Typography>
            </Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
              <Typography variant="body2" color="text.secondary">IGV</Typography>
              <Typography variant="body2">{igv.toFixed(2)}</Typography>
            </Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2, pt: 2, borderTop: '1px solid rgba(0,0,0,0.12)' }}>
              <Typography variant="subtitle1">Total</Typography>
              <Typography variant="h6">{total.toFixed(2)}</Typography>
            </Box>
          </Box>
        </Box>

        <AlertSnackbar open={snackbar.open} onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))} severity={snackbar.severity}>{snackbar.message}</AlertSnackbar>
      </Box>
    </Box>
  );
}
