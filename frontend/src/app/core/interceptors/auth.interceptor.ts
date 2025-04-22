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
  ) { }
  intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    // Ne pas ajouter de token pour les requêtes de login ou les assets
    if (request.url.includes('/login') || request.url.includes('/assets/')) {
      return next.handle(request);
    }

    const token = this.authService.getToken();

    // Si nous n'avons pas de token, ne pas ajouter d'en-tête d'autorisation
    if (!token) {
      return next.handle(request).pipe(
        catchError((error: HttpErrorResponse) => this.handleError(error))
      );
    }

    // Ajouter le token si disponible
    const authReq = request.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`,
      },
    });

    return next.handle(authReq).pipe(
      catchError((error: HttpErrorResponse) => this.handleError(error))
    );
  }

  private handleError(error: HttpErrorResponse): Observable<never> {
    if (error.status === 401) {
      // Nettoyer toutes les données d'authentification
      this.authService.logout();
      this.notificationService.showError("Votre session a expiré. Veuillez vous reconnecter.");
    } else if (error.status === 403) {
      this.notificationService.showError("Vous n'avez pas les droits nécessaires pour cette action.");
    } else if (error.status === 404) {
      this.notificationService.showError("La ressource demandée n'existe pas.");
    }
    //  else if (error.status === 500) {
    //   this.notificationService.showError("Une erreur serveur est survenue. Veuillez réessayer plus tard.");
    // } 
    // else {
    //   this.notificationService.showError("Une erreur est survenue. Veuillez réessayer.");
    // }

    return throwError(() => error);
  }
}