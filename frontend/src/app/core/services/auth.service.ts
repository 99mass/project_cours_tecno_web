import { Injectable } from "@angular/core"
import { HttpClient } from "@angular/common/http"
import { BehaviorSubject, Observable, throwError } from "rxjs"
import { catchError, tap } from "rxjs/operators"
import { User, Role } from "../models/user.model"
import { AuthRequest, AuthResponse } from "../models/auth.model"
import { environment } from "../../../environments/environment"
import { Router } from "@angular/router"

@Injectable({
  providedIn: "root",
})
export class AuthService {
  private apiUrl = `${environment.apiUrl}/auth`
  private currentUserSubject = new BehaviorSubject<User | null>(null)
  public currentUser$ = this.currentUserSubject.asObservable()
  private tokenExpirationTimer: any

  constructor(
    private http: HttpClient,
    private router: Router,
  ) {
    this.loadUserFromStorage()
  }

  login(email: string, password: string): Observable<AuthResponse> {
    const authRequest: AuthRequest = { email, password }
    return this.http.post<AuthResponse>(`${this.apiUrl}/login`, authRequest).pipe(
      tap((response) => {
        this.setAuthData(response)
      }),
      catchError((error) => {
        console.error("Login error:", error)
        return throwError(() => new Error("Échec de connexion. Veuillez vérifier vos identifiants."))
      }),
    )
  }

  logout(): void {
    localStorage.removeItem("token")
    localStorage.removeItem("tokenExpiration")
    localStorage.removeItem("userRole")
    this.currentUserSubject.next(null)
    this.router.navigate(["/login"])

    if (this.tokenExpirationTimer) {
      clearTimeout(this.tokenExpirationTimer)
    }
    this.tokenExpirationTimer = null
  }

  isLoggedIn(): boolean {
    return !!this.getToken() && !this.isTokenExpired()
  }

  getToken(): string | null {
    // Check if we're running in a browser environment
    if (typeof window !== 'undefined' && window.localStorage) {
      return localStorage.getItem('token');
    }
    return null;
  }

  getCurrentUserRole(): Role | null {
    const roleStr = localStorage.getItem("userRole")
    return roleStr ? (roleStr as Role) : null
  }

  isAdmin(): boolean {
    return this.getCurrentUserRole() === Role.ADMIN
  }

  private setAuthData(authResponse: AuthResponse): void {
    console.log("Setting auth data:", authResponse);
    
    // Store token
    localStorage.setItem("token", authResponse.token)

    // Store role
    localStorage.setItem("userRole", authResponse.role)

    // Set token expiration (assuming JWT expires in 24 hours)
    const expirationDate = new Date(new Date().getTime() + 24 * 60 * 60 * 1000)
    localStorage.setItem("tokenExpiration", expirationDate.toISOString())

    // Auto logout when token expires
    this.autoLogout(24 * 60 * 60 * 1000)

    // Create a minimal user object from auth response
    const user: User = {
      name: "", // Will be populated later from user service
      email: "", // Will be populated later from user service
      role: authResponse.role,
    }

    this.currentUserSubject.next(user)
  }

  private isTokenExpired(): boolean {
    const expirationDate = localStorage.getItem("tokenExpiration")
    if (!expirationDate) {
      return true
    }
    return new Date(expirationDate) <= new Date()
  }

  private autoLogout(expirationDuration: number): void {
    this.tokenExpirationTimer = setTimeout(() => {
      this.logout()
    }, expirationDuration)
  }

  private loadUserFromStorage(): void {
    if (typeof window !== 'undefined' && window.localStorage) {
      const token = this.getToken()
      const role = this.getCurrentUserRole()

      if (token && role && !this.isTokenExpired()) {
        // Create a minimal user object
        const user: User = {
          name: "", // Will be populated later from user service
          email: "", // Will be populated later from user service
          role: role,
        }

        this.currentUserSubject.next(user)

        // Calculate remaining time until token expiration
        const expirationDate = localStorage.getItem("tokenExpiration")
        if (expirationDate) {
          const expirationTime = new Date(expirationDate).getTime()
          const now = new Date().getTime()
          const expirationDuration = expirationTime - now

          if (expirationDuration > 0) {
            this.autoLogout(expirationDuration)
          } else {
            this.logout()
          }
        }
      }
    }
  }
}