import { Injectable } from '@angular/core';
import { Observable, of, catchError, map, throwError } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { AuthService } from './auth.service';

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
  members?: any[]; // Add members property to handle team members from backend
}

@Injectable({
  providedIn: 'root'
})
export class TeamService {
  private apiUrl = 'http://localhost:8080/api/teams'; // Update with your Spring backend URL

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) {}


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

  // Done
  getTeamsByCreator(): Observable<ITeam[]> {
    return this.http.get<ITeam[]>(`${this.apiUrl}/my-teams`).pipe(
      map(response => {
        console.log('Teams fetched from backend:', response);
        return response || [];
      }),
      catchError(error => {
      console.error('Error fetching teams from backend:', error);
      return of([]);
  })
  );
}

  // Done
  getTeamById(id: string): Observable<ITeam | null> {
    const url = `${this.apiUrl}/${id}`;
    console.log('TeamService: Fetching team by ID from:', url);

    return this.http.get<ITeam>(url).pipe(
      map(team => {
        console.log('TeamService: Successfully fetched team:', team);
        return team;
      }),
      catchError(error => {
        console.error('TeamService: Error fetching team by ID:', error);
        return of(null);
      })
    );
  }


  // Done
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

  // getTeamMembers(teamId: string): Observable<ITeamMember[]> {
  //   try {
  //     const membersString = sessionStorage.getItem('teamMembers');
  //     if (membersString) {
  //       const members: ITeamMember[] = JSON.parse(membersString);
  //       const teamMembers = members.filter(m => m.teamId === teamId);
  //       return of(teamMembers);
  //     }
  //     return of([]);
  //   } catch (error) {
  //     console.error('Error loading team members:', error);
  //     return of([]);
  //   }
  // }

  // Done (Need Optimization)

  getTeamMembers(teamId: string): Observable<ITeamMember[]> {
    console.log('TeamService: Fetching team members for teamId:', teamId);

    return this.getTeamById(teamId).pipe(
      map(team => {
        if (!team) {
          console.warn('TeamService: Team not found for ID:', teamId);
          return [];
        }

        console.log('TeamService: Team found, extracting members:', team);

        // Extract members array from team object
        const members = team.members || [];
        console.log('TeamService: Raw members from team:', members);

        // Map the members to match ITeamMember interface structure
        const teamMembers: ITeamMember[] = members.map((member: any) => ({
          id: member.id || `${member.userId}-${teamId}`, // Generate ID if not present
          teamId: member.teamId || teamId,
          userId: member.userId,
          username: member.userName || member.username, // Handle both possible field names
          email: member.email || '', // Default empty if not present
          role: member.role as TeamMemberRole,
          status: member.status as TeamMemberStatus,
          invitedBy: member.invitedBy,
          createdAt: member.createdAt || new Date().toISOString(),
          respondedAt: member.respondedAt
        }));

        console.log('TeamService: Mapped team members:', teamMembers);
        return teamMembers;
      }),
      catchError(error => {
        console.error('TeamService: Error fetching team members via getTeamById:', error);
        return of([]);
      })
    );
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

  /**
   * Invite a user to a team by email
   * @param teamId The ID of the team to invite the user to
   * @param email The email of the user to invite
   * @param role The role to assign to the user in the team
   * @returns Observable with the invitation result
   */
  inviteUserByEmail(teamId: string, email: string, role: TeamMemberRole = 'MEMBER'): Observable<ITeamMember> {
    const currentUser = this.authService.getCurrentUser();
    if (!currentUser) {
      return throwError(() => new Error('User not authenticated'));
    }

    const inviteData = {
      email,
      role,
      invitedBy: currentUser.id
    };

    // Updated endpoint to match the backend API
    const inviteUrl = `http://localhost:8080/api/team-members/invite/${teamId}`;
    
    console.log(`Sending invitation to ${email} for team ${teamId}`);
    
    return this.http.post<ITeamMember>(inviteUrl, inviteData).pipe(
      catchError(error => {
        console.error('Error inviting user by email:', error);
        return throwError(() => new Error(error.error?.message || 'Failed to send invitation'));
      })
    );
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
