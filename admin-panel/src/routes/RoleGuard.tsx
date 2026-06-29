import { Navigate, Outlet } from "react-router-dom";
import { useAppSelector } from "../store/hooks";
import { Role } from "../types/role.types";
import Unauthorized from "../pages/Unauthorized";
import { ROUTES } from "./paths";
interface RoleGuardProps {
  allowedRoles: Role[];
}

const RoleGuard = ({ allowedRoles }: RoleGuardProps) => {
  const { user } = useAppSelector((state) => state.auth);

  if (!user) {
    return <Navigate to={ROUTES.login} replace />;
  }

  if (!allowedRoles.includes(user?.role)) {
    return <Unauthorized />;
  }

  return <Outlet />;
};

export default RoleGuard;