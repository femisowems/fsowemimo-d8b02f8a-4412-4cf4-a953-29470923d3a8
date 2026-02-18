import { Component, inject, HostListener } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common'; // Important for *ngIf
import { SidebarComponent } from '../sidebar/sidebar.component';
import { ThemeService } from '../../core/services/theme.service';
import { KeyboardShortcutsService } from '../../core/services/keyboard-shortcuts.service';
import { UiStateService } from '../../core/services/ui-state.service';
import { LucideAngularModule } from 'lucide-angular';

@Component({
  selector: 'app-dashboard-layout',
  standalone: true,
  imports: [CommonModule, RouterOutlet, SidebarComponent, LucideAngularModule],
  template: `
    <div class="flex h-screen bg-surface transition-colors duration-300 relative select-none">
      <!-- Mobile Backdrop -->
      @if (uiState.isSidebarOpen()) {
        <button 
          type="button"
          class="fixed inset-0 bg-gray-900/50 z-40 lg:hidden backdrop-blur-sm transition-opacity w-full h-full cursor-default"
          aria-label="Close sidebar"
          (click)="uiState.isSidebarOpen.set(false)"
          tabindex="-1">
        </button>
      }

      <app-sidebar></app-sidebar>
      
      <main class="flex-1 flex flex-col h-full overflow-hidden">
        <!-- Mobile Header -->
        <header class="lg:hidden bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 px-4 py-3 flex items-center justify-between shrink-0 z-30">
           <div class="flex items-center gap-3">
            <button 
              (click)="uiState.toggleSidebar()"
              class="p-2 -ml-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700/50 rounded-lg transition-colors"
              aria-label="Open menu">
              <lucide-icon name="menu" [size]="24"></lucide-icon>
            </button>
            <span class="font-bold text-lg text-slate-900 dark:text-white tracking-tight">SecureTasks</span>
          </div>

          <button 
            (click)="themeService.toggleTheme()"
            class="p-2 -mr-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700/50 rounded-lg transition-colors"
            aria-label="Toggle theme">
            <lucide-icon [name]="themeService.theme() === 'dark' ? 'sun' : 'moon'" [size]="24"></lucide-icon>
          </button>
        </header>

        <div class="flex-1 overflow-y-auto p-4 lg:p-8 scroll-smooth">
          <router-outlet></router-outlet>
        </div>
      </main>
    </div>
  `,
  styles: [`
    :host { display: block; }
  `]
})
export class DashboardLayoutComponent {
  public themeService = inject(ThemeService);
  private shortcutService = inject(KeyboardShortcutsService);
  public uiState = inject(UiStateService);

  constructor() {
    this.shortcutService.registerShortcut({
      key: 'd',
      description: 'Toggle Dark/Light Mode',
      category: 'Global',
      action: () => this.themeService.toggleTheme()
    });
  }

  @HostListener('window:keydown.esc')
  onEsc() {
    if (this.uiState.isSidebarOpen()) {
      this.uiState.isSidebarOpen.set(false);
    }
  }
}
