import { Injectable } from "@angular/core"
import { HttpRequest, HttpHandler, HttpEvent, HttpInterceptor, HttpErrorResponse } from "@angular/common/http"
import { Observable, throwError } from "rxjs"
import { catchError } from "rxjs/operators"
import { Router } from "@angular/router"
import { AuthService } from "../services/auth.service"
import { NotificationService } from "../services/notification.service"

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  constructor(
    private authService: AuthService,
    private router: Router,
    private notificationService: NotificationService,
  ) {}

  intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    const token = this.authService.getToken()

    if (token) {
      request = request.clone({
        setHeaders: {
          Authorization: `Bearer ${token}`,
        },
      })
    }

    return next.handle(request).pipe(
      catchError((error: HttpErrorResponse) => {
        if (error.status === 401) {
          this.notificationService.showError("Votre session a expiré. Veuillez vous reconnecter.")
          this.authService.logout()
          this.router.navigate(["/login"])
        } else if (error.status === 403) {
          this.notificationService.showError("Vous n'avez pas les droits nécessaires pour cette action.")
        } else if (error.status === 500) {
          this.notificationService.showError("Une erreur serveur est survenue. Veuillez réessayer plus tard.")
        } else if (error.status === 404) {
          this.notificationService.showError("La ressource demandée n'existe pas.")
        } else {
          this.notificationService.showError("Une erreur est survenue. Veuillez réessayer.")
        }

        return throwError(() => error)
      }),
    )
  }
}