import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError, of } from 'rxjs';
import { tap, catchError,switchMap, map } from 'rxjs/operators';
import { IPlace } from "../models/iplace.model";
import { PlaceType } from "../enums/place-type.enum";



@Injectable({
  providedIn: 'root'
})
export class PlaceService {
  private apiUrl = 'http://localhost:8080/api/place';
  private places: IPlace[] = [];
  private nextId = '1';

  constructor(private http: HttpClient) {
    this.getAllPlaces();
  }

  getAllPlaces(): Observable<IPlace[]> {
    console.log('PlaceService: Fetching all places from API');
    return this.http.get<any>(`${this.apiUrl}/all`).pipe(
      map((response: any) => {
        // Extract places from paginated response
        const places = response.content || [];
        console.log('PlaceService: Retrieved', places.length, 'places from API');

        // Transform and validate places
        const transformedPlaces = places.map((place: any) => {
          // Handle type field mapping from API response
          let placeType = place.placeType || place.type || place.fieldType;

          // If type is still undefined, assign a default
          if (!placeType) {
            console.warn(`Place ${place.name} has undefined type, assigning default`);
            placeType = 'ELEVEN'; // Default to 11-a-side
          }

          return {
            id: place.id,
            name: place.name,
            location: place.location,
            type: placeType,
            imageUrl: place.imageUrl,
            description: place.description
          };
        });

        return transformedPlaces;
      }),
      tap((places: IPlace[]) => {
        this.places = places;
      }),
      catchError(error => {
        console.error('PlaceService: Failed to fetch places from API:', error);
        return of(this.places);
      })
    );
  }

  addPlace(place: Omit<IPlace, 'id'>): Observable<IPlace> {
    console.log('PlaceService: Starting to add new place:', place);

    // Transform the place type from enum to string for API
    let placeTypeString: string;
    if (typeof place.type === 'string') {
      // If it's already a string, check if it's a human-readable format and convert
      const enumValue = this.getPlaceTypeFromString(place.type);
      if (enumValue) {
        placeTypeString = enumValue; // This will be FIVE, SEVEN, or ELEVEN
      } else {
        placeTypeString = place.type; // Assume it's already in correct format
      }
    } else {
      // If it's an enum value, convert it to string
      placeTypeString = String(place.type);
    }

    // Transform the place object to match API expectations
    const apiPlace = {
      name: place.name,
      location: place.location,
      placeType: placeTypeString, // Ensure it's a string for API
      imageUrl: place.imageUrl,
      description: place.description
    };

    console.log('PlaceService: Sending to API endpoint:', `${this.apiUrl}`);
    console.log('PlaceService: Request payload:', apiPlace);

    return this.http.post<any>(`${this.apiUrl}`, apiPlace).pipe(
      map((response: any) => {
        console.log('PlaceService: Raw API response:', response);

        // Transform response back to frontend format
        const newPlace: IPlace = {
          id: response.id,
          name: response.name,
          location: response.location,
          type: response.placeType || response.type,
          imageUrl: response.imageUrl,
          description: response.description
        };

        console.log('PlaceService: Transformed response to frontend format:', newPlace);
        return newPlace;
      }),
      tap((newPlace: IPlace) => {
        this.places.push(newPlace);
        console.log('PlaceService: Successfully added place to local cache. Total places:', this.places.length);
      }),
      catchError(error => {
        console.error('PlaceService: API request failed with error:', error);
        console.error('PlaceService: Error status:', error.status);
        console.error('PlaceService: Error message:', error.message);

        if (error.error) {
          console.error('PlaceService: Server error details:', error.error);
        }

        console.log('PlaceService: Falling back to local storage');
        const currentId = this.nextId;
        const nextIdNum = parseInt(this.nextId) + 1;
        this.nextId = nextIdNum.toString();

        const newPlace: IPlace = { ...place, id: currentId };
        this.places.push(newPlace);
        console.log('PlaceService: Added place to local storage:', newPlace);
        return of(newPlace);
      })
    );
  }

  updatePlace(id: string, updated: Partial<Omit<IPlace, 'id'>>): Observable<boolean> {
    console.log('PlaceService: Updating place via API:', id, updated);
    return this.http.put<IPlace>(`${this.apiUrl}/update/${id}`, updated).pipe(
      tap((updatedPlace: IPlace) => {
        const idx = this.places.findIndex(p => p.id === id);
        if (idx !== -1) {
          this.places[idx] = updatedPlace;
        }
        console.log('PlaceService: Successfully updated place via API:', updatedPlace);
      }),
      map(() => true),
      catchError(error => {
        console.error('PlaceService: Failed to update place via API, using local storage:', error);
        // Fallback to local storage if API fails
        const idx = this.places.findIndex(p => p.id === id);
        if (idx === -1) return of(false);
        this.places[idx] = { ...this.places[idx], ...updated };
        return of(true);
      })
    );
  }

  deletePlace(id: string): Observable<boolean> {
    console.log('PlaceService: Deleting place via API:', id);
    return this.http.delete<void>(`${this.apiUrl}/delete/${id}`).pipe(
      tap(() => {
        const idx = this.places.findIndex(p => p.id === id);
        if (idx !== -1) {
          this.places.splice(idx, 1);
        }
        console.log('PlaceService: Successfully deleted place via API:', id);
      }),
      map(() => true),
      catchError(error => {
        console.error('PlaceService: Failed to delete place via API, using local storage:', error);
        // Fallback to local storage if API fails
        const idx = this.places.findIndex(p => p.id === id);
        if (idx === -1) return of(false);
        this.places.splice(idx, 1);
        return of(true);
      })
    );
  }

  filterPlaces(query: { location?: string; type?: string }): Observable<IPlace[]> {
    console.log('PlaceService: Filtering places:', query);
    return this.getAllPlaces().pipe(
      map(places => places.filter(p =>
        (!query.location || p.location === query.location) &&
        (!query.type || p.type === query.type)
      ))
    );
  }

  // Method to get places synchronously from local cache (for backward compatibility)
  getLocalFilteredPlaces(query: { location?: string; type?: string }): IPlace[] {
    return this.places.filter(p =>
      (!query.location || p.location === query.location) &&
      (!query.type || p.type === query.type)
    );
  }

  // Method to get the string representation of the place type enum
  getPlaceTypeString(placeType: PlaceType | string): string {
    // Handle both enum values and string values
    const typeStr = typeof placeType === 'string' ? placeType : placeType;

    switch (typeStr) {
      case PlaceType.FIVE:
      case 'FIVE':
        return '5-a-side';
      case PlaceType.SEVEN:
      case 'SEVEN':
        return '7-a-side';
      case PlaceType.ELEVEN:
      case 'ELEVEN':
        return '11-a-side';
      default:
        console.warn('Unknown place type:', placeType);
        return 'Unknown';
    }
  }

  // Method to convert human-readable string back to enum value
  getPlaceTypeFromString(typeString: string): string | null {
    switch (typeString) {
      case '5-a-side':
        return 'FIVE';
      case '7-a-side':
        return 'SEVEN';
      case '11-a-side':
        return 'ELEVEN';
      // Also handle direct enum values
      case 'FIVE':
      case 'SEVEN':
      case 'ELEVEN':
        return typeString;
      default:
        return null;
    }
  }
}
