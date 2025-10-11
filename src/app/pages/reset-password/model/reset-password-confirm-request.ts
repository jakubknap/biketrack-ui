export interface ResetPasswordConfirmRequest {
  token: string,
  password: string,
  passwordRepeat: string
}