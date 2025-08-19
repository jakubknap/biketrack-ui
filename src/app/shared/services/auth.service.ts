import { Injectable } from '@angular/core';
import { BaseService } from "./base.service";
import { HttpClient } from '@angular/common/http';
import { catchError, Observable } from 'rxjs';
import { BaseResponse } from '../models/api-response';
import { RegisterRequest } from 'src/app/pages/register/model/register-request';

@Injectable({
    providedIn: 'root'
})
export class AuthService extends BaseService {

    constructor(private http: HttpClient) {
        super();
    }

    register(registerRequest: RegisterRequest): Observable<BaseResponse> {
        return this.http.post<BaseResponse>(`${this.baseUrl}/auth/register`, registerRequest).pipe(
            catchError(this.handleError)
        );
    }
}
