import { Role } from "./role.types";

export interface User {
  id: string;
  name: string;
  email: string;
  password: string;
  role: Role;

}
