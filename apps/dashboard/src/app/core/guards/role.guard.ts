import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { AuthStore } from '@fsowemimo-d8b02f8a-4412-4cf4-a953-29470923d3a8/state';
import { UserRole } from '@fsowemimo-d8b02f8a-4412-4cf4-a953-29470923d3a8/models';

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

    // Inheritance logic: Owner can do everything Admin/Viewer can
    if (!hasRole && user.role === UserRole.OWNER) return true;
    if (
      !hasRole &&
      user.role === UserRole.ADMIN &&
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
