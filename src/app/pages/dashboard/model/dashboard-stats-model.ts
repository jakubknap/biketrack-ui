import { Money } from "src/app/shared/models/money";

export interface DashboardStatsResponse {
  totalBikes: number;
  recentlyAddedBike?: RecentlyAddedBikeDto;
  totalRepairs: number;
  totalRepairsCost: Money;
  recentlyAddedRepair?: RecentlyAddedRepairDto;
}

export interface RecentlyAddedBikeDto {
  name: string;
  uuid: string;
}

export interface RecentlyAddedRepairDto {
  uuid: string
  title: string;
  repairCost?: Money;
}