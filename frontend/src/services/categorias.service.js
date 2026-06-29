import api from './api';

export function getCategorias(params) {
  return api.get('/categorias', { params });
}

export function getCategoria(id) {
  return api.get(`/categorias/${id}`);
}

export function createCategoria(data) {
  return api.post('/categorias', data);
}

export function updateCategoria(id, data) {
  return api.put(`/categorias/${id}`, data);
}

export function deleteCategoria(id) {
  return api.delete(`/categorias/${id}`);
}
