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
import { AuthService } from '../../../core/services/auth.service';

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
    private authService: AuthService,
    private router: Router
  ) {
    console.log('TeamList: Constructor called');
  }

  ngOnInit(): void {
    console.log('TeamList: ngOnInit called');
    this.loadUserTeams();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadUserTeams(): void {
    console.log('TeamList: loadUserTeams() called');
    console.log('TeamList: isLoading set to true');
    this.isLoading = true;

    this.teamService.getUserTeams().pipe(takeUntil(this.destroy$)).subscribe({
      next: (teams) => {
        console.log('TeamList: Received teams from service:', teams);
        console.log('TeamList: Number of teams:', teams.length);
        this.teams = teams;
        this.successMessage = null;
        this.errorMessage = null;
        this.isLoading = false;
        console.log('TeamList: isLoading set to false');
      },
      error: (err) => {
        console.error('TeamList: Failed to load user teams', err);
        console.error('TeamList: Error type:', typeof err);
        console.error('TeamList: Error status:', err.status);
        console.error('TeamList: Error message:', err.message);
        this.errorMessage = 'Failed to load your teams. Please try again.';
        this.successMessage = null;
        this.isLoading = false;
        console.log('TeamList: isLoading set to false (error case)');
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
          this.loadUserTeams();
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
