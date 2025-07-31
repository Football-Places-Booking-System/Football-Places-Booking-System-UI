import { Injectable } from '@angular/core';
import { UserService as UserService } from './user.service';

import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { myUserRole } from '../enums/user-role';


import { Observable, throwError, of } from 'rxjs';
import { tap, catchError, switchMap, map } from 'rxjs/operators';

import { IUser, UserRole, IRegisterUser, ILoginUser, IRegisterResponseUser } from '../models/iuser.model';



@Injectable({
  providedIn: 'root'
})
export class AuthService {


  // private apiUrl = '/api/auth';

  private apiUrl = 'http://localhost:8080/api/auth';

  private loggedIn = false;
  private currentUserRole: string | null = null;
  private currentUser: IUser | null = null;


  constructor(private router: Router, private http: HttpClient, private userService: UserService) {
    // Attempt to load login state and role from sessionStorage on service initialization
    if (typeof sessionStorage !== 'undefined') {
      this.loggedIn = !!sessionStorage.getItem('isLoggedIn');
      this.currentUserRole = sessionStorage.getItem('currentUserRole');
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
              tap((userProfile: IUser) => {
                // Store complete user object
                const userObject: IUser = {
                  id: userProfile.id,
                  username: userProfile.username,
                  email: userProfile.email,
                  password: '', // Don't store password
                  role: userProfile.role as UserRole,
                  createdAt: userProfile.createdAt,
                  updatedAt: userProfile.updatedAt
                };

                this.currentUser = userObject;
                if (typeof sessionStorage !== 'undefined') {
                  sessionStorage.setItem('currentUser', JSON.stringify(userObject));
                }

                console.log('AuthService: IUser stored successfully');
              }),
              map(() => response) // Return the original response
            );
          } else {

            console.log('AuthService: No user ID found in registration response. Unable to fetch user profile.');
            return of(response); // Return the response without fetching user profile
          }
        }),
        catchError(error => {
          this.loggedIn = false;
          this.currentUserRole = null;
          if (typeof sessionStorage !== 'undefined') {
            sessionStorage.removeItem('isLoggedIn');
            sessionStorage.removeItem('jwt_token');
            sessionStorage.removeItem('currentUserRole');
          }
          console.error('AuthService: Registration failed with backend error:', error);
          return throwError(() => new Error(error.error?.message || 'Registration failed. Please try again.'));
        })
      );
  }



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
            tap((userProfile: IUser) => {
              // Store complete user object
              const userObject: IUser = {
                id: userProfile.id,
                username: userProfile.username,
                email: userProfile.email,
                password: '', // Don't store password
                role: userProfile.role as UserRole
              };

              this.currentUser = userObject;
              if (typeof sessionStorage !== 'undefined') {
                sessionStorage.setItem('currentUser', JSON.stringify(userObject));
              }

              console.log('AuthService: User profile stored successfully');
            }),
            map(() => response) // Return the original response
          );
        } else {
          // If no user ID, create basic user object
          const userObject: IUser = {
            id: Date.now().toString(),
            username: email.split('@')[0],
            email: email,
            password: '',
            role: response.role as UserRole
          };

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
        }
        console.error('AuthService: Login failed with backend error:', error);
        return throwError(() => new Error(error.error?.message || 'Login failed. Please check your credentials.'));
      })
    );
  }


  /**
   * Logs out the user by clearing local storage and redirecting to the login page.
   */
  logout(): void {
    this.loggedIn = false;
    this.currentUserRole = null;
    if (typeof sessionStorage !== 'undefined') {
      sessionStorage.removeItem('isLoggedIn');
      sessionStorage.removeItem('jwt_token'); // Clear the JWT token
      sessionStorage.removeItem('currentUserRole'); // Clear the user's role
      sessionStorage.removeItem('currentUser'); // Clear the current user
    }
    console.log('AuthService: Logged out. Redirecting to login.');
    this.router.navigate(['/login']); // Redirect to the login page
  }


  getCurrentUser(): IUser | null {
    if (this.currentUser) {
      return this.currentUser;
    }
    // If currentUser is not set, try to load it from sessionStorage
    const userString = sessionStorage.getItem('currentUser');
    if (userString) {
      this.currentUser = JSON.parse(userString);
      return this.currentUser;
    }
    return null;
  }



  /**
   * Checks if the user is currently logged in.
   * @returns True if logged in, false otherwise.
   */
  isLoggedIn(): boolean {
    return this.loggedIn;
  }

  /**
   * Gets the current user's role.
   * @returns The user's role string, or null if not logged in.
   */
  getUserRole(): string | null {
    return this.currentUserRole;
  }

  /**
   * Checks if the current user has the 'organizer' role.
   * @returns True if the user is logged in and has the 'organizer' role, false otherwise.
   */
  isOrganizer(): boolean {
    return this.loggedIn && this.currentUserRole === 'organizer';
  }

}
