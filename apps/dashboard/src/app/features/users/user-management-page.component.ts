import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { LucideAngularModule } from 'lucide-angular';
import { UserManagementService, OrgUser } from '@fsowemimo-d8b02f8a-4412-4cf4-a953-29470923d3a8/services';
import { UserRole } from '@fsowemimo-d8b02f8a-4412-4cf4-a953-29470923d3a8/models';
import { AuthStore } from '@fsowemimo-d8b02f8a-4412-4cf4-a953-29470923d3a8/state';

@Component({
  selector: 'app-user-management',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, LucideAngularModule],
  template: `
    <div class="max-w-8xl mx-auto space-y-6">
      <div class="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h1 class="text-h1 font-bold text-text-primary">User Management</h1>
          <p class="text-sm text-text-secondary mt-1">
            Manage users in your organization (Admin only)
          </p>
        </div>

        <button
          type="button"
          (click)="showAddUserModal.set(true)"
          class="inline-flex items-center gap-2 px-4 h-10 rounded-xl bg-indigo-600 text-white text-sm font-semibold hover:bg-indigo-700 transition-colors"
        >
          <lucide-icon name="user-plus" [size]="18" aria-hidden="true"></lucide-icon>
          Add User
        </button>
      </div>

      @if (userMgmtService.isLoading()) {
        <div class="text-center py-20 text-text-secondary space-y-3">
          <div class="inline-flex items-center gap-2">
            <span
              class="inline-block h-4 w-4 rounded-full border-2 border-slate-300 border-t-indigo-500 animate-spin"
              aria-hidden="true"
            ></span>
            Loading users...
          </div>
        </div>
      } @else if (userMgmtService.error()) {
        <div class="text-center py-20 bg-red-50 backdrop-blur-md rounded-card border border-red-200 text-red-700">
          {{ userMgmtService.error() }}
        </div>
      } @else if (users().length === 0) {
        <div
          class="text-center py-20 bg-surface-glass backdrop-blur-md rounded-card border border-border-subtle text-text-secondary"
        >
          No users found in your organization.
        </div>
      } @else {
        <div class="bg-surface-glass backdrop-blur-md shadow-sm border border-border-subtle rounded-card overflow-hidden">
          <div class="overflow-x-auto">
            <table class="min-w-full divide-y divide-border-subtle">
              <thead class="bg-gray-50/50 dark:bg-slate-900/30">
                <tr>
                  <th class="px-grid-lg py-grid-md text-left text-caption font-bold text-text-secondary uppercase tracking-wider">
                    User
                  </th>
                  <th class="px-grid-lg py-grid-md text-left text-caption font-bold text-text-secondary uppercase tracking-wider">
                    Role
                  </th>
                  <th class="px-grid-lg py-grid-md text-left text-caption font-bold text-text-secondary uppercase tracking-wider">
                    MFA
                  </th>
                  <th class="px-grid-lg py-grid-md text-left text-caption font-bold text-text-secondary uppercase tracking-wider">
                    Verification
                  </th>
                  <th class="px-grid-lg py-grid-md text-left text-caption font-bold text-text-secondary uppercase tracking-wider">
                    Created
                  </th>
                  <th class="px-grid-lg py-grid-md text-right text-caption font-bold text-text-secondary uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody class="divide-y divide-border-subtle">
                @for (user of users(); track user.id) {
                  <tr class="hover:bg-gray-50/50 dark:hover:bg-slate-800/50 transition-colors">
                    <td class="px-grid-lg py-grid-md">
                      <div>
                        <div class="text-body-sm font-medium text-text-primary">
                          {{ user.name || 'Unnamed User' }}
                          @if (user.id === currentUserId()) {
                            <span class="ml-2 text-xs text-indigo-600 font-semibold">(You)</span>
                          }
                        </div>
                        <div class="text-xs text-text-secondary">{{ user.email }}</div>
                      </div>
                    </td>
                    <td class="px-grid-lg py-grid-md">
                      @if (editingUserId() === user.id) {
                        <select
                          [ngModel]="editingRole()"
                          (ngModelChange)="editingRole.set($event)"
                          class="h-8 rounded-lg border border-border-subtle bg-white dark:bg-slate-800 px-2 text-sm"
                        >
                          <option [value]="UserRole.ADMIN">Admin</option>
                          <option [value]="UserRole.OWNER">Owner</option>
                          <option [value]="UserRole.VIEWER">Viewer</option>
                        </select>
                      } @else {
                        <span
                          class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
                          [ngClass]="getRoleBadgeClass(user.role)"
                        >
                          {{ user.role }}
                        </span>
                      }
                    </td>
                    <td class="px-grid-lg py-grid-md">
                      @if (user.mfaEnabled) {
                        <span class="inline-flex items-center text-green-600 text-xs">
                          <lucide-icon name="shield-check" [size]="14" class="mr-1" aria-hidden="true"></lucide-icon>
                          Enabled
                        </span>
                      } @else {
                        <span class="text-text-secondary text-xs">Disabled</span>
                      }
                    </td>
                    <td class="px-grid-lg py-grid-md">
                      <span
                        class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
                        [ngClass]="getVerificationBadgeClass(user.emailVerified)"
                      >
                        {{ user.emailVerified ? 'Verified' : 'Pending' }}
                      </span>
                    </td>
                    <td class="px-grid-lg py-grid-md text-body-sm text-text-secondary">
                      {{ user.createdAt | date: 'short' }}
                    </td>
                    <td class="px-grid-lg py-grid-md text-right">
                      <div class="relative inline-block" data-user-menu>
                        <button
                          type="button"
                          (click)="openMenuUserId() === user.id ? openMenuUserId.set(null) : openMenuUserId.set(user.id)"
                          class="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                          title="More actions"
                        >
                          <lucide-icon name="more-vertical" [size]="16" aria-hidden="true"></lucide-icon>
                        </button>

                        @if (openMenuUserId() === user.id) {
                          <div class="absolute right-0 mt-1 w-48 bg-white dark:bg-slate-800 rounded-lg shadow-lg border border-border-subtle z-10">
                            <!-- Edit User Option -->
                            <button
                              type="button"
                              (click)="openEditUserModal(user); openMenuUserId.set(null)"
                              [disabled]="user.id === currentUserId()"
                              class="w-full text-left px-4 py-2 text-sm text-text-primary hover:bg-slate-50 dark:hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed first:rounded-t-lg transition-colors flex items-center gap-2"
                            >
                              <lucide-icon name="pencil" [size]="14" aria-hidden="true" class="text-slate-400"></lucide-icon>
                              Edit User
                            </button>

                            <!-- Verify Email Option -->
                            @if (!user.emailVerified) {
                              <button
                                type="button"
                                (click)="verifyUser(user.id); openMenuUserId.set(null)"
                                [disabled]="isVerifyingUserId() === user.id"
                                class="w-full text-left px-4 py-2 text-sm text-text-primary hover:bg-slate-50 dark:hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
                              >
                                <lucide-icon name="shield-check" [size]="14" aria-hidden="true" class="text-emerald-500"></lucide-icon>
                                {{ isVerifyingUserId() === user.id ? 'Verifying...' : 'Verify Email' }}
                              </button>
                            }

                            <!-- Delete User Option -->
                            <button
                              type="button"
                              (click)="confirmDelete(user); openMenuUserId.set(null)"
                              [disabled]="user.id === currentUserId()"
                              class="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 disabled:opacity-50 disabled:cursor-not-allowed last:rounded-b-lg transition-colors flex items-center gap-2"
                            >
                              <lucide-icon name="trash-2" [size]="14" aria-hidden="true" class="text-red-500"></lucide-icon>
                              Delete User
                            </button>
                          </div>
                        }
                      </div>
                    </td>
                  </tr>
                }
              </tbody>
            </table>
          </div>
        </div>
      }
    </div>

    <!-- Add User Modal -->
    @if (showAddUserModal()) {
      <div
        class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
        (click)="closeAddUserModal()"
      >
        <div
          class="bg-white dark:bg-slate-800 rounded-card shadow-xl max-w-md w-full p-6"
          (click)="$event.stopPropagation()"
        >
          <h2 class="text-xl font-bold text-text-primary mb-4">Add New User</h2>
          <form [formGroup]="addUserForm" (ngSubmit)="submitAddUser()">
            <div class="space-y-4">
              <div>
                <label class="block text-sm font-medium text-text-primary mb-1">
                  Email <span class="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  formControlName="email"
                  class="w-full px-3 h-10 rounded-xl border border-border-subtle bg-white dark:bg-slate-800 text-sm text-text-primary"
                  placeholder="user@example.com"
                />
              </div>

              <div>
                <label class="block text-sm font-medium text-text-primary mb-1">Name</label>
                <input
                  type="text"
                  formControlName="name"
                  class="w-full px-3 h-10 rounded-xl border border-border-subtle bg-white dark:bg-slate-800 text-sm text-text-primary"
                  placeholder="John Doe"
                />
              </div>

              <div>
                <label class="block text-sm font-medium text-text-primary mb-1">
                  Role <span class="text-red-500">*</span>
                </label>
                <select
                  formControlName="role"
                  class="w-full px-3 h-10 rounded-xl border border-border-subtle bg-white dark:bg-slate-800 text-sm text-text-primary"
                >
                  <option [value]="UserRole.VIEWER">Viewer</option>
                  <option [value]="UserRole.OWNER">Owner</option>
                  <option [value]="UserRole.ADMIN">Admin</option>
                </select>
              </div>

              @if (addUserError()) {
                <div class="text-sm text-red-600 bg-red-50 dark:bg-red-900/20 p-3 rounded-lg">
                  {{ addUserError() }}
                </div>
              }

              <div class="flex gap-3 mt-6">
                <button
                  type="button"
                  (click)="closeAddUserModal()"
                  class="flex-1 px-4 h-10 rounded-xl border border-border-subtle text-sm font-semibold text-text-primary hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  [disabled]="addUserForm.invalid || isAddingUser()"
                  class="flex-1 px-4 h-10 rounded-xl bg-indigo-600 text-white text-sm font-semibold hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {{ isAddingUser() ? 'Adding...' : 'Add User' }}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    }

    <!-- Delete Confirmation Modal -->
    @if (showDeleteModal()) {
      <div
        class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
        (click)="closeDeleteModal()"
      >
        <div
          class="bg-white dark:bg-slate-800 rounded-card shadow-xl max-w-md w-full p-6"
          (click)="$event.stopPropagation()"
        >
          <h2 class="text-xl font-bold text-text-primary mb-2">Delete User</h2>
          <p class="text-sm text-text-secondary mb-4">
            Are you sure you want to delete <strong>{{ userToDelete()?.email }}</strong>?
            This action cannot be undone.
          </p>

          @if (deleteError()) {
            <div class="text-sm text-red-600 bg-red-50 dark:bg-red-900/20 p-3 rounded-lg mb-4">
              {{ deleteError() }}
            </div>
          }

          <div class="flex gap-3">
            <button
              type="button"
              (click)="closeDeleteModal()"
              class="flex-1 px-4 h-10 rounded-xl border border-border-subtle text-sm font-semibold text-text-primary hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              (click)="executeDelete()"
              [disabled]="isDeleting()"
              class="flex-1 px-4 h-10 rounded-xl bg-red-600 text-white text-sm font-semibold hover:bg-red-700 transition-colors disabled:opacity-50"
            >
              {{ isDeleting() ? 'Deleting...' : 'Delete' }}
            </button>
          </div>
        </div>
      </div>
    }

    <!-- Edit User Modal -->
    @if (showEditModal()) {
      <div
        class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
        (click)="closeEditModal()"
      >
        <div
          class="bg-white dark:bg-slate-800 rounded-card shadow-xl max-w-md w-full p-6"
          (click)="$event.stopPropagation()"
        >
          <h2 class="text-xl font-bold text-text-primary mb-4">Edit User</h2>
          <div class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-text-primary mb-1">
                Name
              </label>
              <input
                type="text"
                [(ngModel)]="editingName"
                class="w-full px-3 h-10 rounded-xl border border-border-subtle bg-white dark:bg-slate-800 text-sm text-text-primary"
                placeholder="User name"
              />
            </div>

            <div>
              <label class="block text-sm font-medium text-text-primary mb-1">
                Role
              </label>
              <select
                [(ngModel)]="editingRole"
                class="w-full px-3 h-10 rounded-xl border border-border-subtle bg-white dark:bg-slate-800 text-sm text-text-primary"
              >
                <option [value]="UserRole.VIEWER">Viewer</option>
                <option [value]="UserRole.OWNER">Owner</option>
                <option [value]="UserRole.ADMIN">Admin</option>
              </select>
            </div>
          </div>

          <div class="flex gap-3 mt-6">
            <button
              type="button"
              (click)="closeEditModal()"
              class="flex-1 px-4 h-10 rounded-xl border border-border-subtle text-sm font-semibold text-text-primary hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              (click)="saveUserChanges()"
              [disabled]="isSavingRole()"
              class="flex-1 px-4 h-10 rounded-xl bg-indigo-600 text-white text-sm font-semibold hover:bg-indigo-700 transition-colors disabled:opacity-50"
            >
              {{ isSavingRole() ? 'Saving...' : 'Save Changes' }}
            </button>
          </div>
        </div>
      </div>
    }
  `,
})
export class UserManagementPageComponent implements OnInit {
  private fb = inject(FormBuilder);
  public userMgmtService = inject(UserManagementService);
  private authStore = inject(AuthStore);

  UserRole = UserRole;

  users = this.userMgmtService.users;
  currentUserId = computed(() => this.authStore.user()?.id || '');

  showAddUserModal = signal(false);
  showDeleteModal = signal(false);
  showEditModal = signal(false);
  editingUserId = signal<string | null>(null);
  editingRole = signal<UserRole>(UserRole.VIEWER);
  editingName = signal<string>('');
  userToDelete = signal<OrgUser | null>(null);
  openMenuUserId = signal<string | null>(null);
  editingNameUserId = signal<string | null>(null);
  editingNameValue = signal<string>('');

  isAddingUser = signal(false);
  isSavingRole = signal(false);
  isSavingName = signal(false);
  isDeleting = signal(false);
  isVerifyingUserId = signal<string | null>(null);
  addUserError = signal<string | null>(null);
  deleteError = signal<string | null>(null);

  addUserForm = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    name: [''],
    role: [UserRole.VIEWER, Validators.required],
  });

  ngOnInit() {
    this.userMgmtService.loadUsers().subscribe();
    
    // Close dropdown menu when clicking outside
    document.addEventListener('click', (event) => {
      const target = event.target as HTMLElement;
      if (!target.closest('[data-user-menu]')) {
        this.openMenuUserId.set(null);
      }
    });
  }

  closeAddUserModal() {
    this.showAddUserModal.set(false);
    this.addUserForm.reset({ role: UserRole.VIEWER });
    this.addUserError.set(null);
  }

  submitAddUser() {
    if (this.addUserForm.invalid) return;

    this.isAddingUser.set(true);
    this.addUserError.set(null);

    const formValue = this.addUserForm.value;
    this.userMgmtService
      .createUser({
        email: formValue.email!,
        name: formValue.name || undefined,
        role: formValue.role!,
      })
      .subscribe({
        next: () => {
          this.isAddingUser.set(false);
          this.closeAddUserModal();
        },
        error: (err) => {
          this.addUserError.set(err.error?.message || 'Failed to add user');
          this.isAddingUser.set(false);
        },
      });
  }

  startRoleEdit(user: OrgUser) {
    this.editingUserId.set(user.id);
    this.editingRole.set(user.role);
  }

  cancelRoleEdit() {
    this.editingUserId.set(null);
  }

  saveRoleChange(userId: string) {
    this.isSavingRole.set(true);
    this.userMgmtService.updateUserRole(userId, this.editingRole()).subscribe({
      next: () => {
        this.isSavingRole.set(false);
        this.editingUserId.set(null);
      },
      error: (err) => {
        alert(err.error?.message || 'Failed to update role');
        this.isSavingRole.set(false);
      },
    });
  }

  openEditUserModal(user: OrgUser) {
    this.editingUserId.set(user.id);
    this.editingName.set(user.name || '');
    this.editingRole.set(user.role);
    this.showEditModal.set(true);
  }

  closeEditModal() {
    this.showEditModal.set(false);
    this.editingUserId.set(null);
    this.editingName.set('');
    this.editingRole.set(UserRole.VIEWER);
  }

  saveUserChanges() {
    const userId = this.editingUserId();
    if (!userId) return;

    const name = this.editingName().trim();
    if (!name) {
      alert('Name cannot be empty');
      return;
    }

    this.isSavingRole.set(true);

    // Save name and role together
    this.userMgmtService.updateUserName(userId, name).subscribe({
      next: () => {
        // Then update role
        this.userMgmtService.updateUserRole(userId, this.editingRole()).subscribe({
          next: () => {
            this.isSavingRole.set(false);
            this.closeEditModal();
          },
          error: (err) => {
            alert(err.error?.message || 'Failed to update role');
            this.isSavingRole.set(false);
          },
        });
      },
      error: (err) => {
        alert(err.error?.message || 'Failed to update name');
        this.isSavingRole.set(false);
      },
    });
  }

  confirmDelete(user: OrgUser) {
    this.userToDelete.set(user);
    this.showDeleteModal.set(true);
    this.deleteError.set(null);
  }

  closeDeleteModal() {
    this.showDeleteModal.set(false);
    this.userToDelete.set(null);
    this.deleteError.set(null);
  }

  executeDelete() {
    const user = this.userToDelete();
    if (!user) return;

    this.isDeleting.set(true);
    this.deleteError.set(null);

    this.userMgmtService.deleteUser(user.id).subscribe({
      next: () => {
        this.isDeleting.set(false);
        this.closeDeleteModal();
      },
      error: (err) => {
        this.deleteError.set(err.error?.message || 'Failed to delete user');
        this.isDeleting.set(false);
      },
    });
  }

  verifyUser(userId: string) {
    this.isVerifyingUserId.set(userId);
    this.userMgmtService.setUserVerification(userId, true).subscribe({
      next: () => {
        this.isVerifyingUserId.set(null);
      },
      error: (err) => {
        alert(err.error?.message || 'Failed to verify user');
        this.isVerifyingUserId.set(null);
      },
    });
  }

  getRoleBadgeClass(role: UserRole): string {
    switch (role) {
      case UserRole.ADMIN:
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300';
      case UserRole.OWNER:
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300';
      case UserRole.VIEWER:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  }

  getVerificationBadgeClass(verified: boolean): string {
    return verified
      ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300'
      : 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300';
  }
}
