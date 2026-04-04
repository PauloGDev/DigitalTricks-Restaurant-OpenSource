import { Navigate, useLocation } from "react-router-dom";
import { Loader2, ShieldAlert, Lock, Store, User } from "lucide-react";
import { useAuth } from "./AuthContext";

/* =========================
   HELPERS DE ROLE / ACL
========================= */

const ROLE_ALIASES = {
  ADMIN: "ROLE_ADMIN",
  USER: "ROLE_USER",
  GERENTE: "ROLE_GERENTE",
  FUNCIONARIO: "ROLE_FUNCIONARIO",
  SUPER_ADMIN: "ROLE_SUPER_ADMIN",
};

function normalizeRole(role) {
  if (!role) return null;
  const raw = String(role).trim().toUpperCase();
  return ROLE_ALIASES[raw] || raw;
}

function normalizeRoles(roles) {
  if (!roles) return [];
  if (Array.isArray(roles)) {
    return roles.map(normalizeRole).filter(Boolean);
  }
  return [normalizeRole(roles)].filter(Boolean);
}

function getPrimaryRole(roles = []) {
  const normalized = normalizeRoles(roles);

  const priority = [
    "ROLE_SUPER_ADMIN",
    "ROLE_ADMIN",
    "ROLE_GERENTE",
    "ROLE_FUNCIONARIO",
    "ROLE_USER",
  ];

  return priority.find((role) => normalized.includes(role)) || normalized[0] || null;
}

function buildPermissions(roles = []) {
  const normalized = normalizeRoles(roles);
  const has = (role) => normalized.includes(normalizeRole(role));

  return {
    roles: normalized,
    primaryRole: getPrimaryRole(normalized),

    isSuperAdmin: has("ROLE_SUPER_ADMIN"),
    isAdmin: has("ROLE_ADMIN"),
    isGerente: has("ROLE_GERENTE"),
    isFuncionario: has("ROLE_FUNCIONARIO"),
    isUser: has("ROLE_USER"),

    isRestaurantStaff:
      has("ROLE_ADMIN") || has("ROLE_GERENTE") || has("ROLE_FUNCIONARIO"),

    isClientOnly:
      has("ROLE_USER") &&
      !has("ROLE_ADMIN") &&
      !has("ROLE_GERENTE") &&
      !has("ROLE_FUNCIONARIO") &&
      !has("ROLE_SUPER_ADMIN"),

    canAccessDashboard:
      has("ROLE_SUPER_ADMIN") ||
      has("ROLE_ADMIN") ||
      has("ROLE_GERENTE") ||
      has("ROLE_FUNCIONARIO"),

    canManageCompany:
      has("ROLE_SUPER_ADMIN") ||
      has("ROLE_ADMIN") ||
      has("ROLE_GERENTE"),

    canManageTeam:
      has("ROLE_SUPER_ADMIN") ||
      has("ROLE_ADMIN") ||
      has("ROLE_GERENTE"),

    canRemoveUsers:
      has("ROLE_SUPER_ADMIN") || has("ROLE_ADMIN"),

    canChangeACL:
      has("ROLE_SUPER_ADMIN") || has("ROLE_ADMIN"),

    canViewOrders: true,
    canEditProfile: has("ROLE_USER"),
    canViewGlobalAdmin: has("ROLE_SUPER_ADMIN"),
  };
}

function hasRequiredRoles(userRoles = [], requiredRoles = [], requireAll = false) {
  const current = normalizeRoles(userRoles);
  const required = normalizeRoles(requiredRoles);

  if (!required.length) return true;

  if (requireAll) {
    return required.every((role) => current.includes(role));
  }

  return required.some((role) => current.includes(role));
}

function hasRequiredPermissions(userPermissions, requiredPermissions = [], requireAll = false) {
  if (!requiredPermissions?.length) return true;

  if (requireAll) {
    return requiredPermissions.every((perm) => Boolean(userPermissions?.[perm]));
  }

  return requiredPermissions.some((perm) => Boolean(userPermissions?.[perm]));
}

function getRedirectPathByPermissions(perms) {
  if (perms?.canAccessDashboard) return "/dashboard";
  if (perms?.isClientOnly) return "/perfil";
  return "/";
}

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
}) => {
  const { user, loadingAuth } = useAuth();
  const location = useLocation();

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