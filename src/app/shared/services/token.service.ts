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
    localStorage.setItem(this.JWT_ACCESS_TOKEN, accessToken);
    localStorage.setItem(this.JWT_REFRESH_TOKEN, refreshToken);
  }

  deleteTokens(): void {
    localStorage.removeItem(this.JWT_ACCESS_TOKEN);
    localStorage.removeItem(this.JWT_REFRESH_TOKEN);
  }

  getAccessToken(): string | null {
    return localStorage.getItem(this.JWT_ACCESS_TOKEN);
  }

  getRefreshToken(): string | null {
    return localStorage.getItem(this.JWT_REFRESH_TOKEN);
  }

  isAuthenticated(): boolean {
    const access = this.getAccessToken();
    const refresh = this.getRefreshToken();

    if (access && !this.jwtHelper.isTokenExpired(access)) {
      return true;
    }

    if (refresh && !this.jwtHelper.isTokenExpired(refresh)) {
      return true;
    }

    return false;
  }
}