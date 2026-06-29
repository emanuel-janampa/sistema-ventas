import React, { lazy } from 'react';
import { Navigate } from 'react-router-dom';
import MainLayout from '../layouts/MainLayout';

const Login = lazy(() => import('../pages/Login'));
const Dashboard = lazy(() => import('../pages/Dashboard'));
const Productos = lazy(() => import('../pages/Productos'));
const Categorias = lazy(() => import('../pages/Categorias'));
const Clientes = lazy(() => import('../pages/Clientes'));
const Usuarios = lazy(() => import('../pages/Usuarios'));
const Inventario = lazy(() => import('../pages/Inventario'));
const Ordenes = lazy(() => import('../pages/Ordenes'));
const DetalleOrden = lazy(() => import('../pages/DetalleOrden'));
const MovimientosStock = lazy(() => import('../pages/MovimientosStock'));

const appRoutes = [
  { path: '/login', element: <Login /> },
  { path: '/', element: <Navigate to="/dashboard" replace /> },
  { path: '/dashboard', element: <MainLayout allowedRoles={['ADMIN', 'CLIENTE']}><Dashboard /></MainLayout> },
  { path: '/productos', element: <MainLayout allowedRoles={['ADMIN', 'CLIENTE']}><Productos /></MainLayout> },
  { path: '/ordenes', element: <MainLayout allowedRoles={['ADMIN', 'CLIENTE']}><Ordenes /></MainLayout> },
  { path: '/ordenes/:id', element: <MainLayout allowedRoles={['ADMIN', 'CLIENTE']}><DetalleOrden /></MainLayout> },
  { path: '/movimientos-stock', element: <MainLayout allowedRoles={['ADMIN', 'CLIENTE']}><MovimientosStock /></MainLayout> },
  { path: '/categorias', element: <MainLayout allowedRoles={['ADMIN']}><Categorias /></MainLayout> },
  { path: '/clientes', element: <MainLayout allowedRoles={['ADMIN', 'CLIENTE']}><Clientes /></MainLayout> },
  { path: '/usuarios', element: <MainLayout allowedRoles={['ADMIN']}><Usuarios /></MainLayout> },
  { path: '/inventario', element: <MainLayout allowedRoles={['ADMIN', 'CLIENTE']}><Inventario /></MainLayout> },
  { path: '*', element: <Navigate to="/dashboard" replace /> },
];

export default appRoutes;
