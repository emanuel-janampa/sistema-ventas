import React, { useEffect, useState } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import Button from '@mui/material/Button';

import DataTable from '../components/DataTable';
import Loader from '../components/Loader';
import AlertSnackbar from '../components/AlertSnackbar';

import { getMovimientos } from '../services/inventario.service';
import { getProductos } from '../services/productos.service';

export default function MovimientosStock() {
	const [movimientos, setMovimientos] = useState([]);
	const [productos, setProductos] = useState([]);
	const [loading, setLoading] = useState(false);
	const [filterProd, setFilterProd] = useState('');
	const [snackbar, setSnackbar] = useState({ open: false, severity: 'info', message: '' });

	const fetch = async () => {
		setLoading(true);
		try {
			const res = await getMovimientos();
			setMovimientos(res.data || []);
		} catch (err) { setSnackbar({ open: true, severity: 'error', message: 'No se pudieron cargar movimientos' }); }
		finally { setLoading(false); }
	};

	const fetchProductos = async () => { try { const res = await getProductos(); setProductos(res.data || []); return res.data || []; } catch (err) { return []; } };

	useEffect(() => { fetch(); fetchProductos(); }, []);

	useEffect(() => {
		(async () => {
			const prodsRes = await fetchProductos();
			setLoading(true);
			try {
				const res = await getMovimientos();
				const data = (res.data || []).map(it => ({
					...it,
					producto: it.producto || (prodsRes || []).find(p => p.id === (it.productoId || it.productId)),
					productoNombre: (it.producto && it.producto.nombre) || it.productoNombre || ((prodsRes || []).find(p => p.id === (it.productoId || it.productId)) || {}).nombre,
				}));
				setMovimientos(data);
			} catch (err) { setSnackbar({ open: true, severity: 'error', message: 'No se pudieron cargar movimientos' }); }
			finally { setLoading(false); }
		})();
	}, []);

	const columns = [
		{ field: 'producto', headerName: 'Producto', render: r => r.producto?.nombre || r.productoNombre || r.productoId },
		{ field: 'tipo', headerName: 'Tipo' },
		{ field: 'cantidad', headerName: 'Cantidad' },
		{ field: 'nota', headerName: 'Nota' },
		{ field: 'fecha', headerName: 'Fecha' },
	];

	const filtered = filterProd ? movimientos.filter(m => (m.producto?.id || m.productoId) == filterProd) : movimientos;

	return (
		<Box>
			<Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
				<Typography variant="h5">Movimientos de Stock</Typography>
				<Box sx={{ display: 'flex', gap: 2 }}>
					<FormControl size="small" sx={{ minWidth: 220 }}>
						<InputLabel>Producto</InputLabel>
						<Select value={filterProd} label="Producto" onChange={e => setFilterProd(e.target.value)}>
							<MenuItem value="">Todos</MenuItem>
							{productos.map(p => (<MenuItem key={p.id} value={p.id}>{p.nombre}</MenuItem>))}
						</Select>
					</FormControl>
					<Button variant="outlined" onClick={() => fetch()}>Actualizar</Button>
				</Box>
			</Box>

			{loading ? <Loader /> : <DataTable columns={columns} rows={filtered} emptyTitle="Sin movimientos" emptyDescription="No hay movimientos para mostrar." emptyAction={<Button variant="contained" component={"a"} href="/productos">Crear Producto</Button>} />}

			<AlertSnackbar open={snackbar.open} onClose={() => setSnackbar(prev => ({ ...prev, open: false }))} severity={snackbar.severity}>{snackbar.message}</AlertSnackbar>
		</Box>
	);
}
