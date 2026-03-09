import { Injectable, signal, computed, inject } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Router } from '@angular/router';
import { SupabaseService, APP_CONFIG } from '@secure-task-management/services';
import { User } from '@secure-task-management/models';
import { firstValueFrom } from 'rxjs';
import { AuthChangeEvent, Session } from '@supabase/supabase-js';

@Injectable({
  providedIn: 'root',
})
export class AuthStore {
  private supabase = inject(SupabaseService);
  private http = inject(HttpClient);
  private router = inject(Router);
  private config = inject(APP_CONFIG);

  private _user = signal<User | null>(null);
  private _loading = signal<boolean>(true);
  private _token = signal<string | null>(null);
  private _isFetchingProfile = false;
  private _lastUnauthorizedToken: string | null = null;

  user = this._user.asReadonly();
  isLoading = this._loading.asReadonly();
  isAuthenticated = computed(() => !!this._user());
  token = this._token.asReadonly();

  constructor() {
    this.init();
  }

  private async init() {
    const {
      data: { session },
    } = await this.supabase.auth.getSession();
    const initialToken = session?.access_token || null;
    this._token.set(initialToken);
    if (this._lastUnauthorizedToken && this._lastUnauthorizedToken !== initialToken) {
      this._lastUnauthorizedToken = null;
    }

    if (session) {
      await this.fetchProfile();
    } else {
      this._loading.set(false);
    }

    this.supabase.auth.onAuthStateChange(
      async (_event: AuthChangeEvent, session: Session | null) => {
      const nextToken = session?.access_token || null;
      this._token.set(nextToken);
      if (this._lastUnauthorizedToken && this._lastUnauthorizedToken !== nextToken) {
        this._lastUnauthorizedToken = null;
      }
      if (session) {
        await this.fetchProfile();
      } else {
        this._user.set(null);
      }
      this._loading.set(false);
      },
    );
  }

  async fetchProfile() {
    const token = this._token();
    if (!token) {
      this._user.set(null);
      this._loading.set(false);
      return;
    }

    // Avoid duplicate in-flight profile requests.
    if (this._isFetchingProfile) {
      return;
    }

    // Avoid spamming the same unauthorized token repeatedly.
    if (this._lastUnauthorizedToken === token) {
      this._user.set(null);
      this._loading.set(false);
      return;
    }

    try {
      this._isFetchingProfile = true;
      this._loading.set(true);
      const profile = await firstValueFrom(
        this.http.get<User>(`${this.config.apiUrl}/auth/me`),
      );
      this._user.set(profile);
      this._lastUnauthorizedToken = null;
    } catch (error) {
      console.error('Failed to fetch profile:', error);
      this._user.set(null);

      const httpError = error as HttpErrorResponse;
      if (httpError?.status === 401) {
        this._lastUnauthorizedToken = token;
        await this.supabase.auth.signOut();
        this._token.set(null);
        this.router.navigate(['/login'], {
          queryParams: { sessionExpired: '1' },
        });
      }
    } finally {
      this._isFetchingProfile = false;
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
