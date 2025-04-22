import { Component, OnInit } from "@angular/core";
import { trigger, transition, style, animate } from "@angular/animations";
import { ReportService } from "../../core/services/report.service";
import { NotificationService } from "../../core/services/notification.service";
import { Report, Type } from "../../core/models/report.model";
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
    CommonModule,
    SidebarComponent,
    NavbarComponent
  ]
})
export class UserDashboardComponent implements OnInit {
  reports: Report[] = [];
  newReports: Report[] = [];
  isLoading = false;

  constructor(
    private reportService: ReportService,
    private notificationService: NotificationService,
  ) { }

  ngOnInit(): void {
    this.loadReports();
    this.checkNewReports();
  }

  loadReports(): void {
    this.isLoading = true;
    this.reportService.getAll().subscribe({
      next: (data) => {
        this.reports = data;
        this.isLoading = false;
      },
      error: (error) => {
        console.error("Error loading reports:", error);
        this.notificationService.showError("Erreur lors du chargement des comptes rendus");
        this.isLoading = false;
      },
    });
  }

  checkNewReports(): void {
    this.reportService.getNewReports().subscribe({
      next: (data) => {
        this.newReports = data;
        this.notificationService.updateNewItemsCount(data.length);

        if (data.length > 0) {
          this.notificationService.showInfo(`${data.length} nouveau(x) compte(s) rendu(s) disponible(s)`);
        }
      },
      error: (error) => {
        console.error("Error checking new reports:", error);
      }
    });
  }

  markAsRead(id: string): void {
    this.reportService.markAsRead(id).subscribe({
      next: () => {
        this.checkNewReports();
        this.loadReports();
      },
      error: (error) => {
        console.error("Error marking report as read:", error);
        this.notificationService.showError("Erreur lors du marquage comme lu");
      }
    });
  }

  downloadFile(report: Report): void {
    this.reportService.downloadFile(report.id!).subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `${report.title}.pdf`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);

        if (report.isNew) {
          this.markAsRead(report.id!);
        }
      },
      error: (error) => {
        console.error("Error downloading file:", error);
        this.notificationService.showError("Erreur lors du téléchargement du fichier");
      },
    });
  }
}