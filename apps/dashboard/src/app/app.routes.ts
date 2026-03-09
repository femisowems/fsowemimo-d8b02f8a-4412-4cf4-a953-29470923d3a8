import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { roleGuard } from './core/guards/role.guard';
import { UserRole } from '@secure-task-management/models';

export const routes: Routes = [
  { path: '', redirectTo: 'dashboard/tasks', pathMatch: 'full' },
  {
    path: 'login',
    loadComponent: () =>
      import('./features/auth/login-page/login-page.component').then(
        (m) => m.LoginPageComponent,
      ),
  },
  {
    path: 'signup',
    loadComponent: () =>
      import('./features/auth/signup-page/signup-page.component').then(
        (m) => m.SignupPageComponent,
      ),
  },
  {
    path: 'dashboard',
    loadComponent: () =>
      import('./layout/dashboard-layout/dashboard-layout.component').then(
        (m) => m.DashboardLayoutComponent,
      ),
    canActivate: [authGuard],
    children: [
      { path: '', redirectTo: 'tasks', pathMatch: 'full' },
      {
        path: 'tasks',
        loadComponent: () =>
          import(
            './features/tasks/task-list-page/task-list-page.component'
          ).then((m) => m.TaskListPageComponent),
      },
      {
        path: 'audit',
        loadComponent: () =>
          import(
            './features/audit/audit-log-page/audit-log-page.component'
          ).then((m) => m.AuditLogPageComponent),
        canActivate: [roleGuard([UserRole.ADMIN, UserRole.OWNER])],
      },
      {
        path: 'users',
        loadComponent: () =>
          import(
            './features/users/user-management-page.component'
          ).then((m) => m.UserManagementPageComponent),
        canActivate: [roleGuard([UserRole.ADMIN])],
      },
      {
        path: 'settings',
        loadComponent: () =>
          import('./features/settings/settings.page').then(
            (m) => m.SettingsPage,
          ),
        canActivate: [
          roleGuard([UserRole.OWNER, UserRole.ADMIN, UserRole.VIEWER]),
        ],
        data: { roles: [UserRole.OWNER, UserRole.ADMIN, UserRole.VIEWER] },
      },
    ],
  },
  { path: '**', redirectTo: 'dashboard/tasks' },
];
