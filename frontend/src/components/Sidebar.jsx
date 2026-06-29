import React from 'react';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import Drawer from '@mui/material/Drawer';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Box from '@mui/material/Box';
import Divider from '@mui/material/Divider';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import {
  LayoutDashboard,
  ShoppingBag,
  FolderTree,
  Users,
  UserCog,
  LogOut,
  Boxes,
  Receipt,
  Activity
} from 'lucide-react';

const drawerWidth = 260;

export default function Sidebar() {
  const navigate = useNavigate();
  const role = localStorage.getItem('role') || '';

  const handleLogout = () => {
    localStorage.clear();
    navigate('/login');
  };

  const dispatchOpen = (name) => {
    try { window.dispatchEvent(new CustomEvent(name)); } catch (e) {}
  };

  const allItems = [
    { name: 'Dashboard', path: '/dashboard', icon: <LayoutDashboard size={18} />, roles: ['ADMIN', 'CLIENTE'] },
    { name: 'Productos', path: '/productos', icon: <ShoppingBag size={18} />, roles: [], always: true },
    { name: 'Categorías', path: '/categorias', icon: <FolderTree size={18} />, roles: ['ADMIN'] },
    { name: 'Clientes', path: '/clientes', icon: <Users size={18} />, roles: [], always: true },
    { name: 'Usuarios', path: '/usuarios', icon: <UserCog size={18} />, roles: ['ADMIN'] },
    { name: 'Inventario', path: '/inventario', icon: <Boxes size={18} />, roles: [] },
    { name: 'Órdenes', path: '/ordenes', icon: <Receipt size={18} />, roles: [], always: true },
    { name: 'Movimientos Stock', path: '/movimientos-stock', icon: <Activity size={18} />, roles: [], always: true }
  ];

  const menuItems = allItems.filter(item => {
    if (item.always) return true;
    if (!item.roles || item.roles.length === 0) return true; // visible by default
    return item.roles.includes(role);
  });

  return (
    <Drawer
      variant="permanent"
      sx={{
        width: drawerWidth,
        flexShrink: 0,
        [`& .MuiDrawer-paper`]: { width: drawerWidth, boxSizing: 'border-box', background: '#0f172a', color: '#e6eef8' },
      }}
      open
    >
      <Box sx={{ px: 2, py: 3 }}>
        <Typography variant="h6" sx={{ textAlign: 'center', mb: 2 }}>
          🛒 Sistema Ventas
        </Typography>
        <Divider sx={{ bgcolor: 'rgba(255,255,255,0.06)' }} />
        <List sx={{ mt: 2 }}>
          {menuItems.map((item, index) => (
            <ListItem key={index} disablePadding>
              <ListItemButton component={RouterLink} to={item.path} sx={{ color: '#cbd5e1' }}>
                <ListItemIcon sx={{ color: '#93c5fd' }}>{item.icon}</ListItemIcon>
                <ListItemText primary={item.name} />
              </ListItemButton>
            </ListItem>
          ))}
        </List>
      </Box>

      <Box sx={{ flexGrow: 1 }} />

      <Box sx={{ p: 2 }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, mb: 1 }}>
          <Button size="small" variant="outlined" onClick={() => { dispatchOpen('open-create-cliente'); navigate('/clientes'); }}>Crear Cliente</Button>
          <Button size="small" variant="outlined" onClick={() => { dispatchOpen('open-create-producto'); navigate('/productos'); }}>Crear Producto</Button>
          <Button size="small" variant="outlined" onClick={() => { dispatchOpen('open-create-categoria'); navigate('/categorias'); }}>Crear Categoría</Button>
          <Button size="small" variant="outlined" onClick={() => { dispatchOpen('open-create-orden'); navigate('/ordenes'); }}>Crear Orden</Button>
          <Button size="small" variant="outlined" onClick={() => { dispatchOpen('open-create-movimiento'); navigate('/inventario'); }}>Registrar Movimiento</Button>
        </Box>
        <Button variant="contained" color="error" fullWidth onClick={handleLogout} startIcon={<LogOut size={16} />}>
          Cerrar sesión
        </Button>
      </Box>
    </Drawer>
  );
}