import type { TaskPriority, TaskStatus } from "../types/task.types";

export type SelectOption<T extends string = string> = {
  value: T;
  label: string;
  color: string;
};

export const priorityLabels: Record<TaskPriority, string> = {
  low: "Düşük",
  normal: "Normal",
  high: "Yüksek",
  urgent: "Acil",
};

export const priorityTagColors: Record<TaskPriority, string> = {
  low: "default",
  normal: "blue",
  high: "orange",
  urgent: "red",
};

export const priorityTextColors: Record<TaskPriority, string> = {
  low: "#8c8c8c",
  normal: "#1677ff",
  high: "#fa8c16",
  urgent: "#ff4d4f",
};

export const statusLabels: Record<TaskStatus, string> = {
  pending: "Bekliyor",
  approved: "Onaylandı",
  rejected: "Reddedildi",
};

export const statusTagColors: Record<TaskStatus, string> = {
  pending: "gold",
  approved: "green",
  rejected: "red",
};


