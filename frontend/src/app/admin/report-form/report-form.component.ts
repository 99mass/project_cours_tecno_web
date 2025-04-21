import { Component, OnInit } from "@angular/core"
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormsModule } from "@angular/forms"
import { ActivatedRoute, Router, RouterModule } from "@angular/router"
import { ReportService } from "../../core/services/report.service"
import { NotificationService } from "../../core/services/notification.service"
import { Report, Type, ReportCreationRequest, ReportUpdateRequest } from "../../core/models/report.model"
import { trigger, transition, style, animate } from "@angular/animations"
import { CommonModule, DatePipe } from "@angular/common"

@Component({
  selector: "app-report-form",
  templateUrl: "./report-form.component.html",
  styleUrls: ["./report-form.component.scss"],
  standalone: true,
  imports: [
    CommonModule,       // Pour NgIf, NgFor, NgClass
    ReactiveFormsModule, // Pour formGroup, formControlName
    FormsModule,        // Pour ngModel
    RouterModule,       // Pour routerLink
    DatePipe           // Pour le pipe date
  ],
  animations: [
    trigger("fadeIn", [transition(":enter", [style({ opacity: 0 }), animate("0.4s ease-out", style({ opacity: 1 }))])]),
  ],
})
export class ReportFormComponent implements OnInit {
  reportForm!: FormGroup
  reportTypes = Object.values(Type)
  isEditMode = false
  reportId?: string
  selectedFile: File | null = null
  reports: Report[] = []
  isSubmitting = false
  searchTerm = ""
  filteredReports: Report[] = []

  constructor(
    private fb: FormBuilder,
    private reportService: ReportService,
    private notificationService: NotificationService,
    private route: ActivatedRoute,
    private router: Router,
  ) {}

  ngOnInit(): void {
    this.initForm()
    this.loadReports()

    this.route.params.subscribe((params) => {
      if (params["id"]) {
        this.isEditMode = true
        this.reportId = params["id"]
        if (this.reportId) {
          this.loadReport(this.reportId)
        }
      }
    })
  }

  initForm(): void {
    this.reportForm = this.fb.group({
      title: ["", [Validators.required, Validators.minLength(3)]],
      description: ["", [Validators.required, Validators.minLength(10)]],
      type: [Type.MEETING, Validators.required],
    })
  }

  loadReports(): void {
    this.reportService.getAll().subscribe({
      next: (data) => {
        this.reports = data
        this.applyFilter()
      },
      error: () => {
        this.notificationService.showError("Erreur lors du chargement des comptes rendus")
      },
    })
  }

  loadReport(id: string): void {
    this.reportService.getById(id).subscribe({
      next: (report) => {
        this.reportForm.patchValue({
          title: report.title,
          description: report.description,
          type: report.type,
        })
      },
      error: () => {
        this.notificationService.showError("Erreur lors du chargement du compte rendu")
      },
    })
  }

  onFileSelected(event: any): void {
    const file = event.target.files[0]
    if (file) {
      if (file.type !== "application/pdf") {
        this.notificationService.showError("Seuls les fichiers PDF sont acceptés")
        return
      }
      this.selectedFile = file
    }
  }

  async onSubmit(): Promise<void> {
    if (this.reportForm.invalid) {
      this.reportForm.markAllAsTouched()
      return
    }

    if (!this.isEditMode && !this.selectedFile) {
      this.notificationService.showError("Veuillez sélectionner un fichier PDF")
      return
    }

    this.isSubmitting = true
    const formValue = this.reportForm.value

    try {
      if (this.isEditMode && this.reportId) {
        const updateRequest: ReportUpdateRequest = {
          title: formValue.title,
          description: formValue.description,
          type: formValue.type,
        }

        // Add file if selected
        if (this.selectedFile) {
          const fileBase64 = await this.reportService.fileToBase64(this.selectedFile)
          updateRequest.fileBase64 = fileBase64
          updateRequest.fileName = this.selectedFile.name
        }

        this.reportService.update(this.reportId, updateRequest).subscribe({
          next: () => {
            this.notificationService.showSuccess("Compte rendu mis à jour avec succès")
            this.loadReports()
            this.resetForm()
            this.isSubmitting = false
          },
          error: () => {
            this.notificationService.showError("Erreur lors de la mise à jour du compte rendu")
            this.isSubmitting = false
          },
        })
      } else {
        if (!this.selectedFile) {
          this.isSubmitting = false
          return
        }

        const fileBase64 = await this.reportService.fileToBase64(this.selectedFile)
        const createRequest: ReportCreationRequest = {
          title: formValue.title,
          description: formValue.description,
          type: formValue.type,
          fileBase64: fileBase64,
          fileName: this.selectedFile.name,
        }

        this.reportService.create(createRequest).subscribe({
          next: () => {
            this.notificationService.showSuccess("Compte rendu ajouté avec succès")
            this.loadReports()
            this.resetForm()
            this.isSubmitting = false
          },
          error: () => {
            this.notificationService.showError("Erreur lors de l'ajout du compte rendu")
            this.isSubmitting = false
          },
        })
      }
    } catch (error) {
      this.notificationService.showError("Erreur lors du traitement du fichier")
      this.isSubmitting = false
    }
  }

  resetForm(): void {
    this.reportForm.reset({
      type: Type.MEETING,
    })
    this.selectedFile = null
    this.isEditMode = false
    this.reportId = undefined
  }

  deleteReport(id: string): void {
    if (confirm("Êtes-vous sûr de vouloir supprimer ce compte rendu ?")) {
      this.reportService.delete(id).subscribe({
        next: () => {
          this.notificationService.showSuccess("Compte rendu supprimé avec succès")
          this.loadReports()
        },
        error: () => {
          this.notificationService.showError("Erreur lors de la suppression du compte rendu")
        },
      })
    }
  }

  editReport(id: string): void {
    this.router.navigate(["/admin/reports/edit", id])
  }

  sendReportByEmail(id: string): void {
    this.reportService.sendByEmail(id).subscribe({
      next: () => {
        this.notificationService.showSuccess("Compte rendu envoyé par email avec succès")
      },
      error: () => {
        this.notificationService.showError("Erreur lors de l'envoi du compte rendu par email")
      },
    })
  }

  downloadReport(id: string): void {
    this.reportService.downloadFile(id).subscribe({
      next: (blob) => {
        const report = this.reports.find((r) => r.id === id)
        if (!report) return

        const url = window.URL.createObjectURL(blob)
        const a = document.createElement("a")
        a.href = url
        a.download = `${report.title}.pdf`
        document.body.appendChild(a)
        a.click()
        window.URL.revokeObjectURL(url)
        document.body.removeChild(a)
      },
      error: () => {
        this.notificationService.showError("Erreur lors du téléchargement du fichier")
      },
    })
  }

  searchReports(): void {
    this.applyFilter()
  }

  applyFilter(): void {
    if (!this.searchTerm.trim()) {
      this.filteredReports = [...this.reports]
      return
    }

    const term = this.searchTerm.toLowerCase().trim()
    this.filteredReports = this.reports.filter(
      (report) => report.title.toLowerCase().includes(term) || report.description.toLowerCase().includes(term),
    )
  }
}