import api from "./api";
import { Task } from "../types/task.types";

const TASK_TITLES = [
  "Sistem Erişim Talebi",
  "Donanım Değişim Talebi",
  "Yazılım Kurulum Talebi",
  "İzin Talebi",
  "Teknik Destek Talebi",
];

const CATEGORIES = ["Teknik Destek", "İnsan Kaynakları", "Finans", "Genel"];
const PRIORITIES: Task["priority"][] = ["low", "normal", "high", "urgent"];

class SocketService {
  connect() {
    console.log("Socket Connected");
  }

  disconnect(interval: ReturnType<typeof setInterval>) {
    clearInterval(interval);
    console.log("Socket Disconnected");
  }

  simulateNewTask(callback: (task: Task) => void) {
    const interval = setInterval(async () => {
      const task: Task = {
        id: crypto.randomUUID(),
        title: TASK_TITLES[Math.floor(Math.random() * TASK_TITLES.length)],
        description: "Socket simülasyonu ile oluşturulan otomatik talep.",
        status: "pending",
        priority: PRIORITIES[Math.floor(Math.random() * PRIORITIES.length)],
        category: CATEGORIES[Math.floor(Math.random() * CATEGORIES.length)],
        createdBy: "usr-002",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      await api.post("/tasks", task);
      callback(task);
    }, 20000);

    return interval;
  }
}

export default new SocketService();