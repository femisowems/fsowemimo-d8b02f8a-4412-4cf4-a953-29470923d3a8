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
          class="inline-flex items-center gap-2 px-6 h-11 rounded-xl bg-brand-gradient text-white text-sm font-bold hover:opacity-90 transition-all shadow-lg shadow-brand-primary/20 active:scale-95"
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
        <div class="bg-surface-glass backdrop-blur-md shadow-sm border border-border-subtle rounded-card">
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
                        <div class="text-body-sm font-medium text-text-primary flex items-center gap-2">
                          {{ user.name || 'Unnamed User' }}
                          @if (user.id === currentUserId()) {
                            <span class="px-2 py-0.5 text-[10px] bg-brand-primary/10 text-brand-primary font-bold rounded-lg tracking-wide uppercase">You</span>
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
                      <div class="flex items-center justify-end gap-1">
                        <!-- Edit Action -->
                        <button
                          type="button"
                          (click)="openEditUserModal(user)"
                          [disabled]="user.id === currentUserId()"
                          class="p-2 text-slate-400 hover:text-brand-primary hover:bg-brand-primary/10 rounded-xl transition-all disabled:opacity-20 disabled:cursor-not-allowed group"
                          title="Edit User"
                        >
                          <lucide-icon name="pencil" [size]="16" class="group-hover:scale-110 transition-transform"></lucide-icon>
                        </button>

                        <!-- Verify Action -->
                        @if (!user.emailVerified) {
                          <button
                            type="button"
                            (click)="verifyUser(user.id)"
                            [disabled]="isVerifyingUserId() === user.id"
                            class="p-2 text-slate-400 hover:text-emerald-500 hover:bg-emerald-500/10 rounded-xl transition-all disabled:opacity-20 group"
                            [title]="isVerifyingUserId() === user.id ? 'Verifying...' : 'Verify Email'"
                          >
                            <lucide-icon 
                              [name]="isVerifyingUserId() === user.id ? 'loader-2' : 'shield-check'" 
                              [size]="16" 
                              [class.animate-spin]="isVerifyingUserId() === user.id"
                              class="group-hover:scale-110 transition-transform"
                            ></lucide-icon>
                          </button>
                        }

                        <!-- Delete Action -->
                        <button
                          type="button"
                          (click)="confirmDelete(user)"
                          [disabled]="user.id === currentUserId()"
                          class="p-2 text-slate-400 hover:text-red-500 hover:bg-red-500/10 rounded-xl transition-all disabled:opacity-20 disabled:cursor-not-allowed group"
                          title="Delete User"
                        >
                          <lucide-icon name="trash-2" [size]="16" class="group-hover:scale-110 transition-transform"></lucide-icon>
                        </button>
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
        (click)="onModalBackdropClick($event, 'add')"
        (keydown.escape)="closeAddUserModal()"
        (keyup.enter)="closeAddUserModal()"
        (keyup.space)="closeAddUserModal()"
        role="button"
        tabindex="0"
      >
        <div class="bg-white dark:bg-slate-800 rounded-card shadow-xl max-w-md w-full p-6">
          <h2 class="text-xl font-bold text-text-primary mb-4">Add New User</h2>
          <form [formGroup]="addUserForm" (ngSubmit)="submitAddUser()">
            <div class="space-y-4">
              <div>
                <label for="add-user-email" class="block text-sm font-medium text-text-primary mb-1">
                  Email <span class="text-red-500">*</span>
                </label>
                <input
                  id="add-user-email"
                  type="email"
                  formControlName="email"
                  class="w-full px-3 h-10 rounded-xl border border-border-subtle bg-white dark:bg-slate-800 text-sm text-text-primary"
                  placeholder="user@example.com"
                />
              </div>

              <div>
                <label for="add-user-name" class="block text-sm font-medium text-text-primary mb-1">Name</label>
                <input
                  id="add-user-name"
                  type="text"
                  formControlName="name"
                  class="w-full px-3 h-10 rounded-xl border border-border-subtle bg-white dark:bg-slate-800 text-sm text-text-primary"
                  placeholder="John Doe"
                />
              </div>

              <div>
                <label for="add-user-role" class="block text-sm font-medium text-text-primary mb-1">
                  Role <span class="text-red-500">*</span>
                </label>
                <select
                  id="add-user-role"
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
                  class="flex-1 px-4 h-11 rounded-xl bg-brand-gradient text-white text-sm font-bold shadow-lg shadow-brand-primary/20 hover:opacity-90 transition-all disabled:opacity-50 active:scale-95"
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
        (click)="onModalBackdropClick($event, 'delete')"
        (keydown.escape)="closeDeleteModal()"
        (keyup.enter)="closeDeleteModal()"
        (keyup.space)="closeDeleteModal()"
        role="button"
        tabindex="0"
      >
        <div class="bg-white dark:bg-slate-800 rounded-card shadow-xl max-w-md w-full p-6">
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
        (click)="onModalBackdropClick($event, 'edit')"
        (keydown.escape)="closeEditModal()"
        (keyup.enter)="closeEditModal()"
        (keyup.space)="closeEditModal()"
        role="button"
        tabindex="0"
      >
        <div class="bg-white dark:bg-slate-800 rounded-card shadow-xl max-w-md w-full p-6">
          <h2 class="text-xl font-bold text-text-primary mb-4">Edit User</h2>
          <div class="space-y-4">
            <div>
              <label for="edit-user-name" class="block text-sm font-medium text-text-primary mb-1">
                Name
              </label>
              <input
                id="edit-user-name"
                type="text"
                [(ngModel)]="editingName"
                class="w-full px-3 h-10 rounded-xl border border-border-subtle bg-white dark:bg-slate-800 text-sm text-text-primary"
                placeholder="User name"
              />
            </div>

            <div>
              <label for="edit-user-role" class="block text-sm font-medium text-text-primary mb-1">
                Role
              </label>
              <select
                id="edit-user-role"
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
              class="flex-1 px-4 h-11 rounded-xl bg-brand-gradient text-white text-sm font-bold shadow-lg shadow-brand-primary/20 hover:opacity-90 transition-all disabled:opacity-50 active:scale-95"
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
    if (!formValue.email || !formValue.role) {
      this.addUserError.set('Email and role are required');
      this.isAddingUser.set(false);
      return;
    }

    this.userMgmtService
      .createUser({
        email: formValue.email,
        name: formValue.name || undefined,
        role: formValue.role,
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

  onModalBackdropClick(event: MouseEvent, modal: 'add' | 'delete' | 'edit') {
    if (event.target !== event.currentTarget) {
      return;
    }

    switch (modal) {
      case 'add':
        this.closeAddUserModal();
        break;
      case 'delete':
        this.closeDeleteModal();
        break;
      case 'edit':
        this.closeEditModal();
        break;
    }
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
