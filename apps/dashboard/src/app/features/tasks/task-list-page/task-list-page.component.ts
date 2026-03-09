import {
  Component,
  inject,
  OnInit,
  signal,
  computed,
  ChangeDetectionStrategy,
  OnDestroy,
  ViewChild,
  ElementRef,
  HostListener,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { DragDropModule, CdkDragDrop } from '@angular/cdk/drag-drop';
import { LucideAngularModule } from 'lucide-angular';
import { TaskService, KeyboardShortcutsService } from '@secure-task-management/services';
import { AuthStore, UiStateService } from '@secure-task-management/state';
import {
  UserRole,
  Task,
  TaskStatus,
  TaskCategory,
  TaskPriority,
  Team,
} from '@secure-task-management/models';
import { TaskFormComponent } from '../task-form/task-form.component';
import { TaskAnalyticsComponent } from '../../analytics/task-analytics.component';
import { ShortcutsModalComponent } from '../../../shared/components/shortcuts-modal.component';
import { TaskHeaderComponent } from '../components/task-header.component';
import { TaskColumnComponent } from '../components/task-column.component';
import { CardComponent } from '@secure-task-management/shared-ui';
import { TeamsService } from '../../settings/teams.service';
// KeyboardShortcutsService moved above

type SortOption = 'newest' | 'oldest' | 'priority' | 'title';

@Component({
  selector: 'app-task-list-page',
  standalone: true,
  imports: [
    CommonModule,
    LucideAngularModule,
    DragDropModule,
    TaskHeaderComponent,
    TaskColumnComponent,
    TaskFormComponent,
    TaskAnalyticsComponent,
    ShortcutsModalComponent,
    CardComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="max-w-7xl mx-auto space-y-6 lg:space-y-10 px-4 py-6 lg:py-8">
        <!-- Kanban Board Area with Horizontal Scroll on Mobile -->
        <app-task-header
          [searchQuery]="searchQuery()"
          [categoryFilter]="categoryFilter()"
          [teamFilter]="teamFilter()"
          [teams]="teams()"
          (searchQueryChange)="searchQuery.set($event)"
          (categoryFilterChange)="categoryFilter.set($event)"
          (teamFilterChange)="teamFilter.set($event)"
          (create)="openCreate()"
          (columnGuide)="toggleColumnGuideModal()"
        ></app-task-header>

        @if (taskService.isSaving()) {
          <div class="flex items-center justify-end">
            <div
              class="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-indigo-200 bg-indigo-50 text-indigo-700 text-xs font-semibold"
            >
              <span class="h-2 w-2 rounded-full bg-indigo-500 animate-pulse"></span>
              Saving...
            </div>
          </div>
        }

        <app-task-analytics
          [tasks]="filteredTasks()"
          [activeFilterTitle]="activeFilterTitle()"
        ></app-task-analytics>

        @if (shortcutService.isHelpModalOpen('shortcuts')) {
          <app-shortcuts-modal></app-shortcuts-modal>
        }

        @if (shortcutService.isHelpModalOpen('column-guide')) {
          <div
            class="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-[100]"
            (click)="closeColumnGuideOnBackdrop($event)"
            (keydown.escape)="toggleColumnGuideModal()"
            (keyup.enter)="toggleColumnGuideModal()"
            (keyup.space)="toggleColumnGuideModal()"
            role="button"
            tabindex="0"
          >
            <div
              class="bg-white dark:bg-slate-900 rounded-3xl w-full max-w-2xl p-6 lg:p-8 relative shadow-2xl border border-slate-200 dark:border-slate-700 animate-in zoom-in duration-200"
            >
              <button
                (click)="toggleColumnGuideModal()"
                class="absolute top-6 right-6 p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-xl transition-all"
              >
                <lucide-icon name="x" [size]="20"></lucide-icon>
              </button>

              <div class="mb-5">
                <h2 class="text-2xl font-bold text-slate-900 dark:text-white">Column Guide</h2>
                <p class="text-sm text-slate-500 dark:text-slate-400 mt-1">
                  Quick definitions for each board status.
                </p>
              </div>

              <div class="grid gap-3 text-sm">
                <div class="rounded-xl border border-slate-200 dark:border-slate-700 p-3">
                  <p class="font-semibold text-slate-900 dark:text-slate-100">To Do</p>
                  <p class="text-slate-600 dark:text-slate-300">New tasks that are not started yet.</p>
                </div>
                <div class="rounded-xl border border-slate-200 dark:border-slate-700 p-3">
                  <p class="font-semibold text-slate-900 dark:text-slate-100">Scheduled</p>
                  <p class="text-slate-600 dark:text-slate-300">Planned tasks with a target sequence or upcoming execution window.</p>
                </div>
                <div class="rounded-xl border border-slate-200 dark:border-slate-700 p-3">
                  <p class="font-semibold text-slate-900 dark:text-slate-100">In Progress</p>
                  <p class="text-slate-600 dark:text-slate-300">Tasks currently being actively worked on.</p>
                </div>
                <div class="rounded-xl border border-slate-200 dark:border-slate-700 p-3">
                  <p class="font-semibold text-slate-900 dark:text-slate-100">Blocked</p>
                  <p class="text-slate-600 dark:text-slate-300">Tasks paused by dependencies, reviews, or external blockers.</p>
                </div>
                <div class="rounded-xl border border-slate-200 dark:border-slate-700 p-3">
                  <p class="font-semibold text-slate-900 dark:text-slate-100">Completed</p>
                  <p class="text-slate-600 dark:text-slate-300">Finished tasks ready for closure and reporting.</p>
                </div>
                <div class="rounded-xl border border-slate-200 dark:border-slate-700 p-3">
                  <p class="font-semibold text-slate-900 dark:text-slate-100">Archived</p>
                  <p class="text-slate-600 dark:text-slate-300">Closed historical tasks retained for audit and reference.</p>
                </div>
              </div>

              <div class="mt-5 pt-4 border-t border-slate-200 dark:border-slate-700 text-xs text-slate-500 dark:text-slate-400">
                Press <kbd class="px-1 py-0.5 bg-slate-100 dark:bg-slate-800 rounded border border-slate-200 dark:border-slate-700">!</kbd> or <kbd class="px-1 py-0.5 bg-slate-100 dark:bg-slate-800 rounded border border-slate-200 dark:border-slate-700">Esc</kbd> to close.
              </div>
            </div>
          </div>
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
              class="flex pb-6 overflow-x-auto gap-6 snap-x touch-pan-x scroll-smooth no-scrollbar select-none"
              cdkDropListGroup
            >
              <app-task-column
                [title]="getStatusLabel(TaskStatus.TODO)"
                [status]="TaskStatus.TODO"
                [tasks]="todoTasks()"
                [canEdit]="canEdit()"
                [canDuplicate]="canDuplicate()"
                [canDelete]="canDelete()"
                [teamMap]="teamMap()"
                (taskDrop)="drop($event, TaskStatus.TODO)"
                (edit)="openEdit($event)"
                (duplicate)="handleDuplicate($event)"
                (taskDelete)="deleteTask($event)"
              ></app-task-column>

              <app-task-column
                [title]="getStatusLabel(TaskStatus.SCHEDULED)"
                [status]="TaskStatus.SCHEDULED"
                [tasks]="scheduledTasks()"
                [canEdit]="canEdit()"
                [canDuplicate]="canDuplicate()"
                [canDelete]="canDelete()"
                [teamMap]="teamMap()"
                containerClass="bg-purple-50/40 dark:bg-purple-900/10 border-purple-100/50 dark:border-purple-800/30"
                dotClass="bg-purple-500"
                titleClass="text-purple-900 dark:text-purple-300"
                countClass="border-purple-100 dark:border-purple-900 text-purple-600 dark:text-purple-300"
                (taskDrop)="drop($event, TaskStatus.SCHEDULED)"
                (edit)="openEdit($event)"
                (duplicate)="handleDuplicate($event)"
                (taskDelete)="deleteTask($event)"
              ></app-task-column>

              <app-task-column
                [title]="getStatusLabel(TaskStatus.IN_PROGRESS)"
                [status]="TaskStatus.IN_PROGRESS"
                [tasks]="inProgressTasks()"
                [canEdit]="canEdit()"
                [canDuplicate]="canDuplicate()"
                [canDelete]="canDelete()"
                [teamMap]="teamMap()"
                containerClass="bg-blue-50/40 dark:bg-blue-900/10 border-blue-100/50 dark:border-blue-800/30"
                dotClass="bg-blue-500 animate-pulse"
                titleClass="text-blue-900 dark:text-blue-300"
                countClass="border-blue-100 dark:border-blue-900 text-blue-600 dark:text-blue-300"
                (taskDrop)="drop($event, TaskStatus.IN_PROGRESS)"
                (edit)="openEdit($event)"
                (duplicate)="handleDuplicate($event)"
                (taskDelete)="deleteTask($event)"
              ></app-task-column>

              <app-task-column
                [title]="getStatusLabel(TaskStatus.BLOCKED)"
                [status]="TaskStatus.BLOCKED"
                [tasks]="blockedTasks()"
                [canEdit]="canEdit()"
                [canDuplicate]="canDuplicate()"
                [canDelete]="canDelete()"
                [teamMap]="teamMap()"
                containerClass="bg-red-50/40 dark:bg-red-900/10 border-red-100/50 dark:border-red-800/30"
                dotClass="bg-red-500"
                titleClass="text-red-900 dark:text-red-300"
                countClass="border-red-100 dark:border-red-900 text-red-600 dark:text-red-300"
                (taskDrop)="drop($event, TaskStatus.BLOCKED)"
                (edit)="openEdit($event)"
                (duplicate)="handleDuplicate($event)"
                (taskDelete)="deleteTask($event)"
              ></app-task-column>

              <app-task-column
                [title]="getStatusLabel(TaskStatus.COMPLETED)"
                [status]="TaskStatus.COMPLETED"
                [tasks]="completedTasks()"
                [canEdit]="canEdit()"
                [canDuplicate]="canDuplicate()"
                [canDelete]="canDelete()"
                [teamMap]="teamMap()"
                containerClass="bg-green-50/40 dark:bg-green-900/10 border-green-100/50 dark:border-green-800/30"
                dotClass="bg-green-500"
                titleClass="text-green-900 dark:text-green-300"
                countClass="border-green-100 dark:border-green-900 text-green-600 dark:text-green-300"
                (taskDrop)="drop($event, TaskStatus.COMPLETED)"
                (edit)="openEdit($event)"
                (duplicate)="handleDuplicate($event)"
                (taskDelete)="deleteTask($event)"
              ></app-task-column>

              @if (showArchived()) {
                <app-task-column
                  #archivedContainer
                  [title]="getStatusLabel(TaskStatus.ARCHIVED)"
                  [status]="TaskStatus.ARCHIVED"
                  [tasks]="archivedTasks()"
                  [canEdit]="canEdit()"
                  [canDuplicate]="canDuplicate()"
                  [canDelete]="canDelete()"
                  [teamMap]="teamMap()"
                  containerClass="bg-slate-100/40 dark:bg-slate-900/10 border-slate-200/50 dark:border-slate-800/30"
                  dotClass="bg-slate-500"
                  titleClass="text-slate-900 dark:text-slate-300"
                  countClass="border-slate-200 dark:border-slate-900 text-slate-600 dark:text-slate-300"
                  (taskDrop)="drop($event, TaskStatus.ARCHIVED)"
                  (edit)="openEdit($event)"
                  (duplicate)="handleDuplicate($event)"
                  (taskDelete)="deleteTask($event)"
                ></app-task-column>
              }
            </div>
          </div>
        }

      @if (isModalOpen()) {
        <div
          class="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in duration-200"
        >
          <app-card
            [title]="editingTask() ? 'Update Task' : 'Create New Task'"
            [subtitle]="'Fill in the details below to ' + (editingTask() ? 'edit your' : 'start a') + ' task.'"
            customClass="w-full max-w-lg shadow-2xl relative animate-in zoom-in duration-200"
          >
            <button
              (click)="isModalOpen.set(false)"
              class="absolute top-6 right-6 p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-xl transition-all"
            >
              <lucide-icon name="x" [size]="20"></lucide-icon>
            </button>

            <app-task-form
              [task]="editingTask() || undefined"
              [teams]="teams()"
              (taskSubmit)="
                editingTask() ? handleUpdate($event) : handleCreate($event)
              "
              (formCancel)="isModalOpen.set(false)"
            ></app-task-form>
          </app-card>
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
  @ViewChild('archivedContainer') archivedContainer?: ElementRef<HTMLDivElement>;
  public taskService = inject(TaskService);
  private authStore = inject(AuthStore);
  public shortcutService = inject(KeyboardShortcutsService);
  public uiState = inject(UiStateService);
  private teamsService = inject(TeamsService);

  tasks = this.taskService.tasks;
  teams = signal<Team[]>([]);
  teamMap = computed(() => {
    const map: Record<string, string> = {};
    this.teams().forEach(t => map[t.id] = t.name);
    return map;
  });
  user = this.authStore.user;
  canEdit = computed(() => !!this.user());
  canDuplicate = computed(() => !!this.user());
  canDelete = computed(() => this.user()?.role !== UserRole.VIEWER);

  categories = Object.values(TaskCategory);
  statusMap = TaskStatus;

  // Filters & Search
  searchQuery = signal('');
  categoryFilter = signal<TaskCategory | 'all'>('all');
  teamFilter = signal<string | 'all'>('all');
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

    // 3. Team Filter
    const teamId = this.teamFilter();
    if (teamId !== 'all') {
      result = result.filter((t) => t.assignedTeamId === teamId);
    }

    // 4. Sorting
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

  activeFilterTitle = computed(() => {
    const teamId = this.teamFilter();
    const cat = this.categoryFilter();
    const query = this.searchQuery();

    if (teamId !== 'all') {
      const teamName = this.teamMap()[teamId] || 'Team';
      const suffix = teamName.toLowerCase().endsWith('team') ? '' : ' Team';
      return `${teamName}${suffix}`;
    }

    if (cat !== 'all') {
      return `${this.getCategoryLabel(cat as TaskCategory)} Tasks`;
    }

    if (query) {
      return `Search: "${query}"`;
    }

    return 'Full Organization';
  });

  todoTasks = computed(() => this.filteredTasks().filter(t => t.status === TaskStatus.TODO));
  scheduledTasks = computed(() => this.filteredTasks().filter(t => t.status === TaskStatus.SCHEDULED));
  inProgressTasks = computed(() => this.filteredTasks().filter(t => t.status === TaskStatus.IN_PROGRESS));
  blockedTasks = computed(() => this.filteredTasks().filter(t => t.status === TaskStatus.BLOCKED));
  completedTasks = computed(() => this.filteredTasks().filter(t => t.status === TaskStatus.COMPLETED));
  archivedTasks = computed(() => this.filteredTasks().filter(t => t.status === TaskStatus.ARCHIVED));

  isModalOpen = signal(false);
  editingTask = signal<Task | null>(null);
  TaskStatus = TaskStatus;
  showArchived = signal(false);

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
    [TaskStatus.SCHEDULED]: 'Scheduled',
    [TaskStatus.IN_PROGRESS]: 'In Progress',
    [TaskStatus.BLOCKED]: 'Blocked',
    [TaskStatus.COMPLETED]: 'Completed',
    [TaskStatus.ARCHIVED]: 'Archived',
  };
    return labels[status] || status;
  }

  ngOnInit() {
    this.taskService.fetchTasks();
    this.loadTeams();
    this.registerShortcuts();
  }

  loadTeams() {
    this.teamsService.getTeams().subscribe({
      next: (teams) => this.teams.set(teams),
      error: (err) => console.error('Failed to load teams', err),
    });
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
      key: 'a',
      description: 'Toggle Archived Tasks',
      category: 'Global',
      action: () => this.toggleArchived(),
    });

    this.shortcutService.registerShortcut({
      key: '!',
      description: 'Open Column Guide',
      category: 'Global',
      action: () => this.toggleColumnGuideModal(),
    });
  }

  toggleColumnGuideModal() {
    this.shortcutService.toggleHelpModal('column-guide');
  }

  @HostListener('window:keydown.escape')
  handleEscape() {
    if (this.shortcutService.isHelpModalOpen('column-guide')) {
      this.toggleColumnGuideModal();
    }
  }

  closeColumnGuideOnBackdrop(event: MouseEvent) {
    if (event.target === event.currentTarget) {
      this.toggleColumnGuideModal();
    }
  }

  toggleArchived() {
    this.showArchived.update(v => !v);
    if (this.showArchived()) {
      setTimeout(() => {
        this.archivedContainer?.nativeElement?.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
      }, 50);
    }
  }

  resetFilters() {
    this.searchQuery.set('');
    this.categoryFilter.set('all');
    this.teamFilter.set('all');
    this.sortBy.set('newest');
  }

  drop(event: CdkDragDrop<Task[]>, newStatus: TaskStatus) {
    if (event.previousContainer !== event.container) {
      const task = event.previousContainer.data[event.previousIndex];
      this.taskService.updateTask(task.id, { status: newStatus });
    }
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

  handleDuplicate(task: Task) {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { id: _id, createdAt: _c, updatedAt: _u, ...duplicateData } = task;
    this.taskService.createTask({
      ...duplicateData,
      title: `${task.title} (Copy)`,
    });
  }
}
