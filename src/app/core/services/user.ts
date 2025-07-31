import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface UserProfile {
  id: string;
  username: string;
  email: string;
  role: string;
  createdAt?: string;
  updatedAt?: string;
}

@Injectable({
  providedIn: 'root'
})
export class User {
  private apiUrl = 'http://localhost:8080/api/users';

  constructor(private http: HttpClient) {}

  /**
   * Fetches user profile by ID using JWT token for authentication
   * @param userId The user's ID
   * @returns Observable containing user profile data
   */
  getUserById(userId: string): Observable<UserProfile> {
    const token = sessionStorage.getItem('jwt_token');

    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });

    return this.http.get<UserProfile>(`${this.apiUrl}/${userId}`, { headers });
  }
}
