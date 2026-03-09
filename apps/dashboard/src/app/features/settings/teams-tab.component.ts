import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { LucideAngularModule } from 'lucide-angular';
import { TeamsService } from './teams.service';
import { UserManagementService } from '@secure-task-management/services';
import { Team, UserRole } from '@secure-task-management/models';
import { AuthStore } from '@secure-task-management/state';

@Component({
  selector: 'app-teams-tab',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, LucideAngularModule],
  template: `
    <div class="space-y-6">
      <div class="flex items-center justify-between">
        <div>
          <h3 class="text-lg font-medium leading-6 text-gray-900">Teams</h3>
          <p class="mt-1 text-sm text-gray-500">Manage user groups in your organization.</p>
        </div>
        <button
          (click)="showCreateForm.set(!showCreateForm())"
          class="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none"
        >
          <lucide-icon name="plus" class="w-4 h-4 mr-2"></lucide-icon> Create Team
        </button>
      </div>

      <!-- Create Team Form -->
      @if (showCreateForm()) {
        <div class="bg-gray-50 p-4 border rounded-md">
          <form [formGroup]="createForm" (ngSubmit)="createTeam()" class="space-y-4">
            <div>
              <label for="name" class="block text-sm font-medium text-gray-700">Team Name</label>
              <input id="name" type="text" formControlName="name" class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm h-10 px-3 border" />
            </div>
            <div>
              <label for="description" class="block text-sm font-medium text-gray-700">Description</label>
              <input id="description" type="text" formControlName="description" class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm h-10 px-3 border" />
            </div>
            <div class="flex justify-end gap-2">
              <button type="button" (click)="showCreateForm.set(false)" class="px-4 py-2 whitespace-nowrap text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md">Cancel</button>
              <button type="submit" [disabled]="createForm.invalid" class="px-4 py-2 whitespace-nowrap text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md disabled:bg-indigo-400">Save</button>
            </div>
          </form>
        </div>
      }

      <!-- Teams List -->
      @if (isLoading()) {
        <div class="text-gray-500 text-sm py-4">Loading teams...</div>
      } @else if (teams().length === 0) {
        <div class="text-gray-500 text-sm py-4">No teams created.</div>
      } @else {
        <div class="grid gap-4 grid-cols-1 md:grid-cols-2">
          @for (team of teams(); track team.id) {
            <div class="border border-gray-200 rounded-lg p-4 bg-white shadow-sm flex flex-col">
              <div class="flex justify-between items-start">
                <div>
                  <h4 class="text-md font-semibold text-gray-900">{{ team.name }}</h4>
                  <p class="text-sm text-gray-500 mt-1 line-clamp-2 h-10">{{ team.description || 'No description provided.' }}</p>
                </div>
                <div class="bg-indigo-50 text-indigo-700 text-xs px-2 py-1 rounded-full font-medium shadow-sm border border-indigo-100 flex items-center gap-1">
                  <lucide-icon name="users" class="w-3 h-3"></lucide-icon>
                  {{ team.members.length }} members
                </div>
              </div>

              <!-- Fast Add Member -->
              <div class="mt-4 pt-4 border-t flex flex-col gap-2 relative">
                <p class="text-xs font-semibold text-gray-500 uppercase tracking-wider">Manage Members</p>
                
                <form [formGroup]="addMemberForm" (ngSubmit)="addMember(team.id)" class="flex gap-2">
                  <select formControlName="userId" class="flex-1 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm h-8 px-2 border appearance-none truncate">
                    <option value="" disabled>Select user...</option>
                    @for (user of organizationUsers(); track user.id) {
                      <option [value]="user.id">{{ user.name || user.email }}</option>
                    }
                  </select>
                  <button type="submit" [disabled]="addMemberForm.invalid || isAddingTo() === team.id" class="px-3 py-1 whitespace-nowrap text-xs font-medium text-white bg-indigo-600 border border-transparent rounded-md hover:bg-indigo-700 active:bg-indigo-800 disabled:bg-indigo-400 transition-colors shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-indigo-500 relative flex items-center justify-center min-w-[60px]">
                    @if(isAddingTo() === team.id) {
                      <lucide-icon name="loader" class="w-3 h-3 animate-spin absolute"></lucide-icon>
                    } @else {
                      <lucide-icon name="plus" class="w-3 h-3 mr-1"></lucide-icon> Add
                    }
                  </button>
                </form>

                <div class="mt-2 space-y-1 max-h-32 overflow-y-auto pr-1">
                  @for (member of team.members; track member.id) {
                    <div class="flex items-center justify-between text-sm py-1 border-b last:border-0 hover:bg-gray-50 px-1 rounded transition-colors group">
                      <div class="flex items-center gap-2 overflow-hidden">
                        <div class="w-6 h-6 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-[10px] font-bold shadow-sm flex-shrink-0">
                          {{ member.name ? member.name.charAt(0).toUpperCase() : member.email.charAt(0).toUpperCase() }}
                        </div>
                        <div class="flex flex-col overflow-hidden">
                          <span class="text-gray-900 truncate text-xs">{{ member.name || member.email }}</span>
                        </div>
                      </div>
                      <button (click)="removeMember(team.id, member.id)" class="text-red-400 opacity-0 group-hover:opacity-100 hover:text-red-600 hover:bg-red-50 p-1 rounded transition-all focus:opacity-100 flex-shrink-0" title="Remove member">
                        <lucide-icon name="x" class="w-3 h-3"></lucide-icon>
                      </button>
                    </div>
                  }
                  @if(team.members.length === 0) {
                    <p class="text-xs text-gray-400 italic py-1">No members yet. Add someone above!</p>
                  }
                </div>
              </div>
            </div>
          }
        </div>
      }
    </div>
  `
})
export class TeamsTabComponent implements OnInit {
  private teamsService = inject(TeamsService);
  private userMgmtService = inject(UserManagementService);
  private authStore = inject(AuthStore);
  private fb = inject(FormBuilder);
 
  teams = signal<Team[]>([]);
  organizationUsers = this.userMgmtService.users;
  isLoading = signal(true);
  showCreateForm = signal(false);
  isAddingTo = signal<string | null>(null);

  createForm = this.fb.group({
    name: ['', Validators.required],
    description: ['']
  });

  addMemberForm = this.fb.group({
    userId: ['', Validators.required]
  });

  ngOnInit() {
    this.loadTeams();
    
    // Only load users if user is Admin or Owner
    const role = this.authStore.user()?.role;
    if (role === UserRole.ADMIN || role === UserRole.OWNER) {
      this.userMgmtService.loadUsers().subscribe();
    }
  }

  loadTeams() {
    this.isLoading.set(true);
    this.teamsService.getTeams().subscribe({
      next: (data) => {
        this.teams.set(data);
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('Failed to load teams', err);
        this.isLoading.set(false);
      }
    });
  }

  createTeam() {
    if (this.createForm.invalid) return;
    this.teamsService.createTeam(this.createForm.value as Parameters<TeamsService['createTeam']>[0]).subscribe({
      next: (newTeam) => {
        this.teams.update(teams => [...teams, { ...newTeam, members: [] }]);
        this.showCreateForm.set(false);
        this.createForm.reset();
      },
      error: (err) => console.error('Failed to create team', err)
    });
  }

  addMember(teamId: string) {
    if (this.addMemberForm.invalid) return;
    this.isAddingTo.set(teamId);
    const userId = this.addMemberForm.value.userId;
    if (!userId) return;
    this.teamsService.addMember(teamId, userId).subscribe({
      next: (updatedTeam) => {
        this.teams.update(teams => teams.map(t => t.id === teamId ? updatedTeam : t));
        this.addMemberForm.reset();
        this.isAddingTo.set(null);
      },
      error: (err) => {
        console.error('Failed to add member', err);
        this.isAddingTo.set(null);
      }
    });
  }

  removeMember(teamId: string, userId: string) {
    this.teamsService.removeMember(teamId, userId).subscribe({
      next: (updatedTeam) => {
        this.teams.update(teams => teams.map(t => t.id === teamId ? updatedTeam : t));
      },
      error: (err) => console.error('Failed to remove member', err)
    });
  }
}
