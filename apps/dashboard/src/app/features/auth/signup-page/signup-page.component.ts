import { Component, inject, signal, OnInit, effect } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthStore } from '../../../core/services/auth.store';
import { SupabaseService } from '../../../core/services/supabase.service';

@Component({
  selector: 'app-signup-page',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  template: `
    <div class="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 px-4">
      <!-- Auth Card -->
      <div class="w-full max-w-md bg-white/80 backdrop-blur-md border border-slate-200 rounded-2xl shadow-xl p-grid-xl md:p-10 space-y-grid-lg">
        <div class="text-center space-y-grid-xs">
          <h2 class="text-2xl font-semibold tracking-tight text-slate-900">Create your account</h2>
          <p class="text-sm text-slate-500">
            Secure Task Management App
          </p>
        </div>
        
        <form class="space-y-grid-lg" [formGroup]="signupForm" (ngSubmit)="onSubmit()">
          <div class="space-y-grid-md">
            <div class="space-y-grid-xs">
              <label for="email-address" class="text-sm font-medium text-slate-700">Email address</label>
              <input formControlName="email" id="email-address" name="email" type="email" autocomplete="email" required 
                class="w-full h-11 px-grid-md rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm transition-all" 
                placeholder="name@example.com"
                [attr.aria-invalid]="signupForm.get('email')?.invalid && signupForm.get('email')?.touched">
            </div>
            <div class="space-y-grid-xs">
              <label for="password" class="text-sm font-medium text-slate-700">Password</label>
              <input formControlName="password" id="password" name="password" type="password" autocomplete="new-password" required 
                class="w-full h-11 px-grid-md rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm transition-all" 
                placeholder="••••••••"
                [attr.aria-invalid]="signupForm.get('password')?.invalid && signupForm.get('password')?.touched">
            </div>
            <div class="space-y-grid-xs">
              <label for="org-id" class="text-sm font-medium text-slate-700">Organization ID</label>
              <input formControlName="organizationId" id="org-id" name="organizationId" type="text" required 
                class="w-full h-11 px-grid-md rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm transition-all" 
                placeholder="e.g. org-1"
                [attr.aria-invalid]="signupForm.get('organizationId')?.invalid && signupForm.get('organizationId')?.touched">
            </div>
          </div>

          @if (error()) {
            <div class="bg-red-50 border border-red-100 text-red-600 text-xs py-grid-sm px-grid-md rounded-md text-center animate-in fade-in slide-in-from-top-1">
              {{ error() }}
            </div>
          }

          @if (success()) {
            <div class="bg-green-50 border border-green-100 text-green-700 text-xs py-grid-sm px-grid-md rounded-md text-center animate-in fade-in slide-in-from-top-1">
              Signup successful! Please <a routerLink="/login" class="font-bold underline">sign in</a>.
            </div>
          }

          <div class="space-y-grid-lg">
            <button type="submit" [disabled]="isLoading() || success()"
              class="w-full h-11 rounded-lg bg-indigo-600 text-white font-medium hover:bg-indigo-700 transition-all focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed">
              {{ isLoading() ? 'Creating account...' : 'Create Account' }}
            </button>

            <p class="text-sm text-slate-600 text-center">
              Already have an account? 
              <a routerLink="/login" class="text-indigo-600 hover:underline font-medium transition-colors">
                Sign in
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
export class SignupPageComponent implements OnInit {
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
    if (this.authStore.isAuthenticated()) {
      this.router.navigate(['/dashboard/tasks']);
    }
  }

  signupForm = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]],
    organizationId: ['', [Validators.required]]
  });

  isLoading = signal(false);
  error = signal('');
  success = signal(false);

  async onSubmit() {
    if (this.signupForm.invalid) return;

    try {
      this.isLoading.set(true);
      this.error.set('');

      const { email, password, organizationId } = this.signupForm.value;
      const { error } = await this.supabase.auth.signUp({
        email: email!,
        password: password!,
        options: {
          data: {
            organization_id: organizationId,
            role: 'Owner' // Default for new signups in this simplified version
          }
        }
      });

      if (error) throw error;

      this.success.set(true);
    } catch (err: any) {
      this.error.set(err.message || 'Failed to sign up');
    } finally {
      this.isLoading.set(false);
    }
  }
}
