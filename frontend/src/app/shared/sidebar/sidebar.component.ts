import { Component, type OnInit } from "@angular/core"
import { Router, NavigationEnd, RouterModule } from "@angular/router"
import { filter } from "rxjs/operators"
import { AuthService } from "../../core/services/auth.service"
import { trigger, transition, style, animate } from "@angular/animations"
import { NgIf, NgClass } from "@angular/common"

@Component({
  selector: "app-sidebar",
  templateUrl: "./sidebar.component.html",
  styleUrls: ["./sidebar.component.scss"],
  standalone: true,
  imports: [
    NgIf,
    RouterModule
  ],
  animations: [
    trigger("slideIn", [
      transition(":enter", [
        style({ transform: "translateX(-100%)" }),
        animate("0.3s ease-out", style({ transform: "translateX(0)" })),
      ]),
    ]),
  ],
})
export class SidebarComponent implements OnInit {
  isAdmin = false
  activeRoute = ""
  isMobileMenuOpen = false

  constructor(
    private authService: AuthService,
    private router: Router,
  ) {}

  ngOnInit(): void {
    this.isAdmin = this.authService.isAdmin()

    this.router.events.pipe(filter((event) => event instanceof NavigationEnd)).subscribe((event: any) => {
      this.activeRoute = event.url
    })
  }

  toggleMobileMenu(): void {
    this.isMobileMenuOpen = !this.isMobileMenuOpen
  }
}