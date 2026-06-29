import api from "./api";
import { Task } from "../types/task.types";

export const getTaskById = async (id: string): Promise<Task> => {
  const response = await api.get<Task>(`/tasks/${id}`);
  return response.data;
};

// Tüm talepleri çekip kullanıcıya ait olanları filtreler
export const getTasks = async (userId: string): Promise<Task[]> => {
  const response = await api.get<Task[]>("/tasks");
  return response.data.filter((task) => task.createdBy === userId);
};

export const createTask = async (task: Task): Promise<Task> => {
  const response = await api.post<Task>("/tasks", task);
  return response.data;
};
