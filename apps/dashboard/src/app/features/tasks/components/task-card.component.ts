import { Component, Input, Output, EventEmitter, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LucideAngularModule } from 'lucide-angular';
import { Task, TaskCategory, TaskPriority, TaskStatus } from '@secure-task-management/models';
import { BadgeComponent, BadgeVariant } from '@secure-task-management/shared-ui';

@Component({
  selector: 'app-task-card',
  standalone: true,
  imports: [CommonModule, LucideAngularModule, BadgeComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div
      class="bg-white dark:bg-slate-800 p-4 lg:p-5 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 cursor-grab hover:shadow-lg hover:border-brand-primary/30 transition-all active:cursor-grabbing group relative overflow-hidden"
      [class.opacity-80]="task.status === TaskStatus.COMPLETED || task.status === TaskStatus.ARCHIVED"
    >
      <div class="absolute top-0 left-0 w-1 h-full bg-brand-gradient opacity-0 group-hover:opacity-100 transition-opacity"></div>
      <div class="flex flex-col gap-2 lg:gap-3">
        <div class="flex items-start justify-between mb-4">
          <app-badge [variant]="getCategoryVariant(task.category)">
            {{ task.category }}
          </app-badge>
          <div class="flex items-center gap-2">
            @if (task.assignedTeamId) {
              <div class="flex items-center gap-1.5 px-2 py-1 rounded-md bg-indigo-50 dark:bg-indigo-900/30 border border-indigo-100 dark:border-indigo-800" [title]="'Assigned to ' + (teamMap[task.assignedTeamId] || 'Team')">
                <lucide-icon name="users" [size]="14" class="text-indigo-600 dark:text-indigo-400"></lucide-icon>
                <span class="text-[10px] font-bold text-indigo-700 dark:text-indigo-300 truncate max-w-[80px]">
                  {{ teamMap[task.assignedTeamId] || 'Team' }}
                </span>
              </div>
            } @else {
              <div class="text-slate-400 bg-slate-50 dark:bg-slate-900 p-1 rounded-md border border-slate-100 dark:border-slate-800" title="Personal Task">
                <lucide-icon name="user" [size]="14"></lucide-icon>
              </div>
            }
            @if (task.priority && task.status !== TaskStatus.COMPLETED && task.status !== TaskStatus.ARCHIVED) {
              <span
                [class]="'text-[10px] font-bold uppercase tracking-wider ' + getPriorityColor(task.priority)"
              >
                {{ task.priority }}
              </span>
            }
          </div>
        </div>
        <h3
          class="text-slate-900 dark:text-white font-bold leading-snug text-sm lg:text-base group-hover:text-brand-primary transition-colors"
          [class.line-through]="task.status === TaskStatus.COMPLETED || task.status === TaskStatus.ARCHIVED"
          [class.opacity-50]="task.status === TaskStatus.COMPLETED || task.status === TaskStatus.ARCHIVED"
        >
          {{ task.title }}
        </h3>
        <p
          class="text-slate-500 dark:text-slate-400 text-xs lg:text-sm line-clamp-2 leading-relaxed"
        >
          {{ task.description }}
        </p>
        <div
          class="flex justify-end gap-2 mt-1 lg:mt-2 opacity-100 lg:opacity-0 lg:group-hover:opacity-100 transition-all lg:transform lg:translate-y-1 lg:group-hover:translate-y-0"
        >
          @if (canEdit || canDuplicate || canDelete) {
            <div class="flex gap-2">
              @if (canDuplicate) {
                <button
                  (click)="duplicate.emit(task)"
                  class="p-1.5 lg:p-2 text-slate-400 hover:text-brand-primary hover:bg-brand-primary/10 rounded-lg transition-all"
                  title="Duplicate Task"
                >
                  <lucide-icon name="copy" [size]="14"></lucide-icon>
                </button>
              }

              @if (canEdit) {
                <button
                  (click)="edit.emit(task)"
                  class="p-1.5 lg:p-2 text-slate-400 hover:text-brand-primary hover:bg-brand-primary/10 rounded-lg transition-all"
                  title="Edit Task"
                >
                  <lucide-icon name="pencil" [size]="14"></lucide-icon>
                </button>
              }

              @if (canDelete) {
                <button
                  (click)="delete.emit(task.id)"
                  class="p-1.5 lg:p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/50 rounded-lg transition-all"
                  title="Delete Task"
                >
                  <lucide-icon name="trash-2" [size]="14"></lucide-icon>
                </button>
              }
            </div>
          }
        </div>
      </div>
    </div>
  `,
  styles: [`
    :host {
      display: block;
    }
  `]
})
export class TaskCardComponent {
  @Input({ required: true }) task!: Task;
  @Input() canEdit = true;
  @Input() canDuplicate = true;
  @Input() canDelete = true;
  @Input() teamMap: Record<string, string> = {};
  @Output() edit = new EventEmitter<Task>();
  @Output() duplicate = new EventEmitter<Task>();
  @Output() delete = new EventEmitter<string>();
  TaskStatus = TaskStatus;

  getCategoryVariant(category: TaskCategory): BadgeVariant {
    switch (category) {
      case TaskCategory.WORK: return 'primary';
      case TaskCategory.PERSONAL: return 'success';
      case TaskCategory.SHOPPING: return 'warning';
      default: return 'default';
    }
  }

  getPriorityColor(priority: string) {
    const classes: Record<string, string> = {
      [TaskPriority.HIGH]: 'text-red-600',
      [TaskPriority.MEDIUM]: 'text-orange-500',
      [TaskPriority.LOW]: 'text-sky-500',
    };
    return classes[priority] || classes[TaskPriority.LOW];
  }
}
