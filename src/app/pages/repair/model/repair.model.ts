import { Money } from "src/app/shared/models/money";
import { BikeListToSelect } from "../../bike/model/bike.model";

export interface RepairList {
  uuid: string;
  title: string;
  createdDate: Date;
  cost?: Money;
  bike: RepairBikeDto;
}

export interface RepairBikeDto {
  uuid: string;
  name: string;
}

export interface RepairDto {
  uuid: string;
  name: string | null;
}

export interface AddRepairRequest {
  bikeUuid: string;
  title: string;
  description: string;
  cost: number;
  currency: string | null;
  repairDate: Date;
}

export interface EditRepairRequest {
  repairUuid: string;
  title: string;
  description: string;
  cost: number;
  currency: string;
  repairDate: Date;
}

export interface RepairDetails {
  repairUuid: string;
  bike: BikeListToSelect;
  title: string;
  description?: string;
  cost?: Money;
  repairDate?: Date;
  createdDate: Date;
  lastModifiedDate?: Date;
  photos?: string[];
}