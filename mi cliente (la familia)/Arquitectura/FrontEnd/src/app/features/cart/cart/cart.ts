import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CartService } from '../../../core/services/cart.service';
import { MxnCurrencyPipe } from '../../../shared/pipes/currency.pipe';
import { IconComponent } from '../../../shared/components/icon/icon';

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [RouterLink, FormsModule, MxnCurrencyPipe, IconComponent],
  template: `
    <div class="cart-page" id="cart-page">
      
      <!-- Custom Header matching mockup -->
      <div class="cart-header">
        <div class="header-title">
          <span>La Familia</span>
          <h1>Mi carrito</h1>
        </div>
        <a routerLink="/home/search" class="search-icon-btn" aria-label="Buscar productos">
          <app-icon name="search" size="24" />
        </a>
      </div>

      @if (cartService.items().length === 0) {
        <div class="empty-cart-state" id="cart-empty">
          <div class="illustration-container">
            <div class="glow-ring-outer"></div>
            <div class="glow-ring-inner"></div>
            
            <div class="main-cart-icon-wrapper">
              <app-icon name="shopping-cart" size="64" color="var(--primary)" />
            </div>

            <!-- Floating food item bubbles -->
            <div class="floating-bubble bubble-1">
              <app-icon name="leaf" size="14" color="var(--primary)" />
            </div>
            <div class="floating-bubble bubble-2">
              <app-icon name="cookie" size="14" color="var(--accent)" />
            </div>
            <div class="floating-bubble bubble-3">
              <app-icon name="bread" size="14" color="var(--secondary)" />
            </div>
            <div class="floating-bubble bubble-4">
              <app-icon name="cup-soda" size="14" color="var(--primary)" />
            </div>
          </div>
          
          <h3 class="empty-title">¡Tu carrito está muy ligero!</h3>
          <p class="empty-subtitle">Descubre productos frescos, deliciosos y locales listos para llenar tu mesa familiar.</p>
          
          <a routerLink="/home" class="btn-explore-premium">
            <span>Explorar la Tienda</span>
            <app-icon name="arrow-right" size="16" color="#ffffff" />
          </a>
        </div>
      } @else {
        <div class="cart-items">
          @for (item of cartService.items(); track item.id) {
            <div class="cart-item-wrapper">
              <div class="cart-item" [id]="'cart-item-' + item.id">
                
                <img [src]="item.product.images[0] || 'https://media.istockphoto.com/id/185284489/photo/orange.jpg?s=612x612&w=0&k=20&c=m4EXniUNMHTOUDOZfm2h-dD01M8l3Q00r6T8j7Bf3G0='" alt="Product" class="item-img" referrerpolicy="no-referrer" />
                
                <div class="item-info">
                  <h3>{{ item.product.name }}</h3>
                  <span class="item-subtitle">{{ item.selectedVariant ? item.selectedVariant.value : 'Fresco' }}</span>
                  <span class="item-price">{{ item.product.price | mxnCurrency }}<small>/{{ item.selectedVariant?.value || 'kg' }}</small></span>
                </div>
                
                <div class="item-qty-vertical">
                  <button (click)="cartService.updateQuantity(item.id, item.quantity + 1)">+</button>
                  <div class="qty-badge">{{ item.quantity < 10 ? '0' + item.quantity : item.quantity }}</div>
                  <button (click)="cartService.updateQuantity(item.id, item.quantity - 1)" [disabled]="item.quantity <= 1">−</button>
                </div>

                <button class="delete-btn" (click)="cartService.removeItem(item.id)" [attr.aria-label]="'Eliminar ' + item.product.name">
                  <app-icon name="trash" size="20" />
                </button>

              </div>
            </div>
          }
        </div>

        <div class="cart-bottom-area">
          <div class="total-text">
            Total a pagar <span>{{ cartService.cart().total | mxnCurrency }}</span>
          </div>
          <a routerLink="/checkout/identify" class="checkout-btn" id="checkout-btn">
            Proceder al pago
          </a>
        </div>
      }
    </div>
  `,
  styleUrl: './cart.css',
})
export class Cart {
  protected cartService = inject(CartService);
}
