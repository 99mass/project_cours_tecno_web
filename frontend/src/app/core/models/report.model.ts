export enum Type {
  MEETING = "MEETING",
  SEMINAR = "SEMINAR",
  WEBINAR = "WEBINAR",
  OTHER = "OTHER",
}

export interface Report {
  id?: string // UUID
  title: string
  description: string
  type: Type
  filePath?: string
  isNew?: boolean
  createdAt?: Date
  updatedAt?: Date
}

export interface ReportCreationRequest {
  title: string
  description: string
  type: Type
  fileBase64: string
  fileName: string
}

export interface ReportUpdateRequest {
  title?: string
  description?: string
  type?: Type
  fileBase64?: string
  fileName?: string
}
