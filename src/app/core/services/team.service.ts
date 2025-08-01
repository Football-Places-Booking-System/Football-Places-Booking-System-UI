import { Injectable } from '@angular/core';
import { Observable, of, catchError, map } from 'rxjs';
import { HttpClient } from '@angular/common/http';

export type TeamMemberRole = 'MEMBER' | 'ORGANIZER';
export type TeamMemberStatus = 'PENDING' | 'APPROVED' | 'REJECTED';

export interface ITeamMember {
  id: string;
  teamId: string;
  userId: string;
  username: string;
  email: string;
  role: TeamMemberRole;
  status: TeamMemberStatus;
  invitedBy?: string; // FK to User(id)
  createdAt: string;
  respondedAt?: string;
}

export interface ITeam {
  id: string;
  name: string;
  description?: string;
  createdBy: string; // FK to User(id)
  createdAt: string;
  updatedAt?: string;
}

@Injectable({
  providedIn: 'root'
})
export class TeamService {
  private apiUrl = 'http://localhost:8080/api/teams'; // Update with your Spring backend URL

  constructor(private http: HttpClient) {}

  
  getTeams(): Observable<ITeam[]> {
    try {
      const teamsString = sessionStorage.getItem('teams');
      const teams = teamsString ? JSON.parse(teamsString) : [];
      return of(teams);
    } catch (error) {
      console.error('Error loading teams from sessionStorage:', error);
      return of([]);
    }
  }

  // Get teams created by a specific user
  getTeamsByCreator(userId: string): Observable<ITeam[]> {
    try {
      const teamsString = sessionStorage.getItem('teams');
      if (teamsString) {
        const teams: ITeam[] = JSON.parse(teamsString);
        const userTeams = teams.filter(team => team.createdBy === userId);
        return of(userTeams);
      }
      return of([]);
    } catch (error) {
      console.error('Error loading teams by creator from sessionStorage:', error);
      return of([]);
    }
  }

  getTeamById(id: string): Observable<ITeam | null> {
    try {
      const teamsString = sessionStorage.getItem('teams');
      if (teamsString) {
        const teams: ITeam[] = JSON.parse(teamsString);
        const team = teams.find(t => t.id === id);
        return of(team || null);
      }
      return of(null);
    } catch (error) {
      console.error('Error loading team by ID from sessionStorage:', error);
      return of(null);
    }
  }

  createTeam(teamData: { name: string; description?: string }, creatorId: string, creatorUsername: string, creatorEmail: string): Observable<ITeam> {
    const teamRequest = {
      name: teamData.name,
      description: teamData.description || '',
      createdBy: creatorId,
      creatorUsername,
      creatorEmail
    };

    return this.http.post<ITeam>(this.apiUrl, teamRequest).pipe(
      catchError(error => {
        console.error('Error creating team:', error);
        throw new Error(error.error?.message || 'Failed to create team. Please try again.');
      })
    );
  }

  updateTeam(team: ITeam): Observable<ITeam> {
    try {
      const teamsString = sessionStorage.getItem('teams');
      if (teamsString) {
        const teams: ITeam[] = JSON.parse(teamsString);
        const index = teams.findIndex(t => t.id === team.id);
        if (index !== -1) {
          const updatedTeam: ITeam = {
            ...team,
            updatedAt: new Date().toISOString()
          };
          teams[index] = updatedTeam;
          sessionStorage.setItem('teams', JSON.stringify(teams));
          return of(updatedTeam);
        }
      }
      throw new Error('Team not found');
    } catch (error) {
      console.error('Error updating team:', error);
      throw new Error('Failed to update team');
    }
  }

  deleteTeam(teamId: string): Observable<void> {
    const url = `${this.apiUrl}/${teamId}`;
    return this.http.delete<void>(url).pipe(
      catchError(error => {
        console.error('Error deleting team:', error);
        throw new Error(error.error?.message || 'Failed to delete team. Please try again.');
      })
    );
  }

  // Team Member Management
  addTeamMember(teamId: string, userId: string, username: string, email: string, role: TeamMemberRole, status: TeamMemberStatus = 'PENDING', invitedBy?: string): Observable<ITeamMember> {
    try {
      const newMember: ITeamMember = {
        id: Date.now().toString(),
        teamId,
        userId,
        username,
        email,
        role,
        status,
        invitedBy,
        createdAt: new Date().toISOString()
      };

      const membersString = sessionStorage.getItem('teamMembers');
      const members: ITeamMember[] = membersString ? JSON.parse(membersString) : [];
      members.push(newMember);
      sessionStorage.setItem('teamMembers', JSON.stringify(members));

      return of(newMember);
    } catch (error) {
      console.error('Error adding team member:', error);
      throw new Error('Failed to add team member');
    }
  }

  getTeamMembers(teamId: string): Observable<ITeamMember[]> {
    try {
      const membersString = sessionStorage.getItem('teamMembers');
      if (membersString) {
        const members: ITeamMember[] = JSON.parse(membersString);
        const teamMembers = members.filter(m => m.teamId === teamId);
        return of(teamMembers);
      }
      return of([]);
    } catch (error) {
      console.error('Error loading team members:', error);
      return of([]);
    }
  }

  getUserTeams(): Observable<ITeam[]> {
    const url = `${this.apiUrl}/my-teams`;
    console.log('TeamService: Making request to:', url);

    return this.http.get<{content: ITeam[]}>(url).pipe(
      map(response => {
        console.log('TeamService: Received response:', response);
        // Extract the teams array from the content property
        return response.content || [];
      }),
      catchError(error => {
        console.error('TeamService: Error loading user teams from backend:', error);
        console.error('TeamService: Request URL was:', url);
        console.error('TeamService: Error status:', error.status);
        console.error('TeamService: Error message:', error.message);
        return of([]);
      })
    );
  }

  isUserTeamOrganizer(userId: string, teamId: string): Observable<boolean> {
    try {
      const membersString = sessionStorage.getItem('teamMembers');
      if (membersString) {
        const members: ITeamMember[] = JSON.parse(membersString);
        const member = members.find(m => m.userId === userId && m.teamId === teamId && m.status === 'APPROVED');
        return of(member?.role === 'ORGANIZER');
      }
      return of(false);
    } catch (error) {
      console.error('Error checking if user is team organizer:', error);
      return of(false);
    }
  }

  removeTeamMember(teamId: string, userId: string): Observable<void> {
    try {
      const membersString = sessionStorage.getItem('teamMembers');
      if (membersString) {
        const members: ITeamMember[] = JSON.parse(membersString);
        const filteredMembers = members.filter(m => !(m.teamId === teamId && m.userId === userId));
        sessionStorage.setItem('teamMembers', JSON.stringify(filteredMembers));
      }
      return of(void 0);
    } catch (error) {
      console.error('Error removing team member:', error);
      throw new Error('Failed to remove team member');
    }
  }
}
