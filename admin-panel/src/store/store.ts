import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./slices/authSlice";
import userReducer from "./slices/users/userSlice";
import pendingRequestReducer from "./slices/pendingRequests/pendingRequestSlice";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    user: userReducer,
    pendingRequests: pendingRequestReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
