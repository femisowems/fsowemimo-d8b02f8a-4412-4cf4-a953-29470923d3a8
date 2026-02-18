import { Injectable, signal } from '@angular/core';

@Injectable({
    providedIn: 'root'
})
export class UiStateService {
    isSidebarOpen = signal(false);

    toggleSidebar() {
        this.isSidebarOpen.update(isOpen => !isOpen);
    }
}
