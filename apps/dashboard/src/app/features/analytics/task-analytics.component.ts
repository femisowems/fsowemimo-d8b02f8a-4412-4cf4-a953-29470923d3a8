import { Component, Input, computed, signal, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Task, TaskStatus } from '@secure-task-management/models';
import { LucideAngularModule } from 'lucide-angular';
import { CardComponent } from '@secure-task-management/shared-ui';

@Component({
  selector: 'app-task-analytics',
  standalone: true,
  imports: [CommonModule, LucideAngularModule, CardComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <app-card title="Task Analytics" [subtitle]="'Analysis for: ' + activeFilterTitle">
      <div
        class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-6"
      >
        <!-- To Do -->
        <div class="space-y-2">
          <div class="flex justify-between items-end">
            <span class="text-caption font-semibold text-text-secondary uppercase tracking-wider">To Do</span>
            <span class="text-h4 font-bold text-text-primary">{{ stats().todo }}</span>
          </div>
          <div class="h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
            <div class="h-full bg-slate-400" [style.width.%]="getPercentage(stats().todo)"></div>
          </div>
        </div>

        <!-- Scheduled -->
        <div class="space-y-2">
          <div class="flex justify-between items-end">
            <span class="text-caption font-semibold text-text-secondary uppercase tracking-wider">Scheduled</span>
            <span class="text-h4 font-bold text-text-primary">{{ stats().scheduled }}</span>
          </div>
          <div class="h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
            <div class="h-full bg-purple-500" [style.width.%]="getPercentage(stats().scheduled)"></div>
          </div>
        </div>

        <!-- In Progress -->
        <div class="space-y-2">
          <div class="flex justify-between items-end">
            <span class="text-caption font-semibold text-text-secondary uppercase tracking-wider">In Progress</span>
            <span class="text-h4 font-bold text-text-primary">{{ stats().inProgress }}</span>
          </div>
          <div class="h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
            <div class="h-full bg-blue-500" [style.width.%]="getPercentage(stats().inProgress)"></div>
          </div>
        </div>

        <!-- Blocked -->
        <div class="space-y-2">
          <div class="flex justify-between items-end">
            <span class="text-caption font-semibold text-text-secondary uppercase tracking-wider">Blocked</span>
            <span class="text-h4 font-bold text-text-primary">{{ stats().blocked }}</span>
          </div>
          <div class="h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
            <div class="h-full bg-red-500" [style.width.%]="getPercentage(stats().blocked)"></div>
          </div>
        </div>

        <!-- Completed -->
        <div class="space-y-2">
          <div class="flex justify-between items-end">
            <span class="text-caption font-semibold text-text-secondary uppercase tracking-wider">Completed</span>
            <span class="text-h4 font-bold text-text-primary">{{ stats().completed }}</span>
          </div>
          <div class="h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
            <div class="h-full bg-green-500" [style.width.%]="getPercentage(stats().completed)"></div>
          </div>
        </div>

        <!-- Archived -->
        <div class="space-y-2">
          <div class="flex justify-between items-end">
            <span class="text-caption font-semibold text-text-secondary uppercase tracking-wider">Archived</span>
            <span class="text-h4 font-bold text-text-primary">{{ stats().archived }}</span>
          </div>
          <div class="h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
            <div class="h-full bg-slate-600" [style.width.%]="getPercentage(stats().archived)"></div>
          </div>
        </div>
      </div>

      <div
        class="mt-6 pt-6 border-t border-slate-100 dark:border-slate-700/50 flex flex-wrap gap-x-6 gap-y-2"
      >
        <div class="flex items-center gap-2">
          <div class="w-2 h-2 rounded-full bg-slate-400"></div>
          <span class="text-caption text-text-secondary uppercase tracking-wider font-bold">To Do</span>
        </div>
        <div class="flex items-center gap-2">
          <div class="w-2 h-2 rounded-full bg-purple-500"></div>
          <span class="text-caption text-text-secondary uppercase tracking-wider font-bold">Scheduled</span>
        </div>
        <div class="flex items-center gap-2">
          <div class="w-2 h-2 rounded-full bg-blue-500"></div>
          <span class="text-caption text-text-secondary uppercase tracking-wider font-bold">In Progress</span>
        </div>
        <div class="flex items-center gap-2">
          <div class="w-2 h-2 rounded-full bg-red-500"></div>
          <span class="text-caption text-text-secondary uppercase tracking-wider font-bold">Blocked</span>
        </div>
        <div class="flex items-center gap-2">
          <div class="w-2 h-2 rounded-full bg-green-500"></div>
          <span class="text-caption text-text-secondary uppercase tracking-wider font-bold">Completed</span>
        </div>
        <div class="flex items-center gap-2">
          <div class="w-2 h-2 rounded-full bg-slate-600"></div>
          <span class="text-caption text-text-secondary uppercase tracking-wider font-bold">Archived</span>
        </div>
      </div>
    </app-card>
  `,
  styles: [
    `
      :host {
        display: block;
      }
    `,
  ],
})
export class TaskAnalyticsComponent {
  private _tasks = signal<Task[]>([]);

  @Input() set tasks(value: Task[]) {
    this._tasks.set(value || []);
  }

  @Input() activeFilterTitle = 'All Projects';

  stats = computed(() => {
    const tasks = this._tasks();
    return {
      todo: tasks.filter(t => t.status === TaskStatus.TODO).length,
      scheduled: tasks.filter(t => t.status === TaskStatus.SCHEDULED).length,
      inProgress: tasks.filter(t => t.status === TaskStatus.IN_PROGRESS).length,
      blocked: tasks.filter(t => t.status === TaskStatus.BLOCKED).length,
      completed: tasks.filter(t => t.status === TaskStatus.COMPLETED).length,
      archived: tasks.filter(t => t.status === TaskStatus.ARCHIVED).length,
      total: tasks.length,
    };
  });

  getPercentage(value: number): number {
    const total = this.stats().total;
    if (total === 0) return 0;
    return (value / total) * 100;
  }
}

