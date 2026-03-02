import { Component, Input, OnInit, signal, inject, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { LucideAngularModule } from 'lucide-angular';
import { TaskService } from '../../../core/services/task.service';
import { AuditLog } from '../../../core/models';

@Component({
  selector: 'app-task-timeline',
  standalone: true,
  imports: [CommonModule, LucideAngularModule],
  providers: [DatePipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="mt-8 border-t border-slate-200 dark:border-slate-700 pt-6">
      <h3 class="text-sm font-bold tracking-tight text-slate-900 dark:text-white mb-4">Activity Timeline</h3>
      
      @if (loading()) {
        <div class="flex justify-center py-4">
          <div class="animate-spin rounded-full h-6 w-6 border-2 border-slate-200 border-b-indigo-600"></div>
        </div>
      } @else if (error()) {
        <div class="text-xs text-red-500 py-2">{{ error() }}</div>
      } @else if (logs().length === 0) {
        <div class="text-xs text-slate-500 py-2">No activity recorded yet.</div>
      } @else {
        <div class="flow-root">
          <ul role="list" class="-mb-8">
            @for (log of logs(); track trackById($index, log); let isLast = $last) {
              <li class="relative pb-8">
                @if (!isLast) {
                  <span class="absolute top-4 left-4 -ml-px h-full w-0.5 bg-slate-200 dark:bg-slate-700" aria-hidden="true"></span>
                }
                <div class="relative flex space-x-3">
                  <div>
                    <span class="h-8 w-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center ring-8 ring-white dark:ring-slate-800">
                      @if (log.action === 'TASK_STATUS_CHANGED') {
                        <lucide-icon name="arrow-right-left" class="text-indigo-500" [size]="14"></lucide-icon>
                      } @else if (log.action === 'CREATE') {
                        <lucide-icon name="check" class="text-emerald-500" [size]="14"></lucide-icon>
                      } @else if (log.action === 'UPDATE') {
                        <lucide-icon name="pencil" class="text-amber-500" [size]="14"></lucide-icon>
                      } @else {
                        <lucide-icon name="activity" class="text-slate-500" [size]="14"></lucide-icon>
                      }
                    </span>
                  </div>
                  <div class="flex min-w-0 flex-1 justify-between space-x-4 pt-1.5">
                    <div>
                      <p class="text-xs text-slate-500 dark:text-slate-400">
                        @if (log.action === 'TASK_STATUS_CHANGED' && log.metadata?.['fromStatus']) {
                          Status changed from <span class="font-medium text-slate-900 dark:text-white">{{ log.metadata?.['fromStatus'] }}</span> to
                          <span class="font-medium text-slate-900 dark:text-white">{{ log.metadata?.['toStatus'] }}</span>
                        } @else if (log.action === 'CREATE') {
                          Task created
                        } @else if (log.action === 'UPDATE') {
                          Task updated
                        } @else {
                          {{ log.action }} performed
                        }
                      </p>
                    </div>
                    <div class="whitespace-nowrap text-right text-xs text-slate-400">
                      <time [attr.datetime]="log.timestamp">{{ datePipe.transform(log.timestamp, 'MMM d, h:mm a') }}</time>
                    </div>
                  </div>
                </div>
              </li>
            }
          </ul>
        </div>
      }
    </div>
  `,
  styles: [`
    :host { display: block; }
  `]
})
export class TaskTimelineComponent implements OnInit {
  @Input({ required: true }) taskId!: string;
  
  private taskService = inject(TaskService);
  public datePipe = inject(DatePipe);

  logs = signal<AuditLog[]>([]);
  loading = signal(true);
  error = signal('');

  async ngOnInit() {
    try {
      this.loading.set(true);
      const fetched = await this.taskService.getTaskAuditLogs(this.taskId);
      this.logs.set(fetched);
    } catch {
      this.error.set('Failed to load timeline.');
    } finally {
      this.loading.set(false);
    }
  }

  trackById(index: number, log: AuditLog): string {
    return log.id;
  }
}
