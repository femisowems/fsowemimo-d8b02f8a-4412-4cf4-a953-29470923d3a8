import { Injectable, signal, inject, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Task, TaskStatus, TaskCategory } from '@secure-task-management/models';
import { firstValueFrom } from 'rxjs';
import { APP_CONFIG } from './tokens';

@Injectable({
  providedIn: 'root',
})
export class TaskService {
  private http = inject(HttpClient);
  private config = inject(APP_CONFIG);

  private _tasks = signal<Task[]>([]);
  private _loading = signal<boolean>(false);
  private _savingOps = signal<number>(0);
  private _error = signal<string>('');

  tasks = this._tasks.asReadonly();
  isLoading = this._loading.asReadonly();
  isSaving = computed(() => this._savingOps() > 0);
  error = this._error.asReadonly();

  todoTasks = computed(() => this.tasks().filter(t => t.status === TaskStatus.TODO));
  scheduledTasks = computed(() => this.tasks().filter(t => t.status === TaskStatus.SCHEDULED));
  inProgressTasks = computed(() => this.tasks().filter(t => t.status === TaskStatus.IN_PROGRESS));
  blockedTasks = computed(() => this.tasks().filter(t => t.status === TaskStatus.BLOCKED));
  completedTasks = computed(() => this.tasks().filter(t => t.status === TaskStatus.COMPLETED));
  archivedTasks = computed(() => this.tasks().filter(t => t.status === TaskStatus.ARCHIVED));

  taskStats = computed(() => {
    const tasks = this.tasks();
    return {
      todo: this.todoTasks().length,
      scheduled: this.scheduledTasks().length,
      inProgress: this.inProgressTasks().length,
      blocked: this.blockedTasks().length,
      completed: this.completedTasks().length,
      archived: this.archivedTasks().length,
      total: tasks.length,
    };
  });

  async fetchTasks(options?: { silent?: boolean }) {
    const silent = options?.silent ?? false;
    try {
      if (!silent) {
        this._loading.set(true);
      }
      const res = await firstValueFrom(
        this.http.get<Task[]>(`${this.config.apiUrl}/tasks`),
      );

      // Normalize data to handle case-sensitivity or legacy values
      const normalized = res.map((task) => ({
        ...task,
        status: this.normalizeStatus(task.status),
        category: this.normalizeCategory(task.category),
      })) as Task[];

      this._tasks.set(normalized);
      this._error.set('');
    } catch {
      this._error.set('Failed to load tasks');
    } finally {
      if (!silent) {
        this._loading.set(false);
      }
    }
  }

  private normalizeStatus(status: unknown): TaskStatus {
    const s = String(status).toLowerCase().replace(' ', '-');
    if (Object.values(TaskStatus).includes(s as TaskStatus)) {
      return s as TaskStatus;
    }
    return TaskStatus.TODO; // Fallback
  }

  private normalizeCategory(category: unknown): TaskCategory {
    const c = String(category).toLowerCase();
    if (Object.values(TaskCategory).includes(c as TaskCategory)) {
      return c as TaskCategory;
    }
    return TaskCategory.OTHER; // Map unknown categories to 'other'
  }

  async createTask(data: Partial<Task>) {
    this._savingOps.update((n) => n + 1);
    try {
      await firstValueFrom(this.http.post(`${this.config.apiUrl}/tasks`, data));
      await this.fetchTasks({ silent: true });
    } finally {
      this._savingOps.update((n) => Math.max(0, n - 1));
    }
  }

  async updateTask(id: string, data: Partial<Task>) {
    this._savingOps.update((n) => n + 1);
    try {
      await firstValueFrom(
        this.http.put(`${this.config.apiUrl}/tasks/${id}`, data),
      );
      await this.fetchTasks({ silent: true });
    } finally {
      this._savingOps.update((n) => Math.max(0, n - 1));
    }
  }

  async deleteTask(id: string) {
    this._savingOps.update((n) => n + 1);
    try {
      await firstValueFrom(this.http.delete(`${this.config.apiUrl}/tasks/${id}`));
      await this.fetchTasks({ silent: true });
    } finally {
      this._savingOps.update((n) => Math.max(0, n - 1));
    }
  }
}
