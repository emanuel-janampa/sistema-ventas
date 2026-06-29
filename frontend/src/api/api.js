import axios from "axios";

const api = axios.create({
  baseURL: "/api",
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");

  // Rewrites Spanish frontend routes to gateway microservice routes (English)
  if (config && config.url) {
    const map = [
      ['^/productos', '/products'],
      ['^/categorias', '/categories'],
      ['^/clientes', '/customers'],
      ['^/ordenes', '/orders'],
      ['^/usuarios', '/users'],
      ['^/inventario/stock', '/stock'],
      ['^/inventario/movimientos', '/stock-movements'],
    ];
    for (const [from, to] of map) {
      const re = new RegExp(from);
      if (re.test(config.url)) {
        config.url = config.url.replace(re, to);
        break;
      }
    }
  }

  // Remap common Spanish body fields to English for backend compatibility
  if (config && config.data && (config.method === 'post' || config.method === 'put')) {
    try {
      const mapBody = (d) => {
        if (!d || typeof d !== 'object') return d;
        const copy = { ...d };
        if (copy.nombre) { copy.name = copy.nombre; delete copy.nombre; }
        if (copy.descripcion) { copy.description = copy.descripcion; delete copy.descripcion; }
        if (copy.precio) { copy.price = copy.precio; delete copy.precio; }
        if (copy.categoriaId) { copy.categoryId = copy.categoriaId; delete copy.categoriaId; }
        if (copy.categoria) { copy.category = copy.categoria; delete copy.categoria; }
        if (copy.productoId) { copy.productId = copy.productoId; delete copy.productoId; }
        if (copy.cantidad) { copy.quantity = copy.cantidad; delete copy.cantidad; }
        if (copy.tipo) { copy.type = copy.tipo; delete copy.tipo; }
        if (copy.note) { copy.reason = copy.note; delete copy.note; }
        if (copy.nota) { copy.reason = copy.nota; delete copy.nota; }
        if (copy.motivo) { copy.reason = copy.motivo; delete copy.motivo; }
        return copy;
      };
      // axios may serialize data; attempt to parse if string
      if (typeof config.data === 'string') {
        try {
          const parsed = JSON.parse(config.data);
          config.data = JSON.stringify(mapBody(parsed));
        } catch (e) {
          // leave as-is
        }
      } else {
        config.data = mapBody(config.data);
      }
    } catch {
      // ignore mapping errors
    }
  }

  if (token) {
    config.headers = config.headers || {};
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

// Respuesta global para manejo básico de errores (ej. 401)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    try {
      const status = error.response ? error.response.status : 0;
      let message = 'Ocurrió un error';
      if (!error.response) message = 'Error de conexión. Verifique su red.';
      else if (status === 401) {
        message = 'Sesión expirada. Inicie sesión nuevamente.';
        localStorage.removeItem('token');
        localStorage.removeItem('role');
      } else if (status === 404) message = 'Recurso no encontrado.';
      else if (status === 409) message = 'Registro duplicado.';
      else if (status >= 500) message = 'Error del servidor. Intente más tarde.';
      else if (error.response.data && error.response.data.message) message = error.response.data.message;

      // Emite un evento global para mostrar notificaciones en la UI
      if (typeof window !== 'undefined' && window.dispatchEvent) {
        window.dispatchEvent(new CustomEvent('app-notify', { detail: { severity: 'error', message } }));
      }
    } catch {
      // ignore
    }

    return Promise.reject(error);
  }
);

export default api;
