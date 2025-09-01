import { Money } from "src/app/shared/models/money";

export interface DashboardStatsResponse {
  totalBikes: number;
  recentlyAddedBike: string | null;
  totalRepairs: number;
  totalRepairsCost: Money;
  recentlyAddedRepair: RecentlyAddedRepairDto | null;
}

export interface RecentlyAddedRepairDto {
  title: string;
  repairCost: Money
}