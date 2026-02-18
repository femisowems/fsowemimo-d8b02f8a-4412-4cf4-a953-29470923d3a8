import { Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { SidebarComponent } from '../sidebar/sidebar.component';
import { ThemeService } from '../../core/services/theme.service';
import { KeyboardShortcutsService } from '../../core/services/keyboard-shortcuts.service';

@Component({
  selector: 'app-dashboard-layout',
  standalone: true,
  imports: [RouterOutlet, SidebarComponent],
  template: `
    <div class="flex h-screen bg-surface transition-colors duration-300">
      <app-sidebar></app-sidebar>
      <main class="flex-1 overflow-y-auto p-8">
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

  constructor() {
    this.shortcutService.registerShortcut({
      key: 'd',
      description: 'Toggle Dark/Light Mode',
      category: 'Global',
      action: () => this.themeService.toggleTheme()
    });
  }
}
