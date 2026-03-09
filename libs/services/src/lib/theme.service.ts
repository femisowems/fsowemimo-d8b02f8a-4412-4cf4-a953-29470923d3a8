import { Injectable, signal, effect, inject } from '@angular/core';
import { SettingsService } from './settings.service';
import {
  Theme,
  SettingsPreferences,
} from '@secure-task-management/models';

@Injectable({
  providedIn: 'root',
})
export class ThemeService {
  private settingsService = inject(SettingsService);

  private preferences = signal<SettingsPreferences>({
    theme: 'system',
    defaultView: 'kanban',
    itemsPerPage: 20,
  });

  theme = signal<Theme>(this.getInitialTheme());

  constructor() {
    effect(() => {
      const currentTheme = this.theme();
      localStorage.setItem('theme-preference', currentTheme);
      this.applyTheme(currentTheme);
    });

    window
      .matchMedia('(prefers-color-scheme: dark)')
      .addEventListener('change', () => {
        if (this.theme() === 'system') {
          this.applyTheme('system');
        }
      });

    this.settingsService.getSettings().subscribe((settings) => {
      if (settings?.preferences?.theme) {
        this.preferences.set(settings.preferences);
        this.theme.set(settings.preferences.theme as Theme);
      }
    });
  }

  private getInitialTheme(): Theme {
    const saved = localStorage.getItem('theme-preference') as Theme;
    return saved || 'system';
  }

  private applyTheme(theme: Theme) {
    let isDark = false;
    if (theme === 'system') {
      isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    } else {
      isDark = theme === 'dark';
    }

    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }

  setTheme(theme: Theme) {
    this.theme.set(theme);
    const nextPreferences = {
      ...this.preferences(),
      theme,
    };
    this.preferences.set(nextPreferences);
    this.settingsService.updatePreferences(nextPreferences).subscribe();
  }

  toggleTheme() {
    const current = this.theme();
    const next: Theme = current === 'dark' ? 'light' : 'dark';
    this.setTheme(next);
  }
}
