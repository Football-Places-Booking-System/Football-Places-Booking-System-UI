export type UserRole = 'PLAYER' | 'ORGANIZER' | 'ADMIN';

export interface IUser { 
  id: string; 
  username: string;
  email: string;
  password?: string; 
  role: UserRole;
}