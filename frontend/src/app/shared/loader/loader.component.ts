import { Component } from "@angular/core"
import { trigger, style, animate, transition } from "@angular/animations"

@Component({
  selector: "app-loader",
  template: `
    <div class="loader-overlay" @fadeIn>
      <div class="loader">
        <div class="spinner"></div>
        <p>Chargement...</p>
      </div>
    </div>
  `,
  styles: [
    `
    .loader-overlay {
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background-color: rgba(0, 0, 0, 0.5);
      display: flex;
      justify-content: center;
      align-items: center;
      z-index: 9999;
    }
    
    .loader {
      background-color: white;
      padding: 30px;
      border-radius: 8px;
      box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2);
      display: flex;
      flex-direction: column;
      align-items: center;
    }
    
    .spinner {
      width: 40px;
      height: 40px;
      border: 4px solid #f3f3f3;
      border-top: 4px solid #3498db;
      border-radius: 50%;
      animation: spin 1s linear infinite;
    }
    
    p {
      margin-top: 15px;
      color: #333;
      font-weight: 500;
    }
    
    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
  `,
  ],
  animations: [
    trigger("fadeIn", [
      transition(":enter", [style({ opacity: 0 }), animate("0.2s ease-in", style({ opacity: 1 }))]),
      transition(":leave", [animate("0.2s ease-out", style({ opacity: 0 }))]),
    ]),
  ],
})
export class LoaderComponent {}
