import { Injectable, inject } from '@angular/core';
import { Observable, of } from 'rxjs';
import { delay, tap } from 'rxjs/operators';
import { HttpClient } from '@angular/common/http';
import { AuthStore } from '../../core/services/auth.store';
import { AuditService } from '../../core/services/audit.service';
import { environment } from '../../../environments/environment';
import { UserSettings, SettingsProfile, SettingsOrganization, SettingsSecurity, SettingsPreferences } from './settings.model';

@Injectable({
    providedIn: 'root'
})
export class SettingsService {
    private authStore = inject(AuthStore);
    private auditService = inject(AuditService);
    private http = inject(HttpClient);

    // Mock initial data for preferences and security (since not in User model)
    private security: SettingsSecurity = {
        mfaEnabled: false,
        sessionTimeout: 30
    };
    private preferences: SettingsPreferences = {
        theme: 'system',
        defaultView: 'kanban',
        itemsPerPage: 20
    };

    getSettings(): Observable<UserSettings> {
        const user = this.authStore.user();
        if (!user) {
            // Return empty or throw error, but page guards should prevent this.
            // For safety return empty structure.
            return of({
                profile: { email: '', role: '', name: '' },
                organization: { id: '' },
                security: this.security,
                preferences: this.preferences
            });
        }

        const settings: UserSettings = {
            profile: {
                email: user.email,
                role: user.role,
                name: user.name || 'User' // Default name if not set
            },
            organization: {
                id: user.organizationId
            },
            security: {
                mfaEnabled: user.mfaEnabled || false,
                sessionTimeout: user.sessionTimeout || 30
            },
            preferences: user.preferences || {
                theme: 'system',
                defaultView: 'kanban',
                itemsPerPage: 20
            }
        };

        return of(settings).pipe(delay(500));
    }

    updateProfile(profile: SettingsProfile): Observable<SettingsProfile> {
        const user = this.authStore.user();
        if (!user) return of(profile);
        return this.http.put<SettingsProfile>(`${environment.apiUrl}/users/${user.id}`, { name: profile.name }).pipe(
            tap(updated => {
                console.log('Profile Updated:', updated);
                this.authStore.updateUser({ name: updated.name });
                this.auditService.logAction('Update Profile', { name: updated.name }, 'User', user.id);
            })
        );
    }

    updateOrganization(organization: SettingsOrganization): Observable<SettingsOrganization> {
        return of(organization).pipe(delay(500));
    }

    updateSecurity(security: SettingsSecurity): Observable<SettingsSecurity> {
        this.security = security;
        const user = this.authStore.user();
        if (!user) return of(security);

        return this.http.put<SettingsSecurity>(`${environment.apiUrl}/users/${user.id}`, {
            mfaEnabled: security.mfaEnabled,
            sessionTimeout: security.sessionTimeout
        }).pipe(
            tap(() => {
                console.log('Security Updated:', security);
                this.auditService.logAction('Update Security', { mfa: security.mfaEnabled, timeout: security.sessionTimeout }, 'User', user.id);
            })
        );
    }

    updatePreferences(preferences: SettingsPreferences): Observable<SettingsPreferences> {
        this.preferences = preferences;
        const user = this.authStore.user();
        if (!user) return of(preferences);

        return this.http.put<SettingsPreferences>(`${environment.apiUrl}/users/${user.id}`, { preferences }).pipe(
            tap(() => {
                console.log('Preferences Updated:', preferences);
                this.auditService.logAction('Update Preferences', preferences, 'User', user.id);
            })
        );
    }
}
