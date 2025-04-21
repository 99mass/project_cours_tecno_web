import { Injectable } from "@angular/core"
import { BehaviorSubject } from "rxjs"

@Injectable({
  providedIn: "root",
})
export class LoaderService {
  private isLoadingSubject = new BehaviorSubject<boolean>(false)
  public isLoading$ = this.isLoadingSubject.asObservable()

  constructor() {}

  get isLoading(): boolean {
    return this.isLoadingSubject.value
  }

  show(): void {
    this.isLoadingSubject.next(true)
  }

  hide(): void {
    this.isLoadingSubject.next(false)
  }
}
