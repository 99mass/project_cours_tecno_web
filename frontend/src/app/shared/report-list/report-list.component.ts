import { Component, OnInit } from "@angular/core";
import { ReportService } from "../../core/services/report.service";
import { NotificationService } from "../../core/services/notification.service";
import { Report, Type } from "../../core/models/report.model";
import { trigger, transition, style, animate } from "@angular/animations";
import { NgIf, NgFor, DatePipe } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { Router } from "@angular/router";

@Component({
  selector: "app-report-list",
  templateUrl: "./report-list.component.html",
  styleUrls: ["./report-list.component.scss"],
  animations: [
    trigger("fadeIn", [transition(":enter", [style({ opacity: 0 }), animate("0.4s ease-out", style({ opacity: 1 }))])]),
  ],
  standalone: true,
  imports: [
    NgIf,
    NgFor,
    DatePipe,
    FormsModule
  ]
})
export class ReportListComponent implements OnInit {
  reports: Report[] = [];
  filteredReports: Report[] = [];
  newReports: Report[] = [];
  isLoading = false;
  searchTerm = "";
  selectedType: Type | null = null;
  reportTypes = Object.values(Type);


  constructor(
    private reportService: ReportService,
    private notificationService: NotificationService,
    private router: Router,
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
        this.applyFilters();
        this.isLoading = false;
      },
      error: () => {
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
    });
  }

  applyFilters(): void {
    let filtered = [...this.reports];

    // Apply type filter
    if (this.selectedType) {
      filtered = filtered.filter((report) => report.type === this.selectedType);
    }

    // Apply search filter
    if (this.searchTerm.trim()) {
      const term = this.searchTerm.toLowerCase().trim();
      filtered = filtered.filter(
        (report) => report.title.toLowerCase().includes(term) || report.description.toLowerCase().includes(term),
      );
    }

    this.filteredReports = filtered;
  }

  filterByType(type: Type | null): void {
    this.selectedType = type;
    this.applyFilters();
  }

  search(): void {
    this.applyFilters();
  }

  markAsRead(id: string): void {
    this.reportService.markAsRead(id).subscribe({
      next: () => {
        this.checkNewReports();
        this.loadReports();
      },
    });
  }

  viewReport(report: Report, event: Event): void {
    event.stopPropagation();
    this.router.navigate(['/reports/view', report.id]);

    if (report.isNew) {
      this.markAsRead(report.id!);
    }
  }


  downloadFile(report: Report, event?: Event): void {
    if (event) {
      event.stopPropagation();
    }

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
      error: () => {
        this.notificationService.showError("Erreur lors du téléchargement du fichier");
      },
    });
  }

  isReportNew(id: string): boolean {
    return this.newReports.some((report) => report.id === id);
  }
}