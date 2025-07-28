// src/app/features/teams/services/team.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, of, throwError } from 'rxjs'; // Added BehaviorSubject
import { delay, tap, catchError } from 'rxjs/operators';
import { ITeam } from '../../shared/models/team.model';
import { IUser } from '../../shared/models/user.model';
import { ITeamMember, TeamMemberRole, TeamMemberStatus } from '../../shared/models/team-member.model';

@Injectable({
  providedIn: 'root'
})
export class Team {

  private apiUrl = 'YOUR_BACKEND_API_URL'; // Replace with your backend API URL

 


  private mockUsers: IUser[] = [
    { id: 'user1', username: 'Mohamed Salah', email: 'salah@example.com', role: 'PLAYER' },
    { id: 'user2', username: 'Ahmed Hegazy', email: 'hegazy@example.com', role: 'PLAYER' },
    { id: 'user3', username: 'Tarek Hamed', email: 'hamed@example.com', role: 'PLAYER' },
    { id: 'user4', username: 'Mostafa Mohamed', email: 'mostafa@example.com', role: 'PLAYER' },
    { id: 'user5', username: 'Mahmoud Kahraba', email: 'kahraba@example.com', role: 'PLAYER' },
    { id: 'user6', username: 'Emam Ashour', email: 'ashour@example.com', role: 'PLAYER' },
    { id: 'user7', username: 'Booking Admin', email: 'admin@example.com', role: 'ADMIN' },
    { id: 'user8', username: 'Team Organizer', email: 'organizer@example.com', role: 'ORGANIZER' },
  ];

  private mockTeams: ITeam[] = [
    { id: 'team1', name: 'Al Ahly', description: 'The Red Devils from Cairo.', created_by: 'user8', created_at: '2024-01-01T10:00:00Z', },
    { id: 'team2', name: 'Zamalek', description: 'The White Knights from Giza.', created_by: 'user8', created_at: '2024-01-05T11:00:00Z' },
    // **Crucial Fix:** Ensure this ID matches the one you see in your URL for the dynamic team
    { id: '1753451266735', name: 'teamghgh', description: 'dhhfmn', created_by: 'user7', created_at: '2024-07-27T12:00:00Z' }
  ];

  private mockTeamMembers: ITeamMember[] = [
   
    { id: 'tm1_user1', user_id: 'user1', team_id: 'team1', role: 'MEMBER', status: 'APPROVED', invited_by: 'user8', created_at: '2024-01-01T10:05:00Z' },
    { id: 'tm1_user2', user_id: 'user2', team_id: 'team1', role: 'MEMBER', status: 'PENDING', invited_by: 'user8', created_at: '2024-01-01T10:10:00Z' },
    { id: 'tm1_user3', user_id: 'user3', team_id: 'team1', role: 'MEMBER', status: 'APPROVED', invited_by: 'user8', created_at: '2024-01-01T10:15:00Z' },

    { id: 'tm2_user5', user_id: 'user5', team_id: 'team2', role: 'MEMBER', status: 'APPROVED', invited_by: 'user8', created_at: '2024-01-05T11:05:00Z' },
    { id: 'tm2_user6', user_id: 'user6', team_id: 'team2', role: 'MEMBER', status: 'PENDING', invited_by: 'user8', created_at: '2024-01-05T11:10:00Z' },

    { id: 'tm_dyn_user1', user_id: 'user1', team_id: '1753451266735', role: 'MEMBER', status: 'APPROVED', invited_by: 'user7', created_at: '2024-07-27T12:05:00Z' },
    { id: 'tm_dyn_user4', user_id: 'user4', team_id: '1753451266735', role: 'MEMBER', status: 'PENDING', invited_by: 'user7', created_at: '2024-07-27T12:10:00Z' },
    { id: 'tm_dyn_user6', user_id: 'user6', team_id: '1753451266735', role: 'MEMBER', status: 'PENDING', invited_by: 'user7', created_at: '2024-07-27T12:15:00Z' },
  ];
  private teamsSubject = new BehaviorSubject<ITeam[]>(this.mockTeams); // Initialize BehaviorSubject with initial mock data


  constructor(private http: HttpClient) { }

  // getTeams now returns the observable from the BehaviorSubject
  getTeams(): Observable<ITeam[]> {
    console.log('TeamService: Providing all teams (mock via BehaviorSubject)');
    return this.teamsSubject.asObservable().pipe(delay(100)); // Small delay for async feel
  }

  getTeamById(teamId: string): Observable<ITeam | null> { // Changed parameter name to teamId for consistency
    console.log(`TeamService: Fetching team with ID: ${teamId}`);
    const team = this.teamsSubject.getValue().find(t => t.id === teamId); // Get from current subject value
    if (team) {
      return of(team).pipe(delay(500));
    } else {
      return of(null); // Return null instead of throwing error if not found
    }
  }

  // Get teams created by a specific user
  getTeamsByCreator(userId: string): Observable<ITeam[]> {
    try {
      const teamsString = localStorage.getItem('teams');
      if (teamsString) {
        const teams: ITeam[] = JSON.parse(teamsString);
        const userTeams = teams.filter(team => team.created_by === userId);
        return of(userTeams);
      }
      return of([]);
    } catch (error) {
      console.error('Error loading teams by creator from localStorage:', error);
      return of([]);
    }
  }

  getUserById(userId: string): Observable<IUser | null> {
    console.log(`TeamService: Searching for user with ID: ${userId} (mock)`);
    const user = this.mockUsers.find(u => u.id === userId);
    if (user) {
      return of(user).pipe(delay(100));
    } else {
      return of(null);
    }
  }

  getUserByEmail(email: string): Observable<IUser | null> {
    console.log(`TeamService: Searching for user with email: ${email} (mock)`);
    const user = this.mockUsers.find(u => u.email === email);
    if (user) {
      return of(user).pipe(delay(200));
    } else {
      return of(null);
    }
  }

  getPlayersByTeamId(teamId: string): Observable<IUser[]> {
    console.log(`TeamService: Fetching players (users) for team ID: ${teamId}`);
    const teamMembers = this.mockTeamMembers.filter(tm => tm.team_id === teamId && tm.status === 'APPROVED');
    const players: IUser[] = teamMembers.map(tm => {
      const user = this.mockUsers.find(u => u.id === tm.user_id);
      return user!;
    });
    return of(players).pipe(delay(500));
  }

  getTeamMembers(teamId: string): Observable<ITeamMember[]> {
    console.log(`TeamService: Fetching team members for team ID: ${teamId}`);
    const members = this.mockTeamMembers.filter(tm => tm.team_id === teamId);
    return of(members).pipe(delay(500));
  }

  createTeam(team: Omit<ITeam, 'id' | 'created_at'>): Observable<ITeam> {
    console.log('TeamService: Creating team (mock)', team);
    const newTeam: ITeam = {
      ...team,
      id: `team${Date.now()}`, // Generate a more unique ID
      created_at: new Date().toISOString(),
    };
    const currentTeams = this.teamsSubject.getValue(); // Get current value
    this.teamsSubject.next([...currentTeams, newTeam]); // Add new team and emit
    return of(newTeam).pipe(delay(500));
  }

  updateTeam(team: ITeam): Observable<ITeam> {
    console.log('TeamService: Updating team (mock)', team);
    const currentTeams = this.teamsSubject.getValue();
    const index = currentTeams.findIndex(t => t.id === team.id);
    if (index > -1) {
      currentTeams[index] = { ...team, created_at: currentTeams[index].created_at }; // Preserve original created_at
      this.teamsSubject.next([...currentTeams]); // Emit updated list
      return of(this.teamsSubject.getValue()[index]).pipe(delay(500));
    } else {
      return throwError(() => new Error('Team not found for update'));
    }
  }

  deleteTeam(id: string): Observable<void> {
    console.log(`TeamService: Deleting team with ID: ${id} (mock)`);
    const currentTeams = this.teamsSubject.getValue();
    const updatedTeams = currentTeams.filter(t => t.id !== id);
    if (updatedTeams.length < currentTeams.length) {
      this.teamsSubject.next(updatedTeams); // Emit updated list
      return of(void 0).pipe(delay(500));
    } else {
      return throwError(() => new Error('Team not found for deletion'));
    }
  }

  addTeamMember(teamId: string, userId: string, role: TeamMemberRole, invitedByUserId: string): Observable<ITeamMember> {
    console.log(`TeamService: Adding user ${userId} to team ${teamId} with role ${role} (mock)`);
    const existingMember = this.mockTeamMembers.find(
      (tm) => tm.team_id === teamId && tm.user_id === userId && (tm.status === 'PENDING' || tm.status === 'APPROVED')
    );

    if (existingMember) {
      return throwError(() => new Error(`User ${userId} is already a member or has a pending invitation for this team.`));
    }

    const newTeamMember: ITeamMember = {
      id: `tm${Math.random().toString(36).substring(2, 9)}`, // Use Math.random for unique ID
      user_id: userId,
      team_id: teamId,
      role: role,
      status: 'PENDING',
      invited_by: invitedByUserId,
      created_at: new Date().toISOString()
    };
    this.mockTeamMembers.push(newTeamMember);
    return of(newTeamMember).pipe(delay(500));
  }

  removeTeamMember(teamMemberId: string): Observable<void> {
    console.log(`TeamService: Attempting to remove team member with ID: ${teamMemberId} (mock)`);
    const initialLength = this.mockTeamMembers.length;
    this.mockTeamMembers = this.mockTeamMembers.filter(tm => tm.id !== teamMemberId);

    if (this.mockTeamMembers.length < initialLength) {
      console.log(`TeamService: Team member ${teamMemberId} removed successfully (mock).`);
      return of(void 0).pipe(delay(200)); // Simulate success
    } else {
      console.error(`TeamService: Team member ${teamMemberId} not found for removal (mock).`);
      return throwError(() => new Error('Team member not found for removal.'));
    }
  }


  // TODO: Replace with real implementation
  isUserTeamOrganizer(userId: string, id: any): Observable<boolean> {
    return of(true);
  }
}
