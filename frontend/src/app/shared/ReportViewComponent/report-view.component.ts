import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ReportService } from '../../core/services/report.service';
import { NotificationService } from '../../core/services/notification.service';
import { Report } from '../../core/models/report.model';
import { switchMap, tap, catchError } from 'rxjs/operators';
import { of } from 'rxjs';
import { trigger, transition, style, animate } from '@angular/animations';
import { NgIf, DatePipe } from '@angular/common';
import { SafeResourceUrl, DomSanitizer } from '@angular/platform-browser';

@Component({
    selector: 'app-report-view',
    templateUrl: './report-view.component.html',
    styleUrls: ['./report-view.component.scss'],
    animations: [
        trigger('fadeIn', [
            transition(':enter', [
                style({ opacity: 0 }),
                animate('0.4s ease-out', style({ opacity: 1 }))
            ])
        ])
    ],
    standalone: true,
    imports: [NgIf, DatePipe]
})
export class ReportViewComponent implements OnInit {
    report?: Report;
    isLoading = true;
    pdfUrl?: SafeResourceUrl;
    error?: string;

    constructor(
        private route: ActivatedRoute,
        private router: Router,
        private reportService: ReportService,
        private notificationService: NotificationService,
        private sanitizer: DomSanitizer
    ) { }

    ngOnInit(): void {
        const id = this.route.snapshot.paramMap.get('id');

        if (!id) {
            this.error = 'Identifiant de rapport non trouvé';
            this.isLoading = false;
            return;
        }

        this.loadReport(id);
    }

    loadReport(id: string): void {
        this.reportService.getById(id).pipe(
            tap(report => {
                this.report = report;
                // Si le rapport est nouveau, le marquer comme lu
                if (report.isNew) {
                    this.reportService.markAsRead(id).subscribe();
                }
            }),
            switchMap(report => this.reportService.downloadFile(id).pipe(
                tap(blob => {
                    // Créer une URL pour le blob
                    const blobUrl = URL.createObjectURL(blob);
                    // Sécuriser l'URL pour l'utiliser dans le template
                    this.pdfUrl = this.sanitizer.bypassSecurityTrustResourceUrl(blobUrl);
                })
            )),
            catchError(err => {
                console.error('Erreur lors du chargement du rapport', err);
                this.error = 'Impossible de charger le rapport';
                this.notificationService.showError('Erreur lors du chargement du rapport');
                return of(null);
            })
        ).subscribe({
            next: () => {
                this.isLoading = false;
            },
            error: () => {
                this.isLoading = false;
            }
        });
    }

    downloadFile(): void {
        if (!this.report?.id) return;

        this.reportService.downloadFile(this.report.id).subscribe({
            next: (blob) => {
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `${this.report?.title || 'rapport'}.pdf`;
                document.body.appendChild(a);
                a.click();
                URL.revokeObjectURL(url);
                document.body.removeChild(a);
            },
            error: () => {
                this.notificationService.showError('Erreur lors du téléchargement du fichier');
            }
        });
    }

    goBack(): void {
        this.router.navigate(['/']);
    }
}