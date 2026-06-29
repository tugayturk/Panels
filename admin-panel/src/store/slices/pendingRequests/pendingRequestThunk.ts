import { createAsyncThunk } from "@reduxjs/toolkit";
import * as service from "../../../services/pendingRequest.service";

export const fetchPendingRequests = createAsyncThunk(
  "pendingRequests/fetchAll",
  async () => {
    const result = await service.getPendingRequests();
    return result.data;
  }
);

export const approvePendingTask = createAsyncThunk(
  "pendingRequests/approve",
  async (id: string) => {
    await service.approveTask(id);
    return id;
  }
);

export const rejectPendingTask = createAsyncThunk(
  "pendingRequests/reject",
  async ({ id, rejectionReason }: { id: string; rejectionReason: string }) => {
    await service.rejectTask(id, rejectionReason);
    return id;
  }
);
