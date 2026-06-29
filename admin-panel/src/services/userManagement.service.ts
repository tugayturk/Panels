import api from "./api";
import { User } from "../types/user.types";

export const getUsers = async () => {
  const response = await api.get("/adminUsers");
  return response.data;
};

export const deleteUser = async (id: string) => {
  const response = await api.delete(`/adminUsers/${id}`);
  return response.data;
};

export const createUser = async (user: User) => {
  const response = await api.post("/adminUsers", user);
  return response.data;
};

export const updateUser = async (id: string, user: User) => {
  const response = await api.put(`/adminUsers/${id}`, user);
  return response.data;
};