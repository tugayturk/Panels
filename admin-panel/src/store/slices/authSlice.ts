import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import type { AuthUser } from "../../types/auth.types";

interface AuthState {
  user: AuthUser | null;
  error: string | null;
}

const initialState: AuthState = {
  // Sayfa yenilendiğinde oturumu korumak için localStorage'dan oku
  user: JSON.parse(localStorage.getItem("user") || "null"),
  error: null,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    loginSuccess: (
      state,
      action: PayloadAction<{ user: AuthUser; token: string }>
    ) => {
      state.user = action.payload.user;
      state.error = null;
      localStorage.setItem("token", action.payload.token);
      localStorage.setItem("user", JSON.stringify(action.payload.user));
    },
    loginFail: (state, action: PayloadAction<string>) => {
      state.user = null;
      state.error = action.payload;
      localStorage.removeItem("user");
    },
    logout: (state) => {
      state.user = null;
      state.error = null;
      localStorage.removeItem("token");
      localStorage.removeItem("user");
    },
  },
});

export const { loginSuccess, loginFail, logout } = authSlice.actions;
export default authSlice.reducer;
