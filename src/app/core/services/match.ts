import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, throwError } from 'rxjs';
import { delay, tap, catchError } from 'rxjs/operators';
import { IBookingMatch, IMatchParticipant, MatchParticipantStatus, BookingMatchStatus } from '../../shared/models/match.model';
import { IUser } from '../../shared/models/user.model'; 

@Injectable({
  providedIn: 'root'
})
export class Match { 
  private apiUrl = 'YOUR_BACKEND_API_URL';

  private mockMatches: IBookingMatch[] = [
    {
      id: 'match1', 
      place_id: 'placeA',
      user_id: 'user7',
      team_id: 'team1',
      start_time: '2025-08-10T19:00:00Z',
      end_time: '2025-08-10T21:00:00Z',
      status: 'CONFIRMED',
      created_at: '2025-08-01T10:00:00Z'
    },
    {
      id: 'match2',
      place_id: 'placeB',
      user_id: 'user8',
      team_id: 'team2',
      start_time: '2025-08-15T20:00:00Z',
      end_time: '2025-08-15T22:00:00Z',
      status: 'PENDING',
      created_at: '2025-08-05T11:00:00Z'
    },
    {
      id: 'match_for_dynamic_team', // New match ID
      place_id: 'placeC',
      user_id: 'user7',
      team_id: '1753451266735', // Linked to the dynamic team ID
      start_time: '2025-09-01T15:00:00Z',
      end_time: '2025-09-01T17:00:00Z',
      status: 'SCHEDULED', // Using the new SCHEDULED status
      created_at: '2025-08-20T09:00:00Z'
    }
  ];

  private mockMatchParticipants: { [matchId: string]: IMatchParticipant[] } = {
    'match1': [
      { id: 'mp1_1', booking_match_id: 'match1', user_id: 'user1', status: 'ACCEPTED', responded_at: '2025-08-05T10:00:00Z' },
      { id: 'mp1_2', booking_match_id: 'match1', user_id: 'user2', status: 'INVITED', responded_at: undefined },
      { id: 'mp1_3', booking_match_id: 'match1', user_id: 'user3', status: 'INVITED', responded_at: undefined },
    ],
    'match2': [
      { id: 'mp2_1', booking_match_id: 'match2', user_id: 'user1', status: 'INVITED', responded_at: undefined },
      { id: 'mp2_2', booking_match_id: 'match2', user_id: 'user4', status: 'ACCEPTED', responded_at: '2025-08-12T14:30:00Z' },
    ],
    // Participants for the dynamic team's match
    'match_for_dynamic_team': [
      { id: 'mp_dyn_1', booking_match_id: 'match_for_dynamic_team', user_id: 'user1', status: 'INVITED', responded_at: undefined },
      { id: 'mp_dyn_2', booking_match_id: 'match_for_dynamic_team', user_id: 'user4', status: 'ACCEPTED', responded_at: '2025-08-25T10:00:00Z' },
    ]
  };

  constructor(private http: HttpClient) { }

  getMatchById(matchId: string): Observable<IBookingMatch> {
    console.log(`MatchService: Fetching booking match with ID: ${matchId}`);
    const match = this.mockMatches.find(m => m.id === matchId);
    if (match) {
      return of(match).pipe(delay(500));
    } else {
      return throwError(() => new Error('Booking Match not found'));
    }
  }

  getMatchParticipants(matchId: string): Observable<IMatchParticipant[]> {
    console.log(`MatchService: Fetching participants for booking match ID: ${matchId}`);
    const participants = this.mockMatchParticipants[matchId] || [];
    return of(participants).pipe(delay(500));
  }

  inviteParticipant(matchId: string, userId: string): Observable<IMatchParticipant> {
    console.log(`MatchService: Inviting user ${userId} to booking match ${matchId}`);
    const currentParticipants = this.mockMatchParticipants[matchId] || [];
    const existingParticipant = currentParticipants.find(p => p.user_id === userId);

    if (existingParticipant) {
      if (existingParticipant.status === 'INVITED') {
        console.warn(`User ${userId} already invited for booking match ${matchId}`);
        return throwError(() => new Error('User already invited.'));
      } else {
        console.warn(`User ${userId} already ${existingParticipant.status} for booking match ${matchId}`);
        return throwError(() => new Error(`User already ${existingParticipant.status}.`));
      }
    } else {
      const newParticipant: IMatchParticipant = {
        id: `mp${Math.random().toString(36).substring(2, 9)}`,
        booking_match_id: matchId,
        user_id: userId,
        status: 'INVITED',
        responded_at: undefined
      };
      this.mockMatchParticipants[matchId] = [...currentParticipants, newParticipant];
      console.log(`User ${userId} invited to booking match ${matchId} (mock success).`);
      return of(newParticipant).pipe(delay(500));
    }
  }
}
