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

const extractPayload = (res) => {
  if (!res) return [];
  const data = res.data ?? res;
  if (Array.isArray(data)) return data;
  if (data?.data) return data.data;
  return [];
};

const getEntityId = (item) => item?.id ?? item?._id;
const getProductId = (item) => item?.productId ?? item?.productoId ?? item?.product?.id ?? item?.producto?.id ?? item?.id ?? item?._id;
const getRelationProductId = (item) => item?.productId ?? item?.productoId ?? item?.product?.id ?? item?.producto?.id;
const getProductName = (item) => {
  const name = item?.nombre || item?.name || item?.productName || item?.productoNombre
    || item?.product?.nombre || item?.product?.name || item?.product?.productName || item?.product?.productoNombre;
  return typeof name === 'string' ? name.trim() : '';
};

const normalizeProduct = (product) => ({
  ...product,
  id: getEntityId(product),
  nombre: getProductName(product),
});

export default function MovimientosStock() {
	const [movimientos, setMovimientos] = useState([]);
	const [productos, setProductos] = useState([]);
	const [loading, setLoading] = useState(false);
	const [filterProd, setFilterProd] = useState('');
	const [snackbar, setSnackbar] = useState({ open: false, severity: 'info', message: '' });

	const fetchProductos = async () => {
		try {
			const res = await getProductos();
			const items = extractPayload(res);
			const normalized = items
				.map(normalizeProduct)
				.filter((product) => product.id != null && product.nombre);
			setProductos(normalized);
			return normalized;
		} catch (err) {
			return [];
		}
	};

	const loadMovimientos = async () => {
		setLoading(true);
		try {
			const [movRes, prods] = await Promise.all([getMovimientos(), fetchProductos()]);
			const productsMap = new Map((prods || []).map((product) => [String(product.id), product]));
			const data = extractPayload(movRes)
				.map((item, index) => {
					const productId = String(getProductId(item));
					const product = productsMap.get(productId);
					return {
						...item,
						id: item.id != null ? `mov-${item.id}` : `mov-${index}-${productId}`,
						producto: product,
						productoNombre: getProductName(product) || getProductName(item) || `Producto ${productId}`,
						cantidad: item.cantidad ?? item.quantity ?? 0,
						tipo: item.tipo ?? item.type ?? '',
						nota: item.nota ?? item.note ?? item.reason ?? '',
						productId,
					};
				})
				.filter((row) => row.productoNombre || row.productId);
			setMovimientos(data);
		} catch (err) {
			setSnackbar({ open: true, severity: 'error', message: 'No se pudieron cargar movimientos' });
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		loadMovimientos();
	}, []);

	const columns = [
		{ field: 'productoNombre', headerName: 'Producto' },
		{ field: 'tipo', headerName: 'Tipo' },
		{ field: 'cantidad', headerName: 'Cantidad' },
		{ field: 'nota', headerName: 'Nota' },
		{ field: 'createdAt', headerName: 'Fecha', render: (r) => r.createdAt ? new Date(r.createdAt).toLocaleString() : '' },
	];

	const filtered = filterProd ? movimientos.filter(m => (m.producto?.id || m.productId) == filterProd) : movimientos;

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
					<Button variant="outlined" onClick={() => loadMovimientos()}>Actualizar</Button>
				</Box>
			</Box>

			{loading ? <Loader /> : <DataTable columns={columns} rows={filtered} emptyTitle="Sin movimientos" emptyDescription="No hay movimientos para mostrar." emptyAction={<Button variant="contained" component={"a"} href="/productos">Crear Producto</Button>} />}

			<AlertSnackbar open={snackbar.open} onClose={() => setSnackbar(prev => ({ ...prev, open: false }))} severity={snackbar.severity}>{snackbar.message}</AlertSnackbar>
		</Box>
	);
}
