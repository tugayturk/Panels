import { createSlice } from "@reduxjs/toolkit";
import { Task } from "../../../types/task.types";
import {
  fetchPendingRequests,
  approvePendingTask,
  rejectPendingTask,
} from "./pendingRequestThunk";

interface PendingRequestState {
  tasks: Task[];
  loading: boolean;
  error: string | null;
}

const initialState: PendingRequestState = {
  tasks: [],
  loading: false,
  error: null,
};

const pendingRequestSlice = createSlice({
  name: "pendingRequests",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchPendingRequests.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPendingRequests.fulfilled, (state, action) => {
        state.loading = false;
        state.tasks = action.payload;
      })
      .addCase(fetchPendingRequests.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message ?? "Talepler yüklenemedi";
      })
      .addCase(approvePendingTask.fulfilled, (state, action) => {
        state.tasks = state.tasks.filter((t) => t.id !== action.payload);
      })
      .addCase(rejectPendingTask.fulfilled, (state, action) => {
        state.tasks = state.tasks.filter((t) => t.id !== action.payload);
      });
  },
});

export default pendingRequestSlice.reducer;
