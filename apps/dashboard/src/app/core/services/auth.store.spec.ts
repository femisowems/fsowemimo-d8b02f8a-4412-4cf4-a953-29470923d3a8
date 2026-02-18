import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { AuthStore } from './auth.store';
import { SupabaseService } from './supabase.service';
import { User, UserRole } from '../models';
import { environment } from '../../../environments/environment';

describe('AuthStore', () => {
    let store: AuthStore;
    let httpMock: HttpTestingController;
    let supabaseMock: any;

    const mockUser: User = {
        id: '1',
        email: 'test@example.com',
        role: UserRole.ADMIN,
        organizationId: 'org1',
        name: 'Test User'
    };

    beforeEach(() => {
        supabaseMock = {
            auth: {
                getSession: jest.fn().mockResolvedValue({ data: { session: null }, error: null }),
                onAuthStateChange: jest.fn().mockReturnValue({ data: { subscription: { unsubscribe: jest.fn() } } }),
                signOut: jest.fn().mockResolvedValue({ error: null })
            }
        };

        TestBed.configureTestingModule({
            providers: [
                AuthStore,
                { provide: SupabaseService, useValue: supabaseMock },
                provideHttpClient(),
                provideHttpClientTesting(),
                provideRouter([])
            ]
        });

        store = TestBed.inject(AuthStore);
        httpMock = TestBed.inject(HttpTestingController);
    });

    afterEach(() => {
        if (httpMock) {
            httpMock.verify();
        }
    });

    it('should be created', () => {
        expect(store).toBeTruthy();
    });

    it('should fetch profile when session exists', async () => {
        // Re-initialize with session
        const sessionMock = { access_token: 'token123' };
        supabaseMock.auth.getSession.mockResolvedValueOnce({ data: { session: sessionMock }, error: null });

        // Manual trigger of init for test purposes if needed, 
        // but constructor calls init. In real scenario, we'd mock before inject.
        // However, since we mock provide in TestBed, constructor already ran.

        // Let's test fetchProfile directly since init is async and ran at construction
        const fetchPromise = store.fetchProfile();
        const req = httpMock.expectOne(`${environment.apiUrl}/auth/me`);
        req.flush(mockUser);
        await fetchPromise;

        expect(store.user()).toEqual(mockUser);
        expect(store.isAuthenticated()).toBe(true);
    });

    it('should handle logout', async () => {
        await store.logout();
        expect(supabaseMock.auth.signOut).toHaveBeenCalled();
        expect(store.user()).toBeNull();
        expect(store.token()).toBeNull();
    });

    it('should update user state locally', () => {
        // Set initial user
        (store as any)._user.set(mockUser);

        store.updateUser({ name: 'Updated Name' });
        expect(store.user()?.name).toBe('Updated Name');
    });
});
