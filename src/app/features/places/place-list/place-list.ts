import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PlaceService } from '../../../core/services/place.service';
import { IPlace } from '../../../core/models/iplace.model';
import { FilterBar } from '../filter-bar/filter-bar';
import { PlaceDetails } from '../place-details/place-details';
import { AuthService } from '../../../core/services/auth.service';
import { FormsModule } from '@angular/forms';
import { PlaceType } from '../../../core/enums/place-type.enum';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-place-list',
  imports: [CommonModule, FilterBar, PlaceDetails, FormsModule],
  templateUrl: './place-list.html',
  styleUrl: './place-list.css'
})
export class PlaceList implements OnInit, OnDestroy {
  allPlaces: IPlace[] = [];
  places: IPlace[] = [];
  locations: string[] = [];
  types: string[] = [];

  showDetailsModal = false;
  selectedPlace: IPlace | null = null;
  showAddPlaceModal = false;
  newPlace = { name: '', location: '', type: '' as PlaceType | '', imageUrl: '', description: '' };
  showEditPlaceModal = false;
  editPlaceData: any = null;
  showDeleteConfirmModal = false;
  successMessage = '';
  deletePlaceId: string | null = null;
  private destroy$ = new Subject<void>();

  constructor(private placeService: PlaceService, private auth: AuthService) {}

  ngOnInit() {
    this.loadPlaces();
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadPlaces() {
    this.placeService.getAllPlaces().pipe(
      takeUntil(this.destroy$)
    ).subscribe({
      next: (places) => {
        console.log('PlaceList: Loaded', places.length, 'places');
        this.allPlaces = places;
        this.places = [...this.allPlaces];
        this.locations = Array.from(new Set(this.allPlaces.map(p => p.location).filter(loc => loc)));

        // Get unique types and transform them to human-readable strings
        const uniqueTypes = Array.from(new Set(this.allPlaces.map(p => p.type).filter(type => type)));
        this.types = uniqueTypes.map(type => this.getPlaceTypeString(type));

        // Debug: Check for any places with undefined type
        const placesWithUndefinedType = this.allPlaces.filter(p => !p.type);
        if (placesWithUndefinedType.length > 0) {
          console.warn('Places with undefined type:', placesWithUndefinedType);
        }
      },
      error: (error) => {
        console.error('Failed to load places:', error);
        this.successMessage = '';
        // You might want to show an error message to the user
      }
    });
  }

  get isAdmin(): boolean {
    const user = this.auth.getCurrentUser();
    return !!user && user.role === 'ADMIN';
  }

  get placeTypes() {
    return Object.values(PlaceType);
  }

  // Method to get the human-readable type string
  getPlaceTypeString(placeType: PlaceType | string): string {
    return this.placeService.getPlaceTypeString(placeType);
  }

  // Method to convert human-readable type string back to enum value
  getPlaceTypeFromString(typeString: string): PlaceType | undefined {
    switch (typeString) {
      case '5-a-side':
        return PlaceType.FIVE;
      case '7-a-side':
        return PlaceType.SEVEN;
      case '11-a-side':
        return PlaceType.ELEVEN;
      default:
        return undefined;
    }
  }

  onFilterChange(filter: { location: string; type: string }) {
    // Convert human-readable type string back to enum value for filtering
    const actualFilter = {
      location: filter.location,
      type: filter.type ? this.getPlaceTypeFromString(filter.type) || filter.type : ''
    };

    this.placeService.filterPlaces(actualFilter).pipe(
      takeUntil(this.destroy$)
    ).subscribe({
      next: (filteredPlaces) => {
        this.places = filteredPlaces;
      },
      error: (error) => {
        console.error('Failed to filter places:', error);
        // Fallback to local filtering if API fails
        this.places = this.placeService.getLocalFilteredPlaces(actualFilter);
      }
    });
  }

  openDetails(place: IPlace) {
    this.selectedPlace = place;
    this.showDetailsModal = true;
  }

  closeDetails() {
    this.showDetailsModal = false;
    this.selectedPlace = null;
  }

  openAddPlaceModal() {
    this.showAddPlaceModal = true;
    this.newPlace = { name: '', location: '', type: '' as PlaceType | '', imageUrl: '', description: '' };
  }

  closeAddPlaceModal() {
    this.showAddPlaceModal = false;
  }

  addPlace() {
    console.log('AddPlace called with:', this.newPlace);

    if (!this.newPlace.name || !this.newPlace.location || !this.newPlace.type || !this.newPlace.imageUrl || !this.newPlace.description) {
      console.warn('Form validation failed:', {
        name: !!this.newPlace.name,
        location: !!this.newPlace.location,
        type: !!this.newPlace.type,
        imageUrl: !!this.newPlace.imageUrl,
        description: !!this.newPlace.description
      });
      return;
    }

    console.log('Sending to service:', {
      name: this.newPlace.name,
      location: this.newPlace.location,
      type: this.newPlace.type as PlaceType,
      imageUrl: this.newPlace.imageUrl,
      description: this.newPlace.description
    });

    this.placeService.addPlace({
      name: this.newPlace.name,
      location: this.newPlace.location,
      type: this.newPlace.type as PlaceType,
      imageUrl: this.newPlace.imageUrl,
      description: this.newPlace.description
    }).pipe(
      takeUntil(this.destroy$)
    ).subscribe({
      next: (newPlace) => {
        console.log('Place added successfully:', newPlace);
        this.refreshPlaces();
        this.closeAddPlaceModal();
        this.successMessage = 'Place added successfully!';
        setTimeout(() => this.successMessage = '', 2500);
      },
      error: (error) => {
        console.error('Failed to add place:', error);
        this.successMessage = '';
        // You might want to show an error message to the user
      }
    });
  }

  openEditPlaceModal() {
    if (!this.selectedPlace) return;
    this.editPlaceData = { ...this.selectedPlace };
    this.showEditPlaceModal = true;
    this.closeDetails();
  }

  closeEditPlaceModal() {
    this.showEditPlaceModal = false;
    this.editPlaceData = null;
  }

  saveEditPlace() {
    if (!this.editPlaceData) return;
    this.placeService.updatePlace(this.editPlaceData.id, {
      name: this.editPlaceData.name,
      location: this.editPlaceData.location,
      type: this.editPlaceData.type as PlaceType,
      imageUrl: this.editPlaceData.imageUrl,
      description: this.editPlaceData.description
    }).pipe(
      takeUntil(this.destroy$)
    ).subscribe({
      next: (success) => {
        if (success) {
          this.refreshPlaces();
          this.closeEditPlaceModal();
          this.successMessage = 'Place updated successfully!';
          setTimeout(() => this.successMessage = '', 2500);
        }
      },
      error: (error) => {
        console.error('Failed to update place:', error);
        this.successMessage = '';
        // You might want to show an error message to the user
      }
    });
  }

  confirmDeletePlace() {
    if (this.selectedPlace) {
      this.deletePlaceId = this.selectedPlace.id;
    }
    this.closeDetails();
    this.showDeleteConfirmModal = true;
  }

  closeDeleteConfirmModal() {
    this.showDeleteConfirmModal = false;
    this.deletePlaceId = null;
  }

  deletePlaceConfirmed() {
    if (this.deletePlaceId !== null) {
      this.placeService.deletePlace(this.deletePlaceId).pipe(
        takeUntil(this.destroy$)
      ).subscribe({
        next: (success) => {
          if (success) {
            this.refreshPlaces();
            this.successMessage = 'Place deleted successfully!';
            setTimeout(() => this.successMessage = '', 2500);
          }
        },
        error: (error) => {
          console.error('Failed to delete place:', error);
          this.successMessage = '';
          // You might want to show an error message to the user
        }
      });
    }
    this.closeDeleteConfirmModal();
  }

  refreshPlaces() {
    this.loadPlaces();
  }
}
