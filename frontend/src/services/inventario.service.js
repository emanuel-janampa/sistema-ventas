import api from './api';

export function getStock(params) {
  return api.get('/stock', { params });
}

export function registerMovimiento(data) {
  return api.post('/stock-movements', data);
}

export function getMovimientos(params) {
  return api.get('/stock-movements', { params });
}
