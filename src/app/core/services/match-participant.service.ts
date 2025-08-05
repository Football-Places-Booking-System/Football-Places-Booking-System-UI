import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

export type BookingStatus = 'CONFIRMED' | 'CANCELLED' | 'PENDING' | 'PENDING_PAYMENT';
export type InvitationStatus = 'INVITED' | 'ACCEPTED' | 'DECLINED';

/**
 * Participant entity for a specific match
 */
export interface IMatchParticipant {
  id: string;
  bookingMatchId: string;
  userId: string;
  username: string;
  userEmail: string;
  status: InvitationStatus;
  respondedAt?: string;
}

/**
 * Request body for inviting a participant
 */
export interface IInvitationRequest {
  email: string;
}

/**
 * Combined Match + Invitation DTO from backend
 */
export interface IUserMatch {
  matchId: string;
  participantId: string;
  teamId: string;
  teamName: string;
  placeId: string;
  placeName: string;
  startTime: string;
  endTime: string;
  bookingStatus: BookingStatus;
  invitationStatus: InvitationStatus;
}

@Injectable({
  providedIn: 'root',
})
export class MatchParticipantService {
  private readonly API_URL = 'http://localhost:8080/api/match-participants';

  constructor(private http: HttpClient) {}

  /**
   * Invite a participant to a match
   */
  inviteParticipant(bookingMatchId: string, dto: IInvitationRequest): Observable<IMatchParticipant | null> {
    return this.http
      .post<IMatchParticipant>(`${this.API_URL}/invite/${bookingMatchId}`, dto)
      .pipe(
        catchError((err) => {
          console.error('Error inviting participant:', err);
          return of(null);
        })
      );
  }

  /**
   * Respond to a match invitation by participant ID
   */
  respondToMatchInvitation(matchParticipantId: string, status: 'ACCEPTED' | 'DECLINED'): Observable<void> {
    return this.http
      .get<void>(`${this.API_URL}/respond/${matchParticipantId}`, {
        params: { status },
      })
      .pipe(
        catchError((err) => {
          console.error('Error responding to match invitation:', err);
          return of();
        })
      );
  }

  /**
   * Get all participants for a specific match
   */
  getParticipantsByMatch(matchId: string): Observable<IMatchParticipant[]> {
    return this.http
      .get<IMatchParticipant[]>(`${this.API_URL}/match/${matchId}`)
      .pipe(
        catchError((err) => {
          console.error('Error fetching participants:', err);
          return of([]);
        })
      );
  }

  /**
   * Get all matches where the current user is a participant
   * (Now includes participantId and invitationStatus)
   */
  getUserParticipatedMatches(): Observable<IUserMatch[]> {
    return this.http
      .get<IUserMatch[]>(`${this.API_URL}/user/matches`)
      .pipe(
        map((res) => res || []),
        catchError((err) => {
          console.error('Error fetching participated matches:', err);
          return of([]);
        })
      );
  }
}
