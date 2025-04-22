import { Component, OnInit } from "@angular/core";
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from "@angular/forms";
import { Router } from "@angular/router";
import { CommonModule } from "@angular/common";
import { AuthService } from "../../core/services/auth.service";
import { NotificationService } from "../../core/services/notification.service";
import { Role } from "../../core/models/user.model";
import { trigger, transition, style, animate } from "@angular/animations";

@Component({
  selector: "app-login",
  templateUrl: "./login.component.html",
  styleUrls: ["./login.component.scss"],
  animations: [
    trigger("fadeIn", [
      transition(":enter", [
        style({ opacity: 0, transform: "translateY(-20px)" }),
        animate("0.4s ease-out", style({ opacity: 1, transform: "translateY(0)" })),
      ]),
    ]),
  ],
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule
  ]
})
export class LoginComponent implements OnInit {
  loginForm!: FormGroup;
  isSubmitting = false;
  errorMessage: string = '';

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private notificationService: NotificationService,
  ) { }

  ngOnInit(): void {
    if (this.authService.isLoggedIn()) {
      this.redirectBasedOnRole();
    }

    this.loginForm = this.fb.group({
      email: ["", [Validators.required, Validators.email]],
      password: ["", [Validators.required, Validators.minLength(6)]],
    });
  }

  onSubmit(): void {
    if (this.loginForm.invalid || this.isSubmitting) {
      return;
    }

    this.isSubmitting = true;
    this.errorMessage = ''; // Reset error message
    const { email, password } = this.loginForm.value;

    this.authService.login(email, password).subscribe({
      next: (authResponse) => {
        localStorage.setItem("token", authResponse.token)
        localStorage.setItem("userRole", authResponse.role)

        const expirationDate = new Date(new Date().getTime() + 24 * 60 * 60 * 1000)
        localStorage.setItem("tokenExpiration", expirationDate.toISOString())

        if (this.authService.isAdmin()) {
          this.router.navigate(["/admin"]);
        } else {
          this.router.navigate(["/user"]);
          
        }
      },
      error: (error) => {
        this.isSubmitting = false;
        // Afficher le message d'erreur retourné par l'API 
        if (error.error && error.error.message) {
          this.errorMessage = error.error.message;
        } else {
          this.errorMessage = "Échec de connexion. Veuillez vérifier vos identifiants.";
        }
        this.notificationService.showError(this.errorMessage);
      }
    })

  }

  private redirectBasedOnRole(): void {
    const role = this.authService.getCurrentUserRole();
    if (role === Role.ADMIN) {
      this.router.navigate(["/admin"]);
    } else {
      this.router.navigate(["/user"]);
    }
  }
}