import { Component, inject } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { IconComponent } from '../../../shared/components/icon/icon';

@Component({
  selector: 'app-inventory-layout',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive, IconComponent],
  template: `
    <div class="inventory-shell">
      <header class="inventory-header">
        <div class="brand-block">
          <div class="brand-icon"><app-icon name="package" size="23" color="white" /></div>
          <div><h1>Maday Inventario</h1><p>Control de existencias</p></div>
        </div>

        <nav class="inventory-nav" aria-label="Navegación de inventario">
          <a routerLink="/inventory/stock" routerLinkActive="active">
            <app-icon name="package" size="16" color="currentColor" /> Existencias
          </a>
          <a routerLink="/inventory/movements" routerLinkActive="active">
            <app-icon name="clock" size="16" color="currentColor" /> Movimientos
          </a>
        </nav>

        <div class="session-block">
          <div class="operator-avatar">{{ authService.user()?.firstName?.charAt(0) || 'I' }}</div>
          <div class="operator-name">
            <strong>{{ authService.user()?.firstName || 'Inventario' }}</strong>
            <small>
              {{ authService.user()?.role === 'manager' ? 'Gerente' : authService.user()?.role === 'admin' ? 'Administrador' : 'Encargado de inventario' }}
            </small>
          </div>
          <button type="button" class="logout-button" (click)="authService.logout()" aria-label="Cerrar sesión">
            <app-icon name="log-out" size="17" color="currentColor" />
          </button>
        </div>
      </header>

      <main class="inventory-main"><router-outlet /></main>
    </div>
  `,
  styleUrl: './inventory-layout.css',
})
export class InventoryLayout {
  protected authService = inject(AuthService);
}
