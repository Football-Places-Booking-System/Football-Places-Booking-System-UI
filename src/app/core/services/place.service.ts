import { Injectable } from '@angular/core';
import { PlaceType } from "../enums/place-type.enum";
import { IPlace } from "../models/iplace.model";

@Injectable({
  providedIn: 'root'
})
export class PlaceService {
  private storageKey = 'places';
  private idKey = 'places_nextId';
  private places: IPlace[] = [];
  private nextId = '1';

  constructor() {
    this.loadFromStorage();
  }

  private loadFromStorage() {
    const placesJson = sessionStorage.getItem(this.storageKey);
    const idJson = sessionStorage.getItem(this.idKey);
    if (placesJson) {
      this.places = JSON.parse(placesJson);
    } else {
      // Default data if nothing in storage
      this.places = [
        {
          id: '1',
          name: 'Camp Nou',
          location: 'Barcelona',
          type: PlaceType.ELEVEN,
          imageUrl: '/campnou-2-2.jpg',
        }
      ];
      this.nextId = '5';
      this.saveToStorage();
      return;
    }
    this.nextId = idJson ? idJson : (this.places.length ? (Math.max(...this.places.map(p => parseInt(p.id))) + 1).toString() : '1');
  }

  private saveToStorage() {
    sessionStorage.setItem(this.storageKey, JSON.stringify(this.places));
    sessionStorage.setItem(this.idKey, this.nextId);
  }

  getAllPlaces(): IPlace[] {
    return [...this.places];
  }

  addPlace(place: Omit<IPlace, 'id'>): IPlace {
    const currentId = this.nextId;
    const nextIdNum = parseInt(this.nextId) + 1;
    this.nextId = nextIdNum.toString();

    const newPlace: IPlace = { ...place, id: currentId };
    this.places.push(newPlace);
    this.saveToStorage();
    return newPlace;
  }

  updatePlace(id: string, updated: Partial<Omit<IPlace, 'id'>>): boolean {
    const idx = this.places.findIndex(p => p.id === id);
    if (idx === -1) return false;
    this.places[idx] = { ...this.places[idx], ...updated };
    this.saveToStorage();
    return true;
  }

  deletePlace(id: string): boolean {
    const idx = this.places.findIndex(p => p.id === id);
    if (idx === -1) return false;
    this.places.splice(idx, 1);
    this.saveToStorage();
    return true;
  }

  filterPlaces(query: { location?: string; type?: string }): IPlace[] {
    return this.places.filter(p =>
      (!query.location || p.location === query.location) &&
      (!query.type || p.type === query.type)
    );
  }
}
