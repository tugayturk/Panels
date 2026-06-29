import { createAsyncThunk } from "@reduxjs/toolkit";
import * as service from "../../../services/userManagement.service";
import { User } from "../../../types/user.types";

export const getUsers = createAsyncThunk("users/getUsers", async () => {
  return await service.getUsers();
});

export const deleteUser = createAsyncThunk("users/deleteUser", async (id: string) => {
  await service.deleteUser(id);
  return id;
});

export const addUser = createAsyncThunk("users/addUser", async (user: User) => {
  return await service.createUser(user);
});

export const updateUser = createAsyncThunk(
  "users/updateUser",
  async ({ id, user }: { id: string; user: User }) => {
    return await service.updateUser(id, user);
  }
);