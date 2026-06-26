import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { AppLayout } from "../layouts/AppLayout";
import  Dashboard  from "../pages/Dashboard";
import { Login } from "../pages/Login";
import  PendingRequests  from "../pages/PendingRequests";
import "../styles/global.scss";
import RequestsList from "../pages/RequestsList";
import UserManagement from "../pages/UserManagement";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />

        <Route element={<AppLayout />}>
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="talepler" element={<PendingRequests />} />
          <Route path="tüm-talepler" element={<RequestsList />} />
          <Route path="kullanici-yonetimi" element={<UserManagement />} />
        </Route>

        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
