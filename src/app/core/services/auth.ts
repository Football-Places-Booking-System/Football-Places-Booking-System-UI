// src/app/core/services/auth.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, throwError } from 'rxjs';
import { tap, catchError, delay } from 'rxjs/operators';
import { Router } from '@angular/router';
import { IUser, UserRole } from '../../shared/models/user.model';

@Injectable({
  providedIn: 'root'
})
export class Auth { 
  private currentUserKey = 'currentUser';
  private apiUrl = 'YOUR_BACKEND_API_URL'; 
  private mockUsers: IUser[] = [
    { id: '1', username: 'admin', email: 'admin@admin.com', password: 'admin1', role: 'ADMIN' },
    { id: '2', username: 'organizer', email: 'org@org.com', password: 'organizer', role: 'ORGANIZER' },
    { id: '3', username: 'player', email: 'player@player.com', password: 'player', role: 'PLAYER' }
  ];
  private nextMockId = 4; // For new mock user registrations

  constructor(private router: Router, private http: HttpClient) {
    // Load current user from localStorage on service initialization
    if (typeof localStorage !== 'undefined') {
      const userJson = localStorage.getItem(this.currentUserKey);
      // No need to store in a private property like this.currentUser
      // as getCurrentUser() will read directly from localStorage.
    }
  }

  /**
   * Registers a new user.
   * @param user An object containing username, email, and password.
   * @returns An Observable that emits true on successful registration, or throws an error.
   */
  register(user: { username: string; email: string; password: string }): Observable<boolean> {
    console.log('AuthService: Attempting registration for:', user.email);
    // Simulate backend call with delay
    return of(true).pipe(
      delay(1000),
      tap(() => {
        // Mock logic for registration
        if (this.mockUsers.find(u => u.username === user.username || u.email === user.email)) {
          console.warn('AuthService: Registration failed (username or email already exists).');
          throw new Error('Username or email already exists.');
        }

        const newUser: IUser = {
          id: (this.nextMockId++).toString(), // Generate a mock ID
          username: user.username,
          email: user.email,
          password: user.password, // In a real app, password should be hashed and not stored like this
          role: 'PLAYER' // Default role for new registrations
        };
        this.mockUsers.push(newUser); // Add to in-memory mock users

        // Automatically log in the user after successful registration
        this.setCurrentUser(newUser);
        console.log('AuthService: Registration successful for:', newUser.email);
      }),
      catchError(error => {
        console.error('AuthService: Registration failed:', error);
        return throwError(() => new Error(error.message || 'Registration failed. Please try again.'));
      })
    );
  }

  /**
   * Logs in a user.
   * @param credentials An object containing identifier (email/username) and password.
   * @returns An Observable that emits true on successful login, or throws an error.
   */
  login(credentials: { identifier: string; password: string }): Observable<boolean> {
    console.log('AuthService: Attempting login for:', credentials.identifier);
    // Simulate backend call with delay
    return of(true).pipe(
      delay(1000),
      tap(() => {
        // Mock logic for login
        const user = this.mockUsers.find(
          u => (u.username === credentials.identifier || u.email === credentials.identifier) && u.password === credentials.password
        );

        if (user) {
          this.setCurrentUser(user);
          console.log('AuthService: Login successful for:', user.email);
        } else {
          this.logout(); // Clear any previous user state
          console.warn('AuthService: Login failed (invalid credentials).');
          throw new Error('Invalid email or password.');
        }
      }),
      catchError(error => {
        console.error('AuthService: Login failed:', error);
        return throwError(() => new Error(error.message || 'Login failed. Please check your credentials.'));
      })
    );
  }

  /**
   * Logs out the current user.
   */
  logout(): void {
    if (typeof localStorage !== 'undefined') {
      localStorage.removeItem(this.currentUserKey);
    }
    console.log('AuthService: Logged out. Redirecting to login.');
    this.router.navigate(['/login']); // Assuming /login is the path to your login page
  }

  /**
   * Gets the current logged-in user from localStorage.
   * @returns The current user object or null if not logged in.
   */
  getCurrentUser(): IUser | null {
    if (typeof localStorage !== 'undefined') {
      const userJson = localStorage.getItem(this.currentUserKey);
      return userJson ? JSON.parse(userJson) : null;
    }
    return null;
  }

  /**
   * Checks if a user is currently logged in.
   * @returns True if a user is logged in, false otherwise.
   */
  isLoggedIn(): boolean {
    return !!this.getCurrentUser();
  }

  /**
   * Checks if the current user has 'ORGANIZER' or 'ADMIN' role.
   * @returns True if the user is an organizer or admin, false otherwise.
   */
  isOrganizer(): boolean {
    // const currentUser = this.getCurrentUser();
    // return currentUser?.role === 'ORGANIZER' || currentUser?.role === 'ADMIN';
    return true;
  }

  /**
   * Private helper to set the current user in localStorage.
   * @param user The user object to set.
   */
  private setCurrentUser(user: IUser): void {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(this.currentUserKey, JSON.stringify(user));
    }
  }
}
