import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { UserRole } from '@fsowemimo-d8b02f8a-4412-4cf4-a953-29470923d3a8/models';
import { APP_CONFIG } from './tokens';

export interface OrgUser {
  id: string;
  email: string;
  name?: string;
  role: UserRole;
  organizationId: string;
  mfaEnabled: boolean;
  createdAt: string;
}

@Injectable({ providedIn: 'root' })
export class UserManagementService {
  private http = inject(HttpClient);
  private config = inject(APP_CONFIG);
  private apiUrl = `${this.config.apiUrl}/users`;

  users = signal<OrgUser[]>([]);
  isLoading = signal(false);
  error = signal<string | null>(null);

  loadUsers(): Observable<OrgUser[]> {
    this.isLoading.set(true);
    this.error.set(null);
    return this.http.get<OrgUser[]>(this.apiUrl).pipe(
      tap({
        next: (users) => {
          this.users.set(users);
          this.isLoading.set(false);
        },
        error: (err) => {
          this.error.set(err.message || 'Failed to load users');
          this.isLoading.set(false);
        },
      }),
    );
  }

  createUser(userData: {
    email: string;
    name?: string;
    role: UserRole;
  }): Observable<OrgUser> {
    return this.http.post<OrgUser>(this.apiUrl, userData).pipe(
      tap({
        next: (newUser) => {
          this.users.update((users) => [newUser, ...users]);
        },
      }),
    );
  }

  updateUserRole(userId: string, role: UserRole): Observable<OrgUser> {
    return this.http
      .patch<OrgUser>(`${this.apiUrl}/${userId}/role`, { role })
      .pipe(
        tap({
          next: (updated) => {
            this.users.update((users) =>
              users.map((u) => (u.id === userId ? updated : u)),
            );
          },
        }),
      );
  }

  deleteUser(userId: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${userId}`).pipe(
      tap({
        next: () => {
          this.users.update((users) => users.filter((u) => u.id !== userId));
        },
      }),
    );
  }
}
