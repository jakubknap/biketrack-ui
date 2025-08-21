export interface ResetPasswordRequest {
  email: string;
}

export interface ResetPasswordConfirmRequest {
  token: string,
  password: string,
  passwordRepeat: string
}
