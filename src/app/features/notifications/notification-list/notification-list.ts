import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { NotificationService, INotification, RequestType } from '../../../core/services/notification.service';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-notification-list',
  templateUrl: './notification-list.html',
  styleUrls: ['./notification-list.css'],
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule
  ]
})
export class NotificationList implements OnInit, OnDestroy {
  notifications: INotification[] = [];
  unreadCount: number = 0;
  loading: boolean = true;
  successMessage: string | null = null;
  errorMessage: string | null = null;
  private destroy$ = new Subject<void>();

  constructor(
    private notificationService: NotificationService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadNotifications();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadNotifications(): void {
    const currentUser = this.authService.getCurrentUser();
    if (!currentUser) {
      this.errorMessage = 'User not authenticated';
      this.loading = false;
      return;
    }

    this.notificationService.getUserNotifications()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (notifications) => {
          this.notifications = notifications;
          this.loading = false;
          this.loadUnreadCount();
        },
        error: (err) => {
          console.error('Failed to load notifications', err);
          this.errorMessage = 'Failed to load notifications';
          this.loading = false;
        }
      });
  }

  loadUnreadCount(): void {
    // Count unread notifications locally
    this.unreadCount = this.notifications.filter(n => n.status === 'PENDING').length;
  }

  getNotificationIcon(type: RequestType): string {
    const iconMap: Record<RequestType, string> = {
      'MATCH_INVITATION': 'sports_soccer',
      'JOIN_TEAM_REQUEST': 'group_add',
      'JOIN_TEAM_INVITATION': 'group'
    };
    return iconMap[type] || 'notifications';
  }

  getNotificationIconClass(type: RequestType): string {
    const classMap: Record<RequestType, string> = {
      'MATCH_INVITATION': 'icon-primary',
      'JOIN_TEAM_REQUEST': 'icon-warning',
      'JOIN_TEAM_INVITATION': 'icon-info'
    };
    return classMap[type] || 'icon-default';
  }

  getNotificationTypeLabel(type: RequestType): string {
    const labelMap: Record<RequestType, string> = {
      'MATCH_INVITATION': 'Match Invitation',
      'JOIN_TEAM_REQUEST': 'Join Request',
      'JOIN_TEAM_INVITATION': 'Team Invitation'
    };
    return labelMap[type] || 'Notification';
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

  hasAction(notification: INotification): boolean {
    return ['MATCH_INVITATION', 'JOIN_TEAM_INVITATION', 'JOIN_TEAM_REQUEST'].includes(notification.requestType);
  }

  getActionLabel(notification: INotification): string {
    const actionMap: Record<RequestType, string> = {
      'MATCH_INVITATION': 'View Match',
      'JOIN_TEAM_INVITATION': 'View Team',
      'JOIN_TEAM_REQUEST': 'Manage Request',
    };
    return actionMap[notification.requestType] || '';
  }

  handleNotificationAction(notification: INotification): void {
    switch (notification.requestType) {
      case 'MATCH_INVITATION':
        // Navigate to match details using jokerId
        if (notification.jokerId) {
          this.router.navigate(['/dashboard/matches', notification.jokerId]);
        }
        break;
      case 'JOIN_TEAM_INVITATION':
        // Navigate to team details using jokerId
        if (notification.jokerId) {
          this.router.navigate(['/dashboard/teams', notification.jokerId]);
        }
        break;
      case 'JOIN_TEAM_REQUEST':
        // Navigate to team requests page
        this.router.navigate(['/dashboard/teams/requests']);
        break;
    }
  }
}
