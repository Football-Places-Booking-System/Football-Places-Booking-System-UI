import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { map, catchError } from 'rxjs/operators';

export type NotificationType =
  | 'BOOKING_CONFIRMATION'
  | 'MATCH_INVITATION'
  | 'TEAM_JOIN_REQUEST'
  | 'TEAM_INVITATION'
  | 'APPROVAL'
  | 'REJECTION'
  | 'MATCH_PARTICIPATION_REQUEST'
  | 'MATCH_PARTICIPATION_APPROVED'
  | 'MATCH_PARTICIPATION_REJECTED'
  | 'JOIN_TEAM_INVITATION';

export type NotificationStatus = 'UNREAD' | 'READ' | 'PENDING';

export interface INotification {
  id: string;
  userId: number;
  type: NotificationType;
  title: string;
  message: string;
  status: NotificationStatus;
  relatedId?: string; // ID of related booking, match, team, etc.
  createdAt: string;
  readAt?: string;
  metadata?: {
    bookingId?: string;
    matchId?: string;
    teamId?: string;
    fromUserId?: number;
    fromUsername?: string;
    senderId?: string;
    receiverId?: string;
    joker_id?: string;
  };
}

// Interface for the backend request data
export interface IBackendRequest {
  id: string;
  sendTime: string;
  responseTime?: string;
  requestType: string;
  status: string;
  requestMessage: string;
  responseMessage?: string;
  sender: {
    id: string;
    username: string;
    email: string;
    userName: string;
  };
  receiver: {
    id: string;
    username: string;
    email: string;
    userName: string;
  };
  joker_id: string;
}

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private apiUrl = '/api/requests'; // Using proxy config

  constructor(private http: HttpClient) {}

  // Create notification
  createNotification(notification: Omit<INotification, 'id' | 'createdAt'>): Observable<INotification> {
    try {
      const newNotification: INotification = {
        ...notification,
        id: Date.now().toString(),
        createdAt: new Date().toISOString()
      };

      const notificationsString = localStorage.getItem('notifications');
      const notifications: INotification[] = notificationsString ? JSON.parse(notificationsString) : [];
      notifications.push(newNotification);
      localStorage.setItem('notifications', JSON.stringify(notifications));

      return of(newNotification);
    } catch (error) {
      console.error('Error creating notification:', error);
      throw new Error('Failed to create notification');
    }
  }

  // Get notifications for a user using the new API
  getUserNotifications(): Observable<INotification[]> {
    console.log('NotificationService: Fetching user notifications from API');

    return this.http.get<IBackendRequest[]>(`${this.apiUrl}/received`).pipe(
      map(requests => {
        console.log('NotificationService: Raw requests from API:', requests);

        // Map backend requests to notification format
        const notifications: INotification[] = requests.map(request => ({
          id: request.id,
          userId: 0, // We'll use the receiver ID if needed
          type: this.mapRequestTypeToNotificationType(request.requestType),
          title: this.generateNotificationTitle(request.requestType),
          message: request.requestMessage,
          status: this.mapRequestStatusToNotificationStatus(request.status),
          relatedId: request.joker_id,
          createdAt: request.sendTime,
          readAt: request.responseTime || undefined,
          metadata: {
            senderId: request.sender.id,
            fromUsername: request.sender.userName,
            receiverId: request.receiver.id,
            joker_id: request.joker_id
          }
        }));

        console.log('NotificationService: Mapped notifications:', notifications);

        // Sort by creation date (newest first)
        return notifications.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      }),
      catchError(error => {
        console.error('NotificationService: Error fetching notifications from API:', error);

        // Fallback to localStorage if API fails
        try {
          const notificationsString = localStorage.getItem('notifications');
          if (notificationsString) {
            const notifications: INotification[] = JSON.parse(notificationsString);
            return of(notifications.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
          }
        } catch (localError) {
          console.error('Error loading notifications from localStorage:', localError);
        }

        return of([]);
      })
    );
  }

  // Helper method to map request type to notification type
  private mapRequestTypeToNotificationType(requestType: string): NotificationType {
    const typeMap: Record<string, NotificationType> = {
      'JOIN_TEAM_INVITATION': 'JOIN_TEAM_INVITATION',
      'TEAM_JOIN_REQUEST': 'TEAM_JOIN_REQUEST',
      'MATCH_INVITATION': 'MATCH_INVITATION',
      'TEAM_INVITATION': 'TEAM_INVITATION',
      'MATCH_PARTICIPATION_REQUEST': 'MATCH_PARTICIPATION_REQUEST',
      'BOOKING_CONFIRMATION': 'BOOKING_CONFIRMATION'
    };
    return typeMap[requestType] || 'TEAM_JOIN_REQUEST';
  }

  // Helper method to map request status to notification status
  private mapRequestStatusToNotificationStatus(status: string): NotificationStatus {
    const statusMap: Record<string, NotificationStatus> = {
      'PENDING': 'PENDING',
      'APPROVED': 'READ',
      'REJECTED': 'READ',
      'UNREAD': 'UNREAD'
    };
    return statusMap[status] || 'UNREAD';
  }

  // Helper method to generate notification title
  private generateNotificationTitle(requestType: string): string {
    const titleMap: Record<string, string> = {
      'JOIN_TEAM_INVITATION': 'Team Invitation',
      'TEAM_JOIN_REQUEST': 'Team Join Request',
      'MATCH_INVITATION': 'Match Invitation',
      'TEAM_INVITATION': 'Team Invitation',
      'MATCH_PARTICIPATION_REQUEST': 'Match Participation Request',
      'BOOKING_CONFIRMATION': 'Booking Confirmation'
    };
    return titleMap[requestType] || 'Notification';
  }

  // Get unread notifications count
  getUnreadCount(userId: string): Observable<number> {
    return this.getUserNotifications().pipe(
      map(notifications => notifications.filter(n => n.status === 'UNREAD' || n.status === 'PENDING').length),
      catchError(error => {
        console.error('Error getting unread count:', error);
        return of(0);
      })
    );
  }

  // Mark notification as read
  markAsRead(notificationId: string): Observable<void> {
    try {
      const notificationsString = localStorage.getItem('notifications');
      if (notificationsString) {
        const notifications: INotification[] = JSON.parse(notificationsString);
        const notification = notifications.find(n => n.id === notificationId);
        if (notification) {
          notification.status = 'READ';
          notification.readAt = new Date().toISOString();
          localStorage.setItem('notifications', JSON.stringify(notifications));
        }
      }
      return of(void 0);
    } catch (error) {
      console.error('Error marking notification as read:', error);
      throw new Error('Failed to mark notification as read');
    }
  }

  // Mark all notifications as read for a user
  markAllAsRead(userId: string): Observable<void> {
    // try {
    //   const notificationsString = localStorage.getItem('notifications');
    //   if (notificationsString) {
    //     const notifications: INotification[] = JSON.parse(notificationsString);
    //     const updatedNotifications = notifications.map(n => {
    //       if (n.userId === userId && n.status === 'UNREAD') {
    //         return { ...n, status: 'READ' as NotificationStatus, readAt: new Date().toISOString() };
    //       }
    //       return n;
    //     });
    //     localStorage.setItem('notifications', JSON.stringify(updatedNotifications));
    //   }
    //   return of(void 0);
    // } catch (error) {
    //   console.error('Error marking all notifications as read:', error);
    //   throw new Error('Failed to mark all notifications as read');
    // }
    return of(void 0);
  }

  // Delete notification
  deleteNotification(notificationId: string): Observable<void> {
    try {
      const notificationsString = localStorage.getItem('notifications');
      if (notificationsString) {
        const notifications: INotification[] = JSON.parse(notificationsString);
        const filteredNotifications = notifications.filter(n => n.id !== notificationId);
        localStorage.setItem('notifications', JSON.stringify(filteredNotifications));
      }
      return of(void 0);
    } catch (error) {
      console.error('Error deleting notification:', error);
      throw new Error('Failed to delete notification');
    }
  }

  // Helper methods for creating specific types of notifications
  createBookingConfirmationNotification(userId: number, bookingId: string, placeName: string): Observable<INotification> {
    return this.createNotification({
      userId,
      type: 'BOOKING_CONFIRMATION',
      title: 'Booking Confirmed',
      message: `Your booking for ${placeName} has been confirmed!`,
      status: 'UNREAD',
      relatedId: bookingId,
      metadata: { bookingId }
    });
  }

  createMatchInvitationNotification(userId: number, matchId: string, teamName: string, organizerName: string): Observable<INotification> {
    return this.createNotification({
      userId,
      type: 'MATCH_INVITATION',
      title: 'Match Invitation',
      message: `${organizerName} has invited you to join a match with ${teamName}`,
      status: 'UNREAD',
      relatedId: matchId,
      metadata: { matchId }
    });
  }

  createTeamJoinRequestNotification(userId: number, teamId: string, teamName: string, requesterName: string): Observable<INotification> {
    return this.createNotification({
      userId,
      type: 'TEAM_JOIN_REQUEST',
      title: 'Team Join Request',
      message: `${requesterName} wants to join your team ${teamName}`,
      status: 'UNREAD',
      relatedId: teamId,
      metadata: { teamId }
    });
  }

  createTeamInvitationNotification(userId: number, teamId: string, teamName: string, organizerName: string): Observable<INotification> {
    return this.createNotification({
      userId,
      type: 'TEAM_INVITATION',
      title: 'Team Invitation',
      message: `${organizerName} has invited you to join team ${teamName}`,
      status: 'UNREAD',
      relatedId: teamId,
      metadata: { teamId }
    });
  }

  createApprovalNotification(userId: number, type: string, itemName: string): Observable<INotification> {
    return this.createNotification({
      userId,
      type: 'APPROVAL',
      title: 'Request Approved',
      message: `Your ${type} request for ${itemName} has been approved!`,
      status: 'UNREAD'
    });
  }

  createRejectionNotification(userId: number, type: string, itemName: string): Observable<INotification> {
    return this.createNotification({
      userId,
      type: 'REJECTION',
      title: 'Request Rejected',
      message: `Your ${type} request for ${itemName} has been rejected.`,
      status: 'UNREAD'
    });
  }

  createMatchParticipationRequestNotification(userId: number, matchId: string, playerName: string): Observable<INotification> {
    return this.createNotification({
      userId,
      type: 'MATCH_PARTICIPATION_REQUEST',
      title: 'Match Participation Request',
      message: `${playerName} wants to participate in your match`,
      status: 'UNREAD',
      relatedId: matchId,
      metadata: { matchId }
    });
  }

  createMatchParticipationApprovedNotification(userId: number, matchId: string): Observable<INotification> {
    return this.createNotification({
      userId,
      type: 'MATCH_PARTICIPATION_APPROVED',
      title: 'Match Participation Approved',
      message: 'Your request to participate in the match has been approved!',
      status: 'UNREAD',
      relatedId: matchId,
      metadata: { matchId }
    });
  }

  createMatchParticipationRejectedNotification(userId: number, matchId: string): Observable<INotification> {
    return this.createNotification({
      userId,
      type: 'MATCH_PARTICIPATION_REJECTED',
      title: 'Match Participation Rejected',
      message: 'Your request to participate in the match has been rejected.',
      status: 'UNREAD',
      relatedId: matchId,
      metadata: { matchId }
    });
  }
}
