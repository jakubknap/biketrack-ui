import { inject } from '@angular/core';
import { CanActivateFn } from '@angular/router';
import { TokenService } from '../services/token.service';
import { LogoutService } from '../services/logout.servicet';
import { SessionService } from "../services/session.service";

export const authGuard: CanActivateFn = () => {
    const tokenService = inject(TokenService);
    const logoutService = inject(LogoutService);
    const sessionService = inject(SessionService);

    if (!tokenService.isAuthenticated()) {
        logoutService.logout();
        sessionService.notifyLogout('Twoja sesja wygasła. Zaloguj się ponownie.');
        return false;
    }
    return true;
};