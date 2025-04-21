import type { Role } from "./user.model"

export interface AuthRequest {
  email: string
  password: string
}

export interface AuthResponse {
  token: string
  role: Role
}
