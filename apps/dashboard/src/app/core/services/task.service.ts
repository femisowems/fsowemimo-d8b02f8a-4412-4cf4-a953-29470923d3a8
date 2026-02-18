import { Injectable, signal, inject, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Task, TaskStatus, TaskCategory } from '../models';
import { environment } from '../../../environments/environment';
import { firstValueFrom } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class TaskService {
    private http = inject(HttpClient);

    private _tasks = signal<Task[]>([]);
    private _loading = signal<boolean>(false);
    private _error = signal<string>('');

    tasks = this._tasks.asReadonly();
    isLoading = this._loading.asReadonly();
    error = this._error.asReadonly();

    taskStats = computed(() => {
        const tasks = this.tasks();
        return {
            todo: tasks.filter(t => t.status === TaskStatus.TODO).length,
            inProgress: tasks.filter(t => t.status === TaskStatus.IN_PROGRESS).length,
            completed: tasks.filter(t => t.status === TaskStatus.COMPLETED).length,
            total: tasks.length
        };
    });

    async fetchTasks() {
        try {
            this._loading.set(true);
            const res = await firstValueFrom(this.http.get<Task[]>(`${environment.apiUrl}/tasks`));

            // Normalize data to handle case-sensitivity or legacy values
            const normalized = res.map(task => ({
                ...task,
                status: this.normalizeStatus(task.status),
                category: this.normalizeCategory(task.category)
            }));

            this._tasks.set(normalized);
            this._error.set('');
        } catch (err) {
            this._error.set('Failed to load tasks');
        } finally {
            this._loading.set(false);
        }
    }

    private normalizeStatus(status: any): TaskStatus {
        const s = String(status).toLowerCase().replace(' ', '-');
        if (Object.values(TaskStatus).includes(s as TaskStatus)) {
            return s as TaskStatus;
        }
        return TaskStatus.TODO; // Fallback
    }

    private normalizeCategory(category: any): TaskCategory {
        const c = String(category).toLowerCase();
        if (Object.values(TaskCategory).includes(c as TaskCategory)) {
            return c as TaskCategory;
        }
        return TaskCategory.OTHER; // Map unknown categories to 'other'
    }

    async createTask(data: Partial<Task>) {
        await firstValueFrom(this.http.post(`${environment.apiUrl}/tasks`, data));
        await this.fetchTasks();
    }

    async updateTask(id: string, data: Partial<Task>) {
        await firstValueFrom(this.http.put(`${environment.apiUrl}/tasks/${id}`, data));
        await this.fetchTasks();
    }

    async deleteTask(id: string) {
        await firstValueFrom(this.http.delete(`${environment.apiUrl}/tasks/${id}`));
        await this.fetchTasks();
    }
}
