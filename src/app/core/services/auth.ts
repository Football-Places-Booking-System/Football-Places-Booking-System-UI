import { Injectable } from '@angular/core';


import { HttpClient } from '@angular/common/http';
import { myUserRole } from '../enums/user-role';
import { Observable, throwError } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';

import { IUser, IRegisterUser, ILoginUser, IRegisterResponseUser } from '../models/iuser';
import { Router } from '@angular/router';


export type UserRole = 'PLAYER' | 'ORGANIZER' | 'ADMIN';
export interface User {
  id: number;
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
    { id: 1, username: 'admin', email: 'admin@admin.com', password: 'admin1', role: 'ADMIN' },
    { id: 2, username: 'organizer', email: 'org@org.com', password: 'organizer', role: 'ORGANIZER' },
    { id: 3, username: 'player', email: 'player@player.com', password: 'player', role: 'PLAYER' }
  ];
  private currentUserKey = 'currentUser';
  private nextId = 4;

    // private apiUrl = '/api/auth';
    // private apiUrl = 'http://localhost:8080/api/auth';
    private apiUrl = '/api/auth';

  private loggedIn = false;
  private currentUserRole: string | null = null;



    constructor(private router: Router,private http: HttpClient) {
    // Attempt to load login state and role from localStorage on service initialization
    if (typeof localStorage !== 'undefined') {
      this.loggedIn = !!localStorage.getItem('isLoggedIn');
      this.currentUserRole = localStorage.getItem('currentUserRole');
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
      // Send POST request to your backend's registration endpoint

      return this.http.post<IRegisterResponseUser>(`${this.apiUrl}/register`, user)
      .pipe(
      tap((response: IRegisterResponseUser) => {
      console.log('AuthService: Registration successful with backend for:', user.email, response);

        // Assuming backend returns a 'token' and a 'role' property on success
        if (response && response.token && response.role) {
          this.loggedIn = true;
          this.currentUserRole = response.role;
          if (typeof localStorage !== 'undefined') {
            localStorage.setItem('isLoggedIn', 'true');
            localStorage.setItem('jwt_token', response.token); // Store the JWT token
            localStorage.setItem('currentUserRole', response.role); // Store the user's role
          }
          console.log('AuthService: Login successful with backend. Role:', response.role);
        } else {
          // Handle cases where backend response is unexpected (e.g., missing token/role)
          this.loggedIn = false;
          this.currentUserRole = null;
          if (typeof localStorage !== 'undefined') {
            localStorage.removeItem('isLoggedIn');
            localStorage.removeItem('jwt_token');
            localStorage.removeItem('currentUserRole');
          }
          console.warn('AuthService: Registration failed (backend response missing token or role).');
          throw new Error('Registration failed: Invalid response from server.');
        }
      }),
      catchError(error => {
        // Handle HTTP errors (e.g., 401 Unauthorized, 400 Bad Request)
        this.loggedIn = false;
        this.currentUserRole = null;
        if (typeof localStorage !== 'undefined') {
          localStorage.removeItem('isLoggedIn');
          localStorage.removeItem('jwt_token');
          localStorage.removeItem('currentUserRole');
        }
        console.error('AuthService: Registration failed with backend error:', error);

        // Extract a more specific error message if available from the backend
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


  /**
//    * Handles user login by sending credentials to the backend.
//    * On success, stores login state, JWT token, and user role in localStorage.
//    * @param email The user's email.
//    * @param password The user's password.
//    * @returns An Observable that emits true on successful login, or throws an error.
//    */
  login(user: ILoginUser): Observable<IRegisterResponseUser> {
    console.log('AuthService: Attempting login for:', user.email);
    // Send POST request to your backend's login endpoint
    return this.http.post<IRegisterResponseUser>(`${this.apiUrl}/login`, user).pipe(
      tap((response: IRegisterResponseUser) => {
        // Assuming backend returns a 'token' and a 'role' property on success
        if (response && response.token && response.role) {
          this.loggedIn = true;
          this.currentUserRole = response.role;
          if (typeof localStorage !== 'undefined') {
            localStorage.setItem('isLoggedIn', 'true');
            localStorage.setItem('jwt_token', response.token); // Store the JWT token
            localStorage.setItem('currentUserRole', response.role); // Store the user's role
          }
          console.log('AuthService: Login successful with backend. Role:', response.role);
        } else {
          // Handle cases where backend response is unexpected (e.g., missing token/role)
          this.loggedIn = false;
          this.currentUserRole = null;
          if (typeof localStorage !== 'undefined') {
            localStorage.removeItem('isLoggedIn');
            localStorage.removeItem('jwt_token');
            localStorage.removeItem('currentUserRole');
          }
          console.warn('AuthService: Login failed (backend response missing token or role).');
          throw new Error('Login failed: Invalid response from server.');
        }
      }),
      catchError(error => {
        // Handle HTTP errors (e.g., 401 Unauthorized, 400 Bad Request)
        this.loggedIn = false;
        this.currentUserRole = null;
        if (typeof localStorage !== 'undefined') {
          localStorage.removeItem('isLoggedIn');
          localStorage.removeItem('jwt_token');
          localStorage.removeItem('currentUserRole');
        }
        console.error('AuthService: Login failed with backend error:', error);
        // Extract a more specific error message if available from the backend
        return throwError(() => new Error(error.error?.message || 'Login failed. Please check your credentials.'));
      })
    );
  }

    // login(identifier: string, password: string): boolean {
  //   const user = this.users.find(
  //     u => (u.username === identifier || u.email === identifier) && u.password === password
  //   );
  //   if (user) {
  //     this.setCurrentUser(user);
  //     return true;
  //   }
  //   return false;
  // }


  logout(): void {
    localStorage.removeItem(this.currentUserKey);
  }

  getCurrentUser(): User | null {
    const userJson = localStorage.getItem(this.currentUserKey);
    return userJson ? JSON.parse(userJson) : null;
  }

  private setCurrentUser(user: User): void {
    localStorage.setItem(this.currentUserKey, JSON.stringify(user));
  }

  isOrganizer(): boolean {
    const currentUser = this.getCurrentUser();
    return currentUser?.role === 'ORGANIZER' || currentUser?.role === 'ADMIN';
  }
}
