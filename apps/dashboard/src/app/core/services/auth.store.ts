import { Injectable, signal, computed, inject, effect } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { SupabaseService } from './supabase.service';
import { User, UserRole } from '../models';
import { environment } from '../../../environments/environment';
import { firstValueFrom } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class AuthStore {
    private supabase = inject(SupabaseService);
    private http = inject(HttpClient);
    private router = inject(Router);

    private _user = signal<User | null>(null);
    private _loading = signal<boolean>(true);
    private _token = signal<string | null>(null);

    user = this._user.asReadonly();
    isLoading = this._loading.asReadonly();
    isAuthenticated = computed(() => !!this._user());
    token = this._token.asReadonly();

    constructor() {
        this.init();
    }

    private async init() {
        // Handle initial session
        const { data: { session } } = await this.supabase.auth.getSession();
        this._token.set(session?.access_token || null);

        if (session) {
            await this.fetchProfile();
        } else {
            this._loading.set(false);
        }

        // Listen for auth changes
        this.supabase.auth.onAuthStateChange(async (event, session) => {
            this._token.set(session?.access_token || null);
            if (session) {
                await this.fetchProfile();
            } else {
                this._user.set(null);
            }
            this._loading.set(false);
        });
    }

    async fetchProfile() {
        try {
            this._loading.set(true);
            const profile = await firstValueFrom(this.http.get<User>(`${environment.apiUrl}/auth/me`));
            this._user.set(profile);
        } catch (error) {
            console.error('Failed to fetch profile:', error);
            this._user.set(null);
        } finally {
            this._loading.set(false);
        }
    }

    async logout() {
        await this.supabase.auth.signOut();
        this._user.set(null);
        this._token.set(null);
        this.router.navigate(['/login']);
    }

    updateUser(updates: Partial<User>) {
        const currentUser = this._user();
        if (currentUser) {
            this._user.set({ ...currentUser, ...updates });
        }
    }
}
