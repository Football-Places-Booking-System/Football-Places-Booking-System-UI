export type TeamMemberRole = 'MEMBER' | 'ORGANIZER';
export type TeamMemberStatus = 'PENDING' | 'APPROVED' | 'REJECTED';

export interface ITeamMember {
  id: string; // Primary Key
  user_id: string; // Foreign Key to User(id)
  team_id: string; // Foreign Key to Team(id)
  role: TeamMemberRole; // Role within the team (e.g., MEMBER, ORGANIZER)
  status: TeamMemberStatus; // Status of the team membership (e.g., PENDING, APPROVED, REJECTED)
  invited_by: string; // Foreign Key to User(id) - the user who invited this member
  created_at: string; // Timestamp for when the membership was created/invited
}