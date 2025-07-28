import { Component, OnInit,OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { NgIf,NgFor } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { Auth } from '../../../core/services/auth';
import { Team } from '../../../core/services/team';
import { TeamMemberRole } from '../../../shared/models/team-member.model';
import { IUser } from '../../../shared/models/user.model';

@Component({
  selector: 'app-invite-player',
    imports: [ReactiveFormsModule, NgIf],
  templateUrl: './invite-player.html',
  styleUrls: ['./invite-player.css']
})
export class InvitePlayer implements OnInit, OnDestroy {
  inviteForm!: FormGroup;
  teamId!: string;
  errorMessage: string | null = null;
  successMessage: string | null = null;
  // availableUsers: IUser[] = []; // Removed: No longer needed as we're using email input
  private destroy$ = new Subject<void>();

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private teamService: Team,
    private authService: Auth
  ) { }

  ngOnInit(): void {
    this.inviteForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]] // Changed to email input
      // role: ['MEMBER', Validators.required] // Removed: Role will be hardcoded as MEMBER
    });

    this.route.paramMap.pipe(takeUntil(this.destroy$)).subscribe(params => {
      const id = params.get('id');
      if (id) {
        this.teamId = id;
        console.log('InvitePlayerComponent: Team ID from route:', this.teamId);
        // this.loadAvailableUsers(); // Removed: No longer needed for email input
      } else {
        this.errorMessage = 'Team ID is missing. Cannot invite players.';
        console.error('InvitePlayerComponent: Team ID missing in route.');
        this.router.navigate(['/dashboard/teams']);
      }
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }


  onSubmit(): void {
    this.errorMessage = null;
    this.successMessage = null;

    if (this.inviteForm.valid && this.teamId) {
      const { email } = this.inviteForm.value; 
      const role: TeamMemberRole = 'MEMBER'; 
      const currentUser = this.authService.getCurrentUser();
      const invitedByUserId = currentUser ? currentUser.id : 'unknown_inviter';

      console.log(`InvitePlayerComponent: Attempting to invite user with email: ${email} to team ${this.teamId} as ${role} by ${invitedByUserId}`);

      // First, find the user by email
      this.teamService.getUserByEmail(email).pipe(takeUntil(this.destroy$)).subscribe({
        next: (user) => {
          if (user) {
            // If user found, proceed with inviting them by their ID
            this.teamService.addTeamMember(this.teamId, user.id, role, invitedByUserId)
              .pipe(takeUntil(this.destroy$))
              .subscribe({
                next: (member) => {
                  this.successMessage = `Player ${user.username} (${user.email}) invited successfully! Status: ${member.status}`;
                  console.log('InvitePlayerComponent: Invitation successful:', member);
                  setTimeout(() => {
                    this.router.navigate(['/dashboard/teams', this.teamId]);
                  }, 1500);
                },
                error: (err) => {
                  this.errorMessage = `Failed to invite player: ${err.message || 'Unknown error'}`;
                  console.error('InvitePlayerComponent: Invitation failed:', err);
                }
              });
          } else {
            // User not found with the provided email
            this.errorMessage = `User with email ${email} not found. Please check the email.`;
            console.warn('InvitePlayerComponent: User not found for invitation.');
          }
        },
        error: (err) => {
          this.errorMessage = `Error searching for user: ${err.message || 'Unknown error'}`;
          console.error('InvitePlayerComponent: Error fetching user by email:', err);
        }
      });

    } else {
      this.errorMessage = 'Please enter a valid email address.';
      this.inviteForm.markAllAsTouched();
    }
  }

  goBack(): void {
    this.router.navigate(['/dashboard/teams', this.teamId]);
  }
}
