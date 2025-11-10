export function hasPermission<T extends Record<string, any>>(
  role: string | undefined,
  permissions: Record<string, T>,
  permission: keyof T
): boolean {
  if (!role) return false;
  return permissions[role]?.[permission] ?? false;
}

export function hasPermissions<T extends Record<string, any>>(
  role: string | undefined,
  permissions: Record<string, T>,
  ...requiredPermissions: Array<keyof T>
): boolean {
  if (!role) return false;
  return requiredPermissions.every(
    (permission) => permissions[role]?.[permission] ?? false
  );
}

export function checkPermissions<T extends Record<string, any>>(
  role: string | undefined,
  permissions: Record<string, T>,
  requiredPermissions: Array<keyof T>,
  mode: "all" | "any" = "all"
): boolean {
  if (!role) return false;

  const checker = mode === "all" ? "every" : "some";
  return requiredPermissions[checker](
    (permission) => permissions[role]?.[permission] ?? false
  );
}
