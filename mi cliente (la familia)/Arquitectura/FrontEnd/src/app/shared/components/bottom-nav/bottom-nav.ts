import { Component, inject } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { CartService } from '../../../core/services/cart.service';

@Component({
  selector: 'app-bottom-nav',
  standalone: true,
  imports: [RouterLink, RouterLinkActive],
  template: `
    <nav class="bottom-nav" id="bottom-nav">
      <a routerLink="/home" routerLinkActive="active" [routerLinkActiveOptions]="{exact: true}" id="nav-home" class="nav-item">
        <div class="nav-pill">
          <svg class="nav-icon" viewBox="0 0 24 24">
            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
            <polyline points="9 22 9 12 15 12 15 22"></polyline>
          </svg>
          <span class="nav-label">Inicio</span>
        </div>
      </a>
      
      <a routerLink="/home/categories" routerLinkActive="active" id="nav-categories" class="nav-item">
        <div class="nav-pill">
          <svg class="nav-icon" viewBox="0 0 24 24">
            <rect x="3" y="3" width="7" height="7" rx="1.5"></rect>
            <rect x="14" y="3" width="7" height="7" rx="1.5"></rect>
            <rect x="14" y="14" width="7" height="7" rx="1.5"></rect>
            <rect x="3" y="14" width="7" height="7" rx="1.5"></rect>
          </svg>
          <span class="nav-label">Categorías</span>
        </div>
      </a>

      <a routerLink="/cart" routerLinkActive="active" id="nav-cart" class="nav-item">
        <div class="nav-pill">
          <div class="cart-wrapper">
            <svg class="nav-icon" viewBox="0 0 24 24">
              <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path>
              <line x1="3" y1="6" x2="21" y2="6"></line>
              <path d="M16 10a4 4 0 0 1-8 0"></path>
            </svg>
            @if (cartService.itemCount() > 0) {
              <span class="cart-badge">{{ cartService.itemCount() }}</span>
            }
          </div>
          <span class="nav-label">Carrito</span>
        </div>
      </a>

      <a routerLink="/orders/history" routerLinkActive="active" id="nav-orders" class="nav-item">
        <div class="nav-pill">
          <svg class="nav-icon" viewBox="0 0 24 24">
            <path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2"></path>
            <rect x="9" y="3" width="6" height="4" rx="1" ry="1"></rect>
          </svg>
          <span class="nav-label">Pedidos</span>
        </div>
      </a>

      <a routerLink="/profile" routerLinkActive="active" id="nav-profile" class="nav-item">
        <div class="nav-pill">
          <svg class="nav-icon" viewBox="0 0 24 24">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
            <circle cx="12" cy="7" r="4"></circle>
          </svg>
          <span class="nav-label">Perfil</span>
        </div>
      </a>
    </nav>
  `,
  styles: [`
    .bottom-nav {
      position: fixed; bottom: 0; left: 0; right: 0;
      display: flex; justify-content: space-around; align-items: center;
      background: var(--surface);
      padding: 10px 16px env(safe-area-inset-bottom, 16px); 
      z-index: 100;
      box-shadow: 0 -8px 30px rgba(0, 0, 0, 0.08);
      border-radius: 32px 32px 0 0;
    }
    
    .nav-item {
      text-decoration: none; 
      color: var(--text-secondary);
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      display: flex;
      justify-content: center;
      flex: 1;
    }

    .nav-pill {
      display: flex;
      align-items: center;
      gap: 0;
      padding: 12px;
      border-radius: 9999px;
      transition: all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
      overflow: hidden;
    }

    .nav-label {
      font-weight: 700; 
      font-size: 0.95rem;
      max-width: 0;
      opacity: 0;
      transition: all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
      white-space: nowrap;
    }

    .nav-icon {
      width: 24px; height: 24px;
      stroke: currentColor;
      stroke-width: 2.2;
      stroke-linecap: round;
      stroke-linejoin: round;
      fill: none;
      flex-shrink: 0;
      transition: stroke 0.3s;
    }

    /* Active State */
    .nav-item.active {
      color: #fff;
    }

    .nav-item.active .nav-pill {
      background: var(--primary);
      padding: 12px 20px;
      gap: 10px;
    }

    .nav-item.active .nav-label {
      max-width: 120px;
      opacity: 1;
    }

    .nav-item.active .nav-icon {
      stroke-width: 2.5;
    }

    /* Cart Badge */
    .cart-wrapper { 
      position: relative; 
      display: flex; 
      align-items: center; 
      justify-content: center; 
    }

    .cart-badge {
      position: absolute; top: -6px; right: -8px;
      background: var(--secondary); color: #fff;
      font-size: 0.65rem; font-weight: 800;
      min-width: 18px; height: 18px; border-radius: 9px;
      display: flex; align-items: center; justify-content: center;
      border: 2px solid var(--surface);
      transition: border-color 0.4s;
    }

    .nav-item.active .cart-badge {
      border-color: var(--primary);
    }

    /* Desktop Hide */
    @media (min-width: 768px) {
      .bottom-nav {
        /* You might want to hide it or keep it depending on your desktop design */
        /* display: none; */
        max-width: 600px;
        margin: 0 auto;
        bottom: 24px;
        border-radius: 9999px;
      }
    }
  `],
})
export class BottomNav {
  protected cartService = inject(CartService);
}
