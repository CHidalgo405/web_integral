import { Component, inject, OnInit } from '@angular/core';
import { RouterOutlet, Router, NavigationEnd } from '@angular/router';
import { SwUpdate } from '@angular/service-worker';
import { BottomNav } from './shared/components/bottom-nav/bottom-nav';
import { OfflineBanner } from './shared/components/offline-banner/offline-banner';
import { AlertsComponent } from './shared/components/alerts/alerts.component';
import { filter } from 'rxjs';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, BottomNav, OfflineBanner, AlertsComponent],
  template: `
    <app-offline-banner></app-offline-banner>
    <app-alerts></app-alerts>
    
    @if (updateAvailable) {
      <div class="update-banner">
        <div class="update-content">
          <div class="update-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
              <polyline points="7 10 12 15 17 10"></polyline>
              <line x1="12" y1="15" x2="12" y2="3"></line>
            </svg>
          </div>
          <div class="update-text">
            <h4>¡Nueva versión disponible!</h4>
            <p>Actualiza para disfrutar de las últimas mejoras.</p>
          </div>
        </div>
        <button class="update-button" (click)="updateApp()">Actualizar</button>
      </div>
    }

    <router-outlet></router-outlet>
    @if (showBottomNav) {
      <app-bottom-nav></app-bottom-nav>
    }
  `,
  styles: [`
    :host { display: block; min-height: 100dvh; }
    
    .update-banner {
      position: fixed;
      bottom: max(80px, env(safe-area-inset-bottom) + 80px); /* Above bottom nav */
      left: 50%;
      transform: translateX(-50%);
      width: 90%;
      max-width: 400px;
      background: rgba(255, 255, 255, 0.95);
      backdrop-filter: blur(10px);
      border: 1px solid rgba(0,0,0,0.05);
      box-shadow: 0 10px 30px rgba(0,0,0,0.1);
      border-radius: 20px;
      padding: 16px;
      display: flex;
      flex-direction: column;
      gap: 12px;
      z-index: 9998;
      animation: slideUp 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
    }
    
    .update-content {
      display: flex;
      align-items: center;
      gap: 12px;
    }
    
    .update-icon {
      background: #E1E8FA;
      color: #2A4895;
      width: 40px;
      height: 40px;
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    
    .update-icon svg {
      width: 20px;
      height: 20px;
    }
    
    .update-text h4 {
      margin: 0;
      font-size: 0.95rem;
      font-weight: 700;
      color: #111;
      font-family: var(--font-heading, system-ui);
    }
    
    .update-text p {
      margin: 0;
      font-size: 0.8rem;
      color: #666;
      font-weight: 500;
    }
    
    .update-button {
      background: #2A4895;
      color: white;
      border: none;
      border-radius: 12px;
      padding: 10px;
      font-size: 0.9rem;
      font-weight: 600;
      cursor: pointer;
      transition: background 0.2s, transform 0.1s;
    }
    
    .update-button:active {
      transform: scale(0.98);
    }
    
    @keyframes slideUp {
      from { opacity: 0; transform: translate(-50%, 20px) scale(0.95); }
      to { opacity: 1; transform: translate(-50%, 0) scale(1); }
    }
  `],
})
export class App implements OnInit {
  private router = inject(Router);
  private swUpdate = inject(SwUpdate);
  
  showBottomNav = false;
  updateAvailable = false;

  private hiddenRoutes = ['/auth', '/checkout', '/admin', '/cashier', '/product'];

  constructor() {
    this.router.events
      .pipe(filter((e): e is NavigationEnd => e instanceof NavigationEnd))
      .subscribe((e) => {
        this.showBottomNav = !this.hiddenRoutes.some((r) => e.urlAfterRedirects.startsWith(r));
        window.scrollTo(0, 0);
      });
  }

  ngOnInit() {
    if (this.swUpdate.isEnabled) {
      this.swUpdate.versionUpdates.subscribe((event) => {
        if (event.type === 'VERSION_READY') {
          this.updateAvailable = true;
        }
      });
    }
  }

  updateApp() {
    this.swUpdate.activateUpdate().then(() => document.location.reload());
  }
}
