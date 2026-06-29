import api from './api';

export function getClientes(params) {
  return api.get('/clientes', { params });
}

export function getCliente(id) {
  return api.get(`/clientes/${id}`);
}

export function createCliente(data) {
  return api.post('/clientes', data);
}

export function updateCliente(id, data) {
  return api.put(`/clientes/${id}`, data);
}

export function deleteCliente(id) {
  return api.delete(`/clientes/${id}`);
}
