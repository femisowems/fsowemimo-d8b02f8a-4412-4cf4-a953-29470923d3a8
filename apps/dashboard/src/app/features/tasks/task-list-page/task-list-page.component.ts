import {
  Component,
  inject,
  OnInit,
  signal,
  computed,
  ViewChild,
  ElementRef,
  OnDestroy,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DragDropModule, CdkDragDrop } from '@angular/cdk/drag-drop';
import { LucideAngularModule } from 'lucide-angular';
import { TaskService, ThemeService, KeyboardShortcutsService } from '@fsowemimo-d8b02f8a-4412-4cf4-a953-29470923d3a8/services';
import { AuthStore, UiStateService } from '@fsowemimo-d8b02f8a-4412-4cf4-a953-29470923d3a8/state';
import {
  UserRole,
  Task,
  TaskStatus,
  TaskCategory,
  TaskPriority,
} from '@fsowemimo-d8b02f8a-4412-4cf4-a953-29470923d3a8/models';
import { TaskFormComponent } from '../task-form/task-form.component';
import { TaskAnalyticsComponent } from '../../analytics/task-analytics.component';
import { ShortcutsModalComponent } from '../../../shared/components/shortcuts-modal.component';
import { TaskHeaderComponent } from '../components/task-header.component';
import { TaskColumnComponent } from '../components/task-column.component';
// KeyboardShortcutsService moved above

type SortOption = 'newest' | 'oldest' | 'priority' | 'title';

@Component({
  selector: 'app-task-list-page',
  standalone: true,
  imports: [
    CommonModule,
    LucideAngularModule,
    FormsModule,
    DragDropModule,
    TaskHeaderComponent,
    TaskColumnComponent,
    TaskFormComponent,
    TaskAnalyticsComponent,
    ShortcutsModalComponent,
  ],
  template: `
    <div class="max-w-7xl mx-auto space-y-6 lg:space-y-10 px-4 py-6 lg:py-8">
        <!-- Kanban Board Area with Horizontal Scroll on Mobile -->
        <app-task-header
          [searchQuery]="searchQuery()"
          [categoryFilter]="categoryFilter()"
          (searchQueryChange)="searchQuery.set($event)"
          (categoryFilterChange)="categoryFilter.set($event)"
          (create)="openCreate()"
        ></app-task-header>

        <app-task-analytics></app-task-analytics>

        @if (shortcutService.isModalOpen()) {
          <app-shortcuts-modal></app-shortcuts-modal>
        }

        @if (taskService.isLoading()) {
          <div
            class="flex flex-col items-center justify-center py-20 bg-white/50 dark:bg-slate-800/50 rounded-3xl border border-dashed border-slate-200 dark:border-slate-700"
          >
            <div
              class="animate-spin rounded-full h-10 w-10 border-4 border-slate-200 dark:border-slate-700 border-b-indigo-600 mb-4"
            ></div>
            <p class="text-slate-500 dark:text-slate-400 font-medium">
              Loading project board...
            </p>
          </div>
        } @else {
          <div
            class="overflow-x-auto pb-6 -mx-4 px-4 lg:overflow-visible lg:pb-0 lg:px-0 snap-x snap-mandatory scroll-pl-4"
          >
            <div
              class="flex lg:grid lg:grid-cols-3 gap-4 lg:gap-8 min-w-[max-content] lg:min-w-0"
              cdkDropListGroup
            >
              <app-task-column
                [title]="getStatusLabel(statusMap.TODO)"
                [status]="statusMap.TODO"
                [tasks]="todoTasks()"
                [canEdit]="canEdit()"
                (drop)="drop($event, statusMap.TODO)"
                (edit)="openEdit($event)"
                (delete)="deleteTask($event)"
              ></app-task-column>

              <app-task-column
                [title]="getStatusLabel(statusMap.IN_PROGRESS)"
                [status]="statusMap.IN_PROGRESS"
                [tasks]="inProgressTasks()"
                [canEdit]="canEdit()"
                containerClass="bg-blue-50/40 dark:bg-blue-900/10 border-blue-100/50 dark:border-blue-800/30"
                dotClass="bg-blue-500 animate-pulse"
                titleClass="text-blue-900 dark:text-blue-300"
                countClass="border-blue-100 dark:border-blue-900 text-blue-600 dark:text-blue-300"
                (drop)="drop($event, statusMap.IN_PROGRESS)"
                (edit)="openEdit($event)"
                (delete)="deleteTask($event)"
              ></app-task-column>

              <app-task-column
                [title]="getStatusLabel(statusMap.COMPLETED)"
                [status]="statusMap.COMPLETED"
                [tasks]="completedTasks()"
                [canEdit]="canEdit()"
                containerClass="bg-green-50/40 dark:bg-green-900/10 border-green-100/50 dark:border-green-800/30"
                dotClass="bg-green-500"
                titleClass="text-green-900 dark:text-green-300"
                countClass="border-green-100 dark:border-green-900 text-green-600 dark:text-green-300"
                (drop)="drop($event, statusMap.COMPLETED)"
                (edit)="openEdit($event)"
                (delete)="deleteTask($event)"
              ></app-task-column>
            </div>
          </div>
        }

      @if (isModalOpen()) {
        <div
          class="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50"
        >
          <div
            class="bg-white dark:bg-slate-800 rounded-3xl w-full max-w-lg p-10 relative shadow-2xl border border-slate-200 dark:border-slate-700 animate-in zoom-in duration-200"
          >
            <button
              (click)="isModalOpen.set(false)"
              class="absolute top-6 right-6 p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-xl transition-all"
            >
              <lucide-icon name="x" [size]="20"></lucide-icon>
            </button>
            <div class="mb-8">
              <h2 class="text-2xl font-bold text-slate-900 dark:text-white">
                {{ editingTask() ? 'Update Task' : 'Create New Task' }}
              </h2>
              <p class="text-slate-500 dark:text-slate-400 text-sm mt-1">
                Fill in the details below to
                {{ editingTask() ? 'edit your' : 'start a' }} task.
              </p>
            </div>

            <app-task-form
              [task]="editingTask() || undefined"
              (taskSubmit)="
                editingTask() ? handleUpdate($event) : handleCreate($event)
              "
              (formCancel)="isModalOpen.set(false)"
            ></app-task-form>
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
      .cdk-drag-preview {
        border-radius: 1.5rem;
        box-shadow:
          0 20px 25px -5px rgb(0 0 0 / 0.1),
          0 8px 10px -6px rgb(0 0 0 / 0.1);
      }
      .cdk-drag-placeholder {
        opacity: 0;
      }
      .cdk-drag-animating {
        transition: transform 250ms cubic-bezier(0, 0, 0.2, 1);
      }
      .cdk-drop-list-dragging .cdk-drag {
        transition: transform 250ms cubic-bezier(0, 0, 0.2, 1);
      }
    `,
  ],
})
export class TaskListPageComponent implements OnInit, OnDestroy {
  public taskService = inject(TaskService);
  public themeService = inject(ThemeService);
  private authStore = inject(AuthStore);
  public shortcutService = inject(KeyboardShortcutsService);
  public uiState = inject(UiStateService);

  @ViewChild('searchInput') searchInput!: ElementRef<HTMLInputElement>;

  tasks = this.taskService.tasks;
  user = this.authStore.user;
  canEdit = computed(() => this.user()?.role !== UserRole.VIEWER);

  categories = Object.values(TaskCategory);
  statusMap = TaskStatus;

  // Filters & Search
  searchQuery = signal('');
  categoryFilter = signal<TaskCategory | 'all'>('all');
  sortBy = signal<SortOption>('newest');

  // Computed filtered and sorted tasks
  filteredTasks = computed(() => {
    let result = this.tasks();

    // 1. Search
    const query = this.searchQuery().toLowerCase().trim();
    if (query) {
      result = result.filter(
        (t) =>
          t.title.toLowerCase().includes(query) ||
          t.description.toLowerCase().includes(query),
      );
    }

    // 2. Category Filter
    const cat = this.categoryFilter();
    if (cat !== 'all') {
      result = result.filter((t) => t.category === cat);
    }

    // 3. Sorting
    result = [...result].sort((a, b) => {
      switch (this.sortBy()) {
        case 'newest':
          return (
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          );
        case 'oldest':
          return (
            new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
          );
        case 'priority': {
          const pMap: Record<string, number> = {
            [TaskPriority.HIGH]: 3,
            [TaskPriority.MEDIUM]: 2,
            [TaskPriority.LOW]: 1,
          };
          return (pMap[b.priority] || 0) - (pMap[a.priority] || 0);
        }
        case 'title':
          return a.title.localeCompare(b.title);
        default:
          return 0;
      }
    });

    return result;
  });

  todoTasks = computed(() =>
    this.filteredTasks().filter((t) => t.status === TaskStatus.TODO),
  );
  inProgressTasks = computed(() =>
    this.filteredTasks().filter((t) => t.status === TaskStatus.IN_PROGRESS),
  );
  completedTasks = computed(() =>
    this.filteredTasks().filter((t) => t.status === TaskStatus.COMPLETED),
  );

  isModalOpen = signal(false);
  editingTask = signal<Task | null>(null);

  priorities = Object.values(TaskPriority);

  public getCategoryLabel(category: TaskCategory): string {
    const labels: Record<TaskCategory, string> = {
      [TaskCategory.WORK]: 'Work',
      [TaskCategory.PERSONAL]: 'Personal',
      [TaskCategory.SHOPPING]: 'Shopping',
      [TaskCategory.OTHER]: 'Other',
    };
    return labels[category] || category;
  }

  public getStatusLabel(status: TaskStatus): string {
    const labels: Record<TaskStatus, string> = {
      [TaskStatus.TODO]: 'To Do',
      [TaskStatus.IN_PROGRESS]: 'In Progress',
      [TaskStatus.COMPLETED]: 'Completed',
    };
    return labels[status] || status;
  }

  ngOnInit() {
    this.taskService.fetchTasks();
    this.registerShortcuts();
  }

  ngOnDestroy() {
    this.shortcutService.unregisterShortcuts('Global');
  }

  private registerShortcuts() {
    this.shortcutService.registerShortcut({
      key: 'n',
      description: 'Create New Task',
      category: 'Global',
      action: () => this.openCreate(),
    });

    this.shortcutService.registerShortcut({
      key: 'f',
      description: 'Focus Search',
      category: 'Global',
      action: () => this.searchInput.nativeElement.focus(),
    });
  }

  resetFilters() {
    this.searchQuery.set('');
    this.categoryFilter.set('all');
    this.sortBy.set('newest');
  }

  drop(event: CdkDragDrop<Task[]>, newStatus: TaskStatus) {
    if (event.previousContainer !== event.container) {
      const task = event.previousContainer.data[event.previousIndex];
      this.taskService.updateTask(task.id, { status: newStatus });
    }
  }

  getCategoryClass(category: string) {
    const classes: Record<string, string> = {
      [TaskCategory.WORK]: 'bg-indigo-50 text-indigo-700',
      [TaskCategory.PERSONAL]: 'bg-emerald-50 text-emerald-700',
      [TaskCategory.SHOPPING]: 'bg-amber-50 text-amber-700',
      [TaskCategory.OTHER]: 'bg-slate-50 text-slate-700',
    };
    return classes[category] || classes[TaskCategory.OTHER];
  }

  getPriorityColor(priority: string) {
    const classes: Record<string, string> = {
      [TaskPriority.HIGH]: 'text-red-600',
      [TaskPriority.MEDIUM]: 'text-orange-500',
      [TaskPriority.LOW]: 'text-sky-500',
    };
    return classes[priority] || classes[TaskPriority.LOW];
  }

  openCreate() {
    this.editingTask.set(null);
    this.isModalOpen.set(true);
  }

  openEdit(task: Task) {
    this.editingTask.set(task);
    this.isModalOpen.set(true);
  }

  deleteTask(id: string) {
    if (confirm('Are you sure you want to delete this task?')) {
      this.taskService.deleteTask(id);
    }
  }

  handleCreate(data: Partial<Task>) {
    this.taskService.createTask(data);
    this.isModalOpen.set(false);
  }

  handleUpdate(data: Partial<Task>) {
    const task = this.editingTask();
    if (task) {
      this.taskService.updateTask(task.id, data);
      this.editingTask.set(null);
      this.isModalOpen.set(false);
    }
  }
}
