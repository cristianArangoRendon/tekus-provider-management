import { Component } from '@angular/core';

@Component({
  selector: 'app-loading',
  standalone: true,
  template: `
    <div class="loading-overlay">
      <div class="loading-spinner">
        <div class="spinner-ring"></div>
        <div class="spinner-ring"></div>
        <div class="spinner-ring"></div>
        <div class="loading-text">Cargando...</div>
      </div>
    </div>
  `,
  styles: [`
    .loading-overlay {
      position: fixed;
      inset: 0;
      background: rgba(0, 0, 0, 0.7);
      backdrop-filter: blur(4px);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 9999;
      animation: fadeIn 0.3s ease;
    }

    @keyframes fadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }

    .loading-spinner {
      position: relative;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 1.5rem;
    }

    .spinner-ring {
      position: absolute;
      width: 80px;
      height: 80px;
      border: 4px solid transparent;
      border-top-color: #667eea;
      border-radius: 50%;
      animation: spin 1.5s cubic-bezier(0.68, -0.55, 0.265, 1.55) infinite;

      &:nth-child(2) {
        width: 60px;
        height: 60px;
        border-top-color: #764ba2;
        animation-delay: -0.3s;
      }

      &:nth-child(3) {
        width: 40px;
        height: 40px;
        border-top-color: #f093fb;
        animation-delay: -0.6s;
      }
    }

    @keyframes spin {
      0% {
        transform: rotate(0deg);
      }
      100% {
        transform: rotate(360deg);
      }
    }

    .loading-text {
      margin-top: 100px;
      color: white;
      font-size: 1rem;
      font-weight: 600;
      letter-spacing: 1px;
      animation: pulse 1.5s ease-in-out infinite;
    }

    @keyframes pulse {
      0%, 100% {
        opacity: 1;
      }
      50% {
        opacity: 0.5;
      }
    }
  `]
})
export class LoadingComponent {}
