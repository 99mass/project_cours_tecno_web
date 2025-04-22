import { Component, OnInit } from "@angular/core";
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from "@angular/forms";
import { ActivatedRoute, Router, RouterModule } from "@angular/router";
import { CommonModule } from "@angular/common";
import { UserService } from "../../core/services/user.service";
import { NotificationService } from "../../core/services/notification.service";
import { Role, UserCreationRequest, UserUpdateRequest } from "../../core/models/user.model";
import { trigger, transition, style, animate } from "@angular/animations";

@Component({
  selector: "app-user-form",
  templateUrl: "./user-form.component.html",
  styleUrls: ["./user-form.component.scss"],
  animations: [
    trigger("fadeIn", [transition(":enter", [style({ opacity: 0 }), animate("0.4s ease-out", style({ opacity: 1 }))])]),
  ],
  standalone: true,
  imports: [
    CommonModule,          // Pour *ngIf, *ngFor
    ReactiveFormsModule,   // Pour FormGroup, formControlName, etc.
    RouterModule,          // Pour routerLink
  ]
})
export class UserFormComponent implements OnInit {
  userForm!: FormGroup;
  userRoles = Object.values(Role);
  isEditMode = false;
  userId?: string;
  isSubmitting = false;

  constructor(
    private fb: FormBuilder,
    private userService: UserService,
    private notificationService: NotificationService,
    private route: ActivatedRoute,
    private router: Router,
  ) {}

  ngOnInit(): void {
    this.route.params.subscribe((params) => {
      if (params["id"]) {
        this.isEditMode = true;
        this.userId = params["id"];
        this.initForm(); 
        if (this.userId) {
          this.loadUser(this.userId);
        }
      } else {
        this.initForm();
      }
    });
  }

  initForm(): void {
    this.userForm = this.fb.group({
      name: ["", [Validators.required, Validators.minLength(3)]],
      email: ["", [Validators.required, Validators.email]],
      password: ["", this.isEditMode ? [] : [Validators.required, Validators.minLength(6)]],
      role: [Role.USER, Validators.required],
    });

    if (this.isEditMode) {
      this.userForm.get("password")?.clearValidators();
      this.userForm.get("password")?.updateValueAndValidity();
    }
  }

  loadUser(id: string): void {
    this.userService.getById(id).subscribe({
      next: (user) => {
        this.userForm.patchValue({
          name: user.name,
          email: user.email,
          role: user.role,
        });
      },
      error: () => {
        this.notificationService.showError("Erreur lors du chargement des informations de l'utilisateur");
      },
    });
  }

  onSubmit(): void {
    if (this.userForm.invalid) {
      this.userForm.markAllAsTouched();
      return;
    }

    this.isSubmitting = true;
    const formValue = this.userForm.value;

    if (this.isEditMode && this.userId) {
      const updateRequest: UserUpdateRequest = {
        name: formValue.name,
        email: formValue.email,
        role: formValue.role,
      };

      // Only include password if provided
      if (formValue.password) {
        updateRequest.password = formValue.password;
      }

      this.userService.update(this.userId, updateRequest).subscribe({
        next: () => {
          this.notificationService.showSuccess("Utilisateur mis à jour avec succès");
          this.router.navigate(["/admin/users"]);
          this.isSubmitting = false;
        },
        error: () => {
          this.notificationService.showError("Erreur lors de la mise à jour de l'utilisateur");
          this.isSubmitting = false;
        },
      });
    } else {
      const createRequest: UserCreationRequest = {
        name: formValue.name,
        email: formValue.email,
        password: formValue.password,
        role: formValue.role,
      };

      this.userService.create(createRequest).subscribe({
        next: () => {
          this.notificationService.showSuccess("Utilisateur créé avec succès");
          this.router.navigate(["/admin/users"]);
          this.isSubmitting = false;
        },
        error: () => {
          this.notificationService.showError("Erreur lors de la création de l'utilisateur");
          this.isSubmitting = false;
        },
      });
    }
  }
}