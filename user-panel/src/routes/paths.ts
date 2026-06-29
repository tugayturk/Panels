// Tüm route yolları için tek kaynak — App, AppLayout ve Link'ler buradan okur
export const ROUTES = {
  login: "/login",
  dashboard: "/dashboard",
  taskCreation: "/talep-olustur",
  tasks: "/taleplerim",
} as const;
