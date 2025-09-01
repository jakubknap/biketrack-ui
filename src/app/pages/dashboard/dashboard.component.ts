import { Component, OnInit } from '@angular/core';
import { DashboardStatsResponse } from './model/dashboard-stats-model';
import { DashboardService } from 'src/app/shared/services/dashboard.service';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html'
})
export class DashboardComponent implements OnInit {

  stats: DashboardStatsResponse | null = null;
  loading: boolean = true;
  errorMessage: string | null = null;

  constructor(private dashboardService: DashboardService) { }

  ngOnInit(): void {
    this.fetchData();
  }

  fetchData() {
    this.loading = true;
    this.errorMessage = null;
    this.stats = null;

    this.dashboardService.getDashboardStatistics().subscribe({
      next: response => {
        this.stats = response;
        this.loading = false;
      },
      error: () => {
        this.errorMessage = 'Nie udało się pobrać danych z serwera.';
        this.loading = false;
      }
    });
  }
}