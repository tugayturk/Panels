import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { AppLayout } from "../layouts/AppLayout";
import "../styles/global.scss";
import TaskCreation from "../pages/TaskCreation";
import Tasks from "../pages/Tasks";
import Dashboard from "../pages/Dashboard";
import { Login } from "../pages/Login";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />

        <Route element={<AppLayout />}>
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="talep-olustur" element={<TaskCreation />} />  
          <Route path="taleplerim" element={<Tasks />} />
        </Route>

        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
