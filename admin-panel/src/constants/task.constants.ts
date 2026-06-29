import type { TaskPriority, TaskStatus } from "../types/task.types";

// Talep öncelik/durum etiketleri ve renkleri — tüm admin panelde tek kaynak
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

// Ant Design <Tag color="..."> için preset renkler
export const priorityTagColors: Record<TaskPriority, string> = {
  low: "default",
  normal: "blue",
  high: "orange",
  urgent: "red",
};

// Progress bar, metin vb. özel UI için hex renkler
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

export const categoryTextColors: Record<string, string> = {
  "Teknik Destek": "#1677ff",
  "İzin Talebi": "#52c41a",
  "Satın Alma": "#fa8c16",
  Diğer: "#8c8c8c",
};

export const categoryTagColors: Record<string, string> = {
  "Teknik Destek": "#1677ff",
  "İzin Talebi": "#52c41a",
  "Satın Alma": "#fa8c16",
  Diğer: "#8c8c8c",
};
export const categoryLabels: Record<string, string> = {
  "Teknik Destek": "Teknik Destek",
  "İzin Talebi": "İzin Talebi",
  "Satın Alma": "Satın Alma",
  Diğer: "Diğer",
};