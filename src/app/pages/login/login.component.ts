import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ApiErrorResponse } from 'src/app/shared/models/api-response';
import { AuthService } from 'src/app/shared/services/auth.service';
import { LoginRequest } from './model/login-model';
import { Router } from '@angular/router';
import { TokenService } from 'src/app/shared/services/token.service';
import { SessionService } from 'src/app/shared/services/session.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html'
})
export class LoginComponent implements OnInit {

  loginForm!: FormGroup;
  loading: boolean = false;
  responseMessage: string | null = null;
  responseStatus: 'success' | 'error' | null = null;

  constructor(private formBuilder: FormBuilder,
              private authService: AuthService,
              private router: Router,
              private tokenService: TokenService,
              private sessionService: SessionService) { }

  ngOnInit(): void {
    this.loginForm = this.formBuilder.group({
      email: [null, [Validators.required, Validators.email]],
      password: [null, [Validators.required]]
    });

    this.sessionService.logoutMessage$.subscribe(message => {
      if (message) {
        this.responseMessage = message;
        this.responseStatus = 'error';
        this.sessionService.clearMessage();
      }
    });
  }

  get email() {
    return this.loginForm.get('email')!;
  }

  get password() {
    return this.loginForm.get('password')!;
  }

  onSubmit() {
    this.responseStatus = null;
    this.responseMessage = null;

    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    this.loading = true;

    setTimeout(() => {
      this.authService.login(this.mapFormToRequest()).subscribe({
        next: response => {
          this.tokenService.saveTokens(response.accessToken, response.refreshToken);
          this.router.navigate(['/dashboard']);
        },
        error: (error: ApiErrorResponse) => {
          this.loading = false;

          if (error.errors && error.errors.length > 0) {
            this.mapErrorValidationMessages(error);
          } else {
            this.responseStatus = 'error';
            this.responseMessage = this.mapErrorMessage(error.status);
          }
        }
      });
    }, 1000);
  }

  private mapFormToRequest(): LoginRequest {
    return {
      email: this.email?.value,
      password: this.password?.value
    }
  }

  private mapErrorValidationMessages(error: ApiErrorResponse) {
    if (!error.errors) return;

    error.errors.forEach(e => {
      const control = this.loginForm.get(e.field);
      if (control) {
        control.setErrors({ ...(control.errors || {}), backend: e.message });
      }
    });
  }

  private mapErrorMessage(status: string): string {
    switch (status) {
      case 'E02000':
      case 'E03001':
        return 'Nieprawidłowy e-mail lub hasło.';
      case 'E02001':
        return 'Twoje konto jest nieaktywne. Skontaktuj się z administratorem.';
      case 'E02002':
        return 'Twoje konto zostało zablokowane. Skontaktuj się z administratorem.';
      case 'E02003':
        return 'Twoje konto wygasło. Skontaktuj się z administratorem.';
      case 'E02004':
        return 'Twoje hasło wygasło. Ustaw nowe hasło, aby się zalogować.';
      case 'E03002':
        return 'Twoje konto nie zostało jeszcze aktywowane. Sprawdź pocztę e-mail i aktywuj konto.';
      default:
        return 'Wystąpił nieoczekiwany błąd. Spróbuj ponownie.';
    }
  }
}