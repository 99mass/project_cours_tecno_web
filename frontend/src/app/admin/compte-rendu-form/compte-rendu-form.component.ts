import { Component, type OnInit } from "@angular/core"
import { type FormBuilder, type FormGroup, Validators } from "@angular/forms"
import type { ActivatedRoute, Router } from "@angular/router"
import type { CompteRenduService } from "../../core/services/compte-rendu.service"
import type { NotificationService } from "../../core/services/notification.service"
import { type CompteRendu, CompteRenduType } from "../../core/models/compte-rendu.model"
import { trigger, transition, style, animate } from "@angular/animations"

@Component({
  selector: "app-compte-rendu-form",
  templateUrl: "./compte-rendu-form.component.html",
  styleUrls: ["./compte-rendu-form.component.scss"],
  animations: [
    trigger("fadeIn", [transition(":enter", [style({ opacity: 0 }), animate("0.4s ease-out", style({ opacity: 1 }))])]),
  ],
})
export class CompteRenduFormComponent implements OnInit {
  compteRenduForm!: FormGroup
  compteRenduTypes = Object.values(CompteRenduType)
  isEditMode = false
  compteRenduId?: number
  selectedFile: File | null = null
  comptesRendus: CompteRendu[] = []
  isSubmitting = false

  constructor(
    private fb: FormBuilder,
    private compteRenduService: CompteRenduService,
    private notificationService: NotificationService,
    private route: ActivatedRoute,
    private router: Router,
  ) {}

  ngOnInit(): void {
    this.initForm()
    this.loadComptesRendus()

    this.route.params.subscribe((params) => {
      if (params["id"]) {
        this.isEditMode = true
        this.compteRenduId = +params["id"]
        this.loadCompteRendu(this.compteRenduId)
      }
    })
  }

  initForm(): void {
    this.compteRenduForm = this.fb.group({
      titre: ["", [Validators.required, Validators.minLength(3)]],
      description: ["", [Validators.required, Validators.minLength(10)]],
      type: [CompteRenduType.REUNION, Validators.required],
      date: [new Date().toISOString().split("T")[0], Validators.required],
    })
  }

  loadComptesRendus(): void {
    this.compteRenduService.getAll().subscribe({
      next: (data) => {
        this.comptesRendus = data
      },
      error: () => {
        this.notificationService.showError("Erreur lors du chargement des comptes rendus")
      },
    })
  }

  loadCompteRendu(id: number): void {
    this.compteRenduService.getById(id).subscribe({
      next: (compteRendu) => {
        this.compteRenduForm.patchValue({
          titre: compteRendu.titre,
          description: compteRendu.description,
          type: compteRendu.type,
          date: new Date(compteRendu.date).toISOString().split("T")[0],
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

  onSubmit(): void {
    if (this.compteRenduForm.invalid) {
      this.compteRenduForm.markAllAsTouched()
      return
    }

    if (!this.isEditMode && !this.selectedFile) {
      this.notificationService.showError("Veuillez sélectionner un fichier PDF")
      return
    }

    this.isSubmitting = true
    const formValue = this.compteRenduForm.value
    const compteRendu: CompteRendu = {
      titre: formValue.titre,
      description: formValue.description,
      type: formValue.type,
      date: new Date(formValue.date),
      cheminFichier: "",
      isNouveau: true,
    }

    if (this.isEditMode && this.compteRenduId) {
      this.compteRenduService.update(this.compteRenduId, compteRendu, this.selectedFile || undefined).subscribe({
        next: () => {
          this.notificationService.showSuccess("Compte rendu mis à jour avec succès")
          this.loadComptesRendus()
          this.resetForm()
          this.isSubmitting = false
        },
        error: () => {
          this.notificationService.showError("Erreur lors de la mise à jour du compte rendu")
          this.isSubmitting = false
        },
      })
    } else {
      this.compteRenduService.create(compteRendu, this.selectedFile!).subscribe({
        next: () => {
          this.notificationService.showSuccess("Compte rendu ajouté avec succès")
          this.loadComptesRendus()
          this.resetForm()
          this.isSubmitting = false
        },
        error: () => {
          this.notificationService.showError("Erreur lors de l'ajout du compte rendu")
          this.isSubmitting = false
        },
      })
    }
  }

  resetForm(): void {
    this.compteRenduForm.reset({
      type: CompteRenduType.REUNION,
      date: new Date().toISOString().split("T")[0],
    })
    this.selectedFile = null
    this.isEditMode = false
    this.compteRenduId = undefined
  }

  deleteCompteRendu(id: number): void {
    if (confirm("Êtes-vous sûr de vouloir supprimer ce compte rendu ?")) {
      this.compteRenduService.delete(id).subscribe({
        next: () => {
          this.notificationService.showSuccess("Compte rendu supprimé avec succès")
          this.loadComptesRendus()
        },
        error: () => {
          this.notificationService.showError("Erreur lors de la suppression du compte rendu")
        },
      })
    }
  }

  editCompteRendu(id: number): void {
    this.router.navigate(["/admin/comptes-rendus/edit", id])
  }
}
