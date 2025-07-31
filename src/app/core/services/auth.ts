import { Injectable } from '@angular/core';
import { Team } from './team';
import { User as UserService, UserProfile } from './user';

import { IUser, IRegisterUser, ILoginUser, IRegisterResponseUser } from '../models/iuser';
import { Router } from '@angular/router';
import { HttpClient, HttpParams } from '@angular/common/http';
import { myUserRole } from '../enums/user-role';


import { Observable, throwError, of } from 'rxjs';
import { tap, catchError, switchMap, map } from 'rxjs/operators';


export type UserRole = 'PLAYER' | 'ORGANIZER' | 'ADMIN';
export interface User {
  id: string;
  username: string;
  email: string;
  password: string;
  role: UserRole;
}

@Injectable({
  providedIn: 'root'
})
export class Auth {
  private users: User[] = [
    { id: '1', username: 'admin', email: 'admin@admin.com', password: 'admin1', role: 'ADMIN' },
    { id: '2', username: 'organizer', email: 'org@org.com', password: 'organizer', role: 'ORGANIZER' },
    { id: '3', username: 'player', email: 'player@player.com', password: 'player', role: 'PLAYER' }
  ];
  private currentUserKey = 'currentUser';
  private usersKey = 'users';
  private nextId = '4';

  // constructor(private teamService: Team) {
  //   this.initializeUsers();
  // }

  // private apiUrl = '/api/auth';

  private apiUrl = 'http://localhost:8080/api/auth';

  private loggedIn = false;
  private currentUserRole: string | null = null;


    constructor(private router: Router, private http: HttpClient, private userService: UserService) {
    // Attempt to load login state and role from sessionStorage on service initialization
    if (typeof sessionStorage !== 'undefined') {
      this.loggedIn = !!sessionStorage.getItem('isLoggedIn');
      this.currentUserRole = sessionStorage.getItem('currentUserRole');
      this.initializeUsers();
    }
  }



  /**
   * Handles user registration by sending user details to the backend.
   * @param username The user's chosen username.
   * @param email The user's email.
   * @param password The user's password.
   * @returns An Observable that emits true on successful registration, or throws an error.
   */
    // Create a new user
    register(user: IRegisterUser): Observable<IRegisterResponseUser> {
      console.log('AuthService: Attempting registration for:', user.email);

      return this.http.post<IRegisterResponseUser>(`${this.apiUrl}/register`, user)
      .pipe(
        tap((response: IRegisterResponseUser) => {
          if (response && response.token && response.role) {
            this.loggedIn = true;
            this.currentUserRole = response.role;
            if (typeof sessionStorage !== 'undefined') {
              sessionStorage.setItem('isLoggedIn', 'true');
              sessionStorage.setItem('jwt_token', response.token);
              sessionStorage.setItem('currentUserRole', response.role);
            }
            console.log('AuthService: Registration successful with backend. Role:', response.role);
          } else {
            throw new Error('Registration failed: Invalid response from server.');
          }
        }),
        switchMap((response: IRegisterResponseUser) => {
          // Fetch complete user profile after successful registration
          if (response.id) {
            return this.userService.getUserById(response.id).pipe(
              tap((userProfile: UserProfile) => {
                // Store complete user object
                const userObject: User = {
                  id: userProfile.id,
                  username: userProfile.username,
                  email: userProfile.email,
                  password: '', // Don't store password
                  role: userProfile.role as UserRole
                };

                if (typeof sessionStorage !== 'undefined') {
                  sessionStorage.setItem(this.currentUserKey, JSON.stringify(userObject));
                }
                console.log('AuthService: User profile stored successfully');
              }),
              map(() => response) // Return the original response
            );
          } else {
            // If no user ID, create basic user object
            const userObject: User = {
              id: Date.now().toString(),
              username: user.email.split('@')[0],
              email: user.email,
              password: '',
              role: response.role as UserRole
            };

            if (typeof sessionStorage !== 'undefined') {
              sessionStorage.setItem(this.currentUserKey, JSON.stringify(userObject));
            }
            return of(response);
          }
        }),
        catchError(error => {
          this.loggedIn = false;
          this.currentUserRole = null;
          if (typeof sessionStorage !== 'undefined') {
            sessionStorage.removeItem('isLoggedIn');
            sessionStorage.removeItem('jwt_token');
            sessionStorage.removeItem('currentUserRole');
            sessionStorage.removeItem(this.currentUserKey);
          }
          console.error('AuthService: Registration failed with backend error:', error);
          return throwError(() => new Error(error.error?.message || 'Registration failed. Please try again.'));
        })
      );
      // .pipe(
      //   tap((response: any) => {
      //     console.log('AuthService: Registration successful with backend for:', user.email, response);
      //     // You might want to automatically log in the user after registration here,
      //     // or redirect them to the login page.
      //   }),
      //   catchError(error => {
      //     // Handle HTTP errors during registration
      //     console.error('AuthService: Registration failed with backend error:', error);
      //     return throwError(() => new Error(error.error?.message || 'Registration failed. Please try again.'));
      //   })
      // );
    }

      // register(user: { username: string; email: string; password: string }): boolean {
  //   const users = this.getUsers();
  //   if (
  //     users.find(
  //       u => u.username === user.username || u.email === user.email
  //     )
  //   ) {
  //     return false; // Username or email already exists
  //   }
  //   const newUser: User = {
  //     id: this.nextId++,
  //     username: user.username,
  //     email: user.email,
  //     password: user.password,
  //     role: 'PLAYER'
  //   };
  //   users.push(newUser);
  //   this.saveUsers(users);
  //   this.setCurrentUser(newUser);
  //   return true;
  // }


  /**
//    * Handles user login by sending credentials to the backend.
//    * On success, stores login state, JWT token, and user role in sessionStorage.
//    * @param email The user's email.
//    * @param password The user's password.
//    * @returns An Observable that emits true on successful login, or throws an error.
//    */
  // login(user: ILoginUser): Observable<IRegisterResponseUser> {
  login(email: string, password: string): Observable<IRegisterResponseUser> {
    console.log('AuthService: Attempting login for:', email);

    return this.http.post<IRegisterResponseUser>(`${this.apiUrl}/login`, { email, password }).pipe(
      tap((response: IRegisterResponseUser) => {
        if (response && response.token && response.role) {
          this.loggedIn = true;
          this.currentUserRole = response.role;
          if (typeof sessionStorage !== 'undefined') {
            sessionStorage.setItem('isLoggedIn', 'true');
            sessionStorage.setItem('jwt_token', response.token);
            sessionStorage.setItem('currentUserRole', response.role);
          }
          console.log('AuthService: Login successful with backend. Role:', response.role);
        } else {
          throw new Error('Login failed: Invalid response from server.');
        }
      }),
      switchMap((response: IRegisterResponseUser) => {
        // Fetch complete user profile after successful login
        if (response.id) {
          return this.userService.getUserById(response.id).pipe(
            tap((userProfile: UserProfile) => {
              // Store complete user object
              const userObject: User = {
                id: userProfile.id,
                username: userProfile.username,
                email: userProfile.email,
                password: '', // Don't store password
                role: userProfile.role as UserRole
              };

              if (typeof sessionStorage !== 'undefined') {
                sessionStorage.setItem(this.currentUserKey, JSON.stringify(userObject));
              }
              console.log('AuthService: User profile stored successfully');
            }),
            map(() => response) // Return the original response
          );
        } else {
          // If no user ID, create basic user object
          const userObject: User = {
            id: Date.now().toString(),
            username: email.split('@')[0],
            email: email,
            password: '',
            role: response.role as UserRole
          };

          if (typeof sessionStorage !== 'undefined') {
            sessionStorage.setItem(this.currentUserKey, JSON.stringify(userObject));
          }
          return of(response);
        }
      }),
      catchError(error => {
        this.loggedIn = false;
        this.currentUserRole = null;
        if (typeof sessionStorage !== 'undefined') {
          sessionStorage.removeItem('isLoggedIn');
          sessionStorage.removeItem('jwt_token');
          sessionStorage.removeItem('currentUserRole');
          sessionStorage.removeItem(this.currentUserKey);
        }
        console.error('AuthService: Login failed with backend error:', error);
        return throwError(() => new Error(error.error?.message || 'Login failed. Please check your credentials.'));
      })
    );
  }



  private getUsers(): User[] {
    const storedUsers = sessionStorage.getItem(this.usersKey);
    return storedUsers ? JSON.parse(storedUsers) : [];
  }

  private saveUsers(users: User[]): void {
    sessionStorage.setItem(this.usersKey, JSON.stringify(users));
  }



  // login(identifier: string, password: string): boolean {
  //   const users = this.getUsers();
  //   const user = users.find(
  //     u => (u.username === identifier || u.email === identifier) && u.password === password
  //   );
  //   if (user) {
  //     this.setCurrentUser(user);
  //     return true;
  //   }
  //   return false;
  // }

  logout(): void {
    this.loggedIn = false;
    this.currentUserRole = null;
    if (typeof sessionStorage !== 'undefined') {
      sessionStorage.removeItem('isLoggedIn');
      sessionStorage.removeItem('jwt_token');
      sessionStorage.removeItem('currentUserRole');
      sessionStorage.removeItem(this.currentUserKey);
    }
    this.router.navigate(['/login']);
  }

  getCurrentUser(): User | null {
    const userJson = sessionStorage.getItem(this.currentUserKey);
    return userJson ? JSON.parse(userJson) : null;
  }

  private setCurrentUser(user: User): void {
    sessionStorage.setItem(this.currentUserKey, JSON.stringify(user));
  }

  isOrganizer(): boolean {
    const currentUser = this.getCurrentUser();
    return currentUser?.role === 'ORGANIZER' || currentUser?.role === 'ADMIN';
  }

  // Get effective role based on user's base role and team ownership
  getEffectiveRole(): string {
    const currentUser = this.getCurrentUser();
    if (!currentUser) return 'PLAYER';

    if (currentUser.role === 'ADMIN') return 'ADMIN';
    if (currentUser.role === 'ORGANIZER') return 'ORGANIZER';

    // For players, check if they are organizers in any team
    // This is a simplified check - in a real app, you'd want to cache this
    return 'PLAYER'; // Default to PLAYER, will be updated by components that need it
  }

  private initializeUsers(): void {
    const storedUsers = sessionStorage.getItem(this.usersKey);
    if (!storedUsers) {
      sessionStorage.setItem(this.usersKey, JSON.stringify(this.users));
    } else {
      this.users = JSON.parse(storedUsers);
      if (this.users.length > 0) {
        const maxId = Math.max(...this.users.map(u => parseInt(u.id)));
        this.nextId = (maxId + 1).toString();
      }
    }
  }
}
