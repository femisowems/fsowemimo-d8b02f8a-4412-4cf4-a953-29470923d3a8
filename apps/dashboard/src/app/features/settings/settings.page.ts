import { Component, computed, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators, FormGroup } from '@angular/forms';
import { LucideAngularModule } from 'lucide-angular';
import { AuthStore } from '../../core/services/auth.store';
import { UserRole } from '../../core/models';
import { SettingsService } from './settings.service';
import { SettingsTab, SettingsProfile, SettingsOrganization } from './settings.model';
import { SettingsPreferences } from '../../core/models';
import { ThemeService, Theme } from '../../core/services/theme.service';

@Component({
  selector: 'app-settings-page',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, LucideAngularModule],
  template: `
    <div class="h-full flex flex-col bg-slate-50">
      <!-- Header -->
      <header class="px-8 py-6 bg-white border-b border-gray-200">
        <h1 class="text-2xl font-bold text-gray-900">Settings</h1>
        <p class="text-sm text-gray-500 mt-1">Manage organization preferences, profile, and security</p>
      </header>

      <!-- Main Content -->
      <div class="flex-1 overflow-auto p-8">
        <div class="max-w-4xl mx-auto">
          
          <!-- Tabs -->
          <div class="mb-8 border-b border-gray-200">
            <nav class="-mb-px flex space-x-8 overflow-x-auto" aria-label="Tabs">
              @for (tab of tabs; track tab.id) {
                <button
                  (click)="activeTab.set(tab.id)"
                  [class.border-indigo-500]="activeTab() === tab.id"
                  [class.text-indigo-600]="activeTab() === tab.id"
                  [class.border-transparent]="activeTab() !== tab.id"
                  [class.text-gray-500]="activeTab() !== tab.id"
                  class="whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm hover:text-gray-700 hover:border-gray-300 transition-colors"
                  [attr.aria-current]="activeTab() === tab.id ? 'page' : null">
                  {{ tab.label }}
                </button>
              }
            </nav>
          </div>

          <!-- Content -->
          <div class="bg-white shadow rounded-lg p-6 min-h-[400px]">
            @if (isLoading()) {
              <div class="animate-pulse space-y-4">
                <div class="h-4 bg-gray-200 rounded w-1/4"></div>
                <div class="space-y-3">
                  <div class="h-10 bg-gray-200 rounded"></div>
                  <div class="h-10 bg-gray-200 rounded"></div>
                </div>
              </div>
            } @else {
              <!-- Profile Tab -->
              @if (activeTab() === 'profile') {
                <form [formGroup]="profileForm" (ngSubmit)="saveProfile()" class="space-y-6">
                  <div>
                    <label for="name" class="block text-sm font-medium text-gray-700">Full Name</label>
                    <input id="name" type="text" formControlName="name" class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm h-10 px-3 border">
                  </div>
                  <div>
                    <label for="email" class="block text-sm font-medium text-gray-700">Email</label>
                    <input id="email" type="email" formControlName="email" class="mt-1 block w-full rounded-md border-gray-300 bg-gray-50 shadow-sm sm:text-sm h-10 px-3 border text-gray-500" readonly>
                    <p class="mt-1 text-xs text-gray-500">Email is managed via Supabase auth provider.</p>
                  </div>
                   <div>
                    <span class="block text-sm font-medium text-gray-700">Role</span>
                     <div class="mt-1 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800 capitalize">
                      {{ profile()?.role }}
                    </div>
                     <p class="mt-1 text-xs text-gray-500">Your role determine access permissions across the workspace.</p>
                  </div>
                  
                  <div class="flex justify-end">
                    <button type="submit" [disabled]="profileForm.invalid || profileForm.pristine || isSaving()"
                      [class.bg-green-600]="isProfileSaved()"
                      [class.hover:bg-green-700]="isProfileSaved()"
                      class="ml-3 inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200">
                      @if (isProfileSaved()) {
                        <lucide-icon name="check" class="w-4 h-4 mr-2"></lucide-icon>
                        Saved!
                      } @else {
                        {{ isSaving() ? 'Saving...' : 'Save Profile' }}
                      }
                    </button>
                  </div>
                </form>
              }

              <!-- Organization Tab -->
              @if (activeTab() === 'organization') {
                 @if (canViewOrg()) {
                  <div class="space-y-6">
                    <div>
                      <span class="block text-sm font-medium text-gray-700">Organization ID</span>
                      <div class="mt-1 block w-full rounded-md border-gray-300 bg-gray-50 shadow-sm sm:text-sm h-10 px-3 border flex items-center text-gray-900 font-mono">
                         {{ organization()?.id }}
                      </div>
                      <p class="mt-1 text-xs text-gray-500">Unique identifier for your organization workspace.</p>
                    </div>
                  </div>
                 } @else {
                    <div class="text-center py-10 text-gray-500">You do not have permission to view organization settings.</div>
                 }
              }

              <!-- Security Tab -->
              @if (activeTab() === 'security') {
                @if (canViewSecurity()) {
                  <form [formGroup]="securityForm" (ngSubmit)="saveSecurity()" class="space-y-6">
                    <div class="flex items-center justify-between">
                      <div>
                        <h3 class="text-lg font-medium leading-6 text-gray-900">Multi-Factor Authentication</h3>
                        <p class="mt-1 text-sm text-gray-500">Protect your account with an extra layer of security.</p>
                      </div>
                      <div class="flex items-center">
                        <button type="button" 
                          (click)="toggleMfa()"
                          [class.bg-indigo-600]="securityForm.get('mfaEnabled')?.value"
                          [class.bg-gray-200]="!securityForm.get('mfaEnabled')?.value"
                          [disabled]="!canEditSecurity()"
                          class="relative inline-flex flex-shrink-0 h-6 w-11 border-2 border-transparent rounded-full cursor-pointer transition-colors ease-in-out duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50">
                          <span class="sr-only">Use setting</span>
                          <span aria-hidden="true" 
                            [class.translate-x-5]="securityForm.get('mfaEnabled')?.value"
                            [class.translate-x-0]="!securityForm.get('mfaEnabled')?.value"
                            class="pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow transform ring-0 transition ease-in-out duration-200"></span>
                        </button>
                      </div>
                    </div>

                    <div class="border-t border-gray-200 pt-6">
                      <label for="sessionTimeout" class="block text-sm font-medium text-gray-700">Session Timeout (minutes)</label>
                      <select id="sessionTimeout" formControlName="sessionTimeout" 
                        class="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md border h-10">
                        <option [value]="15">15 minutes</option>
                        <option [value]="30">30 minutes</option>
                        <option [value]="60">1 hour</option>
                        <option [value]="120">2 hours</option>
                      </select>
                    </div>

                    @if (canEditSecurity()) {
                      <div class="flex justify-end">
                        <button type="submit" [disabled]="securityForm.invalid || securityForm.pristine || isSaving()"
                           [class.bg-green-600]="isSecuritySaved()"
                           [class.hover:bg-green-700]="isSecuritySaved()"
                          class="ml-3 inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200">
                           @if (isSecuritySaved()) {
                            <lucide-icon name="check" class="w-4 h-4 mr-2"></lucide-icon>
                            Saved!
                          } @else {
                            {{ isSaving() ? 'Saving...' : 'Save Security' }}
                          }
                        </button>
                      </div>
                    } @else {
                       <div class="bg-yellow-50 border-l-4 border-yellow-400 p-4">
                        <div class="flex">
                          <div class="ml-3">
                            <p class="text-sm text-yellow-700">
                              Only Owners can edit security settings.
                            </p>
                          </div>
                        </div>
                      </div>
                    }
                  </form>
                } @else {
                   <div class="text-center py-10 text-gray-500">You do not have permission to view security settings.</div>
                }
              }

              <!-- Preferences Tab -->
               @if (activeTab() === 'preferences') {
                <form [formGroup]="preferencesForm" (ngSubmit)="savePreferences()" class="space-y-6">
                  <div>
                    <span id="theme-label" class="block text-sm font-medium text-gray-700">Theme</span>
                    <div class="mt-2 grid grid-cols-3 gap-3 sm:grid-cols-6" role="radiogroup" aria-labelledby="theme-label">
                      <label 
                        [class.ring-2]="preferencesForm.get('theme')?.value === 'light'"
                        [class.ring-indigo-500]="preferencesForm.get('theme')?.value === 'light'"
                        class="border rounded-md py-3 px-3 flex items-center justify-center text-sm font-medium sm:flex-1 cursor-pointer focus:outline-none hover:bg-gray-50">
                        <input type="radio" formControlName="theme" value="light" class="sr-only">
                        <span>Light</span>
                      </label>
                      <label 
                         [class.ring-2]="preferencesForm.get('theme')?.value === 'dark'"
                         [class.ring-indigo-500]="preferencesForm.get('theme')?.value === 'dark'"
                         class="border rounded-md py-3 px-3 flex items-center justify-center text-sm font-medium sm:flex-1 cursor-pointer focus:outline-none hover:bg-gray-50">
                        <input type="radio" formControlName="theme" value="dark" class="sr-only">
                        <span>Dark</span>
                      </label>
                       <label 
                         [class.ring-2]="preferencesForm.get('theme')?.value === 'system'"
                         [class.ring-indigo-500]="preferencesForm.get('theme')?.value === 'system'"
                         class="border rounded-md py-3 px-3 flex items-center justify-center text-sm font-medium sm:flex-1 cursor-pointer focus:outline-none hover:bg-gray-50">
                        <input type="radio" formControlName="theme" value="system" class="sr-only">
                        <span>System</span>
                      </label>
                    </div>
                  </div>

                  <div>
                     <label for="defaultView" class="block text-sm font-medium text-gray-700">Default Task View</label>
                     <select id="defaultView" formControlName="defaultView" 
                        class="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md border h-10">
                        <option value="kanban">Kanban Board</option>
                        <option value="list">List View</option>
                      </select>
                  </div>

                  <div>
                      <label for="itemsPerPage" class="block text-sm font-medium text-gray-700">Items Per Page</label>
                      <select id="itemsPerPage" formControlName="itemsPerPage" 
                         class="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md border h-10">
                         <option [value]="10">10 items</option>
                         <option [value]="20">20 items</option>
                         <option [value]="50">50 items</option>
                       </select>
                   </div>

                   <div class="flex justify-end">
                    <button type="submit" [disabled]="preferencesForm.invalid || preferencesForm.pristine || isSaving()"
                       [class.bg-green-600]="isPreferencesSaved()"
                       [class.hover:bg-green-700]="isPreferencesSaved()"
                      class="ml-3 inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200">
                       @if (isPreferencesSaved()) {
                        <lucide-icon name="check" class="w-4 h-4 mr-2"></lucide-icon>
                        Saved!
                      } @else {
                        {{ isSaving() ? 'Saving...' : 'Save Preferences' }}
                      }
                    </button>
                  </div>
                </form>
               }
            }
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    :host { display: block; height: 100%; }
  `]
})
export class SettingsPage implements OnInit {
  private fb = inject(FormBuilder);
  private settingsService = inject(SettingsService);
  private authStore = inject(AuthStore);
  private themeService = inject(ThemeService);

  // State Signals
  activeTab = signal<SettingsTab>('profile');
  isLoading = signal(true);
  isSaving = signal(false);
  isProfileSaved = signal(false);
  isSecuritySaved = signal(false);
  isPreferencesSaved = signal(false);
  profile = signal<SettingsProfile | null>(null);
  organization = signal<SettingsOrganization | null>(null);

  // User Role
  userRole = computed(() => this.authStore.user()?.role || UserRole.VIEWER);

  // Tabs Configuration
  tabs: { id: SettingsTab, label: string }[] = [
    { id: 'profile', label: 'Profile' },
    { id: 'organization', label: 'Organization' },
    { id: 'security', label: 'Security' },
    { id: 'preferences', label: 'Preferences' }
  ];

  // Forms
  profileForm: FormGroup = this.fb.group({
    name: ['', Validators.required],
    email: [{ value: '', disabled: true }]
  });

  orgForm: FormGroup = this.fb.group({
    name: ['', Validators.required],
    slug: [{ value: '', disabled: true }]
  });

  securityForm: FormGroup = this.fb.group({
    mfaEnabled: [false],
    sessionTimeout: [30, Validators.required]
  });

  preferencesForm: FormGroup = this.fb.group({
    theme: ['system'],
    defaultView: ['kanban'],
    itemsPerPage: [20]
  });

  constructor() {
    // React to tab changes if needed, or loading data
  }

  ngOnInit() {
    this.loadSettings();
  }

  loadSettings() {
    this.isLoading.set(true);
    this.settingsService.getSettings().subscribe({
      next: (settings) => {
        this.profile.set(settings.profile);
        this.profileForm.patchValue({
          name: settings.profile.name,
          email: settings.profile.email
        });
        this.organization.set(settings.organization);
        this.securityForm.patchValue(settings.security);
        this.preferencesForm.patchValue(settings.preferences);
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('Failed to load settings', err);
        this.isLoading.set(false);
      }
    });
  }

  // --- Permissions Helpers ---

  // Organization: Viewable by Owner/Admin/Viewer(maybe?), Edtiable by Owner/Admin
  canViewOrg() {
    return [UserRole.OWNER, UserRole.ADMIN, UserRole.VIEWER].includes(this.userRole());
  }

  // Security: Viewable by Owner, Editable by Owner
  canViewSecurity() {
    return [UserRole.OWNER].includes(this.userRole());
  }

  canEditSecurity() {
    return [UserRole.OWNER].includes(this.userRole());
  }

  // --- Actions ---

  saveProfile() {
    if (this.profileForm.invalid || !this.profile()) return;
    this.isSaving.set(true);
    const updatedProfile = {
      ...(this.profile() as SettingsProfile),
      name: this.profileForm.get('name')?.value
    };

    this.settingsService.updateProfile(updatedProfile).subscribe({
      next: (updated) => {
        this.profile.set(updated);
        this.profileForm.markAsPristine();
        this.isSaving.set(false);
        this.isProfileSaved.set(true);
        setTimeout(() => this.isProfileSaved.set(false), 2000);
      },
      error: () => this.isSaving.set(false)
    });
  }

  toggleMfa() {
    if (!this.canEditSecurity()) return;
    const current = this.securityForm.get('mfaEnabled')?.value;
    this.securityForm.patchValue({ mfaEnabled: !current });
    this.securityForm.markAsDirty();
  }

  saveSecurity() {
    if (this.securityForm.invalid) return;
    this.isSaving.set(true);
    this.settingsService.updateSecurity(this.securityForm.getRawValue()).subscribe({
      next: () => {
        this.securityForm.markAsPristine();
        this.isSaving.set(false);
        this.isSecuritySaved.set(true);
        setTimeout(() => this.isSecuritySaved.set(false), 2000);
      },
      error: () => this.isSaving.set(false)
    });
  }

  savePreferences() {
    if (this.preferencesForm.invalid) return;
    this.isSaving.set(true);
    const prefs = this.preferencesForm.getRawValue() as SettingsPreferences;
    this.settingsService.updatePreferences(prefs).subscribe({
      next: () => {
        this.themeService.setTheme(prefs.theme as Theme);
        this.preferencesForm.markAsPristine();
        this.isSaving.set(false);
        this.isPreferencesSaved.set(true);
        setTimeout(() => this.isPreferencesSaved.set(false), 2000);
      },
      error: () => this.isSaving.set(false)
    });
  }
}
