import { Injectable } from "@angular/core"
import { HttpClient, HttpParams } from "@angular/common/http"
import { Observable } from "rxjs"
import { Report, ReportCreationRequest, ReportUpdateRequest, Type } from "../models/report.model"
import { environment } from "../../../environments/environment"

@Injectable({
  providedIn: "root",
})
export class ReportService {
  private apiUrl = `${environment.apiUrl}/reports`

  constructor(private http: HttpClient) {}

  getAll(type?: Type): Observable<Report[]> {
    let params = new HttpParams()
    if (type) {
      params = params.set("type", type)
    }
    return this.http.get<Report[]>(this.apiUrl, { params })
  }

  getNewReports(): Observable<Report[]> {
    return this.http.get<Report[]>(`${this.apiUrl}/new`)
  }

  getById(id: string): Observable<Report> {
    return this.http.get<Report>(`${this.apiUrl}/${id}`)
  }

  create(report: ReportCreationRequest): Observable<Report> {
    return this.http.post<Report>(this.apiUrl, report)
  }

  update(id: string, report: ReportUpdateRequest): Observable<Report> {
    return this.http.put<Report>(`${this.apiUrl}/${id}`, report)
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`)
  }

  markAsRead(id: string): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/${id}/read`, {})
  }

  sendByEmail(id: string): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/${id}/send-email`, {})
  }

  downloadFile(id: string): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/${id}/download`, {
      responseType: "blob",
    })
  }

  // Helper method to convert file to base64
  fileToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.readAsDataURL(file)
      reader.onload = () => {
        let base64String = reader.result as string
        // Remove the data:application/pdf;base64, prefix
        base64String = base64String.split(",")[1]
        resolve(base64String)
      }
      reader.onerror = (error) => reject(error)
    })
  }
}