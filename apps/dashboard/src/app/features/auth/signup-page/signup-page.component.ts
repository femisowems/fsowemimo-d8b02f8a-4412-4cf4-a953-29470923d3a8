import { Component, inject, signal, OnInit, effect } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthStore } from '@secure-task-management/state';
import { SupabaseService } from '@secure-task-management/services';
import { UserRole } from '@secure-task-management/models';
import { LucideAngularModule } from 'lucide-angular';

@Component({
  selector: 'app-signup-page',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink, LucideAngularModule],
  template: `
    <div
      class="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 px-4"
    >
      <!-- Auth Card -->
      <div
        class="w-full max-w-md bg-white/80 backdrop-blur-md border border-slate-200 rounded-2xl shadow-xl p-grid-xl md:p-10 space-y-grid-lg"
      >
        <div class="text-center space-y-grid-xs">
          <h2 class="text-2xl font-semibold tracking-tight text-slate-900">
            Create your account
          </h2>
          <p class="text-sm text-slate-500">Secure Task Management App</p>
        </div>

        <form
          class="space-y-grid-lg"
          [formGroup]="signupForm"
          (ngSubmit)="onSubmit()"
        >
          <div class="space-y-grid-md">
            <div class="space-y-grid-xs">
              <label
                for="email-address"
                class="text-sm font-medium text-slate-700"
                >Email address</label
              >
              <input
                formControlName="email"
                id="email-address"
                name="email"
                type="email"
                autocomplete="email"
                required
                class="w-full h-11 px-grid-md rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-brand-primary/40 focus:border-brand-primary text-sm transition-all"
                placeholder="name@example.com"
                [attr.aria-invalid]="
                  signupForm.get('email')?.invalid &&
                  signupForm.get('email')?.touched
                "
              />
            </div>
            <div class="space-y-grid-xs">
              <label for="password" class="text-sm font-medium text-slate-700"
                >Password</label
              >
              <input
                formControlName="password"
                id="password"
                name="password"
                type="password"
                autocomplete="new-password"
                required
                class="w-full h-11 px-grid-md rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-brand-primary/40 focus:border-brand-primary text-sm transition-all"
                placeholder="••••••••"
                [attr.aria-invalid]="
                  signupForm.get('password')?.invalid &&
                  signupForm.get('password')?.touched
                "
              />
            </div>
            <div class="space-y-grid-xs">
              <label for="role" class="text-sm font-medium text-slate-700"
                >User Role</label
              >
              <select
                formControlName="role"
                id="role"
                name="role"
                required
                class="w-full h-11 px-grid-md rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm transition-all bg-white"
              >
                @for (role of roles; track role) {
                  <option [value]="role">{{ role }}</option>
                }
              </select>
            </div>
          </div>

          @if (error()) {
            <div
              class="flex items-center gap-3 bg-red-50 border border-red-100 text-red-600 text-xs font-semibold py-3 px-4 rounded-xl animate-in fade-in slide-in-from-top-2"
            >
              <lucide-icon name="shield-alert" [size]="16"></lucide-icon>
              <span>{{ error() }}</span>
            </div>
          }

          @if (success()) {
            <div
              class="flex items-center gap-3 bg-green-50 border border-green-100 text-green-700 text-xs font-semibold py-4 px-4 rounded-xl animate-in fade-in slide-in-from-top-2"
            >
              <lucide-icon name="check-circle-2" [size]="20" class="text-green-600"></lucide-icon>
              <div>
                <p class="font-bold">Signup successful!</p>
                <p class="mt-0.5">Please <a routerLink="/login" class="underline decoration-2 underline-offset-2">sign in</a> to continue.</p>
              </div>
            </div>
          }

          <div class="space-y-grid-lg">
            <button
              type="submit"
              [disabled]="isLoading() || success()"
              class="w-full h-11 rounded-lg bg-brand-gradient text-white font-bold hover:opacity-90 transition-all shadow-lg shadow-brand-primary/20 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {{ isLoading() ? 'Creating account...' : 'Create Account' }}
            </button>

            <p class="text-sm text-slate-600 text-center">
              Already have an account?
              <a
                routerLink="/login"
                class="text-brand-primary hover:underline font-bold transition-colors"
              >
                Sign in
              </a>
            </p>
          </div>
        </form>
      </div>
    </div>
  `,
  styles: [
    `
      :host {
        display: block;
      }
    `,
  ],
})
export class SignupPageComponent implements OnInit {
  private fb = inject(FormBuilder);
  private authStore = inject(AuthStore);
  private supabase = inject(SupabaseService);
  private router = inject(Router);

  roles = [UserRole.OWNER, UserRole.VIEWER];

  constructor() {
    effect(() => {
      if (this.authStore.isAuthenticated() && !this.authStore.isLoading()) {
        this.router.navigate(['/dashboard/tasks']);
      }
    });
  }

  ngOnInit() {
    if (this.authStore.isAuthenticated()) {
      this.router.navigate(['/dashboard/tasks']);
    }
  }

  signupForm = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]],
    role: [UserRole.OWNER, [Validators.required]],
  });

  isLoading = signal(false);
  error = signal('');
  success = signal(false);

  async onSubmit() {
    if (this.signupForm.invalid) return;

    try {
      this.isLoading.set(true);
      this.error.set('');

      const { email, password, role } = this.signupForm.value;
      if (!email || !password || !role) {
        this.error.set('Email, password, and role are required');
        return;
      }

      // Auto-generate a new Organization ID for the user
      const organizationId = crypto.randomUUID();

      const { data, error } = await this.supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            organization_id: organizationId,
            role: role, // Use selected role
          },
        },
      });

      if (error) throw error;

      // Supabase returns a fake success for existing users if "Prevent user enumeration" is enabled.
      // We can detect this if the returned user has no identities (and email confirmation is on).
      if (
        data.user &&
        data.user.identities &&
        data.user.identities.length === 0
      ) {
        throw new Error('User already registered');
      }

      this.success.set(true);
    } catch (err: unknown) {
      this.error.set(err instanceof Error ? err.message : 'Failed to sign up');
    } finally {
      this.isLoading.set(false);
    }
  }
}
