import type { DashboardData, Task } from "../types/task.types";
import api from "./api";

// Dashboard istatistiklerini istemci tarafında hesaplar (toplam, durum dağılımı, son 5)
export const dashboardService = async (userId: string): Promise<DashboardData> => {
  const response = await api.get<Task[]>("/tasks");
  const userTasks = response.data.filter((task) => task.createdBy === userId);

  const stats = {
    total: userTasks.length,
    pending: userTasks.filter((task) => task.status === "pending").length,
    approved: userTasks.filter((task) => task.status === "approved").length,
    rejected: userTasks.filter((task) => task.status === "rejected").length,
  };

  const recentTasks = [...userTasks]
    .sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    )
    .slice(0, 5); // En yeni 5 talep

  return { stats, recentTasks };
};
