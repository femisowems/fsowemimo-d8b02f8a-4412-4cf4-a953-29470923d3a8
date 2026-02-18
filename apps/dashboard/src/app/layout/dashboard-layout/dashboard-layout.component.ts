import { Component, inject, HostListener } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common'; // Important for *ngIf
import { SidebarComponent } from '../sidebar/sidebar.component';
import { ThemeService } from '../../core/services/theme.service';
import { KeyboardShortcutsService } from '../../core/services/keyboard-shortcuts.service';
import { UiStateService } from '../../core/services/ui-state.service';

@Component({
  selector: 'app-dashboard-layout',
  standalone: true,
  imports: [CommonModule, RouterOutlet, SidebarComponent],
  template: `
    <div class="flex h-screen bg-surface transition-colors duration-300 relative">
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
      
      <main class="flex-1 overflow-y-auto p-4 lg:p-8">
        <router-outlet></router-outlet>
      </main>
    </div>
  `,
  styles: [`
    :host { display: block; }
  `]
})
export class DashboardLayoutComponent {
  private themeService = inject(ThemeService);
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
