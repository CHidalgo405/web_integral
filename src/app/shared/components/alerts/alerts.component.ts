import { Component, inject } from '@angular/core';
import { NgClass } from '@angular/common';
import { AlertService } from '../../../core/services/alert.service';

@Component({
  selector: 'app-alerts',
  standalone: true,
  imports: [NgClass],
  template: `
    <div class="alerts-container">
      @for (alert of alertService.alerts(); track alert.id) {
        <div class="alert-toast" [ngClass]="alert.type">
          <div class="alert-icon">
            @switch (alert.type) {
              @case ('success') {
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
              }
              @case ('warning') {
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>
              }
              @case ('info') {
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>
              }
              @case ('error') {
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="15" y1="9" x2="9" y2="15"></line><line x1="9" y1="9" x2="15" y2="15"></line></svg>
              }
            }
          </div>
          <div class="alert-content">
            <h4 class="alert-title">{{ alert.title }}</h4>
            <p class="alert-message">{{ alert.message }}</p>
          </div>
          <button class="alert-close" (click)="alertService.remove(alert.id)">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
          </button>
        </div>
      }
    </div>
  `,
  styles: [`
    .alerts-container {
      position: fixed;
      top: max(16px, env(safe-area-inset-top));
      left: 50%;
      transform: translateX(-50%);
      display: flex;
      flex-direction: column;
      gap: 12px;
      z-index: 9999;
      width: 90%;
      max-width: 400px;
      pointer-events: none;
    }

    .alert-toast {
      pointer-events: auto;
      display: flex;
      align-items: center;
      gap: 16px;
      padding: 16px 20px;
      border-radius: 9999px; /* Pill shape */
      box-shadow: 0 10px 30px rgba(0,0,0,0.06);
      animation: slideDown 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
    }

    .alert-content {
      flex: 1;
      display: flex;
      flex-direction: column;
      gap: 2px;
    }

    .alert-title {
      margin: 0;
      font-size: 0.95rem;
      font-weight: 700;
      font-family: var(--font-heading);
    }

    .alert-message {
      margin: 0;
      font-size: 0.8rem;
      font-weight: 500;
      opacity: 0.85;
    }

    .alert-icon {
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .alert-icon svg {
      width: 24px;
      height: 24px;
    }

    .alert-close {
      background: none;
      border: none;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 4px;
      opacity: 0.7;
      transition: opacity 0.2s;
    }

    .alert-close:hover {
      opacity: 1;
    }

    .alert-close svg {
      width: 16px;
      height: 16px;
    }

    /* Success Theme */
    .alert-toast.success { background-color: #E2F2E4; color: #1E663B; }
    .alert-toast.success .alert-icon svg { stroke: #1E663B; }
    .alert-toast.success .alert-close { color: #1E663B; }

    /* Warning Theme */
    .alert-toast.warning { background-color: #FDF1D7; color: #8C6A1E; }
    .alert-toast.warning .alert-icon svg { stroke: #8C6A1E; }
    .alert-toast.warning .alert-close { color: #8C6A1E; }

    /* Info Theme */
    .alert-toast.info { background-color: #E1E8FA; color: #2A4895; }
    .alert-toast.info .alert-icon svg { stroke: #2A4895; }
    .alert-toast.info .alert-close { color: #2A4895; }

    /* Error Theme */
    .alert-toast.error { background-color: #FBE0DB; color: #A8241D; }
    .alert-toast.error .alert-icon svg { stroke: #A8241D; }
    .alert-toast.error .alert-close { color: #A8241D; }

    @keyframes slideDown {
      from { opacity: 0; transform: translateY(-20px) scale(0.95); }
      to { opacity: 1; transform: translateY(0) scale(1); }
    }
  `]
})
export class AlertsComponent {
  protected alertService = inject(AlertService);
}
