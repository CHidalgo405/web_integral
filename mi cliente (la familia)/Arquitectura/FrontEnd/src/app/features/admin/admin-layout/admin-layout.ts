// admin-layout.component.ts
import { Component, inject, signal } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { IconComponent } from '../../../shared/components/icon/icon';

@Component({
  selector: 'app-admin-layout',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive, IconComponent],
  template: `
    <div class="admin-layout">
      <!-- Desktop Sidebar -->
      <aside class="sidebar">
        <div class="sidebar-header">
          <span class="logo-emoji">
            <app-icon name="shield" size="28" color="white" />
          </span>
          <div class="logo-text">
            <h2>Maday Admin</h2>
            <p>{{ authService.user()?.role === 'manager' ? 'Gerencia de Tienda' : 'Control de Tienda' }}</p>
          </div>
        </div>

        <nav class="sidebar-menu">
          <a routerLink="/admin/dashboard" routerLinkActive="active" class="menu-link">
            <span class="link-icon"><app-icon name="bar-chart" size="18" color="currentColor" /></span>
            <span class="link-label">Resumen</span>
          </a>
          <a routerLink="/admin/products" routerLinkActive="active" class="menu-link">
            <span class="link-icon"><app-icon name="package" size="18" color="currentColor" /></span>
            <span class="link-label">Productos</span>
          </a>
          <a routerLink="/admin/orders" routerLinkActive="active" class="menu-link">
            <span class="link-icon"><app-icon name="clipboard" size="18" color="currentColor" /></span>
            <span class="link-label">Pedidos</span>
          </a>
          <a routerLink="/admin/users" routerLinkActive="active" class="menu-link">
            <span class="link-icon"><app-icon name="users" size="18" color="currentColor" /></span>
            <span class="link-label">Usuarios</span>
          </a>
        </nav>

        <div class="sidebar-footer">
          <a routerLink="/inventory" class="btn-return">
            <app-icon name="package" size="16" color="currentColor" />
            Abrir Inventario
          </a>
          <a routerLink="/cashier" class="btn-return">
            <app-icon name="shopping-cart" size="16" color="currentColor" />
            Abrir Punto de Venta
          </a>
          <a routerLink="/home" class="btn-return">
            <app-icon name="store" size="16" color="currentColor" />
            Volver a Tienda
          </a>
          <button (click)="authService.logout()" class="btn-logout">
            <app-icon name="log-out" size="16" color="currentColor" />
            Cerrar Sesión
          </button>
        </div>
      </aside>

      <!-- Mobile Header -->
      <header class="mobile-header">
        <button (click)="toggleMobileMenu()" class="menu-toggle" aria-label="Abrir menú">
          <svg class="toggle-icon" viewBox="0 0 24 24">
            <line x1="3" y1="12" x2="21" y2="12"></line>
            <line x1="3" y1="6" x2="21" y2="6"></line>
            <line x1="3" y1="18" x2="21" y2="18"></line>
          </svg>
        </button>
        <h1 class="header-title">
          <app-icon name="shield" size="18" color="white" />
          Maday Admin
        </h1>
        <div class="user-badge">
          {{ authService.user()?.firstName?.charAt(0) || 'A' }}
        </div>
      </header>

      <!-- Mobile Drawer Overlay -->
      @if (isMobileMenuOpen()) {
        <div class="drawer-overlay" (click)="toggleMobileMenu()"></div>
      }

      <!-- Mobile Drawer -->
      <div class="mobile-drawer" [class.open]="isMobileMenuOpen()">
        <div class="drawer-header">
          <div class="admin-info">
            <div class="drawer-avatar">
              {{ authService.user()?.firstName?.charAt(0) || 'A' }}
            </div>
            <div>
              <h3>{{ authService.user()?.firstName }} {{ authService.user()?.lastName }}</h3>
              <p>{{ authService.user()?.role === 'manager' ? 'Gerente · acceso administrativo' : 'Administrador' }}</p>
            </div>
          </div>
          <button (click)="toggleMobileMenu()" class="drawer-close" aria-label="Cerrar menú">&times;</button>
        </div>

        <nav class="drawer-menu">
          <a routerLink="/admin/dashboard" routerLinkActive="active" (click)="toggleMobileMenu()" class="drawer-link">
            <app-icon name="bar-chart" size="18" color="currentColor" />
            Resumen
          </a>
          <a routerLink="/admin/products" routerLinkActive="active" (click)="toggleMobileMenu()" class="drawer-link">
            <app-icon name="package" size="18" color="currentColor" />
            Productos
          </a>
          <a routerLink="/admin/orders" routerLinkActive="active" (click)="toggleMobileMenu()" class="drawer-link">
            <app-icon name="clipboard" size="18" color="currentColor" />
            Pedidos
          </a>
          <a routerLink="/admin/users" routerLinkActive="active" (click)="toggleMobileMenu()" class="drawer-link">
            <app-icon name="users" size="18" color="currentColor" />
            Usuarios
          </a>
        </nav>

        <div class="drawer-footer">
          <a routerLink="/inventory" class="btn-return">
            <app-icon name="package" size="16" color="currentColor" />
            Abrir Inventario
          </a>
          <a routerLink="/cashier" class="btn-return">
            <app-icon name="shopping-cart" size="16" color="currentColor" />
            Abrir Punto de Venta
          </a>
          <a routerLink="/home" class="btn-return">
            <app-icon name="store" size="16" color="currentColor" />
            Volver a Tienda
          </a>
          <button (click)="authService.logout()" class="btn-logout">
            <app-icon name="log-out" size="16" color="currentColor" />
            Cerrar Sesión
          </button>
        </div>
      </div>

      <!-- Main Content Container -->
      <main class="main-content">
        <router-outlet></router-outlet>
      </main>
    </div>
  `,
  styleUrl: './admin-layout.css',
})
export class AdminLayout {
  protected authService = inject(AuthService);
  isMobileMenuOpen = signal<boolean>(false);

  toggleMobileMenu(): void {
    this.isMobileMenuOpen.set(!this.isMobileMenuOpen());
  }
}
