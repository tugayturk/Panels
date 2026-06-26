export type TaskStatus =
  | "pending"
  | "approved"
  | "rejected";

export type TaskPriority =
  | "low"
  | "normal"
  | "high"
  | "urgent";

export interface Task {
  id: string;
  title: string;
  description: string;
  priority: TaskPriority;
  category: string;
  status: TaskStatus;
  createdBy: string;
  createdAt: string;
  rejectionReason?: string;
}