import { Injectable } from '@angular/core';
import { BaseService } from "./base.service";
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { catchError, Observable } from 'rxjs';
import { BaseResponse } from '../models/api-response';
import { RegisterRequest } from 'src/app/pages/register/model/register-request';
import { ResendTokenRequest } from '../models/resend-token-request';
import { ResetPasswordRequest } from 'src/app/pages/forgot-password/model/reset-password-request';
import { ResetPasswordConfirmRequest } from 'src/app/pages/reset-password/model/reset-password-confirm-request';
import { LoginRequest } from 'src/app/pages/login/model/login-model';
import { TokenService } from './token.service';
import { JwtTokenResponse } from '../models/token-response';

@Injectable({
  providedIn: 'root'
})
export class AuthService extends BaseService {

  private authPrefix: string = 'auth';

  constructor(private http: HttpClient,
              private tokenService: TokenService) {
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

  login(loginRequest: LoginRequest): Observable<JwtTokenResponse> {
    return this.http.post<JwtTokenResponse>(`${this.baseUrl}/${this.authPrefix}/authenticate`, loginRequest).pipe(
      catchError(this.handleError)
    );
  }

  logout(): Observable<BaseResponse> {
    const headers = new HttpHeaders({ 'Authorization': `Bearer ${this.tokenService.getAccessToken()}` })
    return this.http.post<BaseResponse>(`${this.baseUrl}/${this.authPrefix}/logout`, null, { headers }).pipe(
      catchError(this.handleError)
    );
  }

  refreshToken(): Observable<JwtTokenResponse> {
    const headers = new HttpHeaders({ 'Authorization': `Bearer ${this.tokenService.getRefreshToken()}` })
    return this.http.post<JwtTokenResponse>(`${this.baseUrl}/${this.authPrefix}/refresh-token`, null, { headers }).pipe(
      catchError(this.handleError)
    );
  }

  resendToken(resendTokenRequest: ResendTokenRequest): Observable<BaseResponse> {
    return this.http.post<BaseResponse>(`${this.baseUrl}/${this.authPrefix}/resend-token`, resendTokenRequest).pipe(
      catchError(this.handleError)
    );
  }

  resetPasswordRequest(resetPasswordRequest: ResetPasswordRequest): Observable<BaseResponse> {
    return this.http.post<BaseResponse>(`${this.baseUrl}/${this.authPrefix}/password-reset/request`, resetPasswordRequest).pipe(
      catchError(this.handleError)
    );
  }

  resetPasswordConfirm(resetPasswordConfirmRequest: ResetPasswordConfirmRequest): Observable<BaseResponse> {
    return this.http.post<BaseResponse>(`${this.baseUrl}/${this.authPrefix}/password-reset/confirm`, resetPasswordConfirmRequest).pipe(
      catchError(this.handleError)
    );
  }
}