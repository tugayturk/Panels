// Tüm route yolları için tek kaynak — App, AppLayout, guard ve Link'ler buradan okur
export const ROUTES = {
  login: "/login",
  dashboard: "/dashboard",
  pendingRequests: "/talepler",
  allRequests: "/tum-talepler",
  userManagement: "/kullanici-yonetimi",
} as const;
