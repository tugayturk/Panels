import api from "./api";
import { Task } from "../types/task.types";

export interface RequestsParams {
  // string[] → aynı kolonda çoklu seçim (OR): ?status=pending&status=approved
  status?:        string | string[];
  priority?:      string | string[];
  category?:      string | string[];
  q?:             string;
  createdAt_gte?: string;
  createdAt_lte?: string;
  _page?:         number;
  _per_page?:     number;
  _sort?:         string;
}

export interface RequestsResult {
  data:  Task[];
  total: number;
}

export const getRequests = async (params?: RequestsParams): Promise<RequestsResult> => {
  // Boş / uzunluğu 0 olan değerleri query'ye gönderme
  const cleanParams = params
    ? Object.fromEntries(
        Object.entries(params).filter(([, v]) => {
          if (v === undefined || v === "") return false;
          if (Array.isArray(v) && v.length === 0) return false;
          return true;
        })
      )
    : {};

  const response = await api.get("/tasks", {
    params: cleanParams,
    // Dizileri ?status=pending&status=approved şeklinde seri hale getir (json-server OR davranışı)
    paramsSerializer: { indexes: null },
  });

  // json-server _page kullanılınca { data: Task[], items: number, ... } döndürür
  if (params?._page) {
    return {
      data:  response.data.data  ?? [],
      total: response.data.items ?? 0,
    };
  }

  const list: Task[] = response.data;
  return { data: list, total: list.length };
};

export const getRequestById = async (id: string): Promise<Task> => {
  const response = await api.get<Task>(`/tasks/${id}`);
  return response.data;
};