import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ApiErrorResponse } from 'src/app/shared/models/api-response';
import { AuthService } from 'src/app/shared/services/auth.service';
import { emailValidators } from 'src/app/shared/validators/form-validators';
import { ResetPasswordRequest } from './model/reset-password-request';

@Component({
  selector: 'app-forgot-password',
  templateUrl: './forgot-password.component.html'
})
export class ForgotPasswordComponent implements OnInit {

  forgotPasswordForm!: FormGroup;
  loading: boolean = false;
  responseMessage: string | null = null;
  responseStatus: 'success' | 'error' | null = null;

  constructor(private formBuilder: FormBuilder,
              private authService: AuthService) {
  }

  ngOnInit(): void {
    this.forgotPasswordForm = this.formBuilder.group({
      email: [null, emailValidators]
    });
  }

  get email() {
    return this.forgotPasswordForm.get('email')!;
  }

  onSubmit() {
    this.responseStatus = null;
    this.responseMessage = null;

    if (this.forgotPasswordForm.invalid) {
      this.forgotPasswordForm.markAllAsTouched();
      return;
    }

    this.loading = true;

    setTimeout(() => {
      this.authService.resetPasswordRequest(this.mapFormToRequest()).subscribe({
        next: () => {
          this.responseStatus = 'success';
          this.responseMessage = 'Jeżeli adres e-mail istnieje w naszej bazie, wysłaliśmy Ci wiadomość z linkiem do zmiany hasła. Sprawdź swoją skrzynkę.';
          this.loading = false;
          this.forgotPasswordForm.reset();
        },
        error: (error: ApiErrorResponse) => {
          this.loading = false;

          if (error.errors && error.errors.length > 0) {
            this.mapErrorValidationMessages(error);
          } else {
            this.responseStatus = 'error';
            this.responseMessage = 'Wystąpił nieoczekiwany błąd. Spróbuj ponownie.';
          }
        }
      });
    }, 1500);
  }

  private mapFormToRequest(): ResetPasswordRequest {
    return {
      email: this.email?.value
    }
  }

  private mapErrorValidationMessages(error: ApiErrorResponse) {
    if (!error.errors) return;

    error.errors.forEach(e => {
      const control = this.forgotPasswordForm.get(e.field);
      if (control) {
        control.setErrors({ ...(control.errors || {}), backend: e.message });
      }
    });
  }
}
