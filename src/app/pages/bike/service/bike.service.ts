import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { catchError, Observable } from 'rxjs';
import { BaseService } from '../../../shared/services/base.service';
import { Page } from '../../../shared/models/page';
import { BikeDetails, BikeList } from 'src/app/pages/bike/model/bike.model';
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
}