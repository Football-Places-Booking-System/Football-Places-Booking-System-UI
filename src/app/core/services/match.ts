import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { tap, catchError, switchMap } from 'rxjs/operators';
import { IBookingMatch, IMatchParticipant, MatchParticipantStatus } from '../../shared/models/match.model';
import { IUser } from '../../shared/models/user.model';
import { Team } from './team';
import { BackendError, ErrorCode, ErrorCodeMessages } from '../../shared/models/error-code.enum'; 

@Injectable({
  providedIn: 'root'
})
export class Match {
  private matchesApiUrl = 'http://localhost:3000/api/matches';
  private participantsApiUrl = 'http://localhost:3000/api/match-participants';

  constructor(private http: HttpClient, private teamService: Team) { }

private handleError(error: HttpErrorResponse): Observable<never> {
  let errorMessage = 'An unknown error occurred!';

  if (error.error instanceof ErrorEvent) {
    errorMessage = `Error: ${error.error.message}`;
  } else {
    if (error.error && typeof error.error === 'object' && 'code' in error.error && 'msg' in error.error) {
      const backendError = error.error as BackendError;
      errorMessage = `Backend Error [Code: ${backendError.code}]: ${backendError.msg}`;
    } else {
      errorMessage = `Server returned code: ${error.status}, message: ${error.message}`;
      if (error.status === 404) {
        errorMessage = 'Resource not found.';
      } else if (error.status === 400) {
        errorMessage = 'Bad request. Please check your input.';
      } else if (error.status === 409) {
        errorMessage = 'Conflict: Resource already exists or operation not allowed.';
      } else if (error.status === 500) {
        errorMessage = 'Internal Server Error.';
      }
    }
  }

  console.error('Service Error:', errorMessage, error);
  return throwError(() => new Error(errorMessage));
}

  getMatchById(matchId: string): Observable<IBookingMatch> {
    console.log(`MatchService: Fetching booking match with ID: ${matchId} from backend.`);
    return this.http.get<IBookingMatch>(`${this.matchesApiUrl}/${matchId}`)
      .pipe(
        tap(match => console.log(`MatchService: Fetched match ${matchId} from backend:`, match)),
        catchError((error: HttpErrorResponse) => {
          if (error.status === 404) {
            console.log(`MatchService: Match with ID ${matchId} not found on backend.`);
            return throwError(() => new Error(`Booking Match with ID ${matchId} not found.`));
          }
          return this.handleError(error);
        })
      );
  }

  getMatchParticipants(matchId: string): Observable<IMatchParticipant[]> {
    console.log(`MatchService: Fetching participants for booking match ID: ${matchId} from backend.`);
    return this.http.get<IMatchParticipant[]>(`${this.participantsApiUrl}?booking_match_id=${matchId}`)
      .pipe(
        tap(participants => console.log(`MatchService: Fetched participants for ${matchId} from backend:`, participants)),
        catchError(this.handleError)
      );
  }
  inviteParticipant(matchId: string, userEmail: string): Observable<IMatchParticipant> {
    console.log(`MatchService: Inviting user with email ${userEmail} to booking match ${matchId} via backend.`);

    return this.teamService.getUserByEmail(userEmail).pipe( 
      switchMap(user => { 
        if (!user || !user.id) {
          console.error(`MatchService: User with email ${userEmail} not found or has no ID.`);
          return throwError(() => new Error(`User with email ${userEmail} not found.`));
        }

        const newParticipantData: Omit<IMatchParticipant, 'id' | 'responded_at'> = {
          booking_match_id: matchId,
          user_id: user.id, 
          status: 'INVITED'
        };

        return this.http.post<IMatchParticipant>(this.participantsApiUrl, newParticipantData).pipe(
          tap(participant => console.log('MatchService: User invited successfully on backend:', participant)),
          catchError(this.handleError)
        );
      }),
      catchError(this.handleError) 
    );
  }

  // createMatch(matchData: Omit<IBookingMatch, 'id' | 'created_at'>): Observable<IBookingMatch> {
  //   return this.http.post<IBookingMatch>(this.matchesApiUrl, matchData).pipe(catchError(this.handleError));
  // }

  // updateMatch(match: IBookingMatch): Observable<IBookingMatch> {
  //   return this.http.put<IBookingMatch>(`${this.matchesApiUrl}/${match.id}`, match).pipe(catchError(this.handleError));
  // }

  // deleteMatch(matchId: string): Observable<void> {
  //   return this.http.delete<void>(`${this.matchesApiUrl}/${matchId}`).pipe(catchError(this.handleError));
  // }

  // updateParticipantStatus(participantId: string, newStatus: MatchParticipantStatus): Observable<IMatchParticipant> {
  //   return this.http.patch<IMatchParticipant>(`${this.participantsApiUrl}/${participantId}`, { status: newStatus }).pipe(catchError(this.handleError));
  // }
}