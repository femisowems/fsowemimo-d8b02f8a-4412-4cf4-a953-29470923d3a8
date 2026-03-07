import { Component, inject, computed } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthStore, UiStateService } from '@fsowemimo-d8b02f8a-4412-4cf4-a953-29470923d3a8/state';
import { ThemeService } from '@fsowemimo-d8b02f8a-4412-4cf4-a953-29470923d3a8/services';
import { UserRole } from '@fsowemimo-d8b02f8a-4412-4cf4-a953-29470923d3a8/models';
import { LucideAngularModule } from 'lucide-angular';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive, LucideAngularModule],
  template: `
    <div
      class="fixed inset-y-0 left-0 z-50 w-64 h-screen bg-surface border-r border-border-subtle flex flex-col transition-transform duration-300 lg:static lg:translate-x-0 shadow-2xl lg:shadow-none"
      [class.-translate-x-full]="!uiState.isSidebarOpen()"
      [class.translate-x-0]="uiState.isSidebarOpen()"
    >
      <div
        class="p-grid-lg border-b border-border-subtle flex items-center justify-between"
      >
        <div class="flex items-center gap-4">
          <div class="relative group">
            <div class="absolute -inset-1 bg-gradient-to-r from-magenta-500 to-orange-500 rounded-xl blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200"></div>
            <img src="logo.png" alt="Secure Task Management" class="relative w-14 h-14 rounded-xl shadow-xl border border-white/10 bg-white object-contain p-1">
          </div>
          <div>
            <h1 class="text-h4 font-extrabold text-text-primary leading-none tracking-tight">
              Secure Task
              <span class="block text-[10px] font-bold text-indigo-500 tracking-[0.2em] uppercase mt-1 opacity-70">Management</span>
            </h1>
            <p
              class="text-[10px] text-text-secondary uppercase tracking-widest font-bold opacity-60 mt-1"
            >
              {{ role() }}
            </p>
          </div>
        </div>
        <button
          [class.lg:hidden]="true"
          (click)="closeSidebar()"
          class="lg:hidden p-1 text-text-secondary hover:text-text-primary"
        >
          <lucide-icon name="x" [size]="20"></lucide-icon>
        </button>
      </div>

      <nav class="flex-1 p-grid-md space-y-1">
        <a
          routerLink="/dashboard/tasks"
          (click)="closeSidebar()"
          routerLinkActive="bg-indigo-50 text-indigo-700 font-bold"
          [routerLinkActiveOptions]="{ exact: false }"
          class="flex items-center gap-grid-sm px-grid-md py-grid-sm rounded-md transition-colors text-text-secondary hover:bg-gray-50 hover:text-text-primary text-body-sm font-medium"
        >
          <lucide-icon name="layout-dashboard" [size]="18"></lucide-icon>
          Tasks
        </a>

        @if (isAdmin()) {
          <a
            routerLink="/dashboard/users"
            (click)="closeSidebar()"
            routerLinkActive="bg-indigo-50 text-indigo-700 font-bold"
            class="flex items-center gap-grid-sm px-grid-md py-grid-sm rounded-md transition-colors text-text-secondary hover:bg-gray-50 hover:text-text-primary text-body-sm font-medium"
          >
            <lucide-icon name="users" [size]="18"></lucide-icon>
            User Management
          </a>
        }

        @if (isAdminOrOwner()) {
          <a
            routerLink="/dashboard/audit"
            (click)="closeSidebar()"
            routerLinkActive="bg-indigo-50 text-indigo-700 font-bold"
            class="flex items-center gap-grid-sm px-grid-md py-grid-sm rounded-md transition-colors text-text-secondary hover:bg-gray-50 hover:text-text-primary text-body-sm font-medium"
          >
            <lucide-icon name="shield-alert" [size]="18"></lucide-icon>
            Audit Log
          </a>
        }

        <a
          routerLink="/dashboard/settings"
          (click)="closeSidebar()"
          routerLinkActive="bg-indigo-50 text-indigo-700 font-bold"
          class="flex items-center gap-grid-sm px-grid-md py-grid-sm rounded-md transition-colors text-text-secondary hover:bg-gray-50 hover:text-text-primary text-body-sm font-medium"
        >
          <lucide-icon name="settings" [size]="18"></lucide-icon>
          Settings
        </a>
      </nav>

      <div class="p-grid-md border-t border-border-subtle space-y-1">
        <button
          (click)="themeService.toggleTheme()"
          class="w-full flex items-center gap-grid-sm px-grid-md py-grid-sm text-text-secondary hover:bg-gray-50 hover:text-text-primary rounded-md transition-colors text-body-sm font-medium"
        >
          <lucide-icon
            [name]="themeService.theme() === 'dark' ? 'sun' : 'moon'"
            [size]="18"
          ></lucide-icon>
          {{ themeService.theme() === 'dark' ? 'Light Mode' : 'Dark Mode' }}
        </button>

        <button
          (click)="logout()"
          class="w-full flex items-center gap-grid-sm px-grid-md py-grid-sm text-red-600 hover:bg-red-50 rounded-md transition-colors text-body-sm font-medium"
        >
          <lucide-icon name="log-out" [size]="18"></lucide-icon>
          Logout
        </button>
      </div>
    </div>
  `,
  styles: [
    `
      :host {
        display: block;
      }
    `,
  ],
})
export class SidebarComponent {
  private authStore = inject(AuthStore);
  public uiState = inject(UiStateService);
  public themeService = inject(ThemeService);

  user = this.authStore.user;
  role = computed(() => this.user()?.role || '');
  isAdmin = computed(() => this.role() === UserRole.ADMIN);
  isAdminOrOwner = computed(() => {
    const r = this.role();
    return r === UserRole.ADMIN || r === UserRole.OWNER;
  });

  logout() {
    this.authStore.logout();
  }

  closeSidebar() {
    if (this.uiState.isSidebarOpen()) {
      this.uiState.isSidebarOpen.set(false);
    }
  }
}
