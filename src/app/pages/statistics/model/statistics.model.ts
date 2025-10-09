import { Money } from "src/app/shared/models/money";

export interface StatisticsResponse {
    summary: Summary;
    repairsPerBike: RepairsPerBike[];
    averageRepairCostPerBike: AverageRepairCostPerBike[];
    repairsThisYearPerMonth: RepairsThisYearPerMonth[];
}

export interface Summary {
    totalBikes: number;
    totalRepairs: number;
    totalRepairCost: Money;
}

export interface RepairsPerBike {
    bikeName: string;
    repairs: number;
}

export interface AverageRepairCostPerBike {
    bikeName: string;
    averageCost: number;
}

export interface RepairsThisYearPerMonth {
    month: string;
    repairs: number;
}