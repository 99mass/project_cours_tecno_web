import { Component, OnInit } from "@angular/core";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { UserService } from "../../core/services/user.service";
import { NotificationService } from "../../core/services/notification.service";
import { User } from "../../core/models/user.model";
import { trigger, transition, style, animate } from "@angular/animations";
import { NgIf, DatePipe } from "@angular/common";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";

@Component({
  selector: "app-profile",
  templateUrl: "./profile.component.html",
  styleUrls: ["./profile.component.scss"],
  animations: [
    trigger("fadeIn", [transition(":enter", [style({ opacity: 0 }), animate("0.4s ease-out", style({ opacity: 1 }))])]),
  ],
  standalone: true,
  imports: [
    NgIf,
    DatePipe,
    FormsModule,
    ReactiveFormsModule
  ]
})
export class ProfileComponent implements OnInit {
  profileForm!: FormGroup;
  passwordForm!: FormGroup;
  currentUser: User | null = null;
  isSubmittingProfile = false;
  isSubmittingPassword = false;
  showPasswordForm = false;

  constructor(
    private fb: FormBuilder,
    private userService: UserService,
    private notificationService: NotificationService,
  ) {}

  ngOnInit(): void {
    this.initForms();
    this.loadUserProfile();
  }

  initForms(): void {
    this.profileForm = this.fb.group({
      name: ["", [Validators.required, Validators.minLength(3)]],
      email: ["", [Validators.required, Validators.email]],
    });

    this.passwordForm = this.fb.group(
      {
        currentPassword: ["", [Validators.required, Validators.minLength(6)]],
        newPassword: ["", [Validators.required, Validators.minLength(6)]],
        confirmPassword: ["", [Validators.required]],
      },
      { validator: this.passwordMatchValidator },
    );
  }

  passwordMatchValidator(g: FormGroup): { [key: string]: boolean } | null {
    const newPassword = g.get("newPassword")?.value;
    const confirmPassword = g.get("confirmPassword")?.value;
    return newPassword === confirmPassword ? null : { mismatch: true };
  }

  loadUserProfile(): void {
    this.userService.getCurrentUser().subscribe({
      next: (user) => {
        this.currentUser = user;
        this.profileForm.patchValue({
          name: user.name,
          email: user.email,
        });
      },
      error: () => {
        this.notificationService.showError("Erreur lors du chargement du profil");
      },
    });
  }

  onSubmitProfile(): void {
    if (this.profileForm.invalid || this.isSubmittingProfile) {
      return;
    }

    this.isSubmittingProfile = true;
    const formValue = this.profileForm.value;

    if (this.currentUser) {
      this.userService
        .updateCurrentUser(this.currentUser.id!, {
          name: formValue.name,
          email: formValue.email,
        })
        .subscribe({
          next: (updatedUser) => {
            this.notificationService.showSuccess("Profil mis à jour avec succès");
            this.isSubmittingProfile = false;
          },
          error: () => {
            this.notificationService.showError("Erreur lors de la mise à jour du profil");
            this.isSubmittingProfile = false;
          },
        });
    }
  }

  onSubmitPassword(): void {
    if (this.passwordForm.invalid || this.isSubmittingPassword) {
      return;
    }

    this.isSubmittingPassword = true;
    const { currentPassword, newPassword } = this.passwordForm.value;

    this.userService
      .changePassword({
        currentPassword,
        newPassword,
      })
      .subscribe({
        next: () => {
          this.notificationService.showSuccess("Mot de passe changé avec succès");
          this.passwordForm.reset();
          this.showPasswordForm = false;
          this.isSubmittingPassword = false;
        },
        error: () => {
          this.notificationService.showError("Erreur lors du changement de mot de passe");
          this.isSubmittingPassword = false;
        },
      });
  }

  togglePasswordForm(): void {
    this.showPasswordForm = !this.showPasswordForm;
    if (!this.showPasswordForm) {
      this.passwordForm.reset();
    }
  }
}