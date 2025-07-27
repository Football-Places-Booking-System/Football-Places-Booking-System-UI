import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class User {


      // // Get all users
      // getAllUsers(): Observable<IUser[]> {
      //   return this.http.get<IUser[]>(this.apiUrl);
      // }
      // // Get user by ID
      // getUserById(id: number): Observable<IUser> {
      //   return this.http.get<IUser>(`${this.apiUrl}/${id}`);
      // }

  // service to register user
  register(user: { username: string; email: string; password: string }): boolean {
    // Logic to register user
    return true; // Placeholder return value
  }
}
