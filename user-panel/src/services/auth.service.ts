import api from "./api";
import type { AuthUser } from "../types/auth.types";

// Mock auth: users listesinden email/şifre eşleşmesi arar
export const loginService = async (email: string, password: string) => {
  const response = await api.get("/users");
  const user = response.data.find(
    (user: AuthUser & { password: string }) =>
      user.email === email && user.password === password
  );

  if (!user) {
    throw new Error("Invalid credentials");
  }

  const { password: _, ...userData } = user;

  return {
    user: userData,
    token: "mock-token-" + userData.id, // api interceptor bu token'ı kullanır
  };
};
