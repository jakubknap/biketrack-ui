import { Validators } from '@angular/forms';

export const nicknameValidators = [
  Validators.required,
  Validators.minLength(3),
  Validators.maxLength(30),
  Validators.pattern(/^[A-Za-z0-9._-]+$/)
];

export const emailValidators = [
  Validators.required,
  Validators.email,
  Validators.maxLength(128)
];

export const passwordValidators = [
  Validators.required,
  Validators.minLength(8),
  Validators.maxLength(100),
  Validators.pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@#^()$!%*?&.\-_])[A-Za-z\d@$!#^()%*?&.\-_]{8,}$/)
];

export const safeTextValidator = Validators.pattern(/^[\p{L}\p{N} .,!?:;'"()@&%\-_]+$/u);