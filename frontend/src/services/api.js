import api from '../api/api';

export default api;

export function setAuthToken(token) {
  if (token) {
    localStorage.setItem('token', token);
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  }
}

export function clearAuthToken() {
  localStorage.removeItem('token');
  localStorage.removeItem('role');
  delete api.defaults.headers.common['Authorization'];
}

export function getStoredAuth() {
  return {
    token: localStorage.getItem('token'),
    role: localStorage.getItem('role'),
    username: localStorage.getItem('username'),
  };
}
