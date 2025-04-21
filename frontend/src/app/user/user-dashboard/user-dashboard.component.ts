import { Component, OnInit } from "@angular/core";
import { trigger, transition, style, animate } from "@angular/animations";
import { CompteRenduService } from "../../core/services/compte-rendu.service";
import { NotificationService } from "../../core/services/notification.service";
import { CompteRendu } from "../../core/models/compte-rendu.model";
import { RouterOutlet } from "@angular/router";
import { NavbarComponent } from "../../shared/navbar/navbar.component";
import { SidebarComponent } from "../../shared/sidebar/sidebar.component";
import { CommonModule } from "@angular/common";

@Component({
  selector: "app-user-dashboard",
  templateUrl: "./user-dashboard.component.html",
  styleUrls: ["./user-dashboard.component.scss"],
  animations: [
    trigger("fadeIn", [transition(":enter", [style({ opacity: 0 }), animate("0.4s ease-out", style({ opacity: 1 }))])]),
  ],
  standalone: true,
  imports: [
    RouterOutlet,
    // Ajoutez les composants importés ci-dessus
    CommonModule,
    SidebarComponent,
    NavbarComponent
  ]
})
export class UserDashboardComponent implements OnInit {
  comptesRendus: CompteRendu[] = [];
  newComptesRendus: CompteRendu[] = [];
  isLoading = false;

  constructor(
    private compteRenduService: CompteRenduService,
    private notificationService: NotificationService,
  ) { }

  ngOnInit(): void {
    this.loadComptesRendus();
    this.checkNewComptesRendus();
  }

  loadComptesRendus(): void {
    this.isLoading = true;
    this.compteRenduService.getAll().subscribe({
      next: (data) => {
        this.comptesRendus = data;
        this.isLoading = false;
      },
      error: (error) => {
        this.notificationService.showError("Erreur lors du chargement des comptes rendus");
        this.isLoading = false;
      },
    });
  }

  checkNewComptesRendus(): void {
    this.compteRenduService.getByType("NOUVEAU" as any).subscribe({
      next: (data) => {
        this.newComptesRendus = data;
        this.notificationService.updateNewItemsCount(data.length);

        if (data.length > 0) {
          this.notificationService.showInfo(`${data.length} nouveau(x) compte(s) rendu(s) disponible(s)`);
        }
      },
    });
  }

  markAsRead(id: number): void {
    this.compteRenduService.markAsRead(id).subscribe({
      next: () => {
        this.checkNewComptesRendus();
        this.loadComptesRendus();
      },
    });
  }

  downloadFile(compteRendu: CompteRendu): void {
    this.compteRenduService.downloadFile(compteRendu.cheminFichier).subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `${compteRendu.titre}.pdf`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);

        if (compteRendu.isNouveau) {
          this.markAsRead(compteRendu.id!);
        }
      },
      error: () => {
        this.notificationService.showError("Erreur lors du téléchargement du fichier");
      },
    });
  }
}