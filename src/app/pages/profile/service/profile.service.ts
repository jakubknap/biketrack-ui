import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { catchError, Observable } from 'rxjs';
import { BaseService } from 'src/app/shared/services/base.service';
import { BaseResponse } from 'src/app/shared/models/api-response';
import { PasswordChangeRequest, UpdateUserRequest, UserDetailsResponse } from '../model/profile.model';

@Injectable({
  providedIn: 'root'
})
export class ProfileService extends BaseService {

  private usersPrefix: string = 'users';

  constructor(private http: HttpClient) {
    super();
  }

  getUserDetails(): Observable<UserDetailsResponse> {
    return this.http.get<UserDetailsResponse>(`${this.baseUrl}/${this.usersPrefix}`).pipe(
      catchError(this.handleError)
    );
  }

  updateUser(updateUserRequest: UpdateUserRequest): Observable<BaseResponse> {
    return this.http.put<BaseResponse>(`${this.baseUrl}/${this.usersPrefix}`, updateUserRequest).pipe(
      catchError(this.handleError)
    );
  }

  changeUserPassword(passwordChangeRequest: PasswordChangeRequest): Observable<BaseResponse> {
    return this.http.patch<BaseResponse>(`${this.baseUrl}/${this.usersPrefix}/change-password`, passwordChangeRequest).pipe(
      catchError(this.handleError)
    );
  }
}