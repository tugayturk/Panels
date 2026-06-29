import api from "./api";

// Dashboard tüm talepleri çeker; istatistikler (bekleyen/onaylanan/reddedilen)
// istemci tarafında durum bazında hesaplanır
export const getDashboardData = async () => {
  const response = await api.get(`/tasks`);
  return response.data;
};