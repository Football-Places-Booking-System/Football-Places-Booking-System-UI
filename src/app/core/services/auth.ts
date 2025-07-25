import { Injectable } from '@angular/core';
import { Observable, of,throwError  } from 'rxjs';
import { tap, catchError ,delay} from 'rxjs/operators';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class Auth {
   private loggedIn = false;
  private currentUserEmail: string | null = null; // Store current user's email for mock organizer check

  constructor(private router: Router) {
    if (typeof localStorage !== 'undefined') {
      this.loggedIn = !!localStorage.getItem('isLoggedIn');
      this.currentUserEmail = localStorage.getItem('currentUserEmail'); // Load email
    }
  }

  login(email: string, password: string): Observable<boolean> {
    console.log('AuthService: Attempting login for:', email);
    return of(true).pipe(
      delay(1000),
      tap(() => {
        if (email === 'user@example.com' && password === 'password123') {
          this.loggedIn = true;
          this.currentUserEmail = email; // Save email
          if (typeof localStorage !== 'undefined') {
            localStorage.setItem('isLoggedIn', 'true');
            localStorage.setItem('currentUserEmail', email); // Store email
          }
          console.log('AuthService: Login successful.');
        } else if (email === 'organizer@example.com' && password === 'password123') {
          this.loggedIn = true;
          this.currentUserEmail = email; // Save email
          if (typeof localStorage !== 'undefined') {
            localStorage.setItem('isLoggedIn', 'true');
            localStorage.setItem('currentUserEmail', email); // Store email
          }
          console.log('AuthService: Organizer login successful.');
        }
        else {
          this.loggedIn = false;
          this.currentUserEmail = null;
          if (typeof localStorage !== 'undefined') {
            localStorage.removeItem('isLoggedIn');
            localStorage.removeItem('currentUserEmail');
          }
          console.warn('AuthService: Login failed (invalid credentials).');
          throw new Error('Invalid email or password.');
        }
      })
    );
  }

  register(username: string, email: string, password: string): Observable<boolean> {
    console.log('AuthService: Attempting registration for:', email);
    return of(true).pipe(
      delay(1000),
      tap(() => {
        if (email === 'taken@example.com') {
          console.warn('AuthService: Registration failed (email already taken).');
          throw new Error('Email already registered.');
        } else {
          console.log('AuthService: Registration successful for:', email);
        }
      })
    );
  }

  logout(): void {
    this.loggedIn = false;
    this.currentUserEmail = null;
    if (typeof localStorage !== 'undefined') {
      localStorage.removeItem('isLoggedIn');
      localStorage.removeItem('currentUserEmail');
    }
    console.log('AuthService: Logged out. Redirecting to login.');
    this.router.navigate(['/login']);
  }

  isLoggedIn(): boolean {
    return this.loggedIn;
  }

  // New: Mock isOrganizer method
  isOrganizer(): boolean {
    // For testing, assume 'organizer@example.com' is an organizer
    // In a real app, this would involve checking user roles from backend
    return this.loggedIn && this.currentUserEmail === 'organizer@example.com';
  }
}
