import axios, { AxiosError } from "axios";

// Tüm API istekleri bu instance üzerinden gider
const api = axios.create({
  baseURL: process.env.REACT_APP_BASE_API_URL ?? "http://localhost:3001",
});

// Her istekte localStorage'daki token'ı Authorization header'a ekler
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// 401 yanıtında oturumu temizleyip login sayfasına yönlendirir
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
