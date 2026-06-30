import React, { Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';
import routes from './router/routes';
import { AuthProvider } from './context/AuthContext.jsx';

export default function App() {
  return (
    <AuthProvider>
      <Suspense fallback={<div style={{ padding: 40 }}>Cargando...</div>}>
        <Routes>
          {routes.map((route) => (
            <Route key={route.path} path={route.path} element={route.element} />
          ))}
        </Routes>
      </Suspense>
    </AuthProvider>
  );
}