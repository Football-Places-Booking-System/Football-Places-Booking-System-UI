import { Injectable } from '@angular/core';
import { HttpClient, HttpParams} from '@angular/common/http';
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

  getAllUsers(page?: number, size?: number): Observable<any> {
    console.log("Inside getAllUsers method of UserService");
    const params = new HttpParams()
      .set('page', page?.toString() || '0')
      .set('size', size?.toString() || '5');
    return this.http.get<IUser[]>(`${this.apiUrl}/all`, { params });
  }

  updateUser(user: IUser): Observable<IUser> {
    console.log("Inside updateUser method of UserService");
    return this.http.put<IUser>(`${this.apiUrl}/${user.id}`, user);
  }



}
