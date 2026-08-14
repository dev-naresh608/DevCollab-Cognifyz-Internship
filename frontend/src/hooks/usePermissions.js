import { useSelector } from "react-redux";

export const usePermissions = () => {
  const { userPermissions, userRole } = useSelector((state) => state.workspace);

  const hasPermission = (permissionName) => {
    if (!permissionName) return true;
    return userPermissions.includes(permissionName);
  };

  const hasAnyPermission = (permissionNames = []) => {
    if (permissionNames.length === 0) return true;
    return permissionNames.some((perm) => userPermissions.includes(perm));
  };

  return {
    userPermissions,
    userRole,
    hasPermission,
    hasAnyPermission,
  };
};
