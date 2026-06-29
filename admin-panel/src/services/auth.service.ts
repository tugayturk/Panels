import api from "./api";
import type { AuthUser } from "../types/auth.types";

// Mock auth: adminUsers listesinden email/şifre eşleşmesi arar
export const loginService = async (email: string, password: string) => {
  const response = await api.get(`/adminUsers`);
  const admin = response.data.find(
      (user: AuthUser & { password: string }) =>
      user.email === email && user.password === password
  );

  if (!admin) {
    throw new Error("Invalid credentials");
  }

  const { password: _, ...user } = admin;

  // Gerçek JWT yerine mock token — json-server ortamı için yeterli
  return {
    user,
    token: "mock-token-" + user.id,
  };
};
