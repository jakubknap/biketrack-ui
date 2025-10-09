import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { catchError, Observable } from 'rxjs';
import { BaseService } from 'src/app/shared/services/base.service';
import { StatisticsResponse } from '../model/statistics.model';

@Injectable({
  providedIn: 'root'
})
export class StatisticsService extends BaseService {

  private statisticsPrefix: string = 'statistics';

  constructor(private http: HttpClient) {
    super();
  }

  getStatistics(): Observable<StatisticsResponse> {
    return this.http.get<StatisticsResponse>(`${this.baseUrl}/${this.statisticsPrefix}`).pipe(
      catchError(this.handleError)
    );
  }
}