import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { catchError, Observable } from 'rxjs';
import { BaseService } from '../../../shared/services/base.service';
import { Page } from '../../../shared/models/page';
import { BikeDetails, BikeList, BikeListToSelect, BikeRepair, BikeRepairStatistics } from 'src/app/pages/bike/model/bike.model';
import { BaseResponse } from '../../../shared/models/api-response';

@Injectable({
  providedIn: 'root'
})
export class BikeService extends BaseService {

  private bikesPrefix: string = 'bikes';

  constructor(private http: HttpClient) {
    super();
  }

  addBike(addBikeFormData: FormData): Observable<BaseResponse> {
    return this.http.post<BaseResponse>(`${this.baseUrl}/${this.bikesPrefix}`, addBikeFormData).pipe(
      catchError(this.handleError)
    );
  }

  getBikeList(page: number, size: number): Observable<Page<BikeList>> {
    return this.http.get<Page<BikeList>>(`${this.baseUrl}/${this.bikesPrefix}?page=${page}&size=${size}`).pipe(
      catchError(this.handleError)
    );
  }

  getBikesToSelectList(): Observable<BikeListToSelect[]> {
    return this.http.get<BikeListToSelect[]>(`${this.baseUrl}/${this.bikesPrefix}/select-list`).pipe(
      catchError(this.handleError)
    );
  }

  getBikeDetails(bikeUuid: string): Observable<BikeDetails> {
    return this.http.get<BikeDetails>(`${this.baseUrl}/${this.bikesPrefix}/${bikeUuid}`).pipe(
      catchError(this.handleError)
    );
  }

  updateBike(updateBikeFormData: FormData): Observable<BaseResponse> {
    return this.http.put<BaseResponse>(`${this.baseUrl}/${this.bikesPrefix}`, updateBikeFormData).pipe(
      catchError(this.handleError)
    );
  }

  deleteBike(bikeUuid: string): Observable<BaseResponse> {
    return this.http.delete<BaseResponse>(`${this.baseUrl}/${this.bikesPrefix}/${bikeUuid}`).pipe(
      catchError(this.handleError)
    );
  }

  getBikeStatistics(bikeUuid: string): Observable<BikeRepairStatistics> {
    return this.http.get<BikeRepairStatistics>(`${this.baseUrl}/${this.bikesPrefix}/${bikeUuid}/statistics`).pipe(
      catchError(this.handleError)
    );
  }

  getBikeRepairs(bikeUuid: string, page: number, size: number, sortColumn: string, sortDirection: string): Observable<Page<BikeRepair>> {
    return this.http.get<Page<BikeRepair>>(`${this.baseUrl}/${this.bikesPrefix}/${bikeUuid}/repairs`, {
      params: {
        page: page,
        size: size,
        sort: `${sortColumn},${sortDirection}`
      }
    }).pipe(
      catchError(this.handleError)
    );
  }
}