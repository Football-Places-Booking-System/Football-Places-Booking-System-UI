import { PlaceType } from "../enums/place-type.enum";


export interface IPlace {
  id: string;
  name: string;
  location: string;
  type: PlaceType;
  imageUrl: string;
  description?: string; // Optional field for additional details
}
