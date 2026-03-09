import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { authInterceptor } from './core/interceptors/auth.interceptor';
import { APP_CONFIG } from '@fsowemimo-d8b02f8a-4412-4cf4-a953-29470923d3a8/services';
import { environment } from '../environments/environment';
import {
  LUCIDE_ICONS,
  LucideIconProvider,
  LogOut,
  LayoutDashboard,
  ShieldAlert,
  Plus,
  Pencil,
  Trash2,
  X,
  Search,
  Filter,
  SortAsc,
  Settings,
  Check,
  Menu,
  Sun,
  Moon,
  Copy,
  BarChart3,
  ChevronDown,
  UserPlus,
  Users,
  ShieldCheck,
  MoreVertical,
  User,
  Loader,
  Loader2,
  Building2,
  ClipboardCheck,
  ShieldAlert,
  CheckCircle2,
} from 'lucide-angular';

import { routes } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideHttpClient(withInterceptors([authInterceptor])),
    {
      provide: APP_CONFIG,
      useValue: {
        production: environment.production,
        supabase: {
          url: environment.supabaseUrl,
          key: environment.supabaseKey,
        },
        apiUrl: environment.apiUrl,
      },
    },
    {
      provide: LUCIDE_ICONS,
      useValue: new LucideIconProvider({
        LogOut,
        LayoutDashboard,
        ShieldAlert,
        Plus,
        Pencil,
        Trash2,
        X,
        Search,
        Filter,
        SortAsc,
        Settings,
        Check,
        Menu,
        Sun,
        Moon,
        Copy,
        BarChart3,
        ChevronDown,
        UserPlus,
        Users,
        ShieldCheck,
        MoreVertical,
        User,
        Loader,
        Loader2,
        Building2,
        ClipboardCheck,
        ShieldAlert,
        CheckCircle2,
      }),
    },
  ],
};
