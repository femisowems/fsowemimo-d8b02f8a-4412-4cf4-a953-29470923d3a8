import { Component, inject, computed } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthStore } from '../../core/services/auth.store';
import { UiStateService } from '../../core/services/ui-state.service';
import { ThemeService } from '../../core/services/theme.service';
import { UserRole } from '../../core/models';
import { LucideAngularModule } from 'lucide-angular';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive, LucideAngularModule],
  template: `
    <div 
      class="fixed inset-y-0 left-0 z-50 w-64 h-screen bg-surface border-r border-border-subtle flex flex-col transition-transform duration-300 lg:static lg:translate-x-0 shadow-2xl lg:shadow-none"
      [class.-translate-x-full]="!uiState.isSidebarOpen()"
      [class.translate-x-0]="uiState.isSidebarOpen()">
      <div class="p-grid-lg border-b border-border-subtle flex items-center justify-between">
        <div>
          <h1 class="text-h4 font-bold text-indigo-600 leading-tight">Secure Task Management</h1>
          <p class="text-caption text-text-secondary mt-1 uppercase tracking-wider font-semibold">{{ role() }}</p>
        </div>
        <button [class.lg:hidden]="true" (click)="closeSidebar()" class="lg:hidden p-1 text-text-secondary hover:text-text-primary">
            <lucide-icon name="x" [size]="20"></lucide-icon>
        </button>
      </div>

      <nav class="flex-1 p-grid-md space-y-1">
        <a routerLink="/dashboard/tasks" 
           (click)="closeSidebar()"
           routerLinkActive="bg-indigo-50 text-indigo-700 font-bold"
           [routerLinkActiveOptions]="{exact: false}"
           class="flex items-center gap-grid-sm px-grid-md py-grid-sm rounded-md transition-colors text-text-secondary hover:bg-gray-50 hover:text-text-primary text-body-sm font-medium">
          <lucide-icon name="layout-dashboard" [size]="18"></lucide-icon>
          Tasks
        </a>

        @if (isAdminOrOwner()) {
          <a routerLink="/dashboard/audit" 
             (click)="closeSidebar()"
             routerLinkActive="bg-indigo-50 text-indigo-700 font-bold"
             class="flex items-center gap-grid-sm px-grid-md py-grid-sm rounded-md transition-colors text-text-secondary hover:bg-gray-50 hover:text-text-primary text-body-sm font-medium">
            <lucide-icon name="shield-alert" [size]="18"></lucide-icon>
            Audit Log
          </a>
        }

        <a routerLink="/dashboard/settings" 
           (click)="closeSidebar()"
           routerLinkActive="bg-indigo-50 text-indigo-700 font-bold"
           class="flex items-center gap-grid-sm px-grid-md py-grid-sm rounded-md transition-colors text-text-secondary hover:bg-gray-50 hover:text-text-primary text-body-sm font-medium">
          <lucide-icon name="settings" [size]="18"></lucide-icon>
          Settings
        </a>
      </nav>

      <div class="p-grid-md border-t border-border-subtle space-y-1">
        <button
          (click)="themeService.toggleTheme()"
          class="w-full flex items-center gap-grid-sm px-grid-md py-grid-sm text-text-secondary hover:bg-gray-50 hover:text-text-primary rounded-md transition-colors text-body-sm font-medium"
        >
          <lucide-icon [name]="themeService.theme() === 'dark' ? 'sun' : 'moon'" [size]="18"></lucide-icon>
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
  styles: [`
    :host { display: block; }
  `]
})
export class SidebarComponent {
  private authStore = inject(AuthStore);
  public uiState = inject(UiStateService);
  public themeService = inject(ThemeService);

  user = this.authStore.user;
  role = computed(() => this.user()?.role || '');
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
