import { Component, inject, OnInit, signal, computed, ViewChild, ElementRef, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DragDropModule, CdkDragDrop } from '@angular/cdk/drag-drop';
import { LucideAngularModule } from 'lucide-angular';
import { TaskService } from '../../../core/services/task.service';
import { AuthStore } from '../../../core/services/auth.store';
import { UserRole, Task, TaskStatus, TaskCategory, TaskPriority } from '../../../core/models';
import { TaskFormComponent } from '../task-form/task-form.component';
import { TaskAnalyticsComponent } from '../../analytics/task-analytics.component';
import { ShortcutsModalComponent } from '../../../shared/components/shortcuts-modal.component';
import { KeyboardShortcutsService } from '../../../core/services/keyboard-shortcuts.service';

type SortOption = 'newest' | 'oldest' | 'priority' | 'title';

@Component({
  selector: 'app-task-list-page',
  standalone: true,
  imports: [CommonModule, LucideAngularModule, TaskFormComponent, TaskAnalyticsComponent, ShortcutsModalComponent, FormsModule, DragDropModule],
  template: `
    <div class="max-w-7xl mx-auto space-y-10 px-4 py-8">
      <div class="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h1 class="text-3xl font-extrabold text-slate-900 tracking-tight">Project Board</h1>
          <p class="text-slate-500 text-sm mt-1">Manage, track and organize your team tasks.</p>
        </div>
        
        <div class="flex flex-wrap items-center gap-4 w-full md:w-auto">
          <!-- Search -->
          <div class="relative flex-1 md:w-64">
            <lucide-icon name="search" class="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" [size]="18"></lucide-icon>
            <input
              #searchInput
              type="text"
              [ngModel]="searchQuery()"
              (ngModelChange)="searchQuery.set($event)"
              placeholder="Search tasks..."
              class="w-full pl-10 pr-4 h-11 bg-white border border-slate-200 rounded-xl shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all text-sm"
            >
          </div>

          <!-- Category Filter -->
          <div class="relative">
            <lucide-icon name="filter" class="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" [size]="16"></lucide-icon>
            <select
              [ngModel]="categoryFilter()"
              (ngModelChange)="categoryFilter.set($event)"
              class="appearance-none pl-9 pr-10 h-11 bg-white border border-slate-200 rounded-xl shadow-sm focus:ring-2 focus:ring-indigo-500 transition-all text-sm"
            >
              <option value="all">All Categories</option>
              @for (cat of categories; track cat) {
                <option [value]="cat">{{ getCategoryLabel(cat) }}</option>
              }
            </select>
            <div class="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-slate-400">
               <svg class="h-4 w-4 fill-current" viewBox="0 0 20 20"><path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"/></svg>
            </div>
          </div>

          <button
            (click)="openCreate()"
            class="flex items-center gap-2 px-6 h-11 bg-indigo-600 text-white font-semibold rounded-xl hover:bg-indigo-700 transition-all shadow-md shadow-indigo-100 active:scale-95"
          >
            <lucide-icon name="plus" [size]="18"></lucide-icon>
            New Task
          </button>

          <div class="hidden md:flex items-center gap-1.5 px-3 h-11 bg-slate-100/50 border border-slate-200 rounded-xl text-slate-400 text-xs font-mono">
            <span>Shortcut:</span>
            <kbd class="px-1.5 py-0.5 bg-white border border-slate-300 rounded shadow-sm font-bold text-slate-600">?</kbd>
          </div>
        </div>
      </div>

      <app-task-analytics></app-task-analytics>

      @if (shortcutService.isModalOpen()) {
        <app-shortcuts-modal></app-shortcuts-modal>
      }

      @if (taskService.isLoading()) {
        <div class="flex flex-col items-center justify-center py-20 bg-white/50 rounded-3xl border border-dashed border-slate-200">
          <div class="animate-spin rounded-full h-10 w-10 border-4 border-slate-200 border-b-indigo-600 mb-4"></div>
          <p class="text-slate-500 font-medium">Loading project board...</p>
        </div>
      } @else {
        <div class="grid grid-cols-1 md:grid-cols-3 gap-8" cdkDropListGroup>
          <!-- TODO Column -->
          <div class="flex flex-col h-full bg-slate-50/50 rounded-2xl p-5 border border-slate-100 shadow-sm">
            <div class="flex items-center justify-between mb-6 px-1">
              <div class="flex items-center gap-3">
                <div class="w-2.5 h-2.5 rounded-full bg-slate-400"></div>
                <h2 class="text-sm font-bold text-slate-700 uppercase tracking-widest">{{ getStatusLabel(statusMap.TODO) }}</h2>
              </div>
              <span class="bg-white px-2.5 py-1 rounded-lg border border-slate-200 text-slate-500 text-xs font-bold shadow-sm">{{ todoTasks().length }}</span>
            </div>
            
            <div
              cdkDropList
              [cdkDropListData]="todoTasks()"
              (cdkDropListDropped)="drop($event, statusMap.TODO)"
              class="flex-1 space-y-4 min-h-[500px]"
            >
              @for (task of todoTasks(); track task.id) {
                <div cdkDrag class="bg-white p-5 rounded-2xl shadow-sm border border-slate-200 cursor-grab hover:shadow-lg hover:border-indigo-100 transition-all active:cursor-grabbing group">
                  <div class="flex flex-col gap-3">
                    <div class="flex justify-between items-start">
                      <span [class]="'px-2.5 py-1 text-[10px] font-bold uppercase rounded-md tracking-wider ' + getCategoryClass(task.category)">
                        {{ getCategoryLabel(task.category) }}
                      </span>
                      @if (task.priority) {
                        <span [class]="'text-[10px] font-bold uppercase tracking-wider ' + getPriorityColor(task.priority)">
                          {{ task.priority }}
                        </span>
                      }
                    </div>
                    <h3 class="text-slate-900 font-bold leading-snug group-hover:text-indigo-600 transition-colors">{{ task.title }}</h3>
                    <p class="text-slate-500 text-sm line-clamp-2 leading-relaxed">{{ task.description }}</p>
                    <div class="flex justify-end gap-2 mt-2 opacity-0 group-hover:opacity-100 transition-all transform translate-y-1 group-hover:translate-y-0">
                      @if (canEdit()) {
                        <div class="flex gap-2">
                          <button (click)="openEdit(task)" class="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all">
                            <lucide-icon name="pencil" [size]="14"></lucide-icon>
                          </button>
                          <button (click)="deleteTask(task.id)" class="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all">
                            <lucide-icon name="trash-2" [size]="14"></lucide-icon>
                          </button>
                        </div>
                      }
                    </div>
                  </div>
                </div>
              }
            </div>
          </div>

          <!-- IN PROGRESS Column -->
          <div class="flex flex-col h-full bg-blue-50/40 rounded-2xl p-5 border border-blue-100/50 shadow-sm">
             <div class="flex items-center justify-between mb-6 px-1">
              <div class="flex items-center gap-3">
                <div class="w-2.5 h-2.5 rounded-full bg-blue-500 animate-pulse"></div>
                <h2 class="text-sm font-bold text-blue-900 uppercase tracking-widest">{{ getStatusLabel(statusMap.IN_PROGRESS) }}</h2>
              </div>
              <span class="bg-white px-2.5 py-1 rounded-lg border border-blue-100 text-blue-600 text-xs font-bold shadow-sm">{{ inProgressTasks().length }}</span>
            </div>
            
            <div
              cdkDropList
              [cdkDropListData]="inProgressTasks()"
              (cdkDropListDropped)="drop($event, statusMap.IN_PROGRESS)"
              class="flex-1 space-y-4 min-h-[500px]"
            >
              @for (task of inProgressTasks(); track task.id) {
                <div cdkDrag class="bg-white p-5 rounded-2xl shadow-sm border border-slate-200 cursor-grab hover:shadow-lg hover:border-blue-200 transition-all active:cursor-grabbing group">
                   <div class="flex flex-col gap-3">
                    <div class="flex justify-between items-start">
                      <span [class]="'px-2.5 py-1 text-[10px] font-bold uppercase rounded-md tracking-wider ' + getCategoryClass(task.category)">
                        {{ getCategoryLabel(task.category) }}
                      </span>
                      @if (task.priority) {
                        <span [class]="'text-[10px] font-bold uppercase tracking-wider ' + getPriorityColor(task.priority)">
                          {{ task.priority }}
                        </span>
                      }
                    </div>
                    <h3 class="text-slate-900 font-bold leading-snug group-hover:text-blue-600 transition-colors">{{ task.title }}</h3>
                    <p class="text-slate-500 text-sm line-clamp-2 leading-relaxed">{{ task.description }}</p>
                    <div class="flex justify-end gap-2 mt-2 opacity-0 group-hover:opacity-100 transition-all transform translate-y-1 group-hover:translate-y-0">
                      @if (canEdit()) {
                        <div class="flex gap-2">
                          <button (click)="openEdit(task)" class="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all">
                            <lucide-icon name="pencil" [size]="14"></lucide-icon>
                          </button>
                          <button (click)="deleteTask(task.id)" class="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all">
                            <lucide-icon name="trash-2" [size]="14"></lucide-icon>
                          </button>
                        </div>
                      }
                    </div>
                  </div>
                </div>
              }
            </div>
          </div>

          <!-- COMPLETED Column -->
          <div class="flex flex-col h-full bg-green-50/40 rounded-2xl p-5 border border-green-100/50 shadow-sm">
             <div class="flex items-center justify-between mb-6 px-1">
              <div class="flex items-center gap-3">
                <div class="w-2.5 h-2.5 rounded-full bg-green-500"></div>
                <h2 class="text-sm font-bold text-green-900 uppercase tracking-widest">{{ getStatusLabel(statusMap.COMPLETED) }}</h2>
              </div>
              <span class="bg-white px-2.5 py-1 rounded-lg border border-green-100 text-green-600 text-xs font-bold shadow-sm">{{ completedTasks().length }}</span>
            </div>
            
            <div
              cdkDropList
              [cdkDropListData]="completedTasks()"
              (cdkDropListDropped)="drop($event, statusMap.COMPLETED)"
              class="flex-1 space-y-4 min-h-[500px]"
            >
              @for (task of completedTasks(); track task.id) {
                <div cdkDrag class="bg-white p-5 rounded-2xl shadow-sm border border-slate-200 cursor-grab hover:shadow-lg hover:border-green-200 transition-all active:cursor-grabbing group opacity-80 hover:opacity-100">
                   <div class="flex flex-col gap-3">
                    <div class="flex justify-between items-start">
                      <span [class]="'px-2.5 py-1 text-[10px] font-bold uppercase rounded-md tracking-wider ' + getCategoryClass(task.category)">
                        {{ getCategoryLabel(task.category) }}
                      </span>
                    </div>
                    <h3 class="text-slate-900 font-bold leading-snug line-through opacity-50">{{ task.title }}</h3>
                    <div class="flex justify-end gap-2 mt-2">
                      @if (canEdit()) {
                        <div class="flex gap-2">
                          <button (click)="openEdit(task)" class="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-all">
                            <lucide-icon name="pencil" [size]="14"></lucide-icon>
                          </button>
                          <button (click)="deleteTask(task.id)" class="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all">
                            <lucide-icon name="trash-2" [size]="14"></lucide-icon>
                          </button>
                        </div>
                      }
                    </div>
                  </div>
                </div>
              }
            </div>
          </div>
        </div>
      }

      @if (isModalOpen()) {
        <div class="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div class="bg-white rounded-3xl w-full max-w-lg p-10 relative shadow-2xl border border-slate-200 animate-in zoom-in duration-200">
            <button
              (click)="isModalOpen.set(false)"
              class="absolute top-6 right-6 p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition-all"
            >
              <lucide-icon name="x" [size]="20"></lucide-icon>
            </button>
            <div class="mb-8">
              <h2 class="text-2xl font-bold text-slate-900">{{ editingTask() ? 'Update Task' : 'Create New Task' }}</h2>
              <p class="text-slate-500 text-sm mt-1">Fill in the details below to {{ editingTask() ? 'edit your' : 'start a' }} task.</p>
            </div>
            
            <app-task-form
              [task]="editingTask() || undefined"
              (taskSubmit)="editingTask() ? handleUpdate($event) : handleCreate($event)"
              (formCancel)="isModalOpen.set(false)"
            ></app-task-form>
          </div>
        </div>
      }
    </div>
  `,
  styles: [`
    :host { display: block; }
    .cdk-drag-preview {
      border-radius: 1.5rem;
      box-shadow: 0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1);
    }
    .cdk-drag-placeholder { opacity: 0; }
    .cdk-drag-animating { transition: transform 250ms cubic-bezier(0, 0, 0.2, 1); }
    .cdk-drop-list-dragging .cdk-drag { transition: transform 250ms cubic-bezier(0, 0, 0.2, 1); }
  `]
})
export class TaskListPageComponent implements OnInit, OnDestroy {
  public taskService = inject(TaskService);
  private authStore = inject(AuthStore);
  public shortcutService = inject(KeyboardShortcutsService);

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
      result = result.filter(t =>
        t.title.toLowerCase().includes(query) ||
        t.description.toLowerCase().includes(query)
      );
    }

    // 2. Category Filter
    const cat = this.categoryFilter();
    if (cat !== 'all') {
      result = result.filter(t => t.category === cat);
    }

    // 3. Sorting
    result = [...result].sort((a, b) => {
      switch (this.sortBy()) {
        case 'newest': return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        case 'oldest': return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        case 'priority': {
          const pMap: Record<string, number> = { [TaskPriority.HIGH]: 3, [TaskPriority.MEDIUM]: 2, [TaskPriority.LOW]: 1 };
          return (pMap[b.priority] || 0) - (pMap[a.priority] || 0);
        }
        case 'title': return a.title.localeCompare(b.title);
        default: return 0;
      }
    });

    return result;
  });

  todoTasks = computed(() => this.filteredTasks().filter(t => t.status === TaskStatus.TODO));
  inProgressTasks = computed(() => this.filteredTasks().filter(t => t.status === TaskStatus.IN_PROGRESS));
  completedTasks = computed(() => this.filteredTasks().filter(t => t.status === TaskStatus.COMPLETED));

  isModalOpen = signal(false);
  editingTask = signal<Task | null>(null);

  priorities = Object.values(TaskPriority);

  public getCategoryLabel(category: TaskCategory): string {
    const labels: Record<TaskCategory, string> = {
      [TaskCategory.WORK]: 'Work',
      [TaskCategory.PERSONAL]: 'Personal',
      [TaskCategory.SHOPPING]: 'Shopping',
      [TaskCategory.OTHER]: 'Other'
    };
    return labels[category] || category;
  }

  public getStatusLabel(status: TaskStatus): string {
    const labels: Record<TaskStatus, string> = {
      [TaskStatus.TODO]: 'To Do',
      [TaskStatus.IN_PROGRESS]: 'In Progress',
      [TaskStatus.COMPLETED]: 'Completed'
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
      action: () => this.openCreate()
    });

    this.shortcutService.registerShortcut({
      key: 'f',
      description: 'Focus Search',
      category: 'Global',
      action: () => this.searchInput.nativeElement.focus()
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
      [TaskCategory.OTHER]: 'bg-slate-50 text-slate-700'
    };
    return classes[category] || classes[TaskCategory.OTHER];
  }

  getPriorityColor(priority: string) {
    const classes: Record<string, string> = {
      [TaskPriority.HIGH]: 'text-red-600',
      [TaskPriority.MEDIUM]: 'text-orange-500',
      [TaskPriority.LOW]: 'text-sky-500'
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
