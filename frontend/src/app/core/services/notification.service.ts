import { Injectable } from "@angular/core"
import { BehaviorSubject } from "rxjs"
import { ToastrService } from "ngx-toastr"

@Injectable({
  providedIn: "root",
})
export class NotificationService {
  private newItemsCountSubject = new BehaviorSubject<number>(0)
  public newItemsCount$ = this.newItemsCountSubject.asObservable()

  constructor(private toastr: ToastrService) {}

  updateNewItemsCount(count: number): void {
    this.newItemsCountSubject.next(count)
  }

  showSuccess(message: string): void {
    this.toastr.success(message)
  }

  showError(message: string): void {
    this.toastr.error(message)
  }

  showInfo(message: string): void {
    this.toastr.info(message)
  }

  showWarning(message: string): void {
    this.toastr.warning(message)
  }
}