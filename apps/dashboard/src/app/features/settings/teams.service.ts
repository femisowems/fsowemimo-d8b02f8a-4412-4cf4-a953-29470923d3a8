import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { APP_CONFIG } from '@secure-task-management/services';
import { Observable } from 'rxjs';
import { Team } from '@secure-task-management/models';

@Injectable({ providedIn: 'root' })
export class TeamsService {
  private http = inject(HttpClient);
  private config = inject(APP_CONFIG);

  getTeams(): Observable<Team[]> {
    return this.http.get<Team[]>(`${this.config.apiUrl}/teams`);
  }

  createTeam(data: { name: string; description?: string }): Observable<Team> {
    return this.http.post<Team>(`${this.config.apiUrl}/teams`, data);
  }

  addMember(teamId: string, userId: string): Observable<Team> {
    return this.http.post<Team>(`${this.config.apiUrl}/teams/${teamId}/members`, { userId });
  }

  removeMember(teamId: string, userId: string): Observable<Team> {
    return this.http.delete<Team>(`${this.config.apiUrl}/teams/${teamId}/members/${userId}`);
  }
}
