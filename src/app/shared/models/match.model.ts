export type BookingMatchStatus = 'CONFIRMED' | 'CANCELLED' | 'PENDING' | 'SCHEDULED'; // Added SCHEDULED

export type MatchParticipantStatus = 'INVITED' | 'ACCEPTED' | 'DECLINED';

// IBookingMatch interface
export interface IBookingMatch {
  id: string; // Primary Key
  place_id: string; // Foreign Key to Place(id)
  user_id: string; // Foreign Key to User(id) (who booked)
  team_id: string; // Foreign Key to Team(id)
  start_time: string; // Timestamp for start time
  end_time: string; // Timestamp for end time
  status: BookingMatchStatus; // Status of the booking
  created_at: string; // Timestamp for creation date
  // Add other match/booking properties as needed
}

// IMatchParticipant interface
export interface IMatchParticipant {
  id: string; // Primary Key
  booking_match_id: string; // Foreign Key to IBookingMatch(id)
  user_id: string; // Foreign Key to User(id) - the participant user
  status: MatchParticipantStatus; // Status of the invitation/participation
  responded_at?: string; // Optional timestamp for when the participant responded
}
