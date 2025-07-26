// src/app/core/services/team.service.ts
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { delay, tap } from 'rxjs/operators';

// Define the ITeam interface here directly
export interface ITeam {
  id: string;
  name: string;
  description: string;
  // Add any other team properties here as needed
}

@Injectable({
  providedIn: 'root'
})
export class Team {
  // Use ITeam interface for the Subject and Observable
  private teamsSubject = new BehaviorSubject<ITeam[]>(this.loadTeamsFromLocalStorage());
  teams$: Observable<ITeam[]> = this.teamsSubject.asObservable();

  constructor() {
    console.log('TeamService: Initialized.');
  }

  // Private function to load teams from localStorage
  private loadTeamsFromLocalStorage(): ITeam[] {
    try {
      const storedTeams = localStorage.getItem('teams');
      if (storedTeams) {
        const teams = JSON.parse(storedTeams);
        console.log('TeamService: Teams loaded from localStorage:', teams);
        return teams;
      }
    } catch (error) {
      console.error('TeamService: Error parsing teams from localStorage', error);
    }
    return [];
  }

  // Private function to save teams to localStorage
  private saveTeamsToLocalStorage(teams: ITeam[]): void {
    try {
      localStorage.setItem('teams', JSON.stringify(teams));
      console.log('TeamService: Teams saved to localStorage:', teams);
    } catch (error) {
      console.error('TeamService: Error saving teams to localStorage', error);
    }
  }

  // Get all teams
  getTeams(): Observable<ITeam[]> {
    console.log('TeamService: Fetching teams...');
    return this.teamsSubject.asObservable().pipe(
      delay(100) // Simulate network delay
    );
  }

  // Add a new team
  addTeam(team: ITeam): Observable<ITeam> {
    console.log('TeamService: Adding new team:', team);
    const currentTeams = this.teamsSubject.getValue();
    const newTeam = { ...team, id: Date.now().toString() }; // Add a unique ID
    const updatedTeams = [...currentTeams, newTeam];
    this.saveTeamsToLocalStorage(updatedTeams);
    this.teamsSubject.next(updatedTeams); // Emit the updated list
    return of(newTeam).pipe(delay(100)); // Simulate network delay and return the added team
  }

  // Delete a team by ID
  deleteTeam(id: string): Observable<void> {
    console.log('TeamService: Deleting team with ID:', id);
    const currentTeams = this.teamsSubject.getValue();
    const updatedTeams = currentTeams.filter(team => team.id !== id);
    this.saveTeamsToLocalStorage(updatedTeams);
    this.teamsSubject.next(updatedTeams); // Emit the updated list
    return of(void 0).pipe(delay(100)); // Simulate network delay
  }

  // Get a single team by ID
  getTeamById(id: string): Observable<ITeam | undefined> {
    console.log('TeamService: Fetching team by ID:', id);
    const currentTeams = this.teamsSubject.getValue();
    const team = currentTeams.find(t => t.id === id);
    return of(team).pipe(delay(100)); // Simulate network delay
  }

  // Update an existing team
  updateTeam(updatedTeam: ITeam): Observable<ITeam> {
    console.log('TeamService: Updating team:', updatedTeam);
    const currentTeams = this.teamsSubject.getValue();
    const index = currentTeams.findIndex(t => t.id === updatedTeam.id);
    if (index > -1) {
      currentTeams[index] = updatedTeam;
      this.saveTeamsToLocalStorage(currentTeams);
      this.teamsSubject.next(currentTeams); // Emit the updated list
      return of(updatedTeam).pipe(delay(100));
    } else {
      console.error('TeamService: Team not found for update:', updatedTeam.id);
      return of(null as any).pipe(delay(100)); // In a real app, you might throw an error or handle this more gracefully
    }
  }
}