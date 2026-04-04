import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "./AuthContext";

const PublicRoute = ({ children }) => {
  const { user, loadingAuth } = useAuth();
  const location = useLocation();

  if (loadingAuth) return null;

  if (!user) return children;

  const from = location.state?.from;

  const roles = Array.isArray(user?.roles) ? user.roles : [];
  const isStaff = roles.some((role) =>
    ["ROLE_ADMIN", "ROLE_GERENTE", "ROLE_FUNCIONARIO", "ROLE_SUPER_ADMIN"].includes(role)
  );

  // 🔒 só permite voltar se for rota segura
  if (typeof from === "string" && from !== "/login") {
    if (from.startsWith("/dashboard") && !isStaff) {
      return <Navigate to="/perfil" replace />;
    }

    return <Navigate to={from} replace />;
  }

  if (from?.pathname && from.pathname !== "/login") {
    if (from.pathname.startsWith("/dashboard") && !isStaff) {
      return <Navigate to="/perfil" replace />;
    }

    return (
      <Navigate
        to={`${from.pathname}${from.search || ""}${from.hash || ""}`}
        replace
      />
    );
  }

  return <Navigate to={isStaff ? "/dashboard" : "/perfil"} replace />;
};

export default PublicRoute;