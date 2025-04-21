import { Injectable } from "@angular/core"
import { CanActivate, Router, UrlTree } from "@angular/router"
import { Observable } from "rxjs"
import { AuthService } from "../services/auth.service"
import { NotificationService } from "../services/notification.service"

@Injectable({
  providedIn: "root",
})
export class AuthGuard implements CanActivate {
  constructor(
    private authService: AuthService,
    private router: Router,
    private notificationService: NotificationService,
  ) {}

  canActivate(): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
    if (this.authService.isLoggedIn()) {
      return true
    } else {
      this.notificationService.showWarning("Veuillez vous connecter pour accéder à cette page.")
      this.router.navigate(["/login"])
      return false
    }
  }
}