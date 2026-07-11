import { Component, inject } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { CashierService } from '../../../core/services/cashier.service';
import { MxnCurrencyPipe } from '../../../shared/pipes/currency.pipe';
import { IconComponent } from '../../../shared/components/icon/icon';

@Component({
  selector: 'app-cashier-layout',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive, MxnCurrencyPipe, IconComponent],
  template: `
    <div class="cashier-shell">
      <header class="cashier-header">
        <div class="brand-block">
          <div class="brand-icon"><app-icon name="store" size="24" color="white" /></div>
          <div><h1>Maday Caja</h1><p>Punto de venta</p></div>
        </div>

        <nav class="cashier-nav" aria-label="Navegación de caja">
          <a routerLink="/cashier/register" routerLinkActive="active">
            <app-icon name="shopping-cart" size="16" color="currentColor" /> Cobrar
          </a>
          <a routerLink="/cashier/sales" routerLinkActive="active">
            <app-icon name="clipboard" size="16" color="currentColor" /> Mis ventas
          </a>
        </nav>

        <div class="session-block">
          <span class="register-state" [class.open]="cashierService.status()?.is_open">
            <span class="state-dot"></span>
            {{ cashierService.status()?.is_open ? 'Caja abierta' : 'Caja cerrada' }}
          </span>
          <div class="cashier-name">
            <strong>{{ authService.user()?.firstName || 'Cajero' }}</strong>
            <small>{{ cashierService.status()?.sales_total || 0 | mxnCurrency }} hoy</small>
          </div>
          <button type="button" class="logout-button" (click)="authService.logout()" aria-label="Cerrar sesión">
            <app-icon name="log-out" size="17" color="currentColor" />
          </button>
        </div>
      </header>

      <main class="cashier-main"><router-outlet /></main>
    </div>
  `,
  styleUrl: './cashier-layout.css',
})
export class CashierLayout {
  protected authService = inject(AuthService);
  protected cashierService = inject(CashierService);
}
