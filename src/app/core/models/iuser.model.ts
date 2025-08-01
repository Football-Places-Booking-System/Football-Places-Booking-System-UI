import { myUserRole } from '../enums/user-role';

export type UserRole = 'PLAYER' | 'USER' | 'ADMIN' | 'ORGANIZER';

export interface IUser {
  id: string;
  username: string;
  email: string;
  password: string;
  role: UserRole;
  // role: myUserRole;
  status?: 'ACTIVE' | 'INACTIVE';
  createdAt?: string;
  updatedAt?: string;
}


// create interface for register
export interface IRegisterUser {
  username: string;
  email: string;
  password: string;
}


// create interface for register
export interface IRegisterResponseUser {
  id: string;
  token: string;
  role: myUserRole;
}


export interface ILoginUser {
  email: string;
  password: string;
}


