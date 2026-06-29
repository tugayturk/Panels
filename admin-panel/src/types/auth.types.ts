import { Role } from "./role.types";

export type { Role };

export interface LoginRequest {
  email: string;
  password: string;
}

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: Role;
}