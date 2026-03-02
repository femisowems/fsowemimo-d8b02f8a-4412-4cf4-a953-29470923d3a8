import { Component, inject, signal, OnInit, effect } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthStore } from '../../../core/services/auth.store';
import { SupabaseService } from '../../../core/services/supabase.service';

@Component({
  selector: 'app-login-page',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  template: `
    <div class="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 px-4">
      <!-- Dev Credentials Panel -->
        <div class="fixed bottom-4 right-4 max-w-xs bg-amber-50 border border-amber-200 rounded-lg p-grid-md shadow-lg text-xs z-50">
          <h3 class="font-bold text-amber-800 mb-2 uppercase tracking-wider">Login Test Credentials</h3>
          <div class="space-y-grid-sm text-left">
            <div>
              <span class="font-semibold block text-amber-900/70 mb-1">Admin (Owner):</span>
              <code class="bg-amber-100/50 px-grid-xs py-0.5 rounded border border-amber-200/50">admin&#64;test.com</code>
              <span class="mx-1">/</span>
              <code class="bg-amber-100/50 px-grid-xs py-0.5 rounded border border-amber-200/50">password123</code>
            </div>
            <div>
              <span class="font-semibold block text-amber-900/70 mb-1">User (Viewer):</span>
              <code class="bg-amber-100/50 px-grid-xs py-0.5 rounded border border-amber-200/50">user&#64;test.com</code>
              <span class="mx-1">/</span>
              <code class="bg-amber-100/50 px-grid-xs py-0.5 rounded border border-amber-200/50">password123</code>
            </div>
          </div>
        </div>

      <!-- Auth Card -->
      <div class="w-full max-w-md bg-white/80 backdrop-blur-md border border-slate-200 rounded-2xl shadow-xl p-grid-xl md:p-10 space-y-grid-lg">
        <div class="text-center space-y-grid-xs">
          <h2 class="text-2xl font-semibold tracking-tight text-slate-900">Sign in to your account</h2>
          <p class="text-sm text-slate-500">
            Secure Task Management App
          </p>
        </div>
        
        <form class="space-y-grid-lg" [formGroup]="loginForm" (ngSubmit)="onSubmit()">
          <div class="space-y-grid-md">
            <div class="space-y-grid-xs">
              <label for="email-address" class="text-sm font-medium text-slate-700">Email address</label>
              <input formControlName="email" id="email-address" name="email" type="email" autocomplete="email" required 
                class="w-full h-11 px-grid-md rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm transition-all" 
                placeholder="name@example.com"
                [attr.aria-invalid]="loginForm.get('email')?.invalid && loginForm.get('email')?.touched">
            </div>
            <div class="space-y-grid-xs">
              <label for="password" class="text-sm font-medium text-slate-700">Password</label>
              <input formControlName="password" id="password" name="password" type="password" autocomplete="current-password" required 
                class="w-full h-11 px-grid-md rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm transition-all" 
                placeholder="••••••••"
                [attr.aria-invalid]="loginForm.get('password')?.invalid && loginForm.get('password')?.touched">
            </div>
          </div>

          @if (error()) {
            <div class="bg-red-50 border border-red-100 text-red-600 text-xs py-grid-sm px-grid-md rounded-md text-center animate-in fade-in slide-in-from-top-1">
              {{ error() }}
            </div>
          }

          <div class="space-y-grid-lg">
            <button type="submit" [disabled]="isLoading()"
              class="w-full h-11 rounded-lg bg-indigo-600 text-white font-medium hover:bg-indigo-700 transition-all focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed">
              {{ isLoading() ? 'Signing in...' : 'Sign in' }}
            </button>

            <p class="text-sm text-slate-600 text-center">
              Don't have an account? 
              <a routerLink="/signup" class="text-indigo-600 hover:underline font-medium transition-colors">
                Sign up
              </a>
            </p>
          </div>
        </form>
      </div>
    </div>
  `,
  styles: [`
    :host { display: block; }
  `]
})
export class LoginPageComponent implements OnInit {
  private fb = inject(FormBuilder);
  private authStore = inject(AuthStore);
  private supabase = inject(SupabaseService);
  private router = inject(Router);


  constructor() {
    effect(() => {
      if (this.authStore.isAuthenticated() && !this.authStore.isLoading()) {
        this.router.navigate(['/dashboard/tasks']);
      }
    });
  }

  ngOnInit() {
    // Initial check is handled by the effect, but we can keep a secondary check here for safety
    if (this.authStore.isAuthenticated()) {
      this.router.navigate(['/dashboard/tasks']);
    }
  }

  loginForm = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required]]
  });

  isLoading = signal(false);
  error = signal('');

  async onSubmit() {
    if (this.loginForm.invalid) return;

    try {
      this.isLoading.set(true);
      this.error.set('');

      const { email, password } = this.loginForm.value;
      const { error } = await this.supabase.auth.signInWithPassword({
        email: email as string,
        password: password as string
      });

      if (error) throw error;

      // AuthStore will automatically pick up the session change
      this.router.navigate(['/dashboard/tasks']);
    } catch (err: unknown) {
      this.error.set((err as Error).message || 'Failed to login');
    } finally {
      this.isLoading.set(false);
    }
  }
}
