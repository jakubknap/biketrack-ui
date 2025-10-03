import { Money } from "src/app/shared/models/money";

export interface BikeList {
  uuid: string;
  name: string;
  photo?: string;
  previewUrl: string;
}

export interface BikeDetails {
  bikeUuid: string;
  name: string;
  brand?: string;
  model?: string;
  type: string;
  purchaseDate?: Date;
  serialNumber?: string;
  mileageKm?: string;
  description?: string;
  photo?: string;
  createdDate: Date;
  lastModifiedDate?: Date;
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

export interface BikeRepairStatistics {
  totalRepairs: number;
  totalRepairCost: Money;
  dateOfLastRepair?: Date;
  dateOfFirstRepair?: Date;
  averageRepairCost: Money;
  repairsThisYear: number;
}

export interface BikeRepair {
  repairUuid: string;
  title: string;
  cost?: Money;
  createdDate: string;
}