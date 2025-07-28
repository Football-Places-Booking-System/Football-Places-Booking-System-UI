import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule, NgIf, NgFor, DatePipe } from '@angular/common'; 
import { ReactiveFormsModule, FormGroup, FormBuilder, Validators } from '@angular/forms';
import { delay, Observable, of, Subject, takeUntil, throwError } from 'rxjs';

import { ITeam } from '../../../shared/models/team.model';
import { ITeamMember, TeamMemberStatus, TeamMemberRole } from '../../../shared/models/team-member.model';
import { IUser } from '../../../shared/models/user.model';
import { IBookingMatch, IMatchParticipant, BookingMatchStatus, MatchParticipantStatus } from '../../../shared/models/match.model';

import { Team } from '../../../core/services/team'; 
import { Auth } from '../../../core/services/auth'; 
import { Match } from '../../../core/services/match'; 

@Component({
  selector: 'app-team-details',
  imports: [CommonModule, ReactiveFormsModule], 
  templateUrl: './team-details.html', 
  styleUrls: ['./team-details.css'] 
})
export class TeamDetails implements OnInit, OnDestroy { 
  team: ITeam | undefined;
  teamMembers: ITeamMember[] = [];
  usersInTeam: IUser[] = [];
  errorMessage: string | null = null;
  successMessage: string | null = null;
  isOrganizer: boolean = false;
  isEditing: boolean = false;
  editTeamForm!: FormGroup;

  private destroy$ = new Subject<void>();
  private mockMatchIdToLink: string = 'match_for_dynamic_team';
  teamId!: string;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private teamService: Team,
    private authService: Auth,
    private fb: FormBuilder,
    private matchService: Match,
  ) { }

  ngOnInit(): void {
    console.log('TeamDetailsComponent: Initialized.');

    this.isOrganizer = this.authService.isOrganizer();
    console.log('TeamDetailsComponent: Is current user an organizer?', this.isOrganizer);

    this.editTeamForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(50)]],
      description: ['', Validators.maxLength(500)]
    });

    this.route.paramMap.pipe(takeUntil(this.destroy$)).subscribe(params => {
      const teamId = params.get('id');
      console.log('TeamDetailsComponent: Team ID from route params:', teamId);
      if (teamId) {
        this.teamId = teamId;
        this.loadTeamDetails(teamId);
        this.loadTeamMembers(teamId);
      } else {
        this.errorMessage = 'Team ID not provided in URL.';
        console.error('TeamDetailsComponent: Team ID is missing in the URL. Redirecting to team list.');
        this.router.navigate(['/dashboard/teams']);
      }
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadTeamDetails(id: string): void {
    console.log(`TeamDetailsComponent: Attempting to load details for team ID: "${id}"`);
    this.teamService.getTeamById(id).pipe(takeUntil(this.destroy$)).subscribe({
      next: (team) => {
        if (team) {
          this.team = team;
          console.log('TeamDetailsComponent: Team details loaded successfully:', this.team);
          this.editTeamForm.patchValue({
            name: this.team.name,
            description: this.team.description
          });
        } else {
          this.errorMessage = 'Team not found.';
          console.warn(`TeamDetailsComponent: Team with ID "${id}" not found. Redirecting to team list.`);
          this.router.navigate(['/dashboard/teams']);
        }
      },
      error: (err) => {
        console.error("TeamDetailsComponent: Error loading team details:", err);
        this.errorMessage = `Failed to load team details: ${err.message || 'Unknown error'}`;
        this.router.navigate(['/dashboard/teams']);
      }
    });
  }

  loadTeamMembers(teamId: string): void {
    console.log(`TeamDetailsComponent: Attempting to load team members for team ID: "${teamId}"`);
    this.teamService.getTeamMembers(teamId).pipe(takeUntil(this.destroy$)).subscribe({
      next: (members) => {
        this.teamMembers = members;
        console.log('TeamDetailsComponent: Team members loaded:', this.teamMembers);
        this.teamService.getPlayersByTeamId(teamId).pipe(takeUntil(this.destroy$)).subscribe({
          next: (users) => {
            this.usersInTeam = users;
            console.log('TeamDetailsComponent: User details for members loaded:', this.usersInTeam);
          },
          error: (err) => {
            console.error('TeamDetailsComponent: Error loading user details for team members:', err);
            this.errorMessage = `Failed to load member details: ${err.message || 'Unknown error'}`;
          }
        });
      },
      error: (err) => {
        console.error('TeamDetailsComponent: Error loading team members:', err);
        this.errorMessage = `Failed to load team members: ${err.message || 'Unknown error'}`;
      }
    });
  }

  getUserForTeamMember(userId: string): IUser | undefined {
    return this.usersInTeam.find(user => user.id === userId);
  }

  toggleEditMode(): void {
    this.isEditing = !this.isEditing;
    if (this.isEditing) {
      this.editTeamForm.patchValue({
        name: this.team?.name,
        description: this.team?.description
      });
    }
  }

  saveTeamChanges(): void {
    if (this.editTeamForm.valid && this.team) {
      const updatedTeam: ITeam = {
        ...this.team,
        name: this.editTeamForm.value.name,
        description: this.editTeamForm.value.description
      };

      this.teamService.updateTeam(updatedTeam).pipe(takeUntil(this.destroy$)).subscribe({
        next: (responseTeam) => {
          this.team = responseTeam;
          this.successMessage = 'Team updated successfully!';
          this.errorMessage = null;
          this.isEditing = false;
          setTimeout(() => this.successMessage = null, 3000);
        },
        error: (err) => {
          console.error('Failed to update team', err);
          this.errorMessage = `Failed to update team: ${err.message || 'Unknown error'}`;
          this.successMessage = null;
        }
      });
    } else {
      this.errorMessage = 'Please correct the form errors.';
      this.editTeamForm.markAllAsTouched();
    }
  }

  removeTeamMember(teamMemberId: string): void {
    if (confirm('Are you sure you want to remove this member from the team?')) {
      console.log(`TeamDetailsComponent: Initiating removal of team member ${teamMemberId}`);
      this.teamService.removeTeamMember(teamMemberId).pipe(takeUntil(this.destroy$)).subscribe({
        next: () => {
          this.successMessage = 'Member removed successfully!';
          this.errorMessage = null;
          setTimeout(() => this.successMessage = null, 3000);
          this.loadTeamMembers(this.teamId); // Reload members from service to reflect changes
          console.log(`TeamDetailsComponent: Team member ${teamMemberId} removal confirmed by service.`);
        },
        error: (err) => {
          console.error('TeamDetailsComponent: Failed to remove team member:', err);
          this.errorMessage = `Failed to remove member: ${err.message || 'Unknown error'}`;
          this.successMessage = null;
        }
      });
    }
  }

  goToInvitePlayer(teamId: string): void {
    console.log(`TeamDetailsComponent: Navigating to invite player page for team ID: ${teamId}`);
    this.router.navigate(['/dashboard/teams', teamId, 'invite']);
  }

  navigateToMatchParticipants(): void {
    console.log('navigateToMatchParticipants called.');
    console.log('Current teamId:', this.teamId);
    console.log('Current mockMatchIdToLink:', this.mockMatchIdToLink);

    if (this.teamId && this.mockMatchIdToLink) {
      this.router.navigate(['/dashboard/matches/participants', this.mockMatchIdToLink, this.teamId]);
    } else {
      const missingInfo = [];
      if (!this.teamId) {
        missingInfo.push('Team ID');
      }
      if (!this.mockMatchIdToLink) {
        missingInfo.push('Match ID');
      }
      const message = `Cannot navigate: ${missingInfo.join(' and ')} is missing. Please check the data.`;
      console.warn('TeamDetailsComponent:', message);
      window.alert(message);
    }
  }

  goBackToList(): void {
    console.log('TeamDetailsComponent: Attempting to navigate back to team list.');
    this.router.navigate(['/dashboard/teams']);
  }
}