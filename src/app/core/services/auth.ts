import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class Auth {
  private readonly TOKEN_KEY = 'jwt_token';
  private apiUrl = 'YOUR_BACKEND_API_URL';

  constructor(private router: Router) { }

  register(userData: any): Observable<any> {
    // Mock implementation
    return of({ message: 'Registration successful!', token: 'fake-jwt-token-for-register' }).pipe(
      tap((response: any) => {
        if (response.token) {
          this.saveToken(response.token);
          this.router.navigate(['/dashboard']);
        }
      }),
      catchError(error => {
        throw error;
      })
    );
  }

  login(credentials: any): Observable<any> {
    // Mock implementation
    return of({ message: 'Login successful!', token: 'fake-jwt-token-12345' }).pipe(
      tap((response: any) => {
        if (response.token) {
          this.saveToken(response.token);
          this.router.navigate(['/dashboard']);
        }
      }),
      catchError(error => {
        throw error;
      })
    );
  }

  logout(): void {
    localStorage.removeItem(this.TOKEN_KEY);
    this.router.navigate(['/auth/login']);
  }

  private saveToken(token: string): void {
    localStorage.setItem(this.TOKEN_KEY, token);
  }

  getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  isLoggedIn(): boolean {
    const token = this.getToken();
    return !!token;
  }
}
