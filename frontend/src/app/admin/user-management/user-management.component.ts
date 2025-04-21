import { Component, OnInit } from "@angular/core";
import { Router } from "@angular/router";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { UserService } from "../../core/services/user.service";
import { NotificationService } from "../../core/services/notification.service";
import { User, Role } from "../../core/models/user.model";
import { trigger, transition, style, animate } from "@angular/animations";

@Component({
  selector: "app-user-management",
  templateUrl: "./user-management.component.html",
  styleUrls: ["./user-management.component.scss"],
  animations: [
    trigger("fadeIn", [transition(":enter", [style({ opacity: 0 }), animate("0.4s ease-out", style({ opacity: 1 }))])]),
  ],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule
  ]
})
export class UserManagementComponent implements OnInit {
  users: User[] = [];
  filteredUsers: User[] = [];
  searchTerm = "";

  constructor(
    private userService: UserService,
    private notificationService: NotificationService,
    private router: Router,
  ) {}

  ngOnInit(): void {
    this.loadUsers();
  }

  loadUsers(): void {
    this.userService.getAll().subscribe({
      next: (data) => {
        this.users = data;
        this.filteredUsers = [...this.users];
      },
      error: () => {
        this.notificationService.showError("Erreur lors du chargement des utilisateurs");
      },
    });
  }

  searchUsers(): void {
    if (!this.searchTerm.trim()) {
      this.filteredUsers = [...this.users];
      return;
    }

    const term = this.searchTerm.toLowerCase().trim();
    this.filteredUsers = this.users.filter(
      (user) => user.name.toLowerCase().includes(term) || user.email.toLowerCase().includes(term),
    );
  }

  addUser(): void {
    this.router.navigate(["/admin/users/add"]);
  }

  editUser(id: string): void {
    this.router.navigate(["/admin/users/edit", id]);
  }

  deleteUser(id: string): void {
    if (confirm("Êtes-vous sûr de vouloir supprimer cet utilisateur ?")) {
      this.userService.delete(id).subscribe({
        next: () => {
          this.notificationService.showSuccess("Utilisateur supprimé avec succès");
          this.loadUsers();
        },
        error: () => {
          this.notificationService.showError("Erreur lors de la suppression de l'utilisateur");
        },
      });
    }
  }

  getRoleBadgeClass(role: Role): string {
    return role === Role.ADMIN ? "badge-admin" : "badge-user";
  }
}