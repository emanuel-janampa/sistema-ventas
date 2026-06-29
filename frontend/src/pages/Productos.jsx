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
import { useNavigate } from 'react-router-dom';

import { getProductos, createProducto, updateProducto, deleteProducto } from '../services/productos.service';
import { getCategorias, createCategoria } from '../services/categorias.service';
import { getStock, registerMovimiento } from '../services/inventario.service';

export default function Productos() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState([]);

  const [openForm, setOpenForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [formValues, setFormValues] = useState({ nombre: '', descripcion: '', precio: '', categoriaId: '', stock: '' });
  const [filterCat, setFilterCat] = useState('');

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [toDelete, setToDelete] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, severity: 'success', message: '' });
  const [openCatDialog, setOpenCatDialog] = useState(false);
  const [catForm, setCatForm] = useState({ nombre: '', descripcion: '' });
  const navigate = useNavigate();

  const normalizeCategory = (cat) => ({
    id: cat.id || cat.categoryId || cat._id || `local-${Date.now()}`,
    nombre: cat.nombre || cat.name || cat.categoryName || cat.category?.name || '',
    descripcion: cat.descripcion || cat.description || cat.categoryDescription || cat.category?.description || '',
  });

  const extractPayload = (res) => {
    if (!res) return undefined;
    if (Array.isArray(res.data)) return res.data;
    if (res.data && Array.isArray(res.data.data)) return res.data.data;
    if (res.data && res.data.data) return res.data.data;
    return res.data || res;
  };

  const extractObject = (res) => {
    if (!res) return undefined;
    if (res.data) {
      if (Array.isArray(res.data)) return res.data[0];
      if (res.data.data) return res.data.data;
      if (res.data.categoria) return res.data.categoria;
      if (res.data.category) return res.data.category;
      return res.data;
    }
    return res;
  };

  const fetchCategorias = async () => {
    try {
      const res = await getCategorias();
      const payload = extractPayload(res);
      const normalized = (Array.isArray(payload) ? payload : []).map(normalizeCategory);
      setCategories(normalized);
      return normalized;
    } catch (err) {
      // ignore - return empty array to avoid clearing state
      return [];
    }
  };

  const getProductId = (prod) => prod.id || prod.productId || prod.product?.id || prod.producto?.id || prod._id || prod.product?.productId;
  const normalizeStockItem = (st) => ({
    productId: st.productId || st.productoId || st.product?.id || st.producto?.id || st.id,
    stock: st.stock ?? st.quantity ?? st.available ?? st.cantidad ?? st.amount ?? 0,
  });

  const normalizeProduct = (p) => {
    const nombre = p.nombre || p.name || p.productName || '';
    const precio = (p.precio != null ? p.precio : (p.price != null ? p.price : p.productPrice ?? ''));
    const stockVal = (p.stock != null ? p.stock : (p.quantity != null ? p.quantity : (p.qty != null ? p.qty : undefined)));
    const categoriaObj = p.categoria || p.category || null;
    return {
      ...p,
      nombre,
      precio,
      stock: stockVal,
      categoria: typeof categoriaObj === 'object' ? categoriaObj : null,
      categoriaId: typeof categoriaObj === 'object' ? undefined : (p.categoriaId || p.categoryId || categoriaObj || undefined),
      categoriaNombre: p.categoriaNombre || (categoriaObj && (categoriaObj.nombre || categoriaObj.name)) || p.categoryName || '',
    };
  };

  const mapProductRelationships = (products, cats, stockList) => products.map(prod => {
    const prodId = getProductId(prod);
    const st = stockList.find((s) => s.productId == prodId);
    const prodCat = prod.categoria || cats.find(c => c.id === (prod.categoriaId || prod.categoryId || prod.category?.id || prod.categoria?.id));
    return {
      ...prod,
      stock: st ? st.stock : (prod.stock ?? 0),
      categoria: prodCat || prod.categoria,
      categoriaNombre: prod.categoriaNombre || (prodCat && prodCat.nombre) || '',
    };
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      const cats = await fetchCategorias();
      const res = await getProductos();
      const products = (extractPayload(res) || []).map(normalizeProduct);
      let stockList = [];
      try {
        const stockRes = await getStock();
        stockList = (extractPayload(stockRes) || []).map(normalizeStockItem);
      } catch (e) {
        stockList = [];
      }
      setRows(mapProductRelationships(products, cats, stockList));
    } catch (err) {
      setSnackbar({ open: true, severity: 'error', message: 'No se pudieron cargar los productos' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Listen for global events to open create dialogs from sidebar
  const handleOpenCreate = () => { setEditing(null); setFormValues({ nombre: '', descripcion: '', precio: '', categoriaId: '', stock: '' }); setOpenForm(true); };

  useEffect(() => {
    const onOpenCat = () => setOpenCatDialog(true);
    const onOpenProd = () => handleOpenCreate();
    window.addEventListener('open-create-categoria', onOpenCat);
    window.addEventListener('open-create-producto', onOpenProd);
    return () => {
      window.removeEventListener('open-create-categoria', onOpenCat);
      window.removeEventListener('open-create-producto', onOpenProd);
    };
  }, []);
  const handleOpenEdit = (item) => {
    setEditing(item);
    setFormValues({ nombre: item.nombre || '', descripcion: item.descripcion || '', precio: item.precio || '', categoriaId: item.categoria?.id || item.categoriaId || '', stock: item.stock || '' });
    setOpenForm(true);
  };

  const handleSave = async () => {
    // Validaciones
    if (!formValues.nombre || !formValues.nombre.trim()) { setSnackbar({ open: true, severity: 'error', message: 'El nombre es obligatorio' }); return; }
    const price = Number(formValues.precio);
    if (Number.isNaN(price) || price <= 0) { setSnackbar({ open: true, severity: 'error', message: 'El precio debe ser mayor a cero' }); return; }
    const stockVal = Number(formValues.stock);
    if (Number.isNaN(stockVal) || stockVal < 0) { setSnackbar({ open: true, severity: 'error', message: 'El stock no puede ser negativo' }); return; }
    if (!formValues.categoriaId) { setSnackbar({ open: true, severity: 'error', message: 'Debe seleccionar una categoría' }); return; }

    try {
      const payload = {
        nombre: formValues.nombre,
        descripcion: formValues.descripcion,
        precio: formValues.precio,
        categoriaId: formValues.categoriaId,
      };

      if (editing) {
        await updateProducto(editing.id, payload);
        const currentStock = Number(editing.stock ?? 0);
        const stockDelta = stockVal - currentStock;
        if (stockDelta !== 0) {
          try {
            await registerMovimiento({ productoId: editing.id, tipo: stockDelta > 0 ? 'ENTRADA' : 'SALIDA', cantidad: Math.abs(stockDelta), reason: 'AJUSTE DE STOCK' });
            setSnackbar({ open: true, severity: 'success', message: 'Producto actualizado y stock ajustado' });
          } catch {
            setSnackbar({ open: true, severity: 'warning', message: 'Producto actualizado, pero no se pudo ajustar el stock' });
          }
        } else {
          setSnackbar({ open: true, severity: 'success', message: 'Producto actualizado' });
        }
      } else {
        const res = await createProducto(payload);
        const createdProduct = extractObject(res) || {};
        const createdId = getProductId(createdProduct) || getProductId(formValues);
        if (stockVal > 0 && createdId) {
          try {
            await registerMovimiento({ productoId: createdId, tipo: 'ENTRADA', cantidad: stockVal, reason: 'STOCK INICIAL' });
            setSnackbar({ open: true, severity: 'success', message: 'Producto creado y stock inicial registrado' });
          } catch {
            setSnackbar({ open: true, severity: 'warning', message: 'Producto creado, pero no se pudo registrar el stock inicial' });
          }
        } else {
          setSnackbar({ open: true, severity: 'success', message: 'Producto creado' });
        }
      }
      setOpenForm(false);
      fetchData();
    } catch (err) {
      setSnackbar({ open: true, severity: 'error', message: 'Error al guardar el producto' });
    }
  };

  const handleDeleteClick = (item) => { setToDelete(item); setConfirmOpen(true); };
  const handleDelete = async () => {
    try {
      await deleteProducto(toDelete.id);
      setSnackbar({ open: true, severity: 'success', message: 'Producto eliminado' });
      setConfirmOpen(false);
      fetchData();
    } catch (err) {
      setSnackbar({ open: true, severity: 'error', message: 'Error al eliminar el producto' });
    }
  };

  const handleCreateCategoria = async () => {
    if (!catForm.nombre || !catForm.nombre.trim()) {
      setSnackbar({ open: true, severity: 'error', message: 'El nombre de la categoría es obligatorio' });
      return;
    }
    try {
      const res = await createCategoria(catForm);
      const newCategory = normalizeCategory(res.data || catForm);
      setSnackbar({ open: true, severity: 'success', message: 'Categoría creada' });
      setOpenCatDialog(false);
      setCatForm({ nombre: '', descripcion: '' });
      setCategories(prev => [newCategory, ...(prev || [])]);
      fetchData();
    } catch (e) {
      const localCat = normalizeCategory({ id: `local-${Date.now()}`, nombre: catForm.nombre, descripcion: catForm.descripcion });
      setCategories(prev => [localCat, ...(prev || [])]);
      setOpenCatDialog(false);
      setCatForm({ nombre: '', descripcion: '' });
      setSnackbar({ open: true, severity: 'warning', message: 'Categoría creada localmente (backend no disponible)' });
    }
  };

  const columns = [
    { field: 'nombre', headerName: 'Nombre' },
    { field: 'categoria', headerName: 'Categoría', render: (r) => r.categoria?.nombre || r.categoriaNombre || r.categoriaId },
    { field: 'precio', headerName: 'Precio' },
    { field: 'stock', headerName: 'Stock' },
  ];

  const filteredRows = filterCat ? rows.filter((r) => (r.categoria?.id || r.categoriaId) == filterCat) : rows;

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5">Productos</Typography>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <FormControl size="small" sx={{ minWidth: 200 }}>
            <InputLabel>Categoría</InputLabel>
            <Select value={filterCat} label="Categoría" onChange={(e) => setFilterCat(e.target.value)}>
              <MenuItem value="">Todas</MenuItem>
              {categories.map((cat) => <MenuItem key={cat.id} value={cat.id}>{cat.nombre}</MenuItem>)}
            </Select>
          </FormControl>
          <Button variant="outlined" onClick={() => setOpenCatDialog(true)}>Crear Categoría</Button>
          <Button variant="contained" onClick={handleOpenCreate} disabled={categories.length === 0}>Nuevo Producto</Button>
        </Box>
      </Box>

      {loading ? <Loader /> : <DataTable columns={columns} rows={filteredRows} onEdit={(r) => handleOpenEdit(r)} onDelete={(r) => handleDeleteClick(r)} emptyTitle="Sin productos" emptyDescription="No hay productos para mostrar." emptyAction={categories.length === 0 ? (
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button variant="outlined" onClick={() => setOpenCatDialog(true)}>Crear Categoría</Button>
          <Button variant="contained" onClick={() => handleOpenCreate()}>Crear Producto</Button>
        </Box>
      ) : (
        <Button variant="contained" onClick={() => handleOpenCreate()}>Crear Producto</Button>
      )} />}

      <Dialog open={openForm} onClose={() => setOpenForm(false)} fullWidth>
        <DialogTitle>{editing ? 'Editar Producto' : 'Nuevo Producto'}</DialogTitle>
        <DialogContent>
          <TextField autoFocus margin="normal" label="Nombre" fullWidth value={formValues.nombre} onChange={(e) => setFormValues((prev) => ({ ...prev, nombre: e.target.value }))} />
          <TextField margin="normal" label="Descripción" fullWidth multiline rows={2} value={formValues.descripcion} onChange={(e) => setFormValues((prev) => ({ ...prev, descripcion: e.target.value }))} />
          <TextField margin="normal" label="Precio" type="number" fullWidth value={formValues.precio} onChange={(e) => setFormValues((prev) => ({ ...prev, precio: e.target.value }))} />
          <TextField margin="normal" label="Stock" type="number" fullWidth value={formValues.stock} onChange={(e) => setFormValues((prev) => ({ ...prev, stock: e.target.value }))} />
          <FormControl fullWidth margin="normal" size="small">
            <InputLabel>Categoría</InputLabel>
            <Select value={formValues.categoriaId} label="Categoría" onChange={(e) => setFormValues((prev) => ({ ...prev, categoriaId: e.target.value }))}>
              {categories.map((cat) => <MenuItem key={cat.id} value={cat.id}>{cat.nombre}</MenuItem>)}
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenForm(false)}>Cancelar</Button>
          <Button variant="contained" onClick={handleSave}>{editing ? 'Guardar' : 'Crear'}</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={openCatDialog} onClose={() => setOpenCatDialog(false)} fullWidth>
        <DialogTitle>Nueva Categoría</DialogTitle>
        <DialogContent>
          <TextField autoFocus margin="normal" label="Nombre" fullWidth value={catForm.nombre} onChange={(e) => setCatForm((p) => ({ ...p, nombre: e.target.value }))} />
          <TextField margin="normal" label="Descripción" fullWidth multiline rows={3} value={catForm.descripcion} onChange={(e) => setCatForm((p) => ({ ...p, descripcion: e.target.value }))} />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenCatDialog(false)}>Cancelar</Button>
          <Button variant="contained" onClick={handleCreateCategoria}>Crear</Button>
        </DialogActions>
      </Dialog>

      <ConfirmDialog open={confirmOpen} title="Eliminar producto" content={`¿Desea eliminar el producto "${toDelete?.nombre}"?`} onCancel={() => setConfirmOpen(false)} onConfirm={handleDelete} />
      <AlertSnackbar open={snackbar.open} onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))} severity={snackbar.severity}>{snackbar.message}</AlertSnackbar>
    </Box>
  );
}
