import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ApiErrorResponse } from 'src/app/shared/models/api-response';
import { AuthService } from 'src/app/shared/services/auth.service';
import { passwordValidators } from 'src/app/shared/validators/form-validators';
import { ActivatedRoute } from '@angular/router';
import Validation from 'src/app/shared/utils/validation';
import { validate as isValidUUID } from 'uuid';
import { ResetPasswordConfirmRequest } from './model/reset-password-confirm-request';
import { ResendTokenRequest } from 'src/app/shared/models/resend-token-request';


enum ViewState {
  RESETTING,
  RESET_SUCCESS,
  RESET_ERROR,
  LINK_EXPIRED,
  RESENDING,
  RESEND_SUCCESS,
  RESEND_ERROR
}

@Component({
  selector: 'app-reset-password',
  templateUrl: './reset-password.component.html'
})
export class ResetPasswordComponent implements OnInit {

  ViewState = ViewState;
  viewState: ViewState = ViewState.RESETTING;

  resetPasswordForm!: FormGroup;

  loading: boolean = false;

  message: string | null = null;

  private token: string | null = null;

  constructor(private formBuilder: FormBuilder,
              private authService: AuthService,
              private route: ActivatedRoute) { }

  ngOnInit(): void {
    this.token = this.getTokenFromParams();

    if (!this.token || !isValidUUID(this.token)) {
      this.viewState = ViewState.RESET_ERROR;
      this.message = "Link resetujący hasło jest nieprawidłowy. Upewnij się, że korzystasz z linku otrzymanego w wiadomości e-mail.";
      return;
    }

    this.resetPasswordForm = this.formBuilder.group({
      password: [null, passwordValidators],
      confirmPassword: [null, passwordValidators],
    }, {
      validators: [Validation.match('password', 'confirmPassword')]
    });
  }

  get password() {
    return this.resetPasswordForm.get('password')!;
  }

  get confirmPassword() {
    return this.resetPasswordForm.get('confirmPassword')!;
  }

  onSubmit() {
    this.message = null;

    if (this.resetPasswordForm.invalid) {
      this.resetPasswordForm.markAllAsTouched();
      return;
    }

    this.loading = true;

    setTimeout(() => {
      this.authService.resetPasswordConfirm(this.mapFormToRequest()).subscribe({
        next: () => {
          this.viewState = ViewState.RESET_SUCCESS;
          this.message = 'Twoje hasło zostało zmienione! Możesz teraz zalogować się używając nowego hasła.';
        },
        error: (error: ApiErrorResponse) => {
          this.loading = false;

          if (error.errors && error.errors.length > 0) {
            this.mapErrorValidationMessages(error);
          } else {
            let status = error.status;

            if (status === 'E04001') {
              this.viewState = ViewState.LINK_EXPIRED;
              this.message = 'Twój link resetujący hasło wygasł. Kliknij przycisk poniżej, aby wysłać nowy link.';
            } else {
              this.message = this.mapErrorMessage(status);
            }
          }
        }
      });
    }, 1000);
  }

  resendResetLink() {
    this.viewState = ViewState.RESENDING;

    setTimeout(() => {
      this.authService.resendToken(this.prepareRequest()).subscribe({
        next: () => {
          this.viewState = ViewState.RESEND_SUCCESS;
        },
        error: (error: ApiErrorResponse) => {
          this.viewState = ViewState.RESEND_ERROR;
          this.message = this.mapErrorMessageForResend(error.status);
        }
      })
    }, 1500);
  }

  private getTokenFromParams(): string | null {
    return this.route.snapshot.paramMap.get('token');
  }

  private mapFormToRequest(): ResetPasswordConfirmRequest {
    return {
      token: this.token!,
      password: this.password?.value,
      passwordRepeat: this.confirmPassword?.value

    }
  }

  private mapErrorValidationMessages(error: ApiErrorResponse) {
    if (!error.errors) return;

    error.errors.forEach(e => {
      const control = this.resetPasswordForm.get(e.field);
      if (control) {
        control.setErrors({ ...(control.errors || {}), backend: e.message });
      }
    });
  }

  private mapErrorMessage(status: string): string {
    switch (status) {
      case 'E00005':
        return 'Link resetujący hasło jest nieprawidłowy. Upewnij się, że korzystasz z linku otrzymanego w wiadomości e-mail.';
      case 'E03004':
        return 'Hasła nie są takie same.';
      case 'E03005':
        return 'Nowe hasło nie może być takie samo jak aktualne hasło.';
      case 'E04000':
        return 'Nie znaleziono linku resetującego hasło w systemie. Być może został on zmieniony lub jest błędny.';
      case 'E04002':
        return 'Twój link resetujący hasło został unieważniony. Skontaktuj się z nami, jeżeli uważasz że to błąd.';
      case 'E04003':
        return 'Link resetujący hasło jest nieprawidłowy. Upewnij się, że korzystasz z linku otrzymanego w wiadomości e-mail.';
      case 'E04004':
        return 'Twój link resetujący hasło został już wykorzystany.';
      default:
        return 'Wystąpił nieoczekiwany błąd. Spróbuj ponownie.';
    }
  }

  private prepareRequest(): ResendTokenRequest {
    return {
      tokenType: 'PASSWORD_RESET_TOKEN',
      expiredToken: this.token!
    }
  }

  private mapErrorMessageForResend(status: string): string {
    switch (status) {
      case 'E03001':
        return 'Nie znaleziono użytkownika w systemie do przypisanego linku resetującego hasło. Skontaktuj się z nami, jeżeli uważasz że to błąd.';
      case 'E04000':
        return 'Nie znaleziono wygasłego linku resetującego hasło w systemie. Być może został on zmieniony lub jest błędny.';
      case 'E04002':
        return 'Twój wygasły link resetujący hasło został unieważniony. Skontaktuj się z nami, jeżeli uważasz że to błąd.';
      case 'E04003':
        return 'Link resetujący hasło jest nieprawidłowy. Upewnij się, że korzystasz z linku otrzymanego w wiadomości e-mail.';
      case 'E04004':
        return 'Twój link resetujący hasło został już wykorzystany.';
      default:
        return 'Wystąpił nieoczekiwany błąd. Spróbuj ponownie.';
    }
  }
}