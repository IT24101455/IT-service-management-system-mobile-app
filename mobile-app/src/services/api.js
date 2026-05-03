import axios from 'axios';
import * as SecureStore from 'expo-secure-store';

// Replace with your machine's local IP address for physical device testing
const BASE_URL = 'http://10.71.226.205:8081/api'; 

const API = axios.create({
  baseURL: BASE_URL,
});

API.interceptors.request.use(async (config) => {
  const token = await SecureStore.getItemAsync('userToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const login = (credentials) => API.post('/auth/login', credentials);
export const register = (userData) => API.post('/auth/register', userData);
export const sendOtp = (email) => API.post('/auth/send-otp', { email });

export default API;
