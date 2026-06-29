import api from './api';

export function getUsuarios(params) {
  return api.get('/usuarios', { params });
}

export function getUsuario(id) {
  return api.get(`/usuarios/${id}`);
}

export function createUsuario(data) {
  return api.post('/usuarios', data);
}

export function updateUsuario(id, data) {
  return api.put(`/usuarios/${id}`, data);
}

export function deleteUsuario(id) {
  return api.delete(`/usuarios/${id}`);
}
