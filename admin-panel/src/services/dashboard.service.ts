import api from "./api";

export const getDashboardData = async () => {
  const response = await api.get(`/tasks?status=pending`);
  return response.data;
};