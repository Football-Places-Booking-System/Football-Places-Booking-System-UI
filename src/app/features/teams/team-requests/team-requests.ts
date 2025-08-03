import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { TeamService, ITeamMember, TeamMemberStatus } from '../../../core/services/team.service';
import { AuthService } from '../../../core/services/auth.service';
import { NotificationService,INotification } from '../../../core/services/notification.service';

interface PendingInvitation {
  id: string;
  teamId: string;
  teamName: string;
  role: string;
  invitedBy: string;
  createdAt: string;
}

interface JoinRequest {
  id: string;
  teamId: string;
  teamName: string;
  userId: number;
  username: string;
  email: string;
  createdAt: string;
}

@Component({
  selector: 'app-team-requests',
  templateUrl: './team-requests.html',
  styleUrls: ['./team-requests.css'],
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule
  ]
})
export class TeamRequests implements OnInit, OnDestroy {
  pendingInvitations: PendingInvitation[] = [];
  joinRequests: JoinRequest[] = [];
  loading: boolean = true;
  successMessage: string | null = null;
  errorMessage: string | null = null;
  private destroy$ = new Subject<void>();

  constructor(
    private teamService: TeamService,
    private authService: AuthService,
    private notificationService: NotificationService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.loadRequests();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadRequests(): void {
    this.loading = true;
    this.notificationService.getUserNotifications()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (notifications: INotification[]) => {
          this.loading = false;
          
          // Clear existing requests
          this.joinRequests = [];
          
          // Filter and transform notifications to join requests
          for (let i = 0; i < notifications.length; i++) {
            const notification = notifications[i];
            if (notification.requestType === 'JOIN_TEAM_REQUEST' && notification.status === 'PENDING') {
              const joinRequest: JoinRequest = {
                id: notification.id,
                teamId: notification.joker_id, // Using joker_id as teamId
                teamName: 'Team', // Extract from message or use default
                userId: parseInt(notification.senderId), // Convert sender to userId
                username: notification.requestMessage.split(' ')[0] || 'Unknown', // Extract username from message
                email: 'user@example.com', // Default email since not available in notification
                createdAt: notification.sendTime || new Date().toISOString()
              };
              this.joinRequests.push(joinRequest);
            }
          }
        },
        error: (err) => {
          console.error('Failed to load notifications', err);
          this.errorMessage = 'Failed to load notifications';
          this.loading = false;
        }
      });
  }

  loadPendingInvitations(userId: string): void {
  // console.log('Loading pending invitations for user ID:', userId);

  // this.teamService.getAllTeamMembers().pipe(takeUntil(this.destroy$)).subscribe({
  //   next: (allMembers) => {
  //     console.log('All team members for invitations:', allMembers);
  //     const userInvitations = allMembers.filter(member => 
  //       member.userId === userId && member.status === 'PENDING'
  //     );
  //     console.log('User invitations:', userInvitations);

  //     // Get team details for each invitation
  //     const invitationPromises = userInvitations.map(invitation => 
  //       this.teamService.getTeamById(invitation.teamId).toPromise()
  //     );

  //     Promise.all(invitationPromises).then(teams => {
  //       console.log('Teams for invitations:', teams);
  //       this.pendingInvitations = userInvitations.map(invitation => {
  //         const team = teams.find(t => t?.id === invitation.teamId);
  //         return {
  //           id: invitation.id,
  //           teamId: invitation.teamId,
  //           teamName: team?.name || 'Unknown Team',
  //           role: invitation.role,
  //           invitedBy: invitation.invitedBy?.toString() || 'Unknown',
  //           createdAt: invitation.createdAt
  //         };
  //       });
  //       console.log('Final pending invitations:', this.pendingInvitations);
  //     });
  //   },
  //   error: (err) => {
  //     console.error('Failed to load pending invitations', err);
  //   }
  // });
}

loadJoinRequests(userId: string): void {
  // console.log('Loading join requests for user ID:', userId);

  // // Get teams where current user is organizer
  // this.teamService.getTeamsByCreator().pipe(takeUntil(this.destroy$)).subscribe({
  //   next: (userTeams) => {
  //     console.log('User teams (as creator):', userTeams);
  //     const teamIds = userTeams.map(team => team.id);
  //     console.log('Team IDs where user is creator:', teamIds);

  //     // Get all team members for these teams
  //     this.teamService.getAllTeamMembers().pipe(takeUntil(this.destroy$)).subscribe({
  //       next: (allMembers) => {
  //         console.log('All team members:', allMembers);
  //         const joinRequests = allMembers.filter(member => 
  //           teamIds.includes(member.teamId) && 
  //           member.status === 'PENDING' && 
  //           member.userId !== userId
  //         );
  //         console.log('Filtered join requests:', joinRequests);

  //         this.joinRequests = joinRequests.map(request => ({
  //           id: request.id,
  //           teamId: request.teamId,
  //           teamName: userTeams.find(team => team.id === request.teamId)?.name || 'Unknown Team',
  //           userId: request.userId,
  //           username: request.username,
  //           email: request.email,
  //           createdAt: request.createdAt
  //         }));

  //         console.log('Final join requests:', this.joinRequests);
  //         this.loading = false;
  //       },
  //       error: (err) => {
  //         console.error('Failed to load join requests', err);
  //         this.loading = false;
  //       }
  //     });
  //   },
  //   error: (err) => {
  //     console.error('Failed to load user teams', err);
  //     this.loading = false;
  //   }
  // });
}

respondToInvitation(invitationId: string, status: 'APPROVED' | 'REJECTED'): void {
  // const currentUser = this.authService.getCurrentUser();
  // if (!currentUser) return;

  // // Find the invitation
  // const invitation = this.pendingInvitations.find(inv => inv.id === invitationId);
  // if (!invitation) return;

  // console.log('Responding to invitation:', invitation);
  // console.log('New status:', status);

  // // Update team member status
  // this.teamService.getAllTeamMembers().pipe(takeUntil(this.destroy$)).subscribe({
  //   next: (allMembers) => {
  //     const member = allMembers.find(m => m.id === invitationId);
  //     if (member) {
  //       console.log('Found member to update:', member);
  //       member.status = status;
  //       member.respondedAt = new Date().toISOString();

  //       // Update in localStorage
  //       localStorage.setItem('teamMembers', JSON.stringify(allMembers));
  //       console.log('Updated team members in localStorage');

  //       // Create notification for team organizer
  //       this.notificationService.createApprovalNotification(
  //         member.invitedBy || 0,
  //         'team invitation',
  //         invitation.teamName
  //       ).subscribe();

  //       this.successMessage = status === 'APPROVED' 
  //         ? `Successfully joined ${invitation.teamName}!` 
  //         : `Declined invitation to ${invitation.teamName}`;

  //       // Remove from pending invitations
  //       this.pendingInvitations = this.pendingInvitations.filter(inv => inv.id !== invitationId);

  //       setTimeout(() => this.successMessage = null, 3000);
  //     } else {
  //       console.error('Member not found for invitation ID:', invitationId);
  //       this.errorMessage = 'Invitation not found';
  //     }
  //   },
  //   error: (err) => {
  //     console.error('Failed to respond to invitation', err);
  //     this.errorMessage = 'Failed to respond to invitation';
  //   }
  // });
}

respondToJoinRequest(requestId: string, status: 'APPROVED' | 'REJECTED'): void {
  // const currentUser = this.authService.getCurrentUser();
  // if (!currentUser) return;

  // // Find the request
  // const request = this.joinRequests.find(req => req.id === requestId);
  // if (!request) return;

  // console.log('Responding to join request:', request);
  // console.log('New status:', status);

  // // Update team member status
  // this.teamService.getAllTeamMembers().pipe(takeUntil(this.destroy$)).subscribe({
  //   next: (allMembers) => {
  //     const member = allMembers.find(m => m.id === requestId);
  //     if (member) {
  //       console.log('Found member to update:', member);
  //       member.status = status;
  //       member.respondedAt = new Date().toISOString();

  //       // Update in localStorage
  //       localStorage.setItem('teamMembers', JSON.stringify(allMembers));
  //       console.log('Updated team members in localStorage');

  //       // Create notification for the user who requested to join
  //       // this.notificationService.createApprovalNotification(
  //       //   member.userId,
  //       //   'team join request',
  //       //   request.teamName
  //       // ).subscribe();

  //       this.successMessage = status === 'APPROVED' 
  //         ? `Approved ${request.username}'s request to join ${request.teamName}!` 
  //         : `Rejected ${request.username}'s request to join ${request.teamName}`;

  //       // Remove from join requests
  //       this.joinRequests = this.joinRequests.filter(req => req.id !== requestId);

  //       setTimeout(() => this.successMessage = null, 3000);
  //     } else {
  //       console.error('Member not found for request ID:', requestId);
  //       this.errorMessage = 'Request not found';
  //     }
  //   },
  //   error: (err) => {
  //     console.error('Failed to respond to join request', err);
  //     this.errorMessage = 'Failed to respond to join request';
  //   }
  // });
}

getTimeAgo(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffInMs = now.getTime() - date.getTime();
  const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
  const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
  const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

  if (diffInMinutes < 1) return 'Just now';
  if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
  if (diffInHours < 24) return `${diffInHours}h ago`;
  if (diffInDays < 7) return `${diffInDays}d ago`;

  return date.toLocaleDateString();
}
}