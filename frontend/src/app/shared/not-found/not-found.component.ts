import { Component } from "@angular/core"
import { Router } from "@angular/router"
import { trigger, transition, style, animate } from "@angular/animations"

@Component({
  selector: "app-not-found",
  template: `
    <div class="not-found-container" @fadeIn>
      <div class="not-found-content">
        <div class="error-code">404</div>
        <h1>Page non trouvée</h1>
        <p>La page que vous recherchez n'existe pas ou a été déplacée.</p>
        <button class="btn btn-primary" (click)="goBack()">Retour à l'accueil</button>
      </div>
    </div>
  `,
  styles: [
    `
    .not-found-container {
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 100vh;
      background-color: #f5f7fa;
      padding: 20px;
    }
    
    .not-found-content {
      text-align: center;
      max-width: 500px;
    }
    
    .error-code {
      font-size: 120px;
      font-weight: 700;
      color: #3498db;
      line-height: 1;
      margin-bottom: 20px;
    }
    
    h1 {
      font-size: 28px;
      color: #333;
      margin-bottom: 15px;
    }
    
    p {
      color: #666;
      margin-bottom: 30px;
    }
    
    .btn {
      padding: 10px 20px;
      background-color: #3498db;
      color: white;
      border: none;
      border-radius: 5px;
      font-size: 16px;
      cursor: pointer;
      transition: background-color 0.2s;
    }
    
    .btn:hover {
      background-color: #2980b9;
    }
  `,
  ],
  animations: [
    trigger("fadeIn", [transition(":enter", [style({ opacity: 0 }), animate("0.4s ease-out", style({ opacity: 1 }))])]),
  ],
})
export class NotFoundComponent {
  constructor(private router: Router) {}

  goBack(): void {
    this.router.navigate(["/"])
  }
}