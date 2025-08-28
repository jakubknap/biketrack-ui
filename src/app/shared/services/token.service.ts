import { Injectable } from '@angular/core';
import { JwtHelperService } from '@auth0/angular-jwt';


@Injectable({
  providedIn: 'root'
})
export class TokenService {

  private readonly JWT_ACCESS_TOKEN = "JWT_ACCESS_TOKEN";
  private readonly JWT_REFRESH_TOKEN = "JWT_REFRESH_TOKEN";

  private jwtHelper = new JwtHelperService();

  constructor() { }

  saveTokens(accessToken: string, refreshToken: string): void {
    this.deleteTokens();
    sessionStorage.setItem(this.JWT_ACCESS_TOKEN, accessToken);
    sessionStorage.setItem(this.JWT_REFRESH_TOKEN, refreshToken);
  }

  deleteTokens(): void {
    sessionStorage.removeItem(this.JWT_ACCESS_TOKEN);
    sessionStorage.removeItem(this.JWT_REFRESH_TOKEN);
  }

  getAccessToken(): string | null {
    return sessionStorage.getItem(this.JWT_ACCESS_TOKEN);
  }

  getRefreshToken(): string | null {
    return sessionStorage.getItem(this.JWT_REFRESH_TOKEN);
  }

  isAuthenticated(): boolean {
    const accessToken = this.getAccessToken();
    return accessToken != null && !this.jwtHelper.isTokenExpired(accessToken);
  }
}