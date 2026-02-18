import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuditService } from '../../../core/services/audit.service';
import { LucideAngularModule } from 'lucide-angular';

@Component({
  selector: 'app-audit-log-page',
  standalone: true,
  imports: [CommonModule, LucideAngularModule],
  template: `
    <div class="max-w-8xl mx-auto space-y-grid-xl">
      <div class="flex justify-between items-center">
        <h1 class="text-h1 font-bold text-text-primary">Audit Log</h1>
      </div>

      @if (auditService.isLoading()) {
        <div class="text-center py-20 text-text-secondary">Loading audit logs...</div>
      } @else if (logs().length === 0) {
        <div class="text-center py-20 bg-surface-glass backdrop-blur-md rounded-card border border-border-subtle text-text-secondary">
          No audit logs found.
        </div>
      } @else {
        <div class="bg-surface-glass backdrop-blur-md shadow-sm border border-border-subtle rounded-card overflow-hidden">
          <table class="min-w-full divide-y divide-border-subtle">
            <thead class="bg-gray-50/50">
              <tr>
                <th class="px-grid-lg py-grid-md text-left text-caption font-bold text-text-secondary uppercase tracking-wider">User ID</th>
                <th class="px-grid-lg py-grid-md text-left text-caption font-bold text-text-secondary uppercase tracking-wider">Action</th>
                <th class="px-grid-lg py-grid-md text-left text-caption font-bold text-text-secondary uppercase tracking-wider">Resource</th>
                <th class="px-grid-lg py-grid-md text-left text-caption font-bold text-text-secondary uppercase tracking-wider">Timestamp</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-border-subtle">
              @for (log of logs(); track log.id) {
                <tr class="hover:bg-gray-50/50 transition-colors">
                  <td class="px-grid-lg py-grid-md whitespace-nowrap text-body-sm text-text-secondary font-mono">{{ log.userId.slice(0, 8) }}...</td>
                  <td class="px-grid-lg py-grid-md whitespace-nowrap text-body-sm">
                    <span [class]="'px-grid-sm py-0.5 rounded-pill text-caption font-bold uppercase ' + getActionClass(log.action)">
                      {{ log.action }}
                    </span>
                  </td>
                  <td class="px-grid-lg py-grid-md whitespace-nowrap text-body-sm text-text-primary">
                    {{ log.resourceType }}
                  </td>
                  <td class="px-grid-lg py-grid-md whitespace-nowrap text-body-sm text-text-secondary">
                    {{ log.timestamp | date:'medium' }}
                  </td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      }
    </div>
  `,
  styles: [`
    :host { display: block; }
  `]
})
export class AuditLogPageComponent implements OnInit {
  public auditService = inject(AuditService);

  logs = this.auditService.logs;

  ngOnInit() {
    this.auditService.fetchLogs();
  }

  getActionClass(action: string): string {
    switch (action.toLowerCase()) {
      case 'create': return 'bg-green-50 text-green-700';
      case 'update': return 'bg-blue-50 text-blue-700';
      case 'delete': return 'bg-red-50 text-red-700';
      default: return 'bg-gray-50 text-gray-700';
    }
  }
}
