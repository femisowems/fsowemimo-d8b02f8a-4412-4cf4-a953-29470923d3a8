import { Component, computed, effect, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuditService } from '@secure-task-management/services';
import { LucideAngularModule } from 'lucide-angular';

@Component({
  selector: 'app-audit-log-page',
  standalone: true,
  imports: [CommonModule, FormsModule, LucideAngularModule],
  template: `
    <div class="max-w-8xl mx-auto space-y-6">
      <div class="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h1 class="text-h1 font-bold text-text-primary">Audit Log</h1>
          <p class="text-sm text-text-secondary mt-1">
            Track who changed what and when across your workspace.
          </p>
        </div>

        <button
          type="button"
          (click)="refreshLogs()"
          class="inline-flex items-center gap-2 px-4 h-10 rounded-xl border border-border-subtle bg-white dark:bg-slate-800 text-sm font-semibold text-text-primary hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors"
        >
          <span class="text-base leading-none" aria-hidden="true">↻</span>
          Refresh
        </button>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-3">
        <div class="rounded-xl border border-border-subtle bg-surface-glass p-3">
          <p class="text-[11px] uppercase tracking-wider text-text-secondary">Total</p>
          <p class="text-xl font-bold text-text-primary">{{ logs().length }}</p>
        </div>
        <div class="rounded-xl border border-border-subtle bg-surface-glass p-3">
          <p class="text-[11px] uppercase tracking-wider text-text-secondary">Create</p>
          <p class="text-xl font-bold text-green-700">{{ getActionCount('create') }}</p>
        </div>
        <div class="rounded-xl border border-border-subtle bg-surface-glass p-3">
          <p class="text-[11px] uppercase tracking-wider text-text-secondary">Update</p>
          <p class="text-xl font-bold text-brand-primary">{{ getActionCount('update') }}</p>
        </div>
        <div class="rounded-xl border border-border-subtle bg-surface-glass p-3">
          <p class="text-[11px] uppercase tracking-wider text-text-secondary">Delete</p>
          <p class="text-xl font-bold text-red-700">{{ getActionCount('delete') }}</p>
        </div>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-5 gap-3">
        <div class="relative lg:col-span-2">
          <lucide-icon
            name="search"
            class="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            [size]="16"
          ></lucide-icon>
          <input
            type="text"
            [ngModel]="searchQuery()"
            (ngModelChange)="setSearchQuery($event)"
            placeholder="Search by user, action, resource, or resource ID"
            class="w-full pl-9 pr-3 h-10 rounded-xl border border-border-subtle bg-white dark:bg-slate-800 text-sm text-text-primary"
          />
        </div>

        <select
          [ngModel]="actionFilter()"
          (ngModelChange)="setActionFilter($event)"
          class="h-10 rounded-xl border border-border-subtle bg-white dark:bg-slate-800 px-3 text-sm text-text-primary"
        >
          <option value="all">All Actions</option>
          <option value="create">Create</option>
          <option value="update">Update</option>
          <option value="delete">Delete</option>
          <option value="other">Other</option>
        </select>

        <select
          [ngModel]="sortOrder()"
          (ngModelChange)="setSortOrder($event)"
          class="h-10 rounded-xl border border-border-subtle bg-white dark:bg-slate-800 px-3 text-sm text-text-primary"
        >
          <option value="newest">Newest First</option>
          <option value="oldest">Oldest First</option>
        </select>

        <select
          [ngModel]="pageSize()"
          (ngModelChange)="setPageSize($event)"
          class="h-10 rounded-xl border border-border-subtle bg-white dark:bg-slate-800 px-3 text-sm text-text-primary"
        >
          <option [ngValue]="10">10 / page</option>
          <option [ngValue]="25">25 / page</option>
          <option [ngValue]="50">50 / page</option>
        </select>
      </div>

      @if (auditService.isLoading()) {
        <div class="text-center py-20 text-text-secondary space-y-3">
          <div class="inline-flex items-center gap-2">
            <span
              class="inline-block h-4 w-4 rounded-full border-2 border-slate-300 border-t-brand-primary animate-spin"
              aria-hidden="true"
            ></span>
            Loading audit logs...
          </div>
        </div>
      } @else if (logs().length === 0) {
        <div
          class="text-center py-20 bg-surface-glass backdrop-blur-md rounded-card border border-border-subtle text-text-secondary"
        >
          No audit logs found.
        </div>
      } @else if (filteredLogs().length === 0) {
        <div
          class="text-center py-20 bg-surface-glass backdrop-blur-md rounded-card border border-border-subtle text-text-secondary"
        >
          No logs match your current filters.
        </div>
      } @else {
        <div
          class="bg-surface-glass backdrop-blur-md shadow-sm border border-border-subtle rounded-card overflow-hidden"
        >
          <div class="overflow-x-auto">
          <table class="min-w-full divide-y divide-border-subtle">
            <thead class="bg-gray-50/50">
              <tr>
                <th
                  class="w-12 px-grid-sm py-grid-md"
                  aria-label="Expand details"
                ></th>
                <th
                  class="px-grid-lg py-grid-md text-left text-caption font-bold text-text-secondary uppercase tracking-wider"
                >
                  User ID
                </th>
                <th
                  class="px-grid-lg py-grid-md text-left text-caption font-bold text-text-secondary uppercase tracking-wider"
                >
                  Action
                </th>
                <th
                  class="px-grid-lg py-grid-md text-left text-caption font-bold text-text-secondary uppercase tracking-wider"
                >
                  Resource
                </th>
                <th
                  class="px-grid-lg py-grid-md text-left text-caption font-bold text-text-secondary uppercase tracking-wider"
                >
                  Resource ID
                </th>
                <th
                  class="px-grid-lg py-grid-md text-left text-caption font-bold text-text-secondary uppercase tracking-wider"
                >
                  Timestamp
                </th>
              </tr>
            </thead>
            <tbody class="divide-y divide-border-subtle">
              @for (log of pagedLogs(); track log.id) {
                <tr class="hover:bg-gray-50/50 transition-colors">
                  <td class="px-grid-sm py-grid-md align-top">
                    <button
                      type="button"
                      (click)="toggleExpanded(log.id)"
                      class="p-1.5 rounded-lg border border-border-subtle hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors"
                      [attr.aria-label]="isExpanded(log.id) ? 'Collapse details' : 'Expand details'"
                      [attr.aria-expanded]="isExpanded(log.id)"
                      [attr.aria-controls]="'audit-log-details-' + log.id"
                    >
                      <lucide-icon
                        name="chevron-down"
                        class="block text-slate-500 transition-transform duration-200"
                        [size]="14"
                        [class.rotate-180]="isExpanded(log.id)"
                        aria-hidden="true"
                      ></lucide-icon>
                    </button>
                  </td>
                  <td
                    class="px-grid-lg py-grid-md whitespace-nowrap text-body-sm text-text-secondary font-mono"
                    [title]="log.userId"
                  >
                    {{ truncate(log.userId, 8) }}
                  </td>
                  <td
                    class="px-grid-lg py-grid-md whitespace-nowrap text-body-sm"
                  >
                    <span
                      [class]="
                        'px-grid-sm py-0.5 rounded-pill text-caption font-bold uppercase ' +
                        getActionClass(log.action)
                      "
                    >
                      {{ log.action }}
                    </span>
                  </td>
                  <td
                    class="px-grid-lg py-grid-md whitespace-nowrap text-body-sm text-text-primary"
                  >
                    {{ log.resourceType }}
                  </td>
                  <td
                    class="px-grid-lg py-grid-md whitespace-nowrap text-body-sm text-text-secondary font-mono"
                    [title]="log.resourceId || ''"
                  >
                    {{ log.resourceId ? truncate(log.resourceId, 10) : 'N/A' }}
                  </td>
                  <td
                    class="px-grid-lg py-grid-md whitespace-nowrap text-body-sm text-text-secondary"
                  >
                    <div>{{ log.timestamp | date: 'medium' }}</div>
                    <div class="text-xs text-slate-500">{{ getRelativeTime(log.timestamp) }}</div>
                  </td>
                </tr>
                @if (isExpanded(log.id)) {
                  <tr class="bg-gray-50/50 dark:bg-slate-800/40">
                    <td colspan="6" class="px-grid-lg py-grid-md">
                      <div class="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs" [attr.id]="'audit-log-details-' + log.id">
                        <div class="rounded-lg border border-border-subtle p-2.5 bg-white dark:bg-slate-900">
                          <p class="font-semibold text-text-primary mb-1">Event ID</p>
                          <p class="font-mono text-text-secondary break-all">{{ log.id }}</p>
                        </div>
                        <div class="rounded-lg border border-border-subtle p-2.5 bg-white dark:bg-slate-900">
                          <p class="font-semibold text-text-primary mb-1">Full User ID</p>
                          <p class="font-mono text-text-secondary break-all">{{ log.userId }}</p>
                        </div>
                        <div class="rounded-lg border border-border-subtle p-2.5 bg-white dark:bg-slate-900">
                          <p class="font-semibold text-text-primary mb-1">Full Resource ID</p>
                          <p class="font-mono text-text-secondary break-all">{{ log.resourceId || 'N/A' }}</p>
                        </div>
                        <div class="rounded-lg border border-border-subtle p-2.5 bg-white dark:bg-slate-900">
                          <p class="font-semibold text-text-primary mb-1">ISO Timestamp</p>
                          <p class="font-mono text-text-secondary break-all">{{ log.timestamp }}</p>
                        </div>
                      </div>
                    </td>
                  </tr>
                }
              }
            </tbody>
          </table>
          </div>

          <div class="flex flex-col gap-3 md:flex-row md:items-center md:justify-between px-4 py-3 border-t border-border-subtle bg-gray-50/40 dark:bg-slate-900/30">
            <p class="text-xs text-text-secondary">
              Showing {{ pageStart() }}-{{ pageEnd() }} of {{ filteredLogs().length }} logs
            </p>
            <div class="inline-flex items-center gap-2">
              <button
                type="button"
                (click)="goToPreviousPage()"
                [disabled]="currentPage() <= 1"
                class="h-9 px-3 rounded-lg border border-border-subtle text-sm font-medium disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-100 dark:hover:bg-slate-800"
              >
                Previous
              </button>
              <span class="text-xs text-text-secondary">Page {{ currentPage() }} / {{ totalPages() }}</span>
              <button
                type="button"
                (click)="goToNextPage()"
                [disabled]="currentPage() >= totalPages()"
                class="h-9 px-3 rounded-lg border border-border-subtle text-sm font-medium disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-100 dark:hover:bg-slate-800"
              >
                Next
              </button>
            </div>
          </div>
        </div>
      }
    </div>
  `,
  styles: [
    `
      :host {
        display: block;
      }
    `,
  ],
})
export class AuditLogPageComponent implements OnInit {
  public auditService = inject(AuditService);

  logs = this.auditService.logs;
  searchQuery = signal('');
  actionFilter = signal<'all' | 'create' | 'update' | 'delete' | 'other'>('all');
  sortOrder = signal<'newest' | 'oldest'>('newest');
  pageSize = signal<number>(10);
  currentPage = signal<number>(1);
  expandedLogIds = signal<Set<string>>(new Set());

  filteredLogs = computed(() => {
    const query = this.searchQuery().toLowerCase().trim();
    const actionFilter = this.actionFilter();
    const sortOrder = this.sortOrder();

    let rows = [...this.logs()];

    if (query) {
      rows = rows.filter((log) =>
        log.userId.toLowerCase().includes(query) ||
        log.action.toLowerCase().includes(query) ||
        log.resourceType.toLowerCase().includes(query) ||
        (log.resourceId || '').toLowerCase().includes(query),
      );
    }

    if (actionFilter !== 'all') {
      rows = rows.filter((log) => {
        const action = log.action.toLowerCase();
        if (actionFilter === 'other') {
          return action !== 'create' && action !== 'update' && action !== 'delete';
        }
        return action === actionFilter;
      });
    }

    rows.sort((a, b) => {
      const aTs = new Date(a.timestamp).getTime();
      const bTs = new Date(b.timestamp).getTime();
      return sortOrder === 'newest' ? bTs - aTs : aTs - bTs;
    });

    return rows;
  });

  totalPages = computed(() => Math.max(1, Math.ceil(this.filteredLogs().length / this.pageSize())));

  pagedLogs = computed(() => {
    const page = this.currentPage();
    const size = this.pageSize();
    const start = (page - 1) * size;
    return this.filteredLogs().slice(start, start + size);
  });

  pageStart = computed(() => {
    if (this.filteredLogs().length === 0) return 0;
    return (this.currentPage() - 1) * this.pageSize() + 1;
  });

  pageEnd = computed(() => {
    const end = this.currentPage() * this.pageSize();
    return Math.min(end, this.filteredLogs().length);
  });

  constructor() {
    effect(() => {
      const page = this.currentPage();
      const max = this.totalPages();
      if (page > max) {
        this.currentPage.set(max);
      }
    });
  }

  ngOnInit() {
    this.auditService.fetchLogs();
  }

  refreshLogs() {
    this.expandedLogIds.set(new Set());
    this.auditService.fetchLogs();
  }

  truncate(value: string, maxLength: number): string {
    if (!value) return '';
    if (value.length <= maxLength) return value;
    return `${value.slice(0, maxLength)}...`;
  }

  setSearchQuery(query: string) {
    this.searchQuery.set(query);
    this.currentPage.set(1);
    this.expandedLogIds.set(new Set());
  }

  setActionFilter(filter: 'all' | 'create' | 'update' | 'delete' | 'other') {
    this.actionFilter.set(filter);
    this.currentPage.set(1);
    this.expandedLogIds.set(new Set());
  }

  setSortOrder(order: 'newest' | 'oldest') {
    this.sortOrder.set(order);
    this.currentPage.set(1);
    this.expandedLogIds.set(new Set());
  }

  setPageSize(size: number) {
    this.pageSize.set(Number(size));
    this.currentPage.set(1);
    this.expandedLogIds.set(new Set());
  }

  goToPreviousPage() {
    this.currentPage.update((page) => Math.max(1, page - 1));
    this.expandedLogIds.set(new Set());
  }

  goToNextPage() {
    this.currentPage.update((page) => Math.min(this.totalPages(), page + 1));
    this.expandedLogIds.set(new Set());
  }

  toggleExpanded(logId: string) {
    this.expandedLogIds.update((current) => {
      const next = new Set(current);
      if (next.has(logId)) {
        next.delete(logId);
      } else {
        next.add(logId);
      }
      return next;
    });
  }

  isExpanded(logId: string) {
    return this.expandedLogIds().has(logId);
  }

  getActionCount(action: string): number {
    return this.logs().filter((log) => log.action.toLowerCase() === action).length;
  }

  getRelativeTime(timestamp: string): string {
    const diffMs = Date.now() - new Date(timestamp).getTime();
    const mins = Math.floor(diffMs / 60000);
    if (mins < 1) return 'just now';
    if (mins < 60) return `${mins}m ago`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  }

  getActionClass(action: string): string {
    switch (action.toLowerCase()) {
      case 'create':
        return 'bg-green-50 text-green-700';
      case 'update':
        return 'bg-brand-primary/10 text-brand-primary';
      case 'delete':
        return 'bg-red-50 text-red-700';
      default:
        return 'bg-gray-50 text-gray-700';
    }
  }
}
