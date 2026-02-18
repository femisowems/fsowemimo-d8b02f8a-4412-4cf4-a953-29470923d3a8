import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { AuthStore } from '../services/auth.store';
import { toObservable } from '@angular/core/rxjs-interop';
import { filter, map, take } from 'rxjs/operators';

export const authGuard: CanActivateFn = () => {
    const authStore = inject(AuthStore);
    const router = inject(Router);

    // If already authenticated, allow immediately
    if (authStore.isAuthenticated()) {
        return true;
    }

    // Otherwise, wait for loading to finish if it's still in progress
    return toObservable(authStore.isLoading).pipe(
        filter(loading => !loading),
        take(1),
        map(() => {
            if (authStore.isAuthenticated()) {
                return true;
            }
            router.navigate(['/login']);
            return false;
        })
    );
};
