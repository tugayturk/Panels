import api from "./api";

export const getPendingRequests = async () => {
  const response = await api.get(`/tasks?status=pending`);
  return response.data;
};