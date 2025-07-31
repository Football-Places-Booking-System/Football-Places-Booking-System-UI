import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PlaceModel } from '../../../core/services/place.service';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-place-details',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './place-details.html',
  styleUrl: './place-details.css'
})
export class PlaceDetails {
  @Input() place!: PlaceModel;
  @Output() edit = new EventEmitter<void>();
  @Output() delete = new EventEmitter<void>();

  constructor(private auth: AuthService) {}

  get isAdmin(): boolean {
    const user = this.auth.getCurrentUser();
    return !!user && user.role === 'ADMIN';
  }

  editPlace() {
    this.edit.emit();
  }

  deletePlace() {
    this.delete.emit();
  }
}
