// // src/app/core/services/auth.service.ts
// import { Injectable } from '@angular/core';
// import { HttpClient } from '@angular/common/http';
// import { Observable, of, throwError } from 'rxjs';
// import { tap, catchError } from 'rxjs/operators';
// import { Router } from '@angular/router';

// @Injectable({
//   providedIn: 'root'
// })
// export class AuthService { // Changed class name to AuthService for consistency
//   private loggedIn = false;
//   private currentUserRole: string | null = null;
//   private apiUrl = 'YOUR_BACKEND_API_URL'; // Replace with your actual backend API URL

//   constructor(private router: Router, private http: HttpClient) {
//     // Attempt to load login state and role from localStorage on service initialization
//     if (typeof localStorage !== 'undefined') {
//       this.loggedIn = !!localStorage.getItem('isLoggedIn');
//       this.currentUserRole = localStorage.getItem('currentUserRole');
//     }
//   }

//   /**
//    * Handles user login by sending credentials to the backend.
//    * On success, stores login state, JWT token, and user role in localStorage.
//    * @param email The user's email.
//    * @param password The user's password.
//    * @returns An Observable that emits true on successful login, or throws an error.
//    */
//   login(email: string, password: string): Observable<boolean> {
//     console.log('AuthService: Attempting login for:', email);
//     // Send POST request to your backend's login endpoint
//     return this.http.post<any>(${this.apiUrl}/login, { email, password }).pipe(
//       tap((response: any) => {
//         // Assuming backend returns a 'token' and a 'role' property on success
//         if (response && response.token && response.role) {
//           this.loggedIn = true;
//           this.currentUserRole = response.role;
//           if (typeof localStorage !== 'undefined') {
//             localStorage.setItem('isLoggedIn', 'true');
//             localStorage.setItem('jwt_token', response.token); // Store the JWT token
//             localStorage.setItem('currentUserRole', response.role); // Store the user's role
//           }
//           console.log('AuthService: Login successful with backend. Role:', response.role);
//         } else {
//           // Handle cases where backend response is unexpected (e.g., missing token/role)
//           this.loggedIn = false;
//           this.currentUserRole = null;
//           if (typeof localStorage !== 'undefined') {
//             localStorage.removeItem('isLoggedIn');
//             localStorage.removeItem('jwt_token');
//             localStorage.removeItem('currentUserRole');
//           }
//           console.warn('AuthService: Login failed (backend response missing token or role).');
//           throw new Error('Login failed: Invalid response from server.');
//         }
//       }),
//       catchError(error => {
//         // Handle HTTP errors (e.g., 401 Unauthorized, 400 Bad Request)
//         this.loggedIn = false;
//         this.currentUserRole = null;
//         if (typeof localStorage !== 'undefined') {
//           localStorage.removeItem('isLoggedIn');
//           localStorage.removeItem('jwt_token');
//           localStorage.removeItem('currentUserRole');
//         }
//         console.error('AuthService: Login failed with backend error:', error);
//         // Extract a more specific error message if available from the backend
//         return throwError(() => new Error(error.error?.message || 'Login failed. Please check your credentials.'));
//       })
//     );
//   }

//   /**
//    * Handles user registration by sending user details to the backend.
//    * @param username The user's chosen username.
//    * @param email The user's email.
//    * @param password The user's password.
//    * @returns An Observable that emits true on successful registration, or throws an error.
//    */
//   register(username: string, email: string, password: string): Observable<boolean> {
//     console.log('AuthService: Attempting registration for:', email);
//     // Send POST request to your backend's registration endpoint
//     return this.http.post<any>(${this.apiUrl}/register, { username, email, password }).pipe(
//       tap((response: any) => {
//         console.log('AuthService: Registration successful with backend for:', email, response);
//         // You might want to automatically log in the user after registration here,
//         // or redirect them to the login page.
//       }),
//       catchError(error => {
//         // Handle HTTP errors during registration
//         console.error('AuthService: Registration failed with backend error:', error);
//         return throwError(() => new Error(error.error?.message || 'Registration failed. Please try again.'));
//       })
//     );
//   }

//   /**
//    * Logs out the user by clearing local storage and redirecting to the login page.
//    */
//   logout(): void {
//     this.loggedIn = false;
//     this.currentUserRole = null;
//     if (typeof localStorage !== 'undefined') {
//       localStorage.removeItem('isLoggedIn');
//       localStorage.removeItem('jwt_token'); // Clear the JWT token
//       localStorage.removeItem('currentUserRole'); // Clear the user's role
//     }
//     console.log('AuthService: Logged out. Redirecting to login.');
//     this.router.navigate(['/login']); // Redirect to the login page
//   }

//   /**
//    * Checks if the user is currently logged in.
//    * @returns True if logged in, false otherwise.
//    */
//   isLoggedIn(): boolean {
//     return this.loggedIn;
//   }

//   /**
//    * Gets the current user's role.
//    * @returns The user's role string, or null if not logged in.
//    */
//   getUserRole(): string | null {
//     return this.currentUserRole;
//   }

//   /**
//    * Checks if the current user has the 'organizer' role.
//    * @returns True if the user is logged in and has the 'organizer' role, false otherwise.
//    */
//   isOrganizer(): boolean {
//     return this.loggedIn && this.currentUserRole === 'organizer';
//  }
// }
