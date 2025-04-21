import { Component, type OnInit } from "@angular/core"
import { trigger, transition, style, animate } from "@angular/animations"
import { RouterModule } from "@angular/router"
import { SidebarComponent } from "../../shared/sidebar/sidebar.component"
import { NavbarComponent } from "../../shared/navbar/navbar.component"
@Component({
  selector: "app-admin-dashboard",
  templateUrl: "./admin-dashboard.component.html",
  styleUrls: ["./admin-dashboard.component.scss"],
  standalone: true,
  imports: [
    RouterModule,
    SidebarComponent,
    NavbarComponent
  ],
  animations: [
    trigger("fadeIn", [transition(":enter", [style({ opacity: 0 }), animate("0.4s ease-out", style({ opacity: 1 }))])]),
  ],
})
export class AdminDashboardComponent implements OnInit {
  constructor() {}

  ngOnInit(): void {}
}