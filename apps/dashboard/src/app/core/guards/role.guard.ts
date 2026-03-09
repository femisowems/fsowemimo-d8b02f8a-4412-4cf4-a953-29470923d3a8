import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { AuthStore } from '@secure-task-management/state';
import { UserRole } from '@secure-task-management/models';

export const roleGuard = (allowedRoles: UserRole[]): CanActivateFn => {
  return () => {
    const authStore = inject(AuthStore);
    const router = inject(Router);
    const user = authStore.user();

    if (!user) {
      router.navigate(['/login']);
      return false;
    }

    const hasRole = allowedRoles.includes(user.role);

    // Inheritance logic: Admin is highest role and can access Owner/Viewer routes.
    if (!hasRole && user.role === UserRole.ADMIN) return true;
    if (
      !hasRole &&
      user.role === UserRole.OWNER &&
      allowedRoles.includes(UserRole.VIEWER)
    )
      return true;

    if (hasRole) {
      return true;
    }

    router.navigate(['/dashboard']);
    return false;
  };
};
