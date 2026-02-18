import { Component, inject, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { KeyboardShortcutsService } from '../../core/services/keyboard-shortcuts.service';
import { LucideAngularModule } from 'lucide-angular';

@Component({
  selector: 'app-shortcuts-modal',
  standalone: true,
  imports: [CommonModule, LucideAngularModule],
  template: `
    <div class="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-[100]" (click)="close()" (keydown.escape)="close()" tabindex="0">
      <div class="bg-surface rounded-modal w-full max-w-lg p-grid-2xl relative shadow-2xl border border-border-subtle animate-in zoom-in duration-200" (click)="$event.stopPropagation()" (keydown)="handleKeydown($event)" tabindex="-1">
        <button
          (click)="close()"
          class="absolute top-grid-lg right-grid-lg p-grid-sm text-text-secondary hover:text-text-primary hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-all"
        >
          <lucide-icon name="x" [size]="20"></lucide-icon>
        </button>

        <div class="mb-grid-xl">
          <h2 class="text-h3 font-bold text-text-primary">Keyboard Shortcuts</h2>
          <p class="text-caption text-text-secondary mt-1">Master your workflow with these speed keys.</p>
        </div>

        <div class="space-y-grid-lg">
          @for (group of groupedShortcuts(); track group.category) {
            <div>
              <h3 class="text-caption font-bold text-text-secondary uppercase tracking-widest mb-grid-sm">{{ group.category }}</h3>
              <div class="space-y-grid-xs">
                @for (s of group.items; track s.key) {
                  <div class="flex items-center justify-between py-2 border-b border-border-subtle last:border-0">
                    <span class="text-body-sm text-text-primary font-medium">{{ s.description }}</span>
                    <kbd class="px-2 py-1 bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded text-xs font-bold font-mono text-text-primary shadow-sm">
                      {{ s.key.toUpperCase() }}
                    </kbd>
                  </div>
                }
              </div>
            </div>
          }
        </div>

        <div class="mt-grid-xl pt-grid-lg border-t border-border-subtle">
          <p class="text-xs text-text-secondary text-center italic">
            Press <kbd class="px-1 bg-gray-50 border rounded text-[10px]">ESC</kbd> or <kbd class="px-1 bg-gray-50 border rounded text-[10px]">?</kbd> to close this guide.
          </p>
        </div>
      </div>
    </div>
  `,
  styles: [`
    :host { display: block; }
  `]
})
export class ShortcutsModalComponent {
  private shortcutService = inject(KeyboardShortcutsService);

  groupedShortcuts = () => {
    const shortcuts = this.shortcutService.getShortcuts();
    const groups: Record<string, any[]> = {};

    shortcuts.forEach(s => {
      if (!groups[s.category]) groups[s.category] = [];
      groups[s.category].push(s);
    });

    return Object.keys(groups).map(category => ({
      category,
      items: groups[category]
    }));
  };

  @HostListener('window:keydown.escape')
  handleEscape() {
    this.close();
  }

  handleKeydown(event: KeyboardEvent) {
    if (event.key === 'Escape') {
      this.close();
    }
  }

  close() {
    this.shortcutService.isModalOpen.set(false);
  }
}
