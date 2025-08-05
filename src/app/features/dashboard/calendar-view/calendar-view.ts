import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { EventDetailsDialogComponent, EventDetailsData } from './event-details-dialog/event-details-dialog';
import { MatChipsModule } from '@angular/material/chips';
import { MatTooltipModule } from '@angular/material/tooltip';
import { FullCalendarModule } from '@fullcalendar/angular';
import { CalendarOptions, EventClickArg, EventApi } from '@fullcalendar/core';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import { BookingService } from '../../../core/services/booking.service';
import { MatchParticipantService, IBookingMatch } from '../../../core/services/match-participant.service';
import { PlaceService } from '../../../core/services/place.service';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-calendar-view',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatDialogModule,
    MatChipsModule,
    MatTooltipModule,
    FullCalendarModule
  ],
  templateUrl: './calendar-view.html',
  styleUrls: ['./calendar-view.css']
})
export class CalendarViewComponent implements OnInit {
  private bookingService = inject(BookingService);
  private matchService = inject(MatchParticipantService);
  private placeService = inject(PlaceService);
  private authService = inject(AuthService);
  private dialog = inject(MatDialog);

  calendarOptions: CalendarOptions = {
    plugins: [dayGridPlugin, timeGridPlugin, interactionPlugin],
    initialView: 'dayGridMonth',
    headerToolbar: {
      left: 'prev,next today',
      center: 'title',
      right: 'dayGridMonth,timeGridWeek,timeGridDay'
    },
    locale: 'en',
    direction: 'ltr',
    height: 'auto',
    selectable: true,
    selectMirror: true,
    dayMaxEvents: true,
    weekends: true,
    events: [],
    eventClick: this.handleEventClick.bind(this),
    eventColor: '#1976d2',
    eventTextColor: '#ffffff',
    eventDisplay: 'block',
    eventTimeFormat: {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    }
  };

  ngOnInit() {
    this.loadCalendarEvents();
  }



  private async loadCalendarEvents() {
    try {
      // Get current user
      const currentUser = this.authService.getCurrentUser();
      
      // Get real data from services
      let bookingsObservable;
      if (currentUser) {
        console.log('Getting bookings for user ID:', currentUser.id);
        // Use the same method as booking-list component
        bookingsObservable = this.bookingService.getMyMatchesAsOrganizer();
      } else {
        console.log('No user logged in, getting all bookings');
        bookingsObservable = this.bookingService.getBookings();
      }
      
      const [bookings, matches, places] = await Promise.all([
        bookingsObservable.toPromise(),
        this.matchService.getUserParticipatedMatches().toPromise(),
        this.placeService.getAllPlaces().toPromise()
      ]);

      console.log('Calendar loading real data:');
      console.log('Current User ID:', currentUser?.id);
      console.log('Bookings found:', bookings?.length || 0);
      console.log('Matches found:', matches?.length || 0);
      console.log('Places found:', places?.length || 0);

      const events: any[] = [];

      // 1. Booked Pitches (from BookingService)
      console.log('Loading bookings:', bookings);
      if (bookings && Array.isArray(bookings) && places) {
        bookings.forEach((booking: any) => {
          const place = places.find(p => p.id.toString() === booking.placeId?.toString());
          console.log('Processing booking:', booking, 'Place:', place);
          console.log('Booking startTime:', booking.startTime, 'endTime:', booking.endTime);
          
          // Validate dates
          const startDate = new Date(booking.startTime);
          const endDate = new Date(booking.endTime);
          
          if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
            console.error('Invalid date format for booking:', booking.id);
            return;
          }
          
          events.push({
            id: `booking-${booking.id}`,
            title: `Booking: ${place?.name || 'Pitch'}`,
            start: booking.startTime,
            end: booking.endTime,
            backgroundColor: '#4caf50',
            borderColor: '#4caf50',
            textColor: '#ffffff',
            extendedProps: {
              type: 'booking',
              data: {
                ...booking,
                placeName: place?.name || 'Pitch',
                location: place?.location || 'Unknown Location'
              }
            }
          });
        });
      }

      // 2. Upcoming Matches (from BookingMatch)
      console.log('Loading matches:', matches);
      if (matches && Array.isArray(matches) && places) {
        matches.forEach((match: IBookingMatch) => {
          const place = places.find(p => p.id.toString() === match.placeId?.toString());
          const team = this.getTeamById(match.teamId);
          console.log('Processing match:', match, 'Place:', place, 'Team:', team);
          console.log('Match startTime:', match.startTime, 'endTime:', match.endTime);
          
          // Validate dates
          const startDate = new Date(match.startTime);
          const endDate = new Date(match.endTime);
          
          if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
            console.error('Invalid date format for match:', match.id);
            return;
          }
          
          events.push({
            id: `match-${match.id}`,
            title: `Match: ${match.teamName || 'Team'}`,
            start: match.startTime,
            end: match.endTime,
            backgroundColor: '#ff9800',
            borderColor: '#ff9800',
            textColor: '#ffffff',
            extendedProps: {
              type: 'match',
              data: {
                ...match,
                placeName: place?.name || 'Pitch',
                location: place?.location || 'Unknown Location',
                teamName: match.teamName || 'Team'
              }
            }
          });
        });
      }

      this.calendarOptions.events = events;
    } catch (error) {
      console.error('Error loading calendar events:', error);
    }
  }

  private getTeamById(teamId: string): any {
    try {
      const teamsString = localStorage.getItem('teams');
      if (teamsString) {
        const teams = JSON.parse(teamsString);
        return teams.find((team: any) => team.id === teamId) || null;
      }
      return null;
    } catch (error) {
      console.error('Error loading team by ID:', error);
      return null;
    }
  }

  private handleEventClick(info: EventClickArg) {
    const event = info.event;
    const eventData = event.extendedProps as any;
    
    if (eventData['type'] === 'booking') {
      this.showBookingDetails(eventData['data']);
    } else if (eventData['type'] === 'match') {
      this.showMatchDetails(eventData['data']);
    }
  }

  private showBookingDetails(booking: any) {
    const dialogRef = this.dialog.open(EventDetailsDialogComponent, {
      width: '600px',
      data: { type: 'booking', data: booking } as EventDetailsData
    });
  }

  private showMatchDetails(match: any) {
    const dialogRef = this.dialog.open(EventDetailsDialogComponent, {
      width: '600px',
      data: { type: 'match', data: match } as EventDetailsData
    });
  }






} 