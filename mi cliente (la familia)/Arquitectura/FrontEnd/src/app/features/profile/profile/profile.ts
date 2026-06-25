import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { OrderService } from '../../../core/services/order.service';
import { UserService } from '../../../core/services/user.service';
import { IconComponent } from '../../../shared/components/icon/icon';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [RouterLink, IconComponent],
  template: `
    <div class="profile-layout" id="profile-page">
      <!-- Green Header Background -->
      <div class="profile-header-bg">
        <div class="decor-circle decor-1"></div>
        <div class="decor-circle decor-2"></div>
        
        <div class="header-content">
          <div class="avatar-container">
            <div class="avatar-ring"></div>
            <div class="avatar-initials">
              {{ authService.user()?.firstName?.charAt(0) }}{{ authService.user()?.lastName?.charAt(0) }}
            </div>
            <div class="vip-badge">
              <app-icon name="gem" size="12" fill="currentColor" color="#FFFFFF" />
              <span>VIP Familia</span>
            </div>
          </div>
          <h2 class="user-name">{{ authService.user()?.firstName }} {{ authService.user()?.lastName }}</h2>
          <p class="user-email">{{ authService.user()?.email }}</p>
        </div>
        
        <!-- Curved bottom wave using SVG -->
        <svg class="header-wave" viewBox="0 0 1440 120" preserveAspectRatio="none">
          <path d="M0,0 C480,120 960,120 1440,0 L1440,120 L0,120 Z" fill="var(--bg)"></path>
        </svg>
      </div>

      <div class="profile-content">
        <!-- Floating 3-Column Stats Card -->
        <div class="stats-card">
          <div class="stat-item">
            <div class="stat-icon-wrapper orders">
              <app-icon name="clipboard" size="14" />
            </div>
            <span class="stat-value">{{ orderService.getOrders().length }}</span>
            <span class="stat-label">Pedidos</span>
          </div>
          
          <div class="stat-divider"></div>
          
          <div class="stat-item">
            <div class="stat-icon-wrapper addresses">
              <app-icon name="map-pin" size="14" />
            </div>
            <span class="stat-value">{{ userService.getAddresses().length }}</span>
            <span class="stat-label">Direcciones</span>
          </div>

          <div class="stat-divider"></div>

          <div class="stat-item">
            <div class="stat-icon-wrapper payments">
              <app-icon name="credit-card" size="14" />
            </div>
            <span class="stat-value">{{ userService.getPaymentMethods().length }}</span>
            <span class="stat-label">Pagos</span>
          </div>
        </div>

        <!-- Group 1: Mi Actividad -->
        <div class="menu-section-card">
          <h4 class="menu-section-title">Mi Actividad</h4>
          
          <a routerLink="/orders/history" class="menu-item-row" id="menu-orders">
            <div class="menu-icon-bg">
              <app-icon name="clipboard" size="18" />
            </div>
            <div class="menu-item-text">
              <span class="title">Mis Pedidos</span>
              <span class="subtitle">Historial y rastreo de envíos</span>
            </div>
            <app-icon name="chevron-right" size="16" class="menu-arrow-icon" />
          </a>
          
          <div class="menu-row-divider"></div>
          
          <a routerLink="/profile/addresses" class="menu-item-row" id="menu-addresses">
            <div class="menu-icon-bg">
              <app-icon name="map-pin" size="18" />
            </div>
            <div class="menu-item-text">
              <span class="title">Mis Direcciones</span>
              <span class="subtitle">Tus puntos de entrega guardados</span>
            </div>
            <app-icon name="chevron-right" size="16" class="menu-arrow-icon" />
          </a>
          
          <div class="menu-row-divider"></div>
          
          <a routerLink="/profile/payment-methods" class="menu-item-row" id="menu-payments">
            <div class="menu-icon-bg">
              <app-icon name="credit-card" size="18" />
            </div>
            <div class="menu-item-text">
              <span class="title">Métodos de Pago</span>
              <span class="subtitle">Administra tus tarjetas y efectivo</span>
            </div>
            <app-icon name="chevron-right" size="16" class="menu-arrow-icon" />
          </a>
        </div>

        <!-- Group 2: Soporte e Información -->
        <div class="menu-section-card">
          <h4 class="menu-section-title">Soporte e Información</h4>
          
          <a routerLink="/profile/help" class="menu-item-row" id="menu-help">
            <div class="menu-icon-bg">
              <app-icon name="help-circle" size="18" />
            </div>
            <div class="menu-item-text">
              <span class="title">Centro de Ayuda</span>
              <span class="subtitle">Preguntas frecuentes y soporte</span>
            </div>
            <app-icon name="chevron-right" size="16" class="menu-arrow-icon" />
          </a>
          
          <div class="menu-row-divider"></div>
          
          <a routerLink="/profile/terms" class="menu-item-row" id="menu-terms">
            <div class="menu-icon-bg">
              <app-icon name="file-text" size="18" />
            </div>
            <div class="menu-item-text">
              <span class="title">Términos y Privacidad</span>
              <span class="subtitle">Condiciones de servicio y aviso legal</span>
            </div>
            <app-icon name="chevron-right" size="16" class="menu-arrow-icon" />
          </a>

          @if (authService.user()?.role === 'admin') {
            <div class="menu-row-divider"></div>
            <a routerLink="/admin" class="menu-item-row admin-row" id="menu-admin">
              <div class="menu-icon-bg admin-badge-bg">
                <app-icon name="shield" size="18" />
              </div>
              <div class="menu-item-text">
                <span class="title admin-title">Panel de Administración</span>
                <span class="subtitle">Configuración global y órdenes</span>
              </div>
              <app-icon name="chevron-right" size="16" class="menu-arrow-icon admin-arrow" />
            </a>
          }
        </div>

        <!-- Logout Button -->
        <button class="logout-action-btn" (click)="authService.logout()" id="logout-btn">
          <app-icon name="log-out" size="16" color="var(--danger)" />
          <span>Cerrar Sesión</span>
        </button>
      </div>
    </div>
  `,
  styles: [`
    .profile-layout {
      min-height: 100dvh;
      background-color: var(--bg);
      padding-bottom: 90px;
      animation: fadeIn 0.4s ease-out;
    }

    /* Header Background */
    .profile-header-bg {
      position: relative;
      background: linear-gradient(135deg, var(--primary) 0%, var(--primary-dark) 100%);
      padding: 50px 24px 70px;
      display: flex;
      justify-content: center;
      align-items: center;
      overflow: hidden;
    }

    .decor-circle {
      position: absolute;
      border-radius: 50%;
      background: rgba(255, 255, 255, 0.04);
      pointer-events: none;
    }
    .decor-1 { width: 180px; height: 180px; top: -40px; right: -40px; }
    .decor-2 { width: 260px; height: 260px; bottom: -80px; left: -80px; }

    .header-wave {
      position: absolute;
      bottom: -1px;
      left: 0;
      width: 100%;
      height: 35px;
      z-index: 1;
    }

    .header-content {
      position: relative;
      z-index: 2;
      text-align: center;
      display: flex;
      flex-direction: column;
      align-items: center;
      width: 100%;
    }

    /* Avatar styling */
    .avatar-container {
      position: relative;
      margin-bottom: 14px;
      display: inline-flex;
      justify-content: center;
      align-items: center;
    }
    .avatar-ring {
      position: absolute;
      width: 90px;
      height: 90px;
      border-radius: 50%;
      border: 2px dashed rgba(255,255,255,0.4);
      animation: spinRing 20s linear infinite;
    }
    .avatar-initials {
      width: 78px;
      height: 78px;
      border-radius: 50%;
      background-color: var(--surface);
      color: var(--primary);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.85rem;
      font-weight: 800;
      font-family: var(--font-heading);
      box-shadow: 0 8px 20px rgba(0,0,0,0.15);
      border: 3px solid rgba(255,255,255,0.8);
      z-index: 2;
    }

    /* Gold/Lime VIP badge */
    .vip-badge {
      position: absolute;
      bottom: -8px;
      left: 50%;
      transform: translateX(-50%);
      background: linear-gradient(135deg, #FFD700 0%, #FFA500 100%);
      color: #fff;
      font-size: 0.65rem;
      font-weight: 900;
      padding: 4px 14px;
      border-radius: 20px;
      white-space: nowrap;
      box-shadow: 0 4px 10px rgba(255, 165, 0, 0.3);
      border: 2px solid var(--primary-dark);
      display: flex;
      align-items: center;
      gap: 4px;
      z-index: 3;
    }
    .vip-badge span {
      text-transform: uppercase;
      letter-spacing: 0.5px;
      text-shadow: 0 1px 1px rgba(0,0,0,0.1);
    }

    .user-name {
      font-size: 1.35rem;
      font-weight: 800;
      color: #fff;
      margin: 0 0 2px;
      font-family: var(--font-heading);
      text-shadow: 0 2px 4px rgba(0,0,0,0.15);
    }
    .user-email {
      font-size: 0.8rem;
      color: rgba(255, 255, 255, 0.7);
      margin: 0;
      font-weight: 600;
    }

    .profile-content {
      padding: 0 16px;
      position: relative;
      z-index: 3;
      margin-top: -35px; /* Overlap with header wave */
      max-width: 500px;
      margin-left: auto;
      margin-right: auto;
    }

    /* Premium 3-column stats panel */
    .stats-card {
      background: var(--surface);
      border-radius: 24px;
      padding: 18px 12px;
      display: flex;
      align-items: center;
      justify-content: space-around;
      box-shadow: 0 8px 24px rgba(0,0,0,0.06);
      margin-bottom: 20px;
      border: 1px solid var(--border);
    }

    .stat-item {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 4px;
      flex: 1;
    }
    .stat-icon-wrapper {
      width: 28px;
      height: 28px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      margin-bottom: 2px;
    }
    .stat-icon-wrapper ::ng-deep svg {
      stroke: currentColor;
    }
    .stat-icon-wrapper.orders { background: var(--primary-alpha); color: var(--primary); }
    .stat-icon-wrapper.addresses { background: rgba(125, 175, 50, 0.12); color: var(--accent); }
    .stat-icon-wrapper.payments { background: rgba(225, 75, 50, 0.08); color: var(--danger); }

    .stat-value {
      font-size: 1.25rem;
      font-weight: 800;
      color: var(--text-primary);
      font-family: var(--font-heading);
      line-height: 1.1;
    }

    .stat-label {
      font-size: 0.65rem;
      font-weight: 800;
      color: var(--text-secondary);
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .stat-divider {
      width: 1px;
      height: 44px;
      background-color: var(--border);
    }

    /* Group Menu Sections */
    .menu-section-card {
      background: var(--surface);
      border-radius: 24px;
      padding: 16px 0 8px;
      box-shadow: 0 4px 16px rgba(0,0,0,0.03);
      margin-bottom: 18px;
      border: 1px solid var(--border);
    }
    
    .menu-section-title {
      font-size: 0.75rem;
      font-weight: 900;
      color: var(--text-secondary);
      text-transform: uppercase;
      letter-spacing: 1px;
      padding: 0 20px 10px;
      margin: 0;
      border-bottom: 1px solid var(--border);
    }

    /* Menu Item Rows */
    .menu-item-row {
      display: flex;
      align-items: center;
      padding: 14px 20px;
      text-decoration: none;
      color: var(--text-primary);
      transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
    }
    .menu-item-row:hover {
      background-color: var(--primary-alpha);
    }

    .menu-icon-bg {
      width: 36px;
      height: 36px;
      border-radius: 10px;
      background-color: var(--primary-alpha);
      color: var(--primary);
      display: flex;
      align-items: center;
      justify-content: center;
      margin-right: 14px;
      flex-shrink: 0;
      transition: all 0.2s;
    }
    .menu-item-row:hover .menu-icon-bg {
      background-color: var(--primary);
      color: #fff;
    }
    .menu-icon-bg app-icon {
      color: inherit;
    }
    .menu-icon-bg app-icon ::ng-deep svg {
      stroke: currentColor;
    }

    .menu-item-text {
      flex: 1;
      display: flex;
      flex-direction: column;
      gap: 2px;
      overflow: hidden;
    }
    .menu-item-text .title {
      font-size: 0.9rem;
      font-weight: 700;
      color: var(--text-primary);
    }
    .menu-item-text .subtitle {
      font-size: 0.75rem;
      color: var(--text-secondary);
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .menu-arrow-icon {
      color: var(--text-muted);
      transition: transform 0.25s;
    }
    .menu-arrow-icon ::ng-deep svg {
      stroke: currentColor;
    }
    .menu-item-row:hover .menu-arrow-icon {
      transform: translateX(4px);
      color: var(--primary);
    }

    .menu-row-divider {
      height: 1px;
      background-color: var(--border);
      margin: 0 20px;
    }

    /* Admin row special styling */
    .admin-row {
      background-color: rgba(28, 84, 66, 0.03);
    }
    .admin-badge-bg {
      background-color: var(--primary-alpha);
    }
    .admin-title {
      color: var(--primary) !important;
      font-weight: 800 !important;
    }
    .admin-arrow {
      color: var(--primary) !important;
    }

    /* Log Out button style */
    .logout-action-btn {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 10px;
      width: 100%;
      padding: 14px;
      background: var(--surface);
      color: var(--danger);
      border: 1px solid var(--border);
      border-radius: 999px;
      font-weight: 800;
      font-size: 0.9rem;
      cursor: pointer;
      box-shadow: 0 4px 12px rgba(0,0,0,0.03);
      transition: all 0.2s;
      margin-top: 24px;
    }
    .logout-action-btn:hover {
      background: var(--danger-alpha);
      border-color: var(--danger);
      transform: translateY(-1px);
    }

    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(10px); }
      to { opacity: 1; transform: translateY(0); }
    }
    @keyframes spinRing {
      from { transform: rotate(0deg); }
      to { transform: rotate(360deg); }
    }
  `],
})
export class Profile {
  protected authService = inject(AuthService);
  protected orderService = inject(OrderService);
  protected userService = inject(UserService);
}
