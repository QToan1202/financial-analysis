export interface IUser {
  _id: string
  firstName: string
  lastName: string
  email: string
  phone?: string
  password?: string
  avatar?: string
  verify?: boolean
  status: 'activate' | 'deactivate'
}
