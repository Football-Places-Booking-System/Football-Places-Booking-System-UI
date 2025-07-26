import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';

export interface ITeam {
  id: string;
  name: string;
  description?: string;
  organizerId?: string;
  createdAt?: string;
  updatedAt?: string;
}

@Injectable({
  providedIn: 'root'
})
export class Team {
  private teamsKey = 'teams';
  private invitesKey = 'teamInvites';

  constructor() {
    // Initialize localStorage with some sample teams if empty
    this.initializeSampleTeams();
  }

  private initializeSampleTeams(): void {
    const existingTeams = localStorage.getItem(this.teamsKey);
    if (!existingTeams) {
      const sampleTeams: ITeam[] = [
        {
          id: '1',
          name: 'FC Barcelona',
          description: 'Professional football team from Barcelona, Spain',
          organizerId: '2',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        },
        {
          id: '2',
          name: 'Real Madrid',
          description: 'Professional football team from Madrid, Spain',
          organizerId: '2',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
      ];
      localStorage.setItem(this.teamsKey, JSON.stringify(sampleTeams));
    }
  }

  getTeams(): Observable<ITeam[]> {
    try {
      const teamsJson = localStorage.getItem(this.teamsKey);
      const teams: ITeam[] = teamsJson ? JSON.parse(teamsJson) : [];
      return of(teams);
    } catch (error) {
      console.error('Error loading teams from localStorage:', error);
      return of([]);
    }
  }

  getTeamById(id: string): Observable<ITeam | null> {
    try {
      const teamsJson = localStorage.getItem(this.teamsKey);
      const teams: ITeam[] = teamsJson ? JSON.parse(teamsJson) : [];
      const team = teams.find(t => t.id === id) || null;
      return of(team);
    } catch (error) {
      console.error('Error loading team by ID from localStorage:', error);
      return of(null);
    }
  }

  createTeam(team: Omit<ITeam, 'id' | 'createdAt' | 'updatedAt'>): Observable<ITeam> {
    try {
      const teamsJson = localStorage.getItem(this.teamsKey);
      const teams: ITeam[] = teamsJson ? JSON.parse(teamsJson) : [];
      
      const newTeam: ITeam = {
        ...team,
        id: Date.now().toString(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      teams.push(newTeam);
      localStorage.setItem(this.teamsKey, JSON.stringify(teams));
      
      return of(newTeam);
    } catch (error) {
      console.error('Error creating team in localStorage:', error);
      throw new Error('Failed to create team');
    }
  }

  updateTeam(updatedTeam: ITeam): Observable<ITeam> {
    try {
      const teamsJson = localStorage.getItem(this.teamsKey);
      const teams: ITeam[] = teamsJson ? JSON.parse(teamsJson) : [];
      
      const index = teams.findIndex(t => t.id === updatedTeam.id);
      if (index === -1) {
        throw new Error('Team not found');
      }
      
      teams[index] = {
        ...updatedTeam,
        updatedAt: new Date().toISOString()
      };
      
      localStorage.setItem(this.teamsKey, JSON.stringify(teams));
      return of(teams[index]);
    } catch (error) {
      console.error('Error updating team in localStorage:', error);
      throw new Error('Failed to update team');
    }
  }

  deleteTeam(id: string): Observable<void> {
    try {
      const teamsJson = localStorage.getItem(this.teamsKey);
      const teams: ITeam[] = teamsJson ? JSON.parse(teamsJson) : [];
      
      const filteredTeams = teams.filter(t => t.id !== id);
      localStorage.setItem(this.teamsKey, JSON.stringify(filteredTeams));
      
      return of(void 0);
    } catch (error) {
      console.error('Error deleting team from localStorage:', error);
      throw new Error('Failed to delete team');
    }
  }

  // Team invitation methods
  getTeamInvites(): Observable<any[]> {
    try {
      const invitesJson = localStorage.getItem(this.invitesKey);
      const invites: any[] = invitesJson ? JSON.parse(invitesJson) : [];
      return of(invites);
    } catch (error) {
      console.error('Error loading team invites from localStorage:', error);
      return of([]);
    }
  }

  createTeamInvite(invite: any): Observable<any> {
    try {
      const invitesJson = localStorage.getItem(this.invitesKey);
      const invites: any[] = invitesJson ? JSON.parse(invitesJson) : [];
      
      const newInvite = {
        ...invite,
        id: Date.now().toString(),
        timestamp: new Date().toISOString()
      };
      
      invites.push(newInvite);
      localStorage.setItem(this.invitesKey, JSON.stringify(invites));
      
      return of(newInvite);
    } catch (error) {
      console.error('Error creating team invite in localStorage:', error);
      throw new Error('Failed to create team invite');
    }
  }
}
