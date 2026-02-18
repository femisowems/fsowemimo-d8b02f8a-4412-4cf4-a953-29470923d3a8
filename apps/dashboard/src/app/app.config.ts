import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { authInterceptor } from './core/interceptors/auth.interceptor';
import { LUCIDE_ICONS, LucideIconProvider, LogOut, LayoutDashboard, ShieldAlert, Plus, Pencil, Trash2, X, Search, Filter, SortAsc, Settings, Check } from 'lucide-angular';

import { routes } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideHttpClient(withInterceptors([authInterceptor])),
    {
      provide: LUCIDE_ICONS,
      useValue: new LucideIconProvider({ LogOut, LayoutDashboard, ShieldAlert, Plus, Pencil, Trash2, X, Search, Filter, SortAsc, Settings, Check })
    }
  ]
};
