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
export class TeamMemberService {
  private apiUrl = 'http://localhost:8080/api/team-members'; // Update with your Spring backend URL

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) {}


  /**
   * Invite a user to a team by email
   * @param teamId The ID of the team to invite the user to
   * @param email The email of the user to invite
   * @param role The role to assign to the user in the team
   * @returns Observable with the invitation result
   */
  inviteUserByEmail(teamId: string, email: string): Observable<ITeamMember> {
    const currentUser = this.authService.getCurrentUser();
    if (!currentUser) {
      return throwError(() => new Error('User not authenticated'));
    }

    const inviteData = {
      email,
      invitedBy: currentUser.id
    };

    console.log(`Sending invitation to ${email} for team ${teamId}`);

    return this.http.post<ITeamMember>(`${this.apiUrl}/invite/${teamId}`, inviteData).pipe(
      catchError(error => {
        console.error('Error inviting user by email:', error);
        return throwError(() => new Error(error.error?.message || 'Failed to send invitation'));
      })
    );
  }

  removeTeamMember(teamMemberId: string): Observable<void> {
    if (!teamMemberId) {
      return throwError(() => new Error('Team member ID is required'));
    }
    console.log(`TeamService: Removing team member with ID: ${teamMemberId}`);

    return this.http.delete<void>(`${this.apiUrl}/${teamMemberId}`).pipe(
      catchError(error => {
        console.error('Error removing team member:', error);
        return throwError(() => new Error(error.error?.message || 'Failed to remove team member'));
      })
    );
  }

  // Team Member Management
  askToJoinTeam(teamId: string): Observable<ITeamMember> {
    return this.requestToJoinTeam(teamId);
  }

  /**
   * Request to join a team
   * @param teamId The ID of the team to join
   * @returns Observable with the join request response
   */
  requestToJoinTeam(teamId: string): Observable<ITeamMember> {
    if (!teamId) {
      return throwError(() => new Error('Team ID is required'));
    }

    console.log(`Sending join request for team ${teamId}`);

    return this.http.post<ITeamMember>(
      `${this.apiUrl}/join-request/${teamId}`,
      {}
    ).pipe(
      catchError(error => {
        console.error('Error sending join request:', error);
        return throwError(() => new Error(error.error?.message || 'Failed to send join request'));
      })
    );
  }
}
