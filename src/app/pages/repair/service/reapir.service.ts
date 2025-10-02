import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { catchError, forkJoin, map, Observable, of, switchMap } from 'rxjs';
import { Page } from 'src/app/shared/models/page';
import { BaseService } from 'src/app/shared/services/base.service';
import { RepairDetails, RepairList } from '../model/repair.model';
import { BaseResponse } from 'src/app/shared/models/api-response';

@Injectable({
  providedIn: 'root'
})
export class ReapirService extends BaseService {

  private repairsPrefix: string = 'repairs';

  constructor(private http: HttpClient) {
    super();
  }

  getRepairList(page: number, size: number, sortColumn: string, sortDirection: string): Observable<Page<RepairList>> {
    return this.http.get<Page<RepairList>>(`${this.baseUrl}/${this.repairsPrefix}`, {
      params: {
        page: page,
        size: size,
        sort: `${sortColumn},${sortDirection}`
      }
    }).pipe(
      catchError(this.handleError)
    );
  }

  addRepair(addRepairFormData: FormData): Observable<BaseResponse> {
    return this.http.post<BaseResponse>(`${this.baseUrl}/${this.repairsPrefix}`, addRepairFormData).pipe(
      catchError(this.handleError)
    );
  }

  getRepairDetails(repairUuid: string): Observable<RepairDetails> {
    return this.http.get<RepairDetails>(`${this.baseUrl}/${this.repairsPrefix}/${repairUuid}`).pipe(
      catchError(this.handleError)
    );
  }

  updateRepair(updateRepairFormData: FormData): Observable<BaseResponse> {
    return this.http.put<BaseResponse>(`${this.baseUrl}/${this.repairsPrefix}`, updateRepairFormData).pipe(
      catchError(this.handleError)
    );
  }

  deleteRepair(repairUuid: string): Observable<BaseResponse> {
    return this.http.delete<BaseResponse>(`${this.baseUrl}/${this.repairsPrefix}/${repairUuid}`).pipe(
      catchError(this.handleError)
    );
  }

  getRepairPhotoUrls(repairUuid: string): Observable<string[]> {
    return this.http.get<string[]>(`${this.baseUrl}/${this.repairsPrefix}/${repairUuid}/photos`).pipe(
      switchMap(uuids => {
        if (!uuids || uuids.length === 0) return of([]);
        const calls = uuids.map(uuid =>
          this.http.get(`${this.baseUrl}/files/REPAIRS/${uuid}/inline`, { responseType: 'blob' }).pipe(
            map(blob => {
              return URL.createObjectURL(blob);
            })
          )
        );
        return forkJoin(calls);
      }),
      catchError(err => {
        return of([]);
      })
    );
  }

  getRepairPhotos(repairUuid: string): Observable<File[]> {
    return this.http.get<string[]>(`${this.baseUrl}/${this.repairsPrefix}/${repairUuid}/photos`).pipe(
      switchMap(uuids => {
        const filesObservables = uuids.map(uuid =>
          this.http.get(`${this.baseUrl}/files/REPAIRS/${uuid}/inline`, { responseType: 'blob' }).pipe(
            map(blob => {
              const ext = this.getExtensionFromMimeType(blob.type);
              return new File([blob], `${uuid}.${ext}`, { type: blob.type });
            })
          )
        );
        return forkJoin(filesObservables);
      })
    );
  }

  private getExtensionFromMimeType(mimeType: string): string | null {
    switch (mimeType) {
      case 'image/jpeg':
        return 'jpeg';
      case 'image/jpg':
        return 'jpg';
      case 'image/png':
        return 'png';
      case 'image/gif':
        return 'gif';
      case 'image/webp':
        return 'webp';
      default:
        return null;
    }
  }
}