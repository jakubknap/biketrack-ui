export interface BikeList {
  uuid: string;
  name: string;
}

export interface BikeDetails {
  bikeUuid: string;
  name: string;
  brand: string | null;
  model: string | null;
  type: string;
  purchaseDate: Date | null;
  serialNumber: string | null;
  mileageKm: string | null;
  description: string | null;
}

export interface BikeDto {
  uuid: string;
  name: string | null;
}

export interface AddBikeRequest {
  name: string;
  brand: string;
  model: string;
  type: string;
  purchaseDate: Date,
  serialNumber: string;
  mileageKm: number;
  description: string;
}

export interface EditBikeRequest {
  bikeUuid: string;
  name: string;
  brand: string;
  model: string;
  type: string;
  purchaseDate: Date,
  serialNumber: string;
  mileageKm: number;
  description: string;
}

export interface BikeListToSelect {
  uuid: string;
  name: string;
}