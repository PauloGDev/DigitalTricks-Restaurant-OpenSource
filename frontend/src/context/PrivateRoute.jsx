import { Navigate, useLocation, useNavigate } from "react-router-dom";
import { Loader2, ShieldAlert, Lock, Store, User, LogOut } from "lucide-react";
import { useAuth } from "./AuthContext";
import {
  normalizeRoles,
  buildPermissions,
  hasRequiredRoles,
  hasRequiredPermissions,
  getRedirectPathByPermissions,
} from "../utils/acl";

/* =========================
   UI DE BLOQUEIO
========================= */

function AccessDenied({ title, description, icon = "lock" }) {
  const Icon =
    icon === "store"
      ? Store
      : icon === "user"
      ? User
      : icon === "shield"
      ? ShieldAlert
      : Lock;

  return (
    <section className="min-h-screen bg-zinc-50 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md rounded-3xl border border-zinc-200 bg-white p-6 sm:p-7 shadow-sm text-center">
        <div className="mx-auto h-14 w-14 rounded-3xl bg-red-50 border border-red-100 grid place-items-center">
          <Icon className="w-7 h-7 text-red-600" />
        </div>

        <h2 className="mt-4 text-xl font-extrabold text-zinc-900">
          {title}
        </h2>

        <p className="mt-2 text-sm text-zinc-600 leading-relaxed">
          {description}
        </p>
      </div>
    </section>
  );
}

/* =========================
   PRIVATE ROUTE FINAL
========================= */

const PrivateRoute = ({
  children,
  role,
  roles = [],
  permissions = [],
  requireAll = false,
  empresaOnly = false,
  fallback,
  showDeniedScreen = false,
  redirectToLoginIfDenied = false,
}) => {
  const { user, loadingAuth, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  if (loadingAuth) {
    return (
      <section className="min-h-screen bg-zinc-50 flex items-center justify-center px-4">
        <Loader2 className="w-8 h-8 text-red-600 animate-spin" />
      </section>
    );
  }

  if (!user) {
  const isDashboardRoute = location.pathname.startsWith("/dashboard");

  return (
    <Navigate
      to={isDashboardRoute ? "/dashboard/login" : "/login"}
      replace
      state={{ from: location }}
    />
  );
}

  const userRoles = normalizeRoles(user?.roles || []);
  const acl = buildPermissions(userRoles);

  const requestedRoles = [
    ...normalizeRoles(role ? [role] : []),
    ...normalizeRoles(roles),
  ];

  const roleAllowed = hasRequiredRoles(userRoles, requestedRoles, requireAll);
  const permissionAllowed = hasRequiredPermissions(acl, permissions, requireAll);

  // 🔥 CORREÇÃO AQUI (SEM localStorage)
  const empresaId = user?.empresaId;
  const empresaAllowed = !empresaOnly || !!empresaId;

  const granted = roleAllowed && permissionAllowed && empresaAllowed;

  if (granted) {
    return children;
  }

  const redirectTo = fallback || getRedirectPathByPermissions(acl);

  if (!showDeniedScreen) {
    return <Navigate to={redirectTo} replace />;
  }

  // Cliente tentando acessar dashboard → aviso interativo com botão de deslogar
  if (redirectToLoginIfDenied) {
    return (
      <section className="min-h-screen bg-[#0D0D0D] flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md rounded-3xl border border-white/10 bg-white/[0.04] p-6 sm:p-8 text-center">
          <div className="mx-auto h-14 w-14 rounded-3xl bg-amber-500/10 border border-amber-500/20 grid place-items-center">
            <ShieldAlert className="w-7 h-7 text-amber-400" />
          </div>

          <h2 className="mt-4 text-xl font-extrabold text-white">
            Área restrita
          </h2>

          <p className="mt-2 text-sm text-white/55 leading-relaxed">
            Esta área é reservada para a equipe do restaurante.
          </p>

          {user && (
            <p className="mt-1 text-xs text-white/40">
              Logado como <strong className="text-white/70">{user.username}</strong>
            </p>
          )}

          <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
            <button
              onClick={() => { logout(); navigate("/dashboard/login", { replace: true }); }}
              className="inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-[#E5252A] to-[#ff4b4f] px-5 py-2.5 text-sm font-bold text-white shadow-[0_14px_35px_rgba(229,37,42,0.25)] hover:opacity-90 transition"
            >
              <LogOut className="w-4 h-4" />
              Fazer Login como admin
            </button>
            <button
              onClick={() => navigate("/", { replace: true })}
              className="inline-flex items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-5 py-2.5 text-sm font-bold text-white/80 hover:bg-white/10 transition"
            >
              Ir para a Home
            </button>
          </div>
        </div>
      </section>
    );
  }

  if (!empresaAllowed) {
    return (
      <AccessDenied
        icon="store"
        title="Empresa não selecionada"
        description="Seu usuário exige uma empresa ativa para acessar esta área."
      />
    );
  }

  if (!roleAllowed && requestedRoles.length) {
    return (
      <AccessDenied
        icon="shield"
        title="Acesso restrito por papel"
        description={`Seu usuário (${acl.primaryRole || "SEM PAPEL"}) não possui o papel necessário.`}
      />
    );
  }

  if (!permissionAllowed && permissions.length) {
    return (
      <AccessDenied
        icon="lock"
        title="Permissão insuficiente"
        description="Você não possui permissão para acessar esta funcionalidade."
      />
    );
  }

  return (
    <AccessDenied
      icon="lock"
      title="Acesso negado"
      description="Você não possui permissão para acessar esta área."
    />
  );
};

export default PrivateRoute;