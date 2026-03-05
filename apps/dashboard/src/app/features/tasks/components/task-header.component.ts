import { Component, Input, Output, EventEmitter, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LucideAngularModule } from 'lucide-angular';
import { TaskCategory } from '@fsowemimo-d8b02f8a-4412-4cf4-a953-29470923d3a8/models';

@Component({
  selector: 'app-task-header',
  standalone: true,
  imports: [CommonModule, FormsModule, LucideAngularModule],
  template: `
    <div
      class="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 lg:gap-6"
    >
      <div class="flex items-center gap-3">
        <div>
          <h1
            class="text-2xl lg:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight"
          >
            Project Board
          </h1>
          <p
            class="text-slate-500 dark:text-slate-400 text-xs lg:text-sm mt-0.5 lg:mt-1"
          >
            Manage, track and organize your team tasks.
          </p>
        </div>
      </div>

      <div
        class="flex flex-col sm:flex-row flex-wrap items-center gap-3 lg:gap-4 w-full lg:w-auto"
      >
        <!-- Search -->
        <div class="relative w-full sm:flex-1 lg:w-64">
          <lucide-icon
            name="search"
            class="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            [size]="18"
          ></lucide-icon>
          <input
            #searchInput
            type="text"
            [ngModel]="searchQuery"
            (ngModelChange)="searchQueryChange.emit($event)"
            placeholder="Search tasks..."
            class="w-full pl-10 pr-4 h-11 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400"
          />
        </div>

        <div class="flex items-center gap-3 w-full sm:w-auto">
          <!-- Category Filter -->
          <div class="relative flex-1 sm:flex-none">
            <lucide-icon
              name="filter"
              class="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
              [size]="16"
            ></lucide-icon>
            <select
              [ngModel]="categoryFilter"
              (ngModelChange)="categoryFilterChange.emit($event)"
              class="w-full sm:w-auto appearance-none pl-9 pr-10 h-11 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-sm focus:ring-2 focus:ring-indigo-500 transition-all text-sm text-slate-900 dark:text-slate-100"
            >
              <option value="all">All Categories</option>
              @for (cat of categories; track cat) {
                <option [value]="cat">{{ getCategoryLabel(cat) }}</option>
              }
            </select>
            <div
              class="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-slate-400"
            >
              <svg class="h-4 w-4 fill-current" viewBox="0 0 20 20">
                <path
                  d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                />
              </svg>
            </div>
          </div>

          <button
            (click)="create.emit()"
            class="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 lg:px-6 h-11 bg-indigo-600 text-white font-semibold rounded-xl hover:bg-indigo-700 transition-all shadow-md shadow-indigo-100 active:scale-95 whitespace-nowrap"
          >
            <lucide-icon name="plus" [size]="18"></lucide-icon>
            New Task
          </button>
        </div>

        <div
          class="hidden lg:flex items-center gap-1.5 px-3 h-11 bg-slate-100/50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-400 text-xs font-mono"
        >
          <span>Shortcut:</span>
          <kbd
            class="px-1.5 py-0.5 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded shadow-sm font-bold text-slate-600 dark:text-slate-300"
            >?</kbd
          >
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
export class TaskHeaderComponent {
  @Input() searchQuery = '';
  @Input() categoryFilter: TaskCategory | 'all' = 'all';
  @Output() searchQueryChange = new EventEmitter<string>();
  @Output() categoryFilterChange = new EventEmitter<TaskCategory | 'all'>();
  @Output() create = new EventEmitter<void>();

  @ViewChild('searchInput') searchInput!: ElementRef<HTMLInputElement>;

  categories = Object.values(TaskCategory);

  getCategoryLabel(category: TaskCategory): string {
    const labels: Record<TaskCategory, string> = {
      [TaskCategory.WORK]: 'Work',
      [TaskCategory.PERSONAL]: 'Personal',
      [TaskCategory.SHOPPING]: 'Shopping',
      [TaskCategory.OTHER]: 'Other',
    };
    return labels[category] || category;
  }

  focusSearch() {
    this.searchInput.nativeElement.focus();
  }
}
