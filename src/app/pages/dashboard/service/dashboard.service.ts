import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { catchError, Observable } from 'rxjs';
import { DashboardStatsResponse } from 'src/app/pages/dashboard/model/dashboard-stats-model';
import { BaseService } from 'src/app/shared/services/base.service';

@Injectable({
  providedIn: 'root'
})
export class DashboardService extends BaseService {

  private dashboardPrefix: string = 'dashboard';

  constructor(private http: HttpClient) {
    super();
  }

  getDashboardStatistics(): Observable<DashboardStatsResponse> {
    return this.http.get<DashboardStatsResponse>(`${this.baseUrl}/${this.dashboardPrefix}/statistics`).pipe(
      catchError(this.handleError)
    );
  }
}