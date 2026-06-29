import { lazy, Suspense } from "react";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { ConfigProvider, theme as antTheme } from "antd";
import { AppLayout } from "../layouts/AppLayout";
import RoleGuard from "../routes/RoleGuard";
import { ROUTES } from "../routes/paths";
import { Loading } from "../components/Loading";
import { ThemeProvider, useTheme } from "../context/ThemeContext";
import "../styles/global.scss";

// Route bazlı code-splitting — her sayfa kendi chunk'ına ayrılır
const Dashboard = lazy(() => import("../pages/Dashboard"));
const Login = lazy(() => import("../pages/Login").then((m) => ({ default: m.Login })));
const PendingRequests = lazy(() => import("../pages/PendingRequests"));
const RequestsList = lazy(() => import("../pages/RequestsList"));
const UserManagement = lazy(() => import("../pages/UserManagement"));
const NotFoundPage = lazy(() => import("../components/NotFoundPage"));

function AppWithTheme() {
  const { isDark } = useTheme();

  return (
    <ConfigProvider
      theme={{
        algorithm: isDark ? antTheme.darkAlgorithm : antTheme.defaultAlgorithm,
        components: {
          Table: {
            cellFontSize: 14,
            cellFontSizeMD: 13,
            cellFontSizeSM: 12,
          },
        },
      }}
    >
      <BrowserRouter>
        <Suspense fallback={<Loading />}>
          <Routes>
            <Route path={ROUTES.login} element={<Login />} />

            <Route element={<AppLayout />}>
              <Route index element={<Navigate to={ROUTES.dashboard} replace />} />
              <Route path={ROUTES.dashboard} element={<Dashboard />} />

              <Route element={<RoleGuard allowedRoles={["Admin", "Moderator", "Viewer"]} />}>
                <Route path={ROUTES.pendingRequests} element={<PendingRequests />} />
              </Route>

              <Route element={<RoleGuard allowedRoles={["Admin", "Moderator"]} />}>
                <Route path={ROUTES.allRequests} element={<RequestsList />} />
              </Route>

              <Route element={<RoleGuard allowedRoles={["Admin"]} />}>
                <Route path={ROUTES.userManagement} element={<UserManagement />} />
              </Route>

              {/* Tanımsız tüm rotalar → 404 (giriş yapmamışsa AppLayout login'e yönlendirir) */}
              <Route path="*" element={<NotFoundPage />} />
            </Route>
          </Routes>
        </Suspense>
      </BrowserRouter>
    </ConfigProvider>
  );
}

function App() {
  return (
    <ThemeProvider>
      <AppWithTheme />
    </ThemeProvider>
  );
}

export default App;
