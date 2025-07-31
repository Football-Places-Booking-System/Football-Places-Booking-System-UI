import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { IUser } from '../models/iuser.model';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private apiUrl = 'http://localhost:8080/api/users';

  constructor(private http: HttpClient) {}

  /**
   * Fetches user profile by ID using JWT token for authentication
   * @param userId The user's ID
   * @returns Observable containing user data
   */
  getUserById(userId: string): Observable<IUser> {
    console.log("Inside getUserById method of UserService");
    return this.http.get<IUser>(`${this.apiUrl}/${userId}`);
  }
}
