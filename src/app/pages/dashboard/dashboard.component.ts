import { Component, OnInit } from '@angular/core';
import { DashboardStatsResponse } from './model/dashboard-stats-model';
import { Router } from '@angular/router';
import { DashboardService } from './service/dashboard.service';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html'
})
export class DashboardComponent implements OnInit {

  stats: DashboardStatsResponse | null = null;
  loading: boolean = true;
  errorMessage: string | null = null;

  constructor(private dashboardService: DashboardService,
    private router: Router) { }

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

  openBikeDetails(bikeUuid?: string) {
    this.router.navigate([`/bikes/${bikeUuid}`]);
  }

  openAddBikeModal() {
    this.router.navigate(['/bikes'], { queryParams: { modal: 'add' } });
  }

  openRepairDetailsModal(repairUuid?: string) {
    this.router.navigate(['/repairs'], { queryParams: { modal: 'details', repairUuid: repairUuid } });
  }

  openAddRepairModal() {
    this.router.navigate(['/repairs'], { queryParams: { modal: 'add' } });
  }
}