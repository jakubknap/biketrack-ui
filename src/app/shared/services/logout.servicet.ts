import { Injectable } from "@angular/core";
import { Router } from "@angular/router";
import { catchError, finalize, of } from "rxjs";
import { AuthService } from "./auth.service";
import { TokenService } from "./token.service";

@Injectable({
    providedIn: 'root'
})
export class LogoutService {

    constructor(private authService: AuthService,
                private tokenService: TokenService,
                private router: Router) { }

    logout(): void {
        const accessToken = this.tokenService.getAccessToken();

        if (!accessToken) {
            this.cleanupAndRedirect();
            return;
        }

        this.authService.logout().pipe(
            catchError(() => of(null)),
            finalize(() => this.cleanupAndRedirect())
        ).subscribe();
    }

    private cleanupAndRedirect(): void {
        this.tokenService.deleteTokens();
        this.router.navigate(['/login']);
    }
}