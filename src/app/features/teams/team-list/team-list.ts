import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { TeamService } from '../../../core/services/team.service';
import { ITeam } from '../../../core/services/team.service';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-team-list',
  templateUrl: './team-list.html',
  styleUrls: ['./team-list.css'],
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule
  ]
})
export class TeamList implements OnInit, OnDestroy {
  teams: ITeam[] = [];
  successMessage: string | null = null;
  errorMessage: string | null = null;
  isLoading = true;
  private destroy$ = new Subject<void>();

  constructor(
    private teamService: TeamService,
    private router: Router
  ) {
    console.log('TeamList: Constructor called');
  }

  ngOnInit(): void {
    console.log('TeamList: ngOnInit called');
    this.loadTeams();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadTeams(): void {
    console.log('TeamList: loadTeams() called');
    this.isLoading = true;
    this.teams = []; // Clear existing teams

    this.teamService.getAllTeams().pipe(takeUntil(this.destroy$)).subscribe({
      next: (teams) => {
        console.log('TeamList: Received teams from service:', teams);
        console.log('TeamList: Number of teams received:', teams.length);
        this.teams = teams;
        this.successMessage = null;
        this.errorMessage = null;
        this.isLoading = false;
      },
      error: (err) => {
        console.error('TeamList: Error loading teams:', err);
        this.errorMessage = 'Failed to load teams. Please try again.';
        this.successMessage = null;
        this.isLoading = false;
      }
    });
  }

  goToTeamDetails(id: string): void {
    this.router.navigate(['/dashboard/teams', id]);
  }

  goToCreateTeam(): void {
    this.router.navigate(['/dashboard/teams/create']);
  }

  editTeamList(): void {
    console.log('Edit team list clicked');
    this.successMessage = 'Edit Team List functionality would go here!';
    setTimeout(() => this.successMessage = null, 2000);
  }

  deleteTeam(id: string): void {
    if (confirm('Are you sure you want to delete this team?')) {
      this.teamService.deleteTeam(id).pipe(takeUntil(this.destroy$)).subscribe({
        next: () => {
          this.successMessage = 'Team deleted successfully!';
          this.errorMessage = null;
          this.loadTeams();
        },
        error: (err) => {
          console.error('Failed to delete team', err);
          this.errorMessage = 'Failed to delete team. Please try again.';
          this.successMessage = null;
        }
      });
    }
  }

  goToHome(): void {
    this.router.navigate(['/dashboard']);
  }
}
