import api from './api';

export function getProductos(params) {
  return api.get('/products', { params });
}

export function getProducto(id) {
  return api.get(`/products/${id}`);
}

export function createProducto(data) {
  return api.post('/products', data);
}

export function updateProducto(id, data) {
  return api.put(`/products/${id}`, data);
}

export function deleteProducto(id) {
  return api.delete(`/products/${id}`);
}
