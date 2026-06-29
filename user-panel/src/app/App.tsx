import { lazy, Suspense } from "react";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { Spin } from "antd";
import { AppLayout } from "../layouts/AppLayout";
import { ROUTES } from "../routes/paths";
import "../styles/global.scss";

// Route bazlı code-splitting 
const Dashboard = lazy(() => import("../pages/Dashboard"));
const TaskCreation = lazy(() => import("../pages/TaskCreation"));
const Tasks = lazy(() => import("../pages/Tasks"));
const Login = lazy(() => import("../pages/Login").then((m) => ({ default: m.Login })));
const NotFoundPage = lazy(() => import("../components/NotFoundPage"));

const PageFallback = () => (
  <div style={{ display: "flex", justifyContent: "center", padding: 48 }}>
    <Spin size="large" />
  </div>
);

function App() {
  return (
    <BrowserRouter>
      <Suspense fallback={<PageFallback />}>
        <Routes>
          <Route path={ROUTES.login} element={<Login />} />

          {/* Sidebar'lı ana layout — dashboard, talep oluştur, taleplerim */}
          <Route element={<AppLayout />}>
            <Route index element={<Navigate to={ROUTES.dashboard} replace />} />
            <Route path={ROUTES.dashboard} element={<Dashboard />} />
            <Route path={ROUTES.taskCreation} element={<TaskCreation />} />
            <Route path={ROUTES.tasks} element={<Tasks />} />
            <Route path="*" element={<NotFoundPage />} />
          </Route>
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}

export default App;
