import { Injectable } from '@angular/core';
import { BaseService } from "./base.service";
import { HttpClient } from '@angular/common/http';
import { catchError, Observable } from 'rxjs';
import { BaseResponse } from '../models/api-response';
import { RegisterRequest } from 'src/app/pages/register/model/register-request';
import { ResendTokenRequest } from '../models/resend-token-request';

@Injectable({
    providedIn: 'root'
})
export class AuthService extends BaseService {

    private authPrefix: string = 'auth';

    constructor(private http: HttpClient) {
        super();
    }

    register(registerRequest: RegisterRequest): Observable<BaseResponse> {
        return this.http.post<BaseResponse>(`${this.baseUrl}/${this.authPrefix}/register`, registerRequest).pipe(
            catchError(this.handleError)
        );
    }

    activateAccount(token: string): Observable<BaseResponse> {
        return this.http.get<BaseResponse>(`${this.baseUrl}/${this.authPrefix}/activate-account/${token}`).pipe(
            catchError(this.handleError)
        );
    }

    resendToken(resendTokenRequest: ResendTokenRequest): Observable<BaseResponse> {
        return this.http.post<BaseResponse>(`${this.baseUrl}/${this.authPrefix}/resend-token`, resendTokenRequest).pipe(
            catchError(this.handleError)
        );
    }
}
