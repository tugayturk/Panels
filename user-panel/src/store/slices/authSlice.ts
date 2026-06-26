import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import type { AuthUser } from "../../types/auth.types"
interface AuthState {
  user: AuthUser | null;
  error: string | null;
}

const initialState: AuthState = {
  user:JSON.parse(localStorage.getItem("user") || "null"),
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
    },
    loginFail: (state, action: PayloadAction<string>) => {
      state.user = null;
      state.error = action.payload;
    },
    logout: (state) => {
      state.user = null;
      state.error = null;
      localStorage.removeItem("token");
    },
  },
});

export const { loginSuccess, loginFail, logout } = authSlice.actions;
export default authSlice.reducer;
