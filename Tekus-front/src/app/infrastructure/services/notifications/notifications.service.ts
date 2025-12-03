import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

export interface ToastMessage {
  type: 'success' | 'error' | 'warning' | 'info';
  message: string;
  duration?: number;
}

@Injectable({
  providedIn: 'root'
})
export class NotificationsService {
  
  private toastSubject = new Subject<ToastMessage>();
  public toast$ = this.toastSubject.asObservable();

  showToastSuccessMessage(message: string, duration: number = 3000): void {
    this.toastSubject.next({ type: 'success', message, duration });
  }

  showToastErrorMessage(message: string, duration: number = 4000): void {
    this.toastSubject.next({ type: 'error', message, duration });
  }

  showToastWarningMessage(message: string, duration: number = 3500): void {
    this.toastSubject.next({ type: 'warning', message, duration });
  }

  showToastInfoMessage(message: string, duration: number = 3000): void {
    this.toastSubject.next({ type: 'info', message, duration });
  }
}
