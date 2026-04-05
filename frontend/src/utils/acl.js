const ROLE_ALIASES = {
  ADMIN: "ROLE_ADMIN",
  USER: "ROLE_USER",
  GERENTE: "ROLE_GERENTE",
  FUNCIONARIO: "ROLE_FUNCIONARIO",
  SUPER_ADMIN: "ROLE_SUPER_ADMIN",
};

export function normalizeRole(role) {
  if (!role) return null;
  const raw = String(role).trim().toUpperCase();
  return ROLE_ALIASES[raw] || raw;
}

export function normalizeRoles(roles) {
  if (!roles) return [];
  if (Array.isArray(roles)) {
    return roles.map(normalizeRole).filter(Boolean);
  }
  return [normalizeRole(roles)].filter(Boolean);
}

export function getPrimaryRole(roles = []) {
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

export function buildPermissions(roles = []) {
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
      has("ROLE_SUPER_ADMIN") || has("ROLE_ADMIN") || has("ROLE_GERENTE"),
    canManageTeam:
      has("ROLE_SUPER_ADMIN") || has("ROLE_ADMIN") || has("ROLE_GERENTE"),
    canRemoveUsers: has("ROLE_SUPER_ADMIN") || has("ROLE_ADMIN"),
    canChangeACL: has("ROLE_SUPER_ADMIN") || has("ROLE_ADMIN"),
    canViewOrders: true,
    canEditProfile: has("ROLE_USER"),
    canViewGlobalAdmin: has("ROLE_SUPER_ADMIN"),
  };
}

export function hasRequiredRoles(userRoles = [], requiredRoles = [], requireAll = false) {
  const current = normalizeRoles(userRoles);
  const required = normalizeRoles(requiredRoles);
  if (!required.length) return true;
  if (requireAll) return required.every((role) => current.includes(role));
  return required.some((role) => current.includes(role));
}

export function hasRequiredPermissions(userPermissions, requiredPermissions = [], requireAll = false) {
  if (!requiredPermissions?.length) return true;
  if (requireAll) return requiredPermissions.every((perm) => Boolean(userPermissions?.[perm]));
  return requiredPermissions.some((perm) => Boolean(userPermissions?.[perm]));
}

export function getRedirectPathByPermissions(perms) {
  if (perms?.canAccessDashboard) return "/dashboard";
  if (perms?.isClientOnly) return "/perfil";
  return "/";
}
