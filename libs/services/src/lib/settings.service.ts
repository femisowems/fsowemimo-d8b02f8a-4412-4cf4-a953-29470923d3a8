import { Injectable, inject } from '@angular/core';
import { Observable, of } from 'rxjs';
import { catchError, delay, map, switchMap, tap } from 'rxjs/operators';
import { HttpClient } from '@angular/common/http';
import { AuditService } from './audit.service';
import { APP_CONFIG } from './tokens';
import {
  User,
  UserSettings,
  SettingsProfile,
  SettingsOrganization,
  SettingsSecurity,
  SettingsPreferences,
} from '@secure-task-management/models';

@Injectable({
  providedIn: 'root',
})
export class SettingsService {
  private auditService = inject(AuditService);
  private http = inject(HttpClient);
  private config = inject(APP_CONFIG);

  private security: SettingsSecurity = {
    mfaEnabled: false,
    sessionTimeout: 30,
  };
  private preferences: SettingsPreferences = {
    theme: 'system',
    defaultView: 'kanban',
    itemsPerPage: 20,
  };

  private getCurrentUser(): Observable<User | null> {
    return this.http
      .get<User>(`${this.config.apiUrl}/auth/me`)
      .pipe(catchError(() => of(null)));
  }

  private toSettings(user: User): UserSettings {
    return {
      profile: {
        email: user.email,
        role: user.role,
        name: user.name || 'User',
      },
      organization: {
        id: user.organizationId,
      },
      security: {
        mfaEnabled: user.mfaEnabled || false,
        sessionTimeout: user.sessionTimeout || 30,
      },
      preferences: user.preferences || {
        theme: 'system',
        defaultView: 'kanban',
        itemsPerPage: 20,
      },
    };
  }

  private defaultSettings(): UserSettings {
    return {
      profile: { email: '', role: '', name: '' },
      organization: { id: '' },
      security: this.security,
      preferences: this.preferences,
    };
  }

  getSettings(): Observable<UserSettings> {
    return this.getCurrentUser().pipe(
      map((user) => (user ? this.toSettings(user) : this.defaultSettings())),
      delay(500),
    );
  }

  updateProfile(profile: SettingsProfile): Observable<SettingsProfile> {
    return this.getCurrentUser().pipe(
      switchMap((user) => {
        if (!user) return of(profile);

        return this.http
          .put<SettingsProfile>(`${this.config.apiUrl}/users/${user.id}`, {
            name: profile.name,
          })
          .pipe(
            tap((updated) => {
              this.auditService.logAction(
                'Update Profile',
                { name: updated.name },
                'User',
                user.id,
              );
            }),
          );
      }),
    );
  }

  updateOrganization(
    organization: SettingsOrganization,
  ): Observable<SettingsOrganization> {
    return of(organization).pipe(delay(500));
  }

  updateSecurity(security: SettingsSecurity): Observable<SettingsSecurity> {
    this.security = security;

    return this.getCurrentUser().pipe(
      switchMap((user) => {
        if (!user) return of(security);

        return this.http
          .put<SettingsSecurity>(`${this.config.apiUrl}/users/${user.id}`, {
            mfaEnabled: security.mfaEnabled,
            sessionTimeout: security.sessionTimeout,
          })
          .pipe(
            tap(() => {
              this.auditService.logAction(
                'Update Security',
                { mfa: security.mfaEnabled, timeout: security.sessionTimeout },
                'User',
                user.id,
              );
            }),
          );
      }),
    );
  }

  updatePreferences(
    preferences: SettingsPreferences,
  ): Observable<SettingsPreferences> {
    this.preferences = preferences;

    return this.getCurrentUser().pipe(
      switchMap((user) => {
        if (!user) return of(preferences);

        return this.http
          .put<SettingsPreferences>(`${this.config.apiUrl}/users/${user.id}`, {
            preferences,
          })
          .pipe(
            tap(() => {
              this.auditService.logAction(
                'Update Preferences',
                preferences,
                'User',
                user.id,
              );
            }),
          );
      }),
    );
  }
}
