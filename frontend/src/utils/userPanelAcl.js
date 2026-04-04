export const ROLE_LABELS = {
  ROLE_USER: "Cliente",
  ROLE_ADMIN: "Restaurante",
  ROLE_GERENTE: "Gerente",
  ROLE_FUNCIONARIO: "Funcionário",
  ROLE_SUPER_ADMIN: "Admin Geral",
};

export const ROLE_PRIORITY = [
  "ROLE_SUPER_ADMIN",
  "ROLE_ADMIN",
  "ROLE_GERENTE",
  "ROLE_FUNCIONARIO",
  "ROLE_USER",
];

export function normalizeRole(role) {
  if (!role) return null;

  const raw = String(role).trim().toUpperCase();

  const aliases = {
    USER: "ROLE_USER",
    ADMIN: "ROLE_ADMIN",
    GERENTE: "ROLE_GERENTE",
    FUNCIONARIO: "ROLE_FUNCIONARIO",
    SUPER_ADMIN: "ROLE_SUPER_ADMIN",
  };

  return aliases[raw] || raw;
}

export function normalizeRoles(roles = []) {
  if (!roles) return [];

  const list = Array.isArray(roles) ? roles : [roles];

  return [...new Set(list.map(normalizeRole).filter(Boolean))];
}

export function hasRole(roles = [], role) {
  const normalizedRoles = normalizeRoles(roles);
  const normalizedRole = normalizeRole(role);

  return normalizedRoles.includes(normalizedRole);
}

export function hasAnyRole(roles = [], requiredRoles = []) {
  const normalizedRoles = normalizeRoles(roles);
  const normalizedRequired = normalizeRoles(requiredRoles);

  if (!normalizedRequired.length) return true;

  return normalizedRequired.some((role) => normalizedRoles.includes(role));
}

export function hasAllRoles(roles = [], requiredRoles = []) {
  const normalizedRoles = normalizeRoles(roles);
  const normalizedRequired = normalizeRoles(requiredRoles);

  if (!normalizedRequired.length) return true;

  return normalizedRequired.every((role) => normalizedRoles.includes(role));
}

export function getPrimaryRole(roles = []) {
  const normalizedRoles = normalizeRoles(roles);

  if (!normalizedRoles.length) return null;

  return ROLE_PRIORITY.find((role) => normalizedRoles.includes(role)) || normalizedRoles[0];
}

export function buildUserDisplayRole(roles = []) {
  const role = getPrimaryRole(roles);
  return ROLE_LABELS[role] || role || "Usuário";
}

export function getPermissions(roles = []) {
  const normalizedRoles = normalizeRoles(roles);
  const has = (role) => normalizedRoles.includes(normalizeRole(role));

  const isSuperAdmin = has("ROLE_SUPER_ADMIN");
  const isAdmin = has("ROLE_ADMIN");
  const isGerente = has("ROLE_GERENTE");
  const isFuncionario = has("ROLE_FUNCIONARIO");
  const isUser = has("ROLE_USER");

  const isRestaurant = isAdmin || isGerente || isFuncionario;
  const isClient =
    isUser && !isAdmin && !isGerente && !isFuncionario && !isSuperAdmin;

  return {
    roles: normalizedRoles,
    primaryRole: getPrimaryRole(normalizedRoles),
    displayRole: buildUserDisplayRole(normalizedRoles),

    isClient,
    isRestaurant,
    isSuperAdmin,

    isAdmin,
    isGerente,
    isFuncionario,
    isUser,

    canEditProfile: isUser,
    canViewOrders: isUser,

    canViewCompany: isAdmin || isGerente || isFuncionario || isSuperAdmin,
    canEditCompany: isAdmin || isGerente || isSuperAdmin,
    canViewAnalytics: isAdmin || isGerente || isSuperAdmin,
    canManageTeam: isAdmin || isGerente || isSuperAdmin,
    canRemoveUsers: isAdmin || isSuperAdmin,
    canChangeRoles: isAdmin || isSuperAdmin,

    canAccessDashboard: isAdmin || isGerente || isFuncionario || isSuperAdmin,
    canAccessDashboardTV: isAdmin || isGerente || isFuncionario || isSuperAdmin,

    canViewGlobalUsers: isSuperAdmin,
    canViewGlobalCompanies: isSuperAdmin,
    canUseFullACL: isSuperAdmin,
  };
}

export function hasPermission(roles = [], permissionName) {
  const permissions = getPermissions(roles);
  return Boolean(permissions?.[permissionName]);
}

export function hasAnyPermission(roles = [], permissionNames = []) {
  if (!permissionNames?.length) return true;

  const permissions = getPermissions(roles);
  return permissionNames.some((permission) => Boolean(permissions?.[permission]));
}

export function hasAllPermissions(roles = [], permissionNames = []) {
  if (!permissionNames?.length) return true;

  const permissions = getPermissions(roles);
  return permissionNames.every((permission) => Boolean(permissions?.[permission]));
}