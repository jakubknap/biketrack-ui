import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { AuthService } from 'src/app/shared/services/auth.service';
import { emailValidators, nicknameValidators, passwordValidators } from 'src/app/shared/validators/form-validators';
import { RegisterRequest } from "./model/register-request";
import { ApiErrorResponse } from "../../shared/models/api-response";

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html'
})
export class RegisterComponent implements OnInit {

  registerForm!: FormGroup;
  loading: boolean = false;
  responseMessage: string | null = null;
  responseStatus: 'success' | 'error' | null = null;

  constructor(private formBuilder: FormBuilder,
              private authService: AuthService) { }

  ngOnInit(): void {
    this.registerForm = this.formBuilder.group({
      nickname: [null, nicknameValidators],
      email: [null, emailValidators],
      password: [null, passwordValidators]
    });
  }

  get nickname() {
    return this.registerForm.get('nickname')!;
  }

  get email() {
    return this.registerForm.get('email')!;
  }

  get password() {
    return this.registerForm.get('password')!;
  }

  onSubmit() {
    this.responseStatus = null;
    this.responseMessage = null;

    if (this.registerForm.invalid) {
      this.registerForm.markAllAsTouched();
      return;
    }

    this.loading = true;

    setTimeout(() => {
      this.authService.register(this.mapFormToRequest()).subscribe({
        next: () => {
          this.responseStatus = 'success';
          this.responseMessage = 'Konto zostało utworzone! Sprawdź swoją skrzynkę e-mail i aktywuj konto, aby móc się zalogować.';
          this.loading = false;
          this.registerForm.reset();
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

  private mapFormToRequest(): RegisterRequest {
    return {
      nickname: this.nickname?.value,
      email: this.email?.value,
      password: this.password?.value
    }
  }

  private mapErrorValidationMessages(error: ApiErrorResponse) {
    if (!error.errors) return;

    error.errors.forEach(e => {
      const control = this.registerForm.get(e.field);
      if (control) {
        control.setErrors({ ...(control.errors || {}), backend: e.message });
      }
    });
  }

  private mapErrorMessage(status: string): string {
    switch (status) {
      case 'E03000':
        return 'Użytkownik o takim adresie e-mail lub nazwie użytkownika już istnieje.';
      default:
        return 'Wystąpił nieoczekiwany błąd. Spróbuj ponownie.';
    }
  }
}
