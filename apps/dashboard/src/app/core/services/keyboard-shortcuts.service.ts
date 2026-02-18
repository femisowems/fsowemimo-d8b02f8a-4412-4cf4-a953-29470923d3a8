import { Injectable, signal, OnDestroy } from '@angular/core';
import { Subject, fromEvent, takeUntil } from 'rxjs';

export interface ShortcutAction {
    key: string;
    description: string;
    action: () => void;
    category: 'Global' | 'Task Board';
}

@Injectable({
    providedIn: 'root'
})
export class KeyboardShortcutsService implements OnDestroy {
    private destroy$ = new Subject<void>();
    private shortcuts: ShortcutAction[] = [];

    isModalOpen = signal(false);

    constructor() {
        this.setupGlobalListeners();
    }

    private setupGlobalListeners() {
        fromEvent<KeyboardEvent>(window, 'keydown')
            .pipe(takeUntil(this.destroy$))
            .subscribe(event => {
                // Don't trigger if typing in an input
                const target = event.target as HTMLElement;
                if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable) {
                    return;
                }

                const shortcut = this.shortcuts.find(s =>
                    s.key.toLowerCase() === event.key.toLowerCase()
                );

                if (shortcut) {
                    event.preventDefault();
                    this.isModalOpen.set(false);
                    shortcut.action();
                }

                // Global '?' for help
                if (event.key === '?') {
                    this.toggleHelpModal();
                }
            });
    }

    registerShortcut(shortcut: ShortcutAction) {
        this.shortcuts.push(shortcut);
    }

    unregisterShortcuts(category?: 'Global' | 'Task Board') {
        if (category) {
            this.shortcuts = this.shortcuts.filter(s => s.category !== category);
        } else {
            this.shortcuts = [];
        }
    }

    getShortcuts() {
        return this.shortcuts;
    }

    toggleHelpModal() {
        this.isModalOpen.update(v => !v);
    }

    ngOnDestroy() {
        this.destroy$.next();
        this.destroy$.complete();
    }
}
