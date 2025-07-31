import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';

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
export class Team {

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

  createTeam(team: Omit<ITeam, 'id' | 'createdAt'>, creatorId: string, creatorUsername: string, creatorEmail: string): Observable<ITeam> {
    try {
      const newTeam: ITeam = {
        ...team,
        id: Date.now().toString(),
        createdBy: creatorId,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      const teamsString = sessionStorage.getItem('teams');
      const teams: ITeam[] = teamsString ? JSON.parse(teamsString) : [];
      teams.push(newTeam);
      sessionStorage.setItem('teams', JSON.stringify(teams));

      // Add creator as organizer in team members
      this.addTeamMember(newTeam.id, creatorId, creatorUsername, creatorEmail, 'ORGANIZER', 'APPROVED');

      return of(newTeam);
    } catch (error) {
      console.error('Error creating team:', error);
      throw new Error('Failed to create team');
    }
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

  deleteTeam(id: string): Observable<void> {
    try {
      const teamsString = sessionStorage.getItem('teams');
      if (teamsString) {
        const teams: ITeam[] = JSON.parse(teamsString);
        const filteredTeams = teams.filter(t => t.id !== id);
        sessionStorage.setItem('teams', JSON.stringify(filteredTeams));
      }
      return of(void 0);
    } catch (error) {
      console.error('Error deleting team:', error);
      throw new Error('Failed to delete team');
    }
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

  getUserTeams(userId: string): Observable<ITeam[]> {
    try {
      const membersString = sessionStorage.getItem('teamMembers');
      const teamsString = sessionStorage.getItem('teams');

      if (membersString && teamsString) {
        const members: ITeamMember[] = JSON.parse(membersString);
        const teams: ITeam[] = JSON.parse(teamsString);

        const userTeamIds = members
          .filter(m => m.userId === userId && m.status === 'APPROVED')
          .map(m => m.teamId);

        const userTeams = teams.filter(t => userTeamIds.includes(t.id));
        return of(userTeams);
      }
      return of([]);
    } catch (error) {
      console.error('Error loading user teams:', error);
      return of([]);
    }
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
