import { Component, OnInit } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import Validation from 'src/app/shared/utils/validation';
import { emailValidators, nicknameValidators, passwordValidators } from 'src/app/shared/validators/form-validators';
import { ProfileService } from './service/profile.service';
import { PasswordChangeRequest, UpdateUserRequest, UserDetailsResponse } from './model/profile.model';
import { ApiErrorResponse } from 'src/app/shared/models/api-response';
import { ToastrService } from 'ngx-toastr';
import { LogoutService } from 'src/app/shared/services/logout.servicet';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html'
})
export class ProfileComponent implements OnInit {

  user?: UserDetailsResponse;

  loading: boolean = true;
  errorMessage: string | null = null;

  profileEditing: boolean = false;
  profileSaving = false;
  profileError: string | null = null;

  passwordChangeFormOpen: boolean = false;
  passwordSaving = false;
  passwordError: string | null = null;

  profileEditForm = this.formBuilder.group({
    nickname: [{ value: '', disabled: true }, nicknameValidators],
    email: [{ value: '', disabled: true }, emailValidators]
  });

  passwordChangeForm = this.formBuilder.group({
    password: [null, passwordValidators],
    confirmPassword: [null, passwordValidators],
  }, {
    validators: [Validation.match('password', 'confirmPassword')]
  });

  constructor(private formBuilder: FormBuilder,
              private profileService: ProfileService,
              private toastr: ToastrService,
              private logutService: LogoutService) { }

  ngOnInit(): void {
    this.getUserDetails();
  }

  get nickname() {
    return this.profileEditForm.get('nickname')!;
  }

  get email() {
    return this.profileEditForm.get('email')!;
  }

  get password() {
    return this.passwordChangeForm.get('password')!;
  }

  get confirmPassword() {
    return this.passwordChangeForm.get('confirmPassword')!;
  }

  getUserDetails() {
    this.loading = true;
    this.errorMessage = null;

    this.profileService.getUserDetails().subscribe({
      next: response => {
        this.user = response;
        this.profileEditForm.patchValue({ email: response.email, nickname: response.nickname });
        this.loading = false;
      },
      error: () => {
        this.errorMessage = 'Nie udało się pobrać danych z serwera';
        this.loading = false;
      }
    });
  }

  enterEdit() {
    this.profileError = null;
    this.profileSaving = false;
    this.profileEditForm.markAsUntouched();
    this.profileEditing = true;

    this.nickname.enable();
    this.email.enable();
  }

  cancelProfileEdit() {
    this.profileError = null;
    this.profileSaving = false;

    if (this.user) {
      this.profileEditForm.patchValue({ email: this.user.email, nickname: this.user.nickname });
    }

    this.nickname.disable();
    this.email.disable();
    this.profileEditing = false;
  }

  saveProfile() {
    this.profileError = null;

    if (this.profileEditForm.invalid) {
      this.profileEditForm.markAllAsTouched();
      return;
    }

    this.profileSaving = true;

    this.profileService.updateUser(this.mapFormToUpdateUserRequest()).subscribe({
      next: () => {
        let userOldEmail = this.user!.email;
        let userNewEmail = this.email.value!;

        this.user!.email = userNewEmail;
        this.user!.nickname = this.nickname.value!;

        this.profileSaving = false;
        this.profileEditing = false;

        this.nickname.disable();
        this.email.disable();

        if (userOldEmail != userNewEmail) {
          this.toastr.success('Pomyślnie zapisano zmiany w profilu. Nastąpi wylogowanie. Zaloguj się ponownie');
          setTimeout(() => {
            this.logutService.logout();
          }, 3000);
        } else {
          this.toastr.success('Pomyślnie zapisano zmiany w profilu');
        }

      },
      error: (error: ApiErrorResponse) => {
        let status = error.status;

        this.profileSaving = false;

        if (error.errors && error.errors.length > 0) {
          this.mapErrorValidationMessages(error);
        } else {
          this.toastr.error(this.mapUpdateUserErrorMessage(status));
        }
      }
    });
  }

  togglePasswordChangeForm() {
    this.passwordChangeFormOpen = !this.passwordChangeFormOpen;
    this.passwordError = null;
    this.passwordChangeForm.reset();
  }

  changePassword() {
    this.passwordError = null;

    if (this.passwordChangeForm.invalid) {
      this.passwordChangeForm.markAllAsTouched();
      return;
    }

    this.passwordSaving = true;

    this.profileService.changeUserPassword(this.mapFormToPasswordChangeRequest()).subscribe({
      next: () => {
        this.passwordSaving = false;
        this.passwordChangeFormOpen = false;
        this.toastr.success('Hasło zostało zmienione');
        this.passwordChangeForm.reset();
      },
      error: (error: ApiErrorResponse) => {
        let status = error.status;

        this.passwordSaving = false;

        if (error.errors && error.errors.length > 0) {
          this.mapErrorValidationMessages(error);
        } else {
          this.toastr.error(this.mapPasswordChangeErrorMessage(status));
        }
      }
    });
  }

  private mapErrorValidationMessages(error: ApiErrorResponse) {
    if (!error.errors) return;

    error.errors.forEach(e => {
      const control = this.profileEditForm.get(e.field);
      if (control) {
        control.setErrors({ ...(control.errors || {}), backend: e.message });
      }
    });
  }

  private mapPasswordChangeErrorMessage(status: string): string {
    switch (status) {
      case 'E03004':
        return 'Hasła nie są takie same';
      case 'E03005':
        return 'Nowe hasło nie może być takie samo jak obecne';
      default:
        return 'Wystąpił nieoczekiwany błąd. Spróbuj ponownie.';
    }
  }

  private mapUpdateUserErrorMessage(status: string): string {
    switch (status) {
      case 'E03006':
        return 'Ten e-mail jest już zajęty';
      case 'E03007':
        return 'Ta nazwa użytkownika jest już zajęta';
      default:
        return 'Wystąpił nieoczekiwany błąd. Spróbuj ponownie.';
    }
  }

  private mapFormToUpdateUserRequest(): UpdateUserRequest {
    return {
      email: this.email?.value!,
      nickname: this.nickname?.value!
    }
  }

  private mapFormToPasswordChangeRequest(): PasswordChangeRequest {
    return {
      password: this.password?.value!,
      passwordRepeat: this.confirmPassword?.value!
    }
  }
}