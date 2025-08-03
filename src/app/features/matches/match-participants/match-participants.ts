import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { Observable, combineLatest, map, switchMap, of, catchError, tap, takeUntil, Subject } from 'rxjs';

import { MatchParticipantService, IMatchParticipant, IInvitationRequest } from '../../../core/services/match-participant.service';
import { TeamService, ITeamMember } from '../../../core/services/team.service';
import { BookingService, IBooking } from '../../../core/services/booking.service';

@Component({
  selector: 'app-match-participants',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './match-participants.html',
  styleUrls: ['./match-participants.css']
})
export class MatchParticipantsComponent implements OnInit, OnDestroy {
  matchId!: string;
  teamId!: string;

  match$!: Observable<IBooking | null>;
  players$!: Observable<ITeamMember[]>;
  matchParticipants$!: Observable<IMatchParticipant[]>;

  combinedData$!: Observable<{ 
    match: IBooking | null, 
    players: ITeamMember[], 
    participants: IMatchParticipant[], 
    teamId: string 
  }>;

  errorMessage: string | null = null;
  private destroy$ = new Subject<void>();

  constructor(
    private route: ActivatedRoute,
    private bookingService: BookingService,
    private matchParticipantService: MatchParticipantService,
    private teamService: TeamService
  ) { }

  ngOnInit(): void {
    console.log('MatchParticipantsComponent: ngOnInit started.');

    this.combinedData$ = this.route.paramMap.pipe(
      map(params => {
        this.matchId = params.get('id') || '';
        this.teamId = params.get('teamId') || '';
        console.log(`MatchParticipantsComponent: Route Params - matchId: ${this.matchId}, teamId: ${this.teamId}`);

        if (!this.matchId || !this.teamId) {
          this.errorMessage = 'Match ID or Team ID is missing in the route.';
          throw new Error(this.errorMessage);
        }
        return { matchId: this.matchId, teamId: this.teamId };
      }),
      switchMap(({ matchId, teamId }) => {
        console.log(`MatchParticipantsComponent: Initiating service calls for matchId: ${matchId}, teamId: ${teamId}`);
        return combineLatest([
          this.bookingService.getBookingById(matchId).pipe(catchError(() => of(null))),
          this.teamService.getTeamMembers(teamId).pipe(catchError(() => of([]))),
          this.matchParticipantService.getParticipantsByMatch(matchId).pipe(catchError(() => of([])))
        ]).pipe(
          tap(([match, players, participants]) => {
            console.log('Match data:', match);
            console.log('Players:', players);
            console.log('Participants:', participants);
          }),
          map(([match, players, participants]) => ({ match, players, participants, teamId })),
          catchError((err) => {
            this.errorMessage = `Error loading data: ${err.message}`;
            return of({ match: null, players: [], participants: [], teamId });
          })
        );
      }),
      takeUntil(this.destroy$)
    );

    this.combinedData$.subscribe({
      next: (data) => {
        console.log('Combined data received:', data);
      },
      error: (err) => {
        console.error('Error in combinedData$ subscription:', err);
      }
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /**
   * Check if a player is invited or accepted in the match participants list
   */
  isPlayerInvited(userId: string, participants: IMatchParticipant[]): boolean {
    return participants.some(p => p.userId === userId && (p.status === 'INVITED' || p.status === 'ACCEPTED'));
  }

  /**
   * Get invitation status for a specific player
   */
  getPlayerInvitationStatus(userId: string, participants: IMatchParticipant[]): string {
    const participant = participants.find(p => p.userId === userId);
    return participant ? participant.status.charAt(0).toUpperCase() + participant.status.slice(1).toLowerCase() : 'Not Invited';
  }

  /**
   * Invite a player by userId (this assumes you can get their email from team members)
   */
  invitePlayer(email: string): void {
    if (!this.matchId) {
      this.errorMessage = 'Match ID is not available.';
      return;
    }

    const dto: IInvitationRequest = { email };
    this.matchParticipantService.inviteParticipant(this.matchId, dto).subscribe({
      next: (participant) => {
        console.log('User invited successfully:', participant);
        this.refreshParticipants();
      },
      error: (err) => {
        this.errorMessage = `Failed to invite user: ${err.message}`;
      }
    });
  }

  /**
   * Refresh participants list after an invitation
   */
  private refreshParticipants(): void {
    if (this.matchId) {
      this.matchParticipantService.getParticipantsByMatch(this.matchId).pipe(
        catchError((err) => {
          this.errorMessage = `Error refreshing participants: ${err.message}`;
          return of([]);
        }),
        takeUntil(this.destroy$)
      ).subscribe((newParticipants) => {
        this.combinedData$ = this.combinedData$.pipe(
          map(data => ({ ...data, participants: newParticipants })),
          takeUntil(this.destroy$)
        );
      });
    }
  }
}
