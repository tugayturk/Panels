import axios, { AxiosError } from "axios";

// Ortak axios instance — baseURL .env'den okunur (REACT_APP_BASE_API_URL)
const api = axios.create({
  baseURL: process.env.REACT_APP_BASE_API_URL ?? "http://localhost:3001",
});

// İstek öncesi token'ı header'a ekle
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Yetkisiz yanıtta oturumu kapat ve login'e yönlendir
api.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("token");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

export default api;
