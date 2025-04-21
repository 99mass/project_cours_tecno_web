import { Component } from "@angular/core";
import { RouterOutlet } from "@angular/router";
import { CommonModule } from "@angular/common";
import { LoaderService } from "./core/services/loader.service";
import { LoaderComponent } from "./shared/loader/loader.component";

@Component({
  selector: "app-root",
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    LoaderComponent
  ],
  template: `
    <div class="app-container">
      <router-outlet></router-outlet>
      <app-loader *ngIf="isLoading"></app-loader>
    </div>
  `,
  // styles: [
  //   `
  //   .app-container {
  //     min-height: 100vh;
  //     position: relative;
  //   }
  // `,
  // ],
})
export class AppComponent {
  constructor(private loaderService: LoaderService) {}

  get isLoading(): boolean {
    return this.loaderService.isLoading;
  }
}