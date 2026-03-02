import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TaskService } from '../../core/services/task.service';
import { LucideAngularModule } from 'lucide-angular';

@Component({
  selector: 'app-task-analytics',
  standalone: true,
  imports: [CommonModule, LucideAngularModule],
  template: `
    <div class="bg-surface border border-border-subtle rounded-card p-4 lg:p-grid-lg shadow-sm">
      <div class="flex items-center justify-between mb-4 lg:mb-grid-lg">
        <div>
          <h2 class="text-lg lg:text-h4 font-bold text-text-primary">Task Analytics</h2>
          <p class="text-xs lg:text-caption text-text-secondary">Track progress across your project</p>
        </div>
        <div class="p-2 lg:p-grid-sm bg-indigo-50 dark:bg-indigo-900/30 rounded-lg">
          <lucide-icon name="sort-asc" class="text-indigo-600 dark:text-indigo-400" [size]="20"></lucide-icon>
        </div>
      </div>

      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-grid-lg">
        <!-- To Do -->
        <div class="space-y-2 lg:space-y-grid-sm">
          <div class="flex justify-between items-end">
            <span class="text-sm lg:text-body-sm font-semibold text-text-secondary">To Do</span>
            <span class="text-2xl lg:text-h3 font-bold text-text-primary">{{ stats().todo }} <span class="text-xs lg:text-caption font-medium">tasks</span></span>
          </div>
          <div class="h-3 lg:h-4 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
            <div 
              class="h-full bg-slate-400 transition-all duration-700 ease-out"
              [style.width.%]="getPercentage(stats().todo)"
              role="progressbar"
              [attr.aria-valuenow]="stats().todo"
              [attr.aria-valuemin]="0"
              [attr.aria-valuemax]="stats().total"
            ></div>
          </div>
        </div>

        <!-- In Progress -->
        <div class="space-y-2 lg:space-y-grid-sm">
          <div class="flex justify-between items-end">
            <span class="text-sm lg:text-body-sm font-semibold text-text-secondary">In Progress</span>
            <span class="text-2xl lg:text-h3 font-bold text-text-primary">{{ stats().inProgress }} <span class="text-xs lg:text-caption font-medium">tasks</span></span>
          </div>
          <div class="h-3 lg:h-4 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
            <div 
              class="h-full bg-blue-500 transition-all duration-700 ease-out"
              [style.width.%]="getPercentage(stats().inProgress)"
              role="progressbar"
              [attr.aria-valuenow]="stats().inProgress"
              [attr.aria-valuemin]="0"
              [attr.aria-valuemax]="stats().total"
            ></div>
          </div>
        </div>

        <!-- Completed -->
        <div class="space-y-2 lg:space-y-grid-sm">
          <div class="flex justify-between items-end">
            <span class="text-sm lg:text-body-sm font-semibold text-text-secondary">Completed</span>
            <span class="text-2xl lg:text-h3 font-bold text-text-primary">{{ stats().completed }} <span class="text-xs lg:text-caption font-medium">tasks</span></span>
          </div>
          <div class="h-3 lg:h-4 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
            <div 
              class="h-full bg-green-500 transition-all duration-700 ease-out"
              [style.width.%]="getPercentage(stats().completed)"
              role="progressbar"
              [attr.aria-valuenow]="stats().completed"
              [attr.aria-valuemin]="0"
              [attr.aria-valuemax]="stats().total"
            ></div>
          </div>
        </div>
      </div>

      <div class="mt-4 lg:mt-grid-lg pt-4 lg:pt-grid-lg border-t border-border-subtle flex flex-wrap gap-4 lg:gap-grid-md">
        <div class="flex items-center gap-2">
          <div class="w-2.5 h-2.5 lg:w-3 lg:h-3 rounded-full bg-slate-400"></div>
          <span class="text-xs lg:text-caption text-text-secondary uppercase tracking-wider font-bold">To Do</span>
        </div>
        <div class="flex items-center gap-2">
          <div class="w-2.5 h-2.5 lg:w-3 lg:h-3 rounded-full bg-blue-500"></div>
          <span class="text-xs lg:text-caption text-text-secondary uppercase tracking-wider font-bold">In Progress</span>
        </div>
        <div class="flex items-center gap-2">
          <div class="w-2.5 h-2.5 lg:w-3 lg:h-3 rounded-full bg-green-500"></div>
          <span class="text-xs lg:text-caption text-text-secondary uppercase tracking-wider font-bold">Completed</span>
        </div>
      </div>
    </div>
  `,
  styles: [`
    :host { display: block; }
  `]
})
export class TaskAnalyticsComponent {
  private taskService = inject(TaskService);
  stats = this.taskService.taskStats;

  getPercentage(value: number): number {
    if (this.stats().total === 0) return 0;
    return (value / this.stats().total) * 100;
  }
}
