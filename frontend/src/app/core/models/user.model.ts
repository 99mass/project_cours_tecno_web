export enum Role {
  ADMIN = "ADMIN",
  USER = "USER",
}

export interface User {
  id?: string // UUID
  name: string
  email: string
  password?: string
  role: Role
  createdAt?: Date
  updatedAt?: Date
}

export interface PasswordChangeRequest {
  currentPassword: string
  newPassword: string
}

export interface UserCreationRequest {
  name: string
  email: string
  password: string
  role: Role
}

export interface UserUpdateRequest {
  name?: string
  email?: string
  password?: string
  role?: Role
}
