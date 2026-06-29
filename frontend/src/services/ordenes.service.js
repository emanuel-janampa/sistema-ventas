import api from './api';

export function getOrdenes(params) {
  return api.get('/ordenes', { params });
}

export function getOrden(id) {
  return api.get(`/ordenes/${id}`);
}

export function createOrden(data) {
  return api.post('/ordenes', data);
}

export function getDetallesOrden(orderId) {
  return api.get(`/order-details/order/${orderId}`);
}

export function updateOrden(id, data) {
  return api.put(`/ordenes/${id}`, data);
}

export function deleteOrden(id) {
  return api.delete(`/ordenes/${id}`);
}
