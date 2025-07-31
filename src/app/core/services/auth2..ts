// import { Injectable } from '@angular/core';
// // import  http client

// import { HttpClient } from '@angular/common/http';
// import { UserRole } from '../enums/user-role';
// import { Observable, throwError } from 'rxjs';
// import { tap, catchError } from 'rxjs/operators';

// import { IUser, IRegisterUser, ILoginUser, IRegisterResponseUser } from '../models/iuser';
// import { Router } from '@angular/router';


// @Injectable({
//   providedIn: 'root'
// })

// export class Auth {
//   private apiUrl = '/api/auth';

//   private loggedIn = false;
//   private currentUserRole: string | null = null;



//   constructor(private router: Router,private http: HttpClient) {
//     // Attempt to load login state and role from localStorage on service initialization
//     if (typeof localStorage !== 'undefined') {
//       this.loggedIn = !!localStorage.getItem('isLoggedIn');
//       this.currentUserRole = localStorage.getItem('currentUserRole');
//     }
//   }


//   /**
//    * Handles user registration by sending user details to the backend.
//    * @param username The user's chosen username.
//    * @param email The user's email.
//    * @param password The user's password.
//    * @returns An Observable that emits true on successful registration, or throws an error.
//    */
//   // Create a new user
//   register(user: IRegisterUser): Observable<IRegisterResponseUser> {
//     console.log('AuthService: Attempting registration for:', user.email);
//     // Send POST request to your backend's registration endpoint

//     return this.http.post<IRegisterResponseUser>(`${this.apiUrl}/register`, user).pipe(
//       tap((response: any) => {
//         console.log('AuthService: Registration successful with backend for:', user.email, response);
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
// }
