import { Component, Input, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Task, TaskStatus, UserRole } from '../../../core/models';
import { TaskService } from '../../../core/services/task.service';
import { AuthStore } from '../../../core/services/auth.store';

@Component({
  selector: 'app-status-dropdown',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="relative w-full max-w-[150px]">
      <select
        [ngModel]="task.status"
        (ngModelChange)="onStatusChange($event)"
        [disabled]="isDisabled()"
        class="w-full appearance-none pl-3 pr-8 py-1.5 text-xs font-medium rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
        [ngClass]="getStatusColor(task.status)"
      >
        <option [value]="task.status">{{ getStatusLabel(task.status) }} (Current)</option>
        @for (status of allowedStatuses(); track status) {
          @if (status !== task.status) {
            <option [value]="status">{{ getStatusLabel(status) }}</option>
          }
        }
      </select>
      <div class="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-slate-400">
        <svg class="h-4 w-4 fill-current" viewBox="0 0 20 20"><path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"/></svg>
      </div>
    </div>
  `,
  styles: [`
    :host { display: block; }
  `]
})
export class StatusDropdownComponent {
  @Input({ required: true }) task!: Task;
  
  private taskService = inject(TaskService);
  private authStore = inject(AuthStore);

  user = this.authStore.user;

  private allowedTransitions: Record<TaskStatus, TaskStatus[]> = {
    [TaskStatus.TODO]: [TaskStatus.SCHEDULED, TaskStatus.IN_PROGRESS, TaskStatus.ARCHIVED],
    [TaskStatus.SCHEDULED]: [TaskStatus.TODO, TaskStatus.IN_PROGRESS, TaskStatus.BLOCKED, TaskStatus.ARCHIVED],
    [TaskStatus.IN_PROGRESS]: [TaskStatus.TODO, TaskStatus.BLOCKED, TaskStatus.COMPLETED, TaskStatus.ARCHIVED],
    [TaskStatus.BLOCKED]: [TaskStatus.TODO, TaskStatus.IN_PROGRESS, TaskStatus.ARCHIVED],
    [TaskStatus.COMPLETED]: [TaskStatus.ARCHIVED],
    [TaskStatus.ARCHIVED]: []
  };

  allowedStatuses = computed(() => {
    const currentRole = this.user()?.role;
    if (currentRole === UserRole.VIEWER) return [];
    
    let allowed = this.allowedTransitions[this.task.status as TaskStatus] || [];
    
    if (currentRole === UserRole.ADMIN) {
      allowed = allowed.filter(s => s !== TaskStatus.ARCHIVED);
    }
    
    return allowed;
  });

  isDisabled = computed(() => {
    return this.user()?.role === UserRole.VIEWER || this.allowedStatuses().length === 0;
  });

  getStatusLabel(status: string): string {
    const labels: Record<string, string> = {
      [TaskStatus.TODO]: 'To Do',
      [TaskStatus.SCHEDULED]: 'Scheduled',
      [TaskStatus.IN_PROGRESS]: 'In Progress',
      [TaskStatus.BLOCKED]: 'Blocked',
      [TaskStatus.COMPLETED]: 'Completed',
      [TaskStatus.ARCHIVED]: 'Archived'
    };
    return labels[status] || status;
  }

  getStatusColor(status: string): string {
    const defaultColor = 'bg-slate-50 text-slate-700 dark:bg-slate-800 dark:text-slate-300';
    // Simplified specific colors if preferred, but usually Tailwind utility classes should be full strings.
    return defaultColor;
  }

  async onStatusChange(newStatus: TaskStatus) {
    if (newStatus === this.task.status) return;
    try {
      await this.taskService.patchTaskStatus(this.task.id, newStatus);
    } catch (e) {
      // Reverted implicitly by service
    }
  }
}
