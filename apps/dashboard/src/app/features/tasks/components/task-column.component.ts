import { Component, Input, Output, EventEmitter, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DragDropModule, CdkDragDrop } from '@angular/cdk/drag-drop';
import { Task, TaskStatus } from '@fsowemimo-d8b02f8a-4412-4cf4-a953-29470923d3a8/models';
import { TaskCardComponent } from './task-card.component';
import { BadgeComponent, BadgeVariant } from '@fsowemimo-d8b02f8a-4412-4cf4-a953-29470923d3a8/shared-ui';

@Component({
  selector: 'app-task-column',
  standalone: true,
  imports: [CommonModule, DragDropModule, TaskCardComponent, BadgeComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div
      class="w-[360px] flex flex-col h-full rounded-2xl p-4 border shadow-sm shrink-0 snap-center"
      [ngClass]="containerClass"
    >
      <div class="flex items-center justify-between mb-4 px-1">
        <div class="flex items-center gap-3">
          <div [class]="'w-2.5 h-2.5 rounded-full ' + dotClass"></div>
          <h2
            class="text-sm font-bold uppercase tracking-widest"
            [ngClass]="titleClass"
          >
            {{ title }}
          </h2>
        </div>
        <app-badge [variant]="getBadgeVariant()">
          {{ tasks.length }}
        </app-badge>
      </div>

      <div
        cdkDropList
        [cdkDropListData]="tasks"
        (cdkDropListDropped)="onDrop($event)"
        class="flex-1 space-y-3 overflow-y-auto min-h-[500px] pr-2"
      >
        @for (task of tasks; track task.id) {
          <app-task-card
            [task]="task"
            [canEdit]="canEdit"
            (edit)="edit.emit($event)"
            (duplicate)="duplicate.emit($event)"
            (delete)="taskDelete.emit($event)"
            cdkDrag
          />
        }
      </div>
    </div>
  `,
  styles: [`
    :host {
      display: block;
    }
  `]
})
export class TaskColumnComponent {
  @Input({ required: true }) title!: string;
  @Input({ required: true }) status!: TaskStatus;
  @Input({ required: true }) tasks!: Task[];
  @Input() canEdit = true;
  @Input() containerClass = 'bg-slate-50/50 dark:bg-slate-800/50 border-slate-100 dark:border-slate-700/50';
  @Input() dotClass = 'bg-slate-400';
  @Input() titleClass = 'text-slate-700 dark:text-slate-300';
  @Input() countClass = 'border-slate-200 dark:border-slate-600 text-slate-500 dark:text-slate-300';

  @Output() drop = new EventEmitter<CdkDragDrop<Task[]>>();
  @Output() edit = new EventEmitter<Task>();
  @Output() duplicate = new EventEmitter<Task>();
  @Output() taskDelete = new EventEmitter<string>();

  onDrop(event: CdkDragDrop<Task[]>) {
    this.drop.emit(event);
  }

  getBadgeVariant(): BadgeVariant {
    switch (this.status) {
      case TaskStatus.TODO: return 'default';
      case TaskStatus.SCHEDULED: return 'purple';
      case TaskStatus.IN_PROGRESS: return 'info';
      case TaskStatus.BLOCKED: return 'error';
      case TaskStatus.COMPLETED: return 'success';
      case TaskStatus.ARCHIVED: return 'default';
      default: return 'default';
    }
  }
}
