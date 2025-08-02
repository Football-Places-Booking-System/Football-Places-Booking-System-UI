import { Component, OnInit, ViewChild } from '@angular/core';
import { NgIf, NgClass } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatPaginatorModule, MatPaginator, PageEvent } from '@angular/material/paginator';
import { MatSortModule, MatSort } from '@angular/material/sort';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatMenuModule } from '@angular/material/menu';
import { MatDialogModule } from '@angular/material/dialog';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { AuthService } from '../../../core/services/auth.service';
import { UserService } from '../../../core/services/user.service';
import { Router } from '@angular/router';

import { IUser } from '../../../core/models/iuser.model';

// interface User {
//   id: string;
//   username: string;
//   email: string;
//   role: 'ADMIN' | 'USER' | 'ORGANIZER';
//   status: 'ACTIVE' | 'INACTIVE';
//   // createdAt: string;
// }

@Component({
  selector: 'app-user-list',
  standalone: true,
  imports: [
    NgIf,
    NgClass,
    FormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatMenuModule,
    MatDialogModule,
    MatProgressSpinnerModule,
    MatTooltipModule
  ],
  templateUrl: './user-list.html',
  styleUrls: ['./user-list.css']
})
export class UserList implements OnInit {

  dataSource = new MatTableDataSource<IUser>([]);

  allUsers: IUser[] = [];
  currentUser: any;
  isLoading = false;
  error: string | null = null;


  // Pagination properties
  totalUsers = 0;
  pageSize = 5;
  currentPage = 0;
  pageSizeOptions = [5, 10, 25, 50];

  // ViewChild decorators to access Material components
  @ViewChild(MatPaginator) paginator!: MatPaginator;


  // // Filter properties
  // @ViewChild(MatSort) sort!: MatSort;
  // searchTerm = '';
  // roleFilter = '';
  // statusFilter = '';

  displayedColumns: string[] = ['id', 'username', 'email', 'role', 'status', 'actions'];

  constructor(
    private authService: AuthService,
    private userService: UserService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.currentUser = this.authService.getCurrentUser();
    this.loadUsers();
  }

  ngAfterViewInit(): void {
    // Disable client-side pagination since we're using server-side pagination
    this.dataSource.paginator = null;
  }


  onPageChange(event: PageEvent): void {
    console.log('Page change event:', event);
    console.log(`Requesting page ${event.pageIndex} with size ${event.pageSize}`);

    this.currentPage = event.pageIndex;
    this.pageSize = event.pageSize;

    // Call API with pagination parameters
    this.loadUsers();
  }


  loadUsers(): void {
    console.log('Loading users with pagination:', this.currentPage, this.pageSize);
    this.isLoading = true;
    this.error = null;


    this.userService.getAllUsers(this.currentPage, this.pageSize).subscribe({
      next: (response) => {
        console.log('Received users from API:', response);
        let users: IUser[] = [];

        // Handle both paginated and non-paginated responses
        if (response.content) {
          // Paginated response from backend
          users = response.content;
          this.totalUsers = response.totalElements;


        } else {
          // Non-paginated response
          users = response;
          this.totalUsers = response.length;
        }

        // Update the data source
        this.dataSource.data = users;
        this.isLoading = false;
      },
      error: (err) => {
        this.error = 'Failed to load users';
        this.isLoading = false;
        console.error('Error loading Users:', err);

      }
    });
  }


  changeUserRole(userId: string, newRole: 'ADMIN' | 'USER'): void {
    const user = this.allUsers.find(u => u.id === userId);
    if (user) {
      user.role = newRole;
      sessionStorage.setItem('users', JSON.stringify(this.allUsers));
      // this.applyFilters();
    }
  }

  changeUserStatus(userId: string, newStatus: 'ACTIVE' | 'INACTIVE'): void {
    const user = this.allUsers.find(u => u.id === userId);
    if (user) {
      user.status = newStatus;
      sessionStorage.setItem('users', JSON.stringify(this.allUsers));
    }
  }



  getRoleColor(role: string): string {
    switch (role) {
      case 'ADMIN': return 'warn';
      case 'USER': return 'accent';
      // case 'ORGANIZER': return 'primary';
      default: return 'primary';
    }
  }

  getStatusColor(status: string): string {
    return status === 'ACTIVE' ? 'primary' : 'warn';
  }

  get isAdmin(): boolean {
    return this.currentUser?.role === 'ADMIN';
  }
}
