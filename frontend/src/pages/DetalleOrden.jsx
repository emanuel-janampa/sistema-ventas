import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Loader from '../components/Loader';
import AlertSnackbar from '../components/AlertSnackbar';

import { getOrden } from '../services/ordenes.service';
import { getClientes } from '../services/clientes.service';
import { getProductos } from '../services/productos.service';

export default function DetalleOrden() {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, severity: 'info', message: '' });

  useEffect(() => {
    const fetch = async () => {
      setLoading(true);
      try { const res = await getOrden(id); setOrder(res.data); }
      catch (err) { setSnackbar({ open: true, severity: 'error', message: 'No se pudo cargar la orden' }); }
      finally { setLoading(false); }
    };
    fetch();
  }, [id]);

  useEffect(() => {
    (async () => {
      if (!order) return;
      try {
        // If cliente name missing, try to fetch clients and map
        if (!order.cliente || !order.cliente.nombre) {
          const clientes = (await getClientes()).data || [];
          const cust = clientes.find(c => c.id === (order.clienteId || order.clientId));
          if (cust) setOrder(prev => ({ ...prev, cliente: prev.cliente || cust }));
        }
        // Map product names for items
        if (order.items && order.items.length > 0) {
          const productos = (await getProductos()).data || [];
          setOrder(prev => ({ ...prev, items: (prev.items || []).map(it => ({
            ...it,
            producto: it.producto || productos.find(p => p.id === (it.productoId || it.productId)),
            productoNombre: (it.producto && it.producto.nombre) || it.productoNombre || ((productos.find(p => p.id === (it.productoId || it.productId)) || {}).nombre),
          })) }));
        }
      } catch (e) {
        // ignore
      }
    })();
  }, [order]);

  if (loading) return <Loader />;

  return (
    <Box>
      <Typography variant="h5">Detalle Orden #{id}</Typography>
      {order ? (
        <Box sx={{ mt: 2 }}>
          <Typography><strong>Cliente:</strong> {order.cliente?.nombre || order.clienteNombre}</Typography>
          <Typography><strong>Estado:</strong> {order.estado}</Typography>
          <Typography sx={{ mt: 2 }}><strong>Items:</strong></Typography>
          <ul>
            {(order.items || []).map((it, i) => (<li key={i}>{it.producto?.nombre || it.productoNombre} - {it.cantidad} x {it.precio}</li>))}
          </ul>
          <Typography><strong>Total:</strong> {order.total}</Typography>
        </Box>
      ) : <Typography sx={{ mt: 2 }}>No hay datos de la orden.</Typography>}

      <AlertSnackbar open={snackbar.open} onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))} severity={snackbar.severity}>{snackbar.message}</AlertSnackbar>
    </Box>
  );
}
