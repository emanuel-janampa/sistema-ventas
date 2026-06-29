import React, { Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';
import routes from './router/routes';

export default function App() {
  return (
    <Suspense fallback={<div style={{ padding: 40 }}>Cargando...</div>}>
      <Routes>
        {routes.map((route) => (
          <Route key={route.path} path={route.path} element={route.element} />
        ))}
      </Routes>
    </Suspense>
  );
}