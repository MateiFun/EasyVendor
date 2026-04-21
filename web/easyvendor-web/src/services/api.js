import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

const apiClient = axios.create({
  baseURL: API_URL,
});

// Add token to requests
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auth APIs
export const authAPI = {
  register: (name, email, password, userType) =>
    apiClient.post('/auth/register', { name, email, password, userType }),
  login: (email, password) =>
    apiClient.post('/auth/login', { email, password }),
};

// Store APIs
export const storeAPI = {
  createStore: (name, description, location, hours) =>
    apiClient.post('/stores', { name, description, location, hours }),
  getMyStore: () =>
    apiClient.get('/stores/my-store'),
  getAllStores: () =>
    apiClient.get('/stores'),
  getStoreById: (storeId) =>
    apiClient.get(`/stores/${storeId}`),
  updateStore: (name, description, location, hours, status) =>
    apiClient.put('/stores', { name, description, location, hours, status }),
};

// Menu APIs
export const menuAPI = {
  addMenuItem: (name, description, price) =>
    apiClient.post('/menu', { name, description, price }),
  getStoreMenu: (storeId) =>
    apiClient.get(`/menu/store/${storeId}`),
  updateMenuItem: (itemId, name, description, price, availability) =>
    apiClient.put(`/menu/${itemId}`, { name, description, price, availability }),
  deleteMenuItem: (itemId) =>
    apiClient.delete(`/menu/${itemId}`),
};

export default apiClient;
