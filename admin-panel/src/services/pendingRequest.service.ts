import api from "./api";
import { Task } from "../types/task.types";

export interface PendingRequestsParams {
  priority?:   string | string[];
  category?:   string | string[];
  q?: string;
  createdBy?:  string | string[];
  _page?:      number;
  _per_page?:  number;
}

export interface PendingRequestsResult {
  data:  Task[];
  total: number;
}

// Bekleyen talepler sayfası — status=pending zorunlu, diğer filtreler opsiyonel
export const getPendingRequests = async (
  params?: PendingRequestsParams,
): Promise<PendingRequestsResult> => {
  const cleanParams: Record<string, unknown> = { status: "pending" };

  if (params) {
    for (const [key, val] of Object.entries(params)) {
      if (val === undefined || val === "") continue;
      if (Array.isArray(val) && val.length === 0) continue;
      cleanParams[key] = val;
    }
  }

  const response = await api.get("/tasks", {
    params: cleanParams,
    paramsSerializer: { indexes: null },
  });

  // json-server _page kullanılınca { data: Task[], items: number, ... } döner
  if (params?._page) {
    return {
      data:  response.data.data  ?? [],
      total: response.data.items ?? 0,
    };
  }

  const list: Task[] = response.data;
  return { data: list, total: list.length };
};

export const getUsers = async () => {
  const response = await api.get(`/users`);
  return response.data;
};

export const approveTask = async (id: string) => {
  const response = await api.patch(`/tasks/${id}`, {
    status: "approved",
    updatedAt: new Date().toISOString(),
  });
  return response.data;
};

export const rejectTask = async (id: string, rejectionReason: string) => {
  const response = await api.patch(`/tasks/${id}`, {
    status: "rejected",
    rejectionReason,
    updatedAt: new Date().toISOString(),
  });
  return response.data;
};