import { Component, EventEmitter, Input, OnInit, Output, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Task, TaskStatus, TaskCategory, TaskPriority } from '../../../core/models';

@Component({
  selector: 'app-task-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <form [formGroup]="taskForm" (ngSubmit)="submit()" class="space-y-6">
      <div class="space-y-4">
        <div>
          <label for="title" class="block text-sm font-semibold text-slate-700 mb-1.5">Project Title</label>
          <input id="title" formControlName="title" type="text"
                 class="block w-full h-11 px-4 bg-slate-50 border border-slate-200 rounded-lg shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all text-slate-900 placeholder:text-slate-400"
                 placeholder="e.g. Migration to v2">
        </div>

        <div>
          <label for="description" class="block text-sm font-semibold text-slate-700 mb-1.5">Brief Description</label>
          <textarea id="description" formControlName="description" rows="3"
                    class="block w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-lg shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all text-slate-900 placeholder:text-slate-400"
                    placeholder="Provide some details about the task..."></textarea>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <div>
            <label for="category" class="block text-sm font-semibold text-slate-700 mb-1.5">Category</label>
            <div class="relative">
              <select id="category" formControlName="category"
                      class="appearance-none block w-full h-11 px-4 bg-slate-50 border border-slate-200 rounded-lg shadow-sm focus:ring-2 focus:ring-indigo-500 transition-all text-slate-900">
                @for (cat of categories; track cat) {
                  <option [value]="cat">{{ getCategoryLabel(cat) }}</option>
                }
              </select>
              <div class="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-slate-400">
                <svg class="h-4 w-4 fill-current" viewBox="0 0 20 20"><path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"/></svg>
              </div>
            </div>
          </div>

          <div>
            <label for="status" class="block text-sm font-semibold text-slate-700 mb-1.5">Current Status</label>
            <div class="relative">
              <select id="status" formControlName="status"
                      class="appearance-none block w-full h-11 px-4 bg-slate-50 border border-slate-200 rounded-lg shadow-sm focus:ring-2 focus:ring-indigo-500 transition-all text-slate-900">
                @for (status of statuses; track status) {
                  <option [value]="status">{{ getStatusLabel(status) }}</option>
                }
              </select>
              <div class="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-slate-400">
                <svg class="h-4 w-4 fill-current" viewBox="0 0 20 20"><path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"/></svg>
              </div>
            </div>
          </div>

          <div>
            <label for="priority" class="block text-sm font-semibold text-slate-700 mb-1.5">Priority</label>
            <div class="relative">
              <select id="priority" formControlName="priority"
                      class="appearance-none block w-full h-11 px-4 bg-slate-50 border border-slate-200 rounded-lg shadow-sm focus:ring-2 focus:ring-indigo-500 transition-all text-slate-900">
                @for (priority of priorities; track priority) {
                  <option [value]="priority">{{ priority }}</option>
                }
              </select>
              <div class="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-slate-400">
                <svg class="h-4 w-4 fill-current" viewBox="0 0 20 20"><path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"/></svg>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="flex justify-end gap-3 pt-6 border-t border-slate-100">
        <button type="button" (click)="formCancel.emit()"
                class="px-6 h-11 text-sm font-semibold text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-all active:scale-95">
          Cancel
        </button>
        <button type="submit" [disabled]="taskForm.invalid"
                class="px-6 h-11 text-sm font-semibold text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 disabled:opacity-50 shadow-md shadow-indigo-200 transition-all active:scale-95">
          {{ isEditing ? 'Update Task' : 'Create Task' }}
        </button>
      </div>
    </form>
  `,
  styles: [`
    :host { display: block; }
    select {
      background-image: none !important;
    }
  `]
})
export class TaskFormComponent implements OnInit {
  private fb = inject(FormBuilder);

  @Input() task?: Task;
  @Output() taskSubmit = new EventEmitter<Partial<Task>>();
  @Output() formCancel = new EventEmitter<void>();

  categories = Object.values(TaskCategory);
  statuses = Object.values(TaskStatus);
  priorities = Object.values(TaskPriority);

  public getCategoryLabel(category: TaskCategory): string {
    const labels: Record<TaskCategory, string> = {
      [TaskCategory.WORK]: 'Work',
      [TaskCategory.PERSONAL]: 'Personal',
      [TaskCategory.SHOPPING]: 'Shopping',
      [TaskCategory.OTHER]: 'Other'
    };
    return labels[category];
  }

  public getStatusLabel(status: TaskStatus): string {
    const labels: Record<TaskStatus, string> = {
      [TaskStatus.TODO]: 'To Do',
      [TaskStatus.IN_PROGRESS]: 'In Progress',
      [TaskStatus.COMPLETED]: 'Completed'
    };
    return labels[status];
  }

  taskForm = this.fb.group({
    title: ['', [Validators.required]],
    description: ['', [Validators.required]],
    category: [TaskCategory.WORK, [Validators.required]],
    status: [TaskStatus.TODO, [Validators.required]],
    priority: [TaskPriority.MEDIUM, [Validators.required]]
  });

  get isEditing(): boolean {
    return !!this.task;
  }

  ngOnInit() {
    if (this.task) {
      this.taskForm.patchValue({
        title: this.task.title,
        description: this.task.description,
        category: this.task.category,
        status: this.task.status,
        priority: this.task.priority
      });
    }
  }

  submit() {
    if (this.taskForm.valid) {
      this.taskSubmit.emit(this.taskForm.value as Partial<Task>);
    }
  }
}
