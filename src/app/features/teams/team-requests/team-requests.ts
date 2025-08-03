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
  joinRequests: INotification[] = [];
  requestsCount: number = 0;
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
              const joinRequest: INotification = {
                id: notification.id,
                requestType: notification.requestType,
                sendTime: notification.sendTime,
                status: notification.status,
                requestMessage: notification.requestMessage,
                senderId: notification.senderId,
                receiverId: notification.receiverId,
                joker_id: notification.joker_id,
                senderEmail: notification.senderEmail
              };
              this.joinRequests.push(joinRequest);
              this.requestsCount = this.joinRequests.length;
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