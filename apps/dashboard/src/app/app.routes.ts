import { Routes } from '@angular/router';
import { LoginPageComponent } from './features/auth/login-page/login-page.component';
import { SignupPageComponent } from './features/auth/signup-page/signup-page.component';
import { DashboardLayoutComponent } from './layout/dashboard-layout/dashboard-layout.component';
import { TaskListPageComponent } from './features/tasks/task-list-page/task-list-page.component';
import { authGuard } from './core/guards/auth.guard';
import { roleGuard } from './core/guards/role.guard';
import { UserRole } from './core/models';

export const routes: Routes = [
    { path: '', redirectTo: 'dashboard/tasks', pathMatch: 'full' },
    { path: 'login', component: LoginPageComponent },
    { path: 'signup', component: SignupPageComponent },
    {
        path: 'dashboard',
        component: DashboardLayoutComponent,
        canActivate: [authGuard],
        children: [
            { path: '', redirectTo: 'tasks', pathMatch: 'full' },
            { path: 'tasks', component: TaskListPageComponent },
            {
                path: 'audit',
                loadComponent: () => import('./features/audit/audit-log-page/audit-log-page.component').then(m => m.AuditLogPageComponent),
                canActivate: [roleGuard([UserRole.ADMIN, UserRole.OWNER])]
            },
            {
                path: 'settings',
                loadComponent: () => import('./features/settings/settings.page').then(m => m.SettingsPage),
                canActivate: [roleGuard([UserRole.OWNER, UserRole.ADMIN, UserRole.VIEWER])],
                data: { roles: [UserRole.OWNER, UserRole.ADMIN, UserRole.VIEWER] }
            }
        ]
    },
    { path: '**', redirectTo: 'dashboard/tasks' }
];
