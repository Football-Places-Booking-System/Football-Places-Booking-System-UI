export interface ITeam {
  id: string; // Primary Key
  name: string;
  description?: string; // Optional description
  created_by: string; // Foreign Key to User(id) - the user who created the team
  created_at: string; // Timestamp for creation date
}