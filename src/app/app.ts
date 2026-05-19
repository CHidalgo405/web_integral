import { Component, inject } from '@angular/core';
import { RouterOutlet, Router, NavigationEnd } from '@angular/router';
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
    <router-outlet></router-outlet>
    @if (showBottomNav) {
      <app-bottom-nav></app-bottom-nav>
    }
  `,
  styles: [`
    :host { display: block; min-height: 100dvh; }
  `],
})
export class App {
  private router = inject(Router);
  showBottomNav = false;

  private hiddenRoutes = ['/auth', '/checkout', '/orders/confirmation', '/orders/error'];

  constructor() {
    this.router.events
      .pipe(filter((e): e is NavigationEnd => e instanceof NavigationEnd))
      .subscribe((e) => {
        this.showBottomNav = !this.hiddenRoutes.some((r) => e.urlAfterRedirects.startsWith(r));
        window.scrollTo(0, 0);
      });
  }
}
