import { Component, type OnInit } from "@angular/core"
import { Router } from "@angular/router"
import { AuthService } from "../../core/services/auth.service"
import { UserService } from "../../core/services/user.service"
import { NotificationService } from "../../core/services/notification.service"
import { User } from "../../core/models/user.model"
import { trigger, transition, style, animate } from "@angular/animations"
import { NgIf } from "@angular/common"

@Component({
  selector: "app-navbar",
  templateUrl: "./navbar.component.html",
  styleUrls: ["./navbar.component.scss"],
  standalone: true,
  imports: [
    NgIf
  ],
  animations: [
    trigger("fadeIn", [
      transition(":enter", [
        style({ opacity: 0, transform: "translateY(-10px)" }),
        animate("0.3s ease-out", style({ opacity: 1, transform: "translateY(0)" })),
      ]),
    ]),
  ],
})
export class NavbarComponent implements OnInit {
  currentUser: User | null = null
  newItemsCount = 0
  isDropdownOpen = false

  constructor(
    private authService: AuthService,
    private userService: UserService,
    private router: Router,
    private notificationService: NotificationService,
  ) { }

  ngOnInit(): void {
    this.userService.currentUser$.subscribe((user) => {
      this.currentUser = user
    })

    this.notificationService.newItemsCount$.subscribe((count) => {
      this.newItemsCount = count
    })
  }

  logout(): void {
    this.authService.logout()
  }

  toggleDropdown(): void {
    this.isDropdownOpen = !this.isDropdownOpen
  }

  navigateToProfile(): void {
    const baseRoute = this.authService.isAdmin() ? "/admin" : "/user"
    this.router.navigate([`${baseRoute}/profile`])
    this.isDropdownOpen = false
  }
}