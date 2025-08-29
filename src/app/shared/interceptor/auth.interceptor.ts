import { HttpErrorResponse, HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { BehaviorSubject, catchError, filter, Observable, switchMap, take, throwError } from "rxjs";
import { TokenService } from "../services/token.service";
import { AuthService } from "../services/auth.service";
import { LogoutService } from "../services/logout.servicet";
import { SessionService } from "../services/session.service";

@Injectable()
export class AuthInterceptor implements HttpInterceptor {

    private isRefreshing = false;
    private refreshTokenSubject: BehaviorSubject<any> = new BehaviorSubject<any>(null);

    constructor(private tokenService: TokenService,
                private authService: AuthService,
                private logoutService: LogoutService,
                private sessionService: SessionService) { }


    intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
        if (req.url.includes('/api/v1/auth')) {
            return next.handle(req);
        }

        const accessToken = this.tokenService.getAccessToken();
        req = this.addTokenHeader(req, accessToken!);

        return next.handle(req).pipe(catchError((error) => {
            if (error instanceof HttpErrorResponse && error.status === 401) {
                return this.handle401Error(req, next);
            }
            return throwError(() => error);
        })
        );
    }

    private addTokenHeader(req: HttpRequest<any>, accessToken: string): HttpRequest<any> {
        return req.clone({
            setHeaders: { Authorization: `Bearer ${accessToken}` },
        });
    }

    private handle401Error(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
        if (!this.isRefreshing) {
            this.isRefreshing = true;
            this.refreshTokenSubject.next(null);

            return this.authService.refreshToken().pipe(
                switchMap((response) => {
                    this.isRefreshing = false;
                    this.tokenService.saveTokens(response.accessToken, response.refreshToken);
                    this.refreshTokenSubject.next(response.accessToken);
                    return next.handle(this.addTokenHeader(req, response.accessToken));
                }),
                catchError((err) => {
                    this.isRefreshing = false;
                    this.tokenService.deleteTokens();
                    this.logoutService.logout();
                    this.sessionService.notifyLogout('Twoja sesja wygasła. Zaloguj się ponownie.');
                    return throwError(() => err);
                })
            );
        } else {
            return this.refreshTokenSubject.pipe(
                filter((token) => token !== null),
                take(1),
                switchMap(token => next.handle(this.addTokenHeader(req, token)))
            );
        }
    }
}