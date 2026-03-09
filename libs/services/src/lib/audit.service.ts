import { Injectable, signal, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { AuditLog } from '@secure-task-management/models';
import { firstValueFrom } from 'rxjs';
import { APP_CONFIG } from './tokens';

@Injectable({
  providedIn: 'root',
})
export class AuditService {
  private http = inject(HttpClient);
  private config = inject(APP_CONFIG);

  private _logs = signal<AuditLog[]>([]);
  private _loading = signal<boolean>(false);

  logs = this._logs.asReadonly();
  isLoading = this._loading.asReadonly();

  async fetchLogs() {
    try {
      this._loading.set(true);
      const res = await firstValueFrom(
        this.http.get<AuditLog[]>(`${this.config.apiUrl}/audit-log`),
      );
      this._logs.set(res);
    } catch (err) {
      console.error('Failed to load audit logs:', err);
    } finally {
      this._loading.set(false);
    }
  }

  logAction(
    action: string,
    details: unknown,
    resourceType = 'UNKNOWN',
    resourceId?: string,
  ): void {
    this.http
      .post(`${this.config.apiUrl}/audit-log`, {
        action,
        details,
        resourceType,
        resourceId,
      })
      .subscribe({
        next: () =>
          console.log(`Audit Logged: ${action} on ${resourceType}`, details),
        error: (err) => {
          console.warn('Failed to log audit action to backend:', err);
        },
      });
  }
}
