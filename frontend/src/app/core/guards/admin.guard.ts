import { Injectable } from "@angular/core"
import { CanActivate, Router, UrlTree } from "@angular/router"
import { Observable } from "rxjs"
import { AuthService } from "../services/auth.service"
import { NotificationService } from "../services/notification.service"

@Injectable({
  providedIn: "root",
})
export class AdminGuard implements CanActivate {
  constructor(
    private authService: AuthService,
    private router: Router,
    private notificationService: NotificationService,
  ) {}

  canActivate(): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
    if (this.authService.isAdmin()) {
      return true
    } else {
      this.notificationService.showError("Accès réservé aux administrateurs.")
      this.router.navigate(["/user"])
      return false
    }
  }
}