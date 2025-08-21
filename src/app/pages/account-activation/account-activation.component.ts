import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ApiErrorResponse } from 'src/app/shared/models/api-response';
import { ResendTokenRequest } from 'src/app/shared/models/resend-token-request';
import { AuthService } from 'src/app/shared/services/auth.service';
import { validate as isValidUUID } from 'uuid';

enum ViewState {
  ACTIVATING,
  ACTIVATED,
  ACTIVATION_ERROR,
  ACTIVATION_EXPIRED,
  RESENDING,
  RESEND_SUCCESS,
  RESEND_ERROR
}

@Component({
  selector: 'app-account-activation',
  templateUrl: './account-activation.component.html'
})
export class AccountActivationComponent implements OnInit {

  ViewState = ViewState;
  viewState: ViewState = ViewState.ACTIVATING;
  message: string | null = null;

  constructor(private route: ActivatedRoute,
              private authService: AuthService) {
  }

  ngOnInit(): void {
    const token = this.token;

    setTimeout(() => {
      if (!token || !isValidUUID(token)) {
        return this.failActivation('Link aktywacyjny jest nieprawidłowy. Upewnij się, że korzystasz z linku otrzymanego w wiadomości e-mail.');
      }

      this.authService.activateAccount(token).subscribe({
        next: () => {
          this.viewState = ViewState.ACTIVATED;
          this.message = 'Możesz teraz zalogować się i korzystać z pełnej funkcjonalności BikeTrack.';
        },
        error: (error: ApiErrorResponse) => {
          let status = error.status;

          if (status === 'E03003') {
            this.viewState = ViewState.ACTIVATED;
            this.message = 'Twoje konto zostało już wcześniej aktywowane. Możesz zalogować się i korzystać z pełnej funkcjonalności BikeTrack.';
          } else if (status === 'E04001') {
            this.viewState = ViewState.ACTIVATION_EXPIRED;
            this.message = 'Twój link aktywacyjny wygasł. Kliknij przycisk poniżej, aby wysłać nowy link.';
          } else {
            this.failActivation(this.mapErrorMessage(status));
          }
        }
      })
    }, 2000);
  }

  resendActivationLink() {
    this.viewState = ViewState.RESENDING;

    const expiredToken = this.token!;

    setTimeout(() => {
      this.authService.resendToken(this.prepareRequest(expiredToken)).subscribe({
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

  private get token(): string | null {
    return this.route.snapshot.paramMap.get('token');
  }

  private failActivation(message: string): void {
    this.viewState = ViewState.ACTIVATION_ERROR;
    this.message = message;
  }

  private prepareRequest(expiredToken: string): ResendTokenRequest {
    return {
      tokenType: 'ACCOUNT_ACTIVATION_TOKEN',
      expiredToken: expiredToken
    }
  }

  private mapErrorMessage(status: string): string {
    switch (status) {
      case 'E00005':
        return 'Link aktywacyjny jest nieprawidłowy. Upewnij się, że korzystasz z linku otrzymanego w wiadomości e-mail.';
      case 'E04000':
        return 'Nie znaleziono linku aktywacyjnego w systemie. Być może został on zmieniony lub jest błędny.';
      case 'E04002':
        return 'Twój link aktywacyjny został unieważniony. Skontaktuj się z nami, jeżeli uważasz że to błąd.';
      case 'E04003':
        return 'Link aktywacyjny jest nieprawidłowy. Upewnij się, że korzystasz z linku otrzymanego w wiadomości e-mail.';
      case 'E04004':
        return 'Twój link aktywacyjny został już wykorzystany.';
      default:
        return 'Wystąpił nieoczekiwany błąd. Spróbuj ponownie.';
    }
  }

  private mapErrorMessageForResend(status: string): string {
    switch (status) {
      case 'E03001':
        return 'Nie znaleziono użytkownika w systemie do przypisanego linku aktywacyjnego. Skontaktuj się z nami, jeżeli uważasz że to błąd.';
      case 'E03003':
        return 'Twoje konto zostało już wcześniej aktywowane. Skontaktuj się z nami, jeżeli uważasz że to błąd.';
      case 'E04000':
        return 'Nie znaleziono wygasłego linku aktywacyjnego w systemie. Być może został on zmieniony lub jest błędny.';
      case 'E04002':
        return 'Twój wygasły link aktywacyjny został unieważniony. Skontaktuj się z nami, jeżeli uważasz że to błąd.';
      case 'E04003':
        return 'Link aktywacyjny jest nieprawidłowy. Upewnij się, że korzystasz z linku otrzymanego w wiadomości e-mail.';
      case 'E04004':
        return 'Twój link aktywacyjny został już wykorzystany.';
      default:
        return 'Wystąpił nieoczekiwany błąd. Spróbuj ponownie.';
    }
  }
}
