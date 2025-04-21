import { Injectable } from "@angular/core"
import { HttpClient } from "@angular/common/http"
import { Observable, BehaviorSubject } from "rxjs"
import { tap } from "rxjs/operators"
import { User, UserCreationRequest, UserUpdateRequest, PasswordChangeRequest } from "../models/user.model"
import { environment } from "../../../environments/environment"
import { AuthService } from "./auth.service"

@Injectable({
  providedIn: "root",
})
export class UserService {
  private apiUrl = `${environment.apiUrl}/users`
  private currentUserSubject = new BehaviorSubject<User | null>(null)
  public currentUser$ = this.currentUserSubject.asObservable()

  constructor(
    private http: HttpClient,
    private authService: AuthService,
  ) {
    // Load current user data when service is initialized
    if (this.authService.isLoggedIn()) {
      this.loadCurrentUser()
    }

    // Subscribe to auth changes to reload user data when needed
    this.authService.currentUser$.subscribe((authUser) => {
      if (authUser && this.authService.isLoggedIn()) {
        this.loadCurrentUser()
      } else if (!authUser) {
        this.currentUserSubject.next(null)
      }
    })
  }

  getAll(): Observable<User[]> {
    return this.http.get<User[]>(this.apiUrl)
  }

  getById(id: string): Observable<User> {
    return this.http.get<User>(`${this.apiUrl}/${id}`)
  }

  getCurrentUser(): Observable<User> {
    return this.http.get<User>(`${this.apiUrl}/me`).pipe(
      tap((user) => {
        this.currentUserSubject.next(user)
      }),
    )
  }

  create(user: UserCreationRequest): Observable<User> {
    return this.http.post<User>(this.apiUrl, user)
  }

  update(id: string, user: UserUpdateRequest): Observable<User> {
    return this.http.put<User>(`${this.apiUrl}/${id}`, user)
  }

  updateCurrentUser(id: string, user: UserUpdateRequest): Observable<User> {
    return this.http.put<User>(`${this.apiUrl}/me/${id}`, user).pipe(
      tap((updatedUser) => {
        this.currentUserSubject.next(updatedUser)
      }),
    )
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`)
  }

  changePassword(request: PasswordChangeRequest): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/me/password`, request)
  }

  private loadCurrentUser(): void {
    this.getCurrentUser().subscribe({
      error: () => {
        // If we can't load the user, log out
        this.authService.logout()
      },
    })
  }
}