export enum CompteRenduType {
  REUNION = "REUNION",
  SEMINAIRE = "SEMINAIRE",
  WEBINAIRE = "WEBINAIRE",
  AUTRE = "AUTRE",
}

export interface CompteRendu {
  id?: number
  titre: string
  description: string
  type: CompteRenduType
  date: Date
  cheminFichier: string
  isNouveau: boolean
}
