import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subject, takeUntil } from 'rxjs';
import { NotificationsService, ToastMessage } from '../../../infrastructure/services/notifications/notifications.service';

@Component({
  selector: 'app-toast',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="toast-container">
      <div 
        *ngFor="let toast of toasts" 
        class="toast"
        [class.toast-success]="toast.type === 'success'"
        [class.toast-error]="toast.type === 'error'"
        [class.toast-warning]="toast.type === 'warning'"
        [class.toast-info]="toast.type === 'info'"
        [@slideIn]>
        <div class="toast-icon">
          <span *ngIf="toast.type === 'success'">✓</span>
          <span *ngIf="toast.type === 'error'">✕</span>
          <span *ngIf="toast.type === 'warning'">⚠</span>
          <span *ngIf="toast.type === 'info'">ℹ</span>
        </div>
        <div class="toast-message">{{ toast.message }}</div>
      </div>
    </div>
  `,
  styles: [`
    .toast-container {
      position: fixed;
      top: 20px;
      right: 20px;
      z-index: 10000;
      display: flex;
      flex-direction: column;
      gap: 12px;
      max-width: 400px;
    }

    .toast {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 16px 20px;
      border-radius: 12px;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
      background: white;
      animation: slideInRight 0.3s ease;
      min-width: 300px;

      &.toast-success {
        border-left: 4px solid #4caf50;
        .toast-icon {
          background: #4caf50;
        }
      }

      &.toast-error {
        border-left: 4px solid #f44336;
        .toast-icon {
          background: #f44336;
        }
      }

      &.toast-warning {
        border-left: 4px solid #ff9800;
        .toast-icon {
          background: #ff9800;
        }
      }

      &.toast-info {
        border-left: 4px solid #2196f3;
        .toast-icon {
          background: #2196f3;
        }
      }
    }

    .toast-icon {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 28px;
      height: 28px;
      border-radius: 50%;
      color: white;
      font-weight: bold;
      font-size: 16px;
      flex-shrink: 0;
    }

    .toast-message {
      flex: 1;
      color: #333;
      font-size: 14px;
      line-height: 1.4;
    }

    @keyframes slideInRight {
      from {
        transform: translateX(100%);
        opacity: 0;
      }
      to {
        transform: translateX(0);
        opacity: 1;
      }
    }

    @media (max-width: 768px) {
      .toast-container {
        left: 20px;
        right: 20px;
        max-width: none;
      }

      .toast {
        min-width: auto;
      }
    }
  `]
})
export class ToastComponent implements OnInit, OnDestroy {
  toasts: (ToastMessage & { id: number })[] = [];
  private destroy$ = new Subject<void>();
  private toastId = 0;

  constructor(private notificationsService: NotificationsService) {}

  ngOnInit(): void {
    this.notificationsService.toast$
      .pipe(takeUntil(this.destroy$))
      .subscribe(toast => {
        const toastWithId = { ...toast, id: this.toastId++ };
        this.toasts.push(toastWithId);
        
        setTimeout(() => {
          this.removeToast(toastWithId.id);
        }, toast.duration || 3000);
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private removeToast(id: number): void {
    this.toasts = this.toasts.filter(t => t.id !== id);
  }
}
