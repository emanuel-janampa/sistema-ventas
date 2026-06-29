import React, { useEffect, useState } from 'react';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import Loader from '../components/Loader';
import { useNavigate } from 'react-router-dom';

import { getProductos } from '../services/productos.service';
import { getCategorias } from '../services/categorias.service';
import { getClientes } from '../services/clientes.service';
import { getOrdenes } from '../services/ordenes.service';

export default function Dashboard() {
  const [loading, setLoading] = useState(false);
  const [counts, setCounts] = useState({ productos: 0, categorias: 0, clientes: 0, ordenes: 0 });
  const navigate = useNavigate();

  useEffect(() => {
    const fetch = async () => {
      setLoading(true);
      try {
        const [p, c, cl, o] = await Promise.all([getProductos(), getCategorias(), getClientes(), getOrdenes()]);
        setCounts({ productos: (p.data || []).length, categorias: (c.data || []).length, clientes: (cl.data || []).length, ordenes: (o.data || []).length });
      } catch (err) {
        // ignore
      } finally { setLoading(false); }
    };
    fetch();
  }, []);

  if (loading) return <Loader />;

  const cards = [
    { title: 'Dashboard', value: '', path: '/dashboard' },
    { title: 'Productos', value: counts.productos, path: '/productos' },
    { title: 'Categorías', value: counts.categorias, path: '/categorias' },
    { title: 'Clientes', value: counts.clientes, path: '/clientes' },
    { title: 'Inventario', value: '', path: '/inventario' },
    { title: 'Movimientos Stock', value: '', path: '/movimientos-stock' },
    { title: 'Órdenes', value: counts.ordenes, path: '/ordenes' },
    { title: 'Usuarios', value: '', path: '/usuarios' },
  ];

  return (
    <Box>
      <Typography variant="h5" sx={{ mb: 3 }}>Dashboard</Typography>
      <Grid container spacing={2}>
        {cards.map((c, i) => (
          <Grid item xs={12} sm={6} md={3} key={i}>
            <Paper sx={{ p: 2, cursor: 'pointer' }} onClick={() => navigate(c.path)}>
              <Typography variant="subtitle2">{c.title}</Typography>
              <Typography variant="h4">{c.value}</Typography>
            </Paper>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
}
