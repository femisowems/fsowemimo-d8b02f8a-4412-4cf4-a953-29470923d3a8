import { Component, inject, computed } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthStore } from '../../core/services/auth.store';
import { UserRole } from '../../core/models';
import { LucideAngularModule } from 'lucide-angular';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive, LucideAngularModule],
  template: `
    <div class="w-64 h-screen bg-surface border-r border-border-subtle flex flex-col">
      <div class="p-grid-lg border-b border-border-subtle">
        <h1 class="text-h4 font-bold text-indigo-600 leading-tight">Secure Task Management</h1>
        <p class="text-caption text-text-secondary mt-1 uppercase tracking-wider font-semibold">{{ role() }}</p>
      </div>

      <nav class="flex-1 p-grid-md space-y-1">
        <a routerLink="/dashboard/tasks" 
           routerLinkActive="bg-indigo-50 text-indigo-700 font-bold"
           [routerLinkActiveOptions]="{exact: false}"
           class="flex items-center gap-grid-sm px-grid-md py-grid-sm rounded-md transition-colors text-text-secondary hover:bg-gray-50 hover:text-text-primary text-body-sm font-medium">
          <lucide-icon name="layout-dashboard" [size]="18"></lucide-icon>
          Tasks
        </a>

        @if (isAdminOrOwner()) {
          <a routerLink="/dashboard/audit" 
             routerLinkActive="bg-indigo-50 text-indigo-700 font-bold"
             class="flex items-center gap-grid-sm px-grid-md py-grid-sm rounded-md transition-colors text-text-secondary hover:bg-gray-50 hover:text-text-primary text-body-sm font-medium">
            <lucide-icon name="shield-alert" [size]="18"></lucide-icon>
            Audit Log
          </a>
        }

        <a routerLink="/dashboard/settings" 
           routerLinkActive="bg-indigo-50 text-indigo-700 font-bold"
           class="flex items-center gap-grid-sm px-grid-md py-grid-sm rounded-md transition-colors text-text-secondary hover:bg-gray-50 hover:text-text-primary text-body-sm font-medium">
          <lucide-icon name="settings" [size]="18"></lucide-icon>
          Settings
        </a>
      </nav>

      <div class="p-grid-md border-t border-border-subtle">
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

  user = this.authStore.user;
  role = computed(() => this.user()?.role || '');
  isAdminOrOwner = computed(() => {
    const r = this.role();
    return r === UserRole.ADMIN || r === UserRole.OWNER;
  });

  logout() {
    this.authStore.logout();
  }
}
