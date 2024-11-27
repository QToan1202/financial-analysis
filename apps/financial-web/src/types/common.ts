export type SignInForm = {
  account: string
  password: string
}

export type SignUpForm = {
  firstName: string
  lastName: string
  email: string
  phone: string
  password: string
  confirmPassword: string
}

export interface Token {
  accessToken: string
  refreshToken: string
}
