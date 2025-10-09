export interface UserDetailsResponse {
  email: string;
  nickname: string;
}

export interface UpdateUserRequest {
  email: string;
  nickname: string;
}

export interface PasswordChangeRequest {
  password: string,
  passwordRepeat: string
}