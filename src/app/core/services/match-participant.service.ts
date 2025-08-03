import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

export type BookingStatus = 'CONFIRMED' | 'CANCELLED' | 'PENDING' | 'PENDING_PAYMENT';
export type invitationStatus = 'INVITED' | 'ACCEPTED' | 'DECLINED';

export interface IMatchParticipant {
  id: string;
  bookingMatchId: string;
  userId: string;
  username: string;
  userEmail: string;
  status: invitationStatus;
  respondedAt?: string;
}

export interface IInvitationRequest {
  email: string;
}

export interface IBookingMatch {
  id: string;
  startTime: string;
  endTime: string;
  status: BookingStatus;
  userId: string;
  teamId: string;
  teamName: string;
  placeId: string;
  placeName: string;
}

export interface IBookingMatchDetails extends IBookingMatch {
  createdAt?: string;
  userName?: string;
}

@Injectable({
  providedIn: 'root',
})
export class MatchParticipantService {
  private readonly API_URL = 'http://localhost:8080/api/match-participants';

  constructor(private http: HttpClient) {}

  /**
   * Helper: Build HTTP headers with JWT token
   */
  private getAuthHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    return new HttpHeaders({
      Authorization: token ? `Bearer ${token}` : '',
      'Content-Type': 'application/json',
    });
  }

  /**
   * Invite a participant to a match by email
   */
  inviteParticipant(bookingMatchId: string, dto: IInvitationRequest): Observable<IMatchParticipant | null> {
    return this.http
      .post<IMatchParticipant>(`${this.API_URL}/invite/${bookingMatchId}`, dto, { headers: this.getAuthHeaders() })
      .pipe(
        catchError((err) => {
          console.error('Error inviting participant:', err);
          return of(null);
        })
      );
  }

  /**
   * Respond to an invitation (ACCEPTED or DECLINED)
   */
  respondToInvitation(participantId: string, status: 'ACCEPTED' | 'DECLINED'): Observable<IMatchParticipant | null> {
    return this.http
      .patch<IMatchParticipant>(`${this.API_URL}/respond/${participantId}`, null, {
        headers: this.getAuthHeaders(),
        params: { status },
      })
      .pipe(
        catchError((err) => {
          console.error('Error responding to invitation:', err);
          return of(null);
        })
      );
  }

  /**
   * Respond to a match invitation by participant ID
   * @param matchParticipantId The ID of the match participant
   * @param status The response status (ACCEPTED or DECLINED)
   * @returns Observable with the updated match participant response
   */
  respondToMatchInvitation(matchParticipantId: string, status: 'ACCEPTED' | 'DECLINED'): Observable<IMatchParticipant | null> {
    return this.http
      .patch<IMatchParticipant>(`${this.API_URL}/respond/${matchParticipantId}`, null, {
        headers: this.getAuthHeaders(),
        params: { status },
      })
      .pipe(
        catchError((err) => {
          console.error('Error responding to match invitation:', err);
          return of(null);
        })
      );
  }

  /**
   * Get all participants for a specific match
   */
  getParticipantsByMatch(matchId: string): Observable<IMatchParticipant[]> {
    return this.http
      .get<IMatchParticipant[]>(`${this.API_URL}/match/${matchId}`, { headers: this.getAuthHeaders() })
      .pipe(
        catchError((err) => {
          console.error('Error fetching participants:', err);
          return of([]);
        })
      );
  }

  /**
   * Get all matches where the current user is a participant (simple response)
   */
  getUserParticipatedMatches(): Observable<IBookingMatch[]> {
    return this.http
      .get<IBookingMatch[]>(`${this.API_URL}/user/matches`, { headers: this.getAuthHeaders() })
      .pipe(
        map((res) => res || []),
        catchError((err) => {
          console.error('Error fetching participated matches:', err);
          return of([]);
        })
      );
  }

  /**
   * Get all matches where the current user is a participant (detailed response)
   */
  getUserParticipatedMatchesDetailed(): Observable<IBookingMatchDetails[]> {
    return this.http
      .get<IBookingMatchDetails[]>(`${this.API_URL}/user/matches/details`, { headers: this.getAuthHeaders() })
      .pipe(
        map((res) => res || []),
        catchError((err) => {
          console.error('Error fetching detailed participated matches:', err);
          return of([]);
        })
      );
  }
}
