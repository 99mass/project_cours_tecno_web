import { Injectable } from "@angular/core"
import { HttpClient, HttpParams } from "@angular/common/http"
import { Observable } from "rxjs"
import { CompteRendu, CompteRenduType } from "../models/compte-rendu.model"
import { environment } from "../../../environments/environment"

@Injectable({
  providedIn: "root",
})
export class CompteRenduService {
  private apiUrl = `${environment.apiUrl}/comptes-rendus`

  constructor(private http: HttpClient) {}

  getAll(): Observable<CompteRendu[]> {
    return this.http.get<CompteRendu[]>(this.apiUrl)
  }

  getById(id: number): Observable<CompteRendu> {
    return this.http.get<CompteRendu>(`${this.apiUrl}/${id}`)
  }

  getByType(type: CompteRenduType): Observable<CompteRendu[]> {
    const params = new HttpParams().set("type", type)
    return this.http.get<CompteRendu[]>(this.apiUrl, { params })
  }

  getByDateRange(startDate: Date, endDate: Date): Observable<CompteRendu[]> {
    const params = new HttpParams().set("startDate", startDate.toISOString()).set("endDate", endDate.toISOString())
    return this.http.get<CompteRendu[]>(this.apiUrl, { params })
  }

  create(compteRendu: CompteRendu, file: File): Observable<CompteRendu> {
    const formData = new FormData()
    formData.append("file", file)
    formData.append("compteRendu", JSON.stringify(compteRendu))

    return this.http.post<CompteRendu>(this.apiUrl, formData)
  }

  update(id: number, compteRendu: CompteRendu, file?: File): Observable<CompteRendu> {
    const formData = new FormData()
    if (file) {
      formData.append("file", file)
    }
    formData.append("compteRendu", JSON.stringify(compteRendu))

    return this.http.put<CompteRendu>(`${this.apiUrl}/${id}`, formData)
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`)
  }

  markAsRead(id: number): Observable<void> {
    return this.http.patch<void>(`${this.apiUrl}/${id}/read`, {})
  }

  downloadFile(filePath: string): Observable<Blob> {
    return this.http.get(`${environment.apiUrl}/files/${filePath}`, {
      responseType: "blob",
    })
  }
}