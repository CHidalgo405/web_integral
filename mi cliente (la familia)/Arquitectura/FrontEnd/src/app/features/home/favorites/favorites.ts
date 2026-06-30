import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ProductService } from '../../../core/services/product.service';
import { CartService } from '../../../core/services/cart.service';
import { MxnCurrencyPipe } from '../../../shared/pipes/currency.pipe';
import { Header } from '../../../shared/components/header/header';
import { IconComponent } from '../../../shared/components/icon/icon';
import { Product } from '../../../core/models/product.model';

@Component({
  selector: 'app-favorites',
  standalone: true,
  imports: [RouterLink, MxnCurrencyPipe, Header, IconComponent],
  template: `
    <app-header title="Mis Favoritos" [showBack]="true"></app-header>
    
    <div class="favorites-page" id="favorites-page">
      @if (productService.getFavoriteProducts().length === 0) {
        <div class="empty-favorites-state" id="favorites-empty">
          <div class="illustration-container">
            <div class="glow-ring-outer"></div>
            <div class="glow-ring-inner"></div>
            <div class="main-heart-icon-wrapper">
              <app-icon name="heart" size="48" fill="currentColor" color="var(--danger)" />
            </div>
          </div>
          
          <h3 class="empty-title">Sin favoritos guardados</h3>
          <p class="empty-subtitle">Agrega los productos que más te gustan con el botón de corazón para encontrarlos aquí fácilmente.</p>
          <a routerLink="/home" class="btn-explore-premium">
            <span>Explorar Productos</span>
            <app-icon name="arrow-right" size="16" color="#ffffff" />
          </a>
        </div>
      } @else {
        <div class="favorites-grid">
          @for (product of productService.getFavoriteProducts(); track product.id) {
            <div class="fav-product-card" [id]="'fav-' + product.id">
              
              <!-- Heart Toggle on Card -->
              <button class="card-heart-btn" (click)="productService.toggleFavorite(product.id)" title="Quitar de favoritos">
                <app-icon name="heart" size="16" fill="currentColor" color="var(--danger)" />
              </button>

              <a [routerLink]="['/product', product.id]" class="card-link">
                <div class="card-image-sec" style="overflow: hidden;">
                  <img [src]="product.images[0] || 'assets/images/productos/placeholder.png'" [alt]="product.name" style="width:100%;height:100%;object-fit:cover;" />
                  @if (!product.inStock) {
                    <span class="out-badge">Agotado</span>
                  }
                </div>
                
                <div class="card-info-sec">
                  <h3>{{ product.name }}</h3>
                  
                  <div class="rating-row">
                    <app-icon name="star" size="12" fill="currentColor" color="var(--warning)" />
                    <span>{{ product.rating }}</span>
                  </div>
                  
                  <div class="price-row">
                    <span class="price-amount">{{ product.price | mxnCurrency }}</span>
                  </div>
                </div>
              </a>

              <!-- Bottom add cart action -->
              @if (product.inStock) {
                <button class="add-to-cart-action-btn" (click)="cartService.addItem(product)" title="Agregar al carrito">
                  <app-icon name="shopping-cart" size="16" color="#ffffff" />
                  <span>Agregar</span>
                </button>
              } @else {
                <button class="add-to-cart-action-btn disabled" disabled>
                  <span>Agotado</span>
                </button>
              }

            </div>
          }
        </div>
      }
    </div>
  `,
  styles: [`
    .favorites-page {
      padding: 16px;
      padding-bottom: 80px;
      background-color: var(--bg);
      min-height: 100dvh;
    }

    /* Grid Layout */
    .favorites-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 12px;
      animation: fadeIn 0.4s ease-out;
    }

    /* Product Card */
    .fav-product-card {
      background: var(--surface-raised);
      border-radius: 20px;
      overflow: hidden;
      position: relative;
      border: 1px solid var(--border);
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
      box-shadow: 0 4px 12px rgba(0,0,0,0.03);
    }
    .fav-product-card:hover {
      transform: translateY(-2px);
      box-shadow: 0 8px 20px rgba(0,0,0,0.08);
      border-color: var(--text-muted);
    }

    .card-link {
      text-decoration: none;
      color: inherit;
      display: flex;
      flex-direction: column;
      flex: 1;
    }

    /* Top Card Heart Button */
    .card-heart-btn {
      position: absolute;
      top: 8px;
      right: 8px;
      width: 28px;
      height: 28px;
      border-radius: 50%;
      background: var(--surface);
      border: 1px solid var(--border);
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      z-index: 10;
      box-shadow: 0 2px 8px rgba(0,0,0,0.05);
      transition: transform 0.2s;
    }
    .card-heart-btn:hover {
      transform: scale(1.1);
    }

    /* Image section */
    .card-image-sec {
      height: 100px;
      background: var(--surface);
      display: flex;
      align-items: center;
      justify-content: center;
      position: relative;
      border-bottom: 1px solid var(--border);
    }
    .category-icon-bg {
      font-size: 2.2rem;
    }
    .out-badge {
      position: absolute;
      top: 8px;
      left: 8px;
      background: var(--danger);
      color: #fff;
      font-size: 0.6rem;
      font-weight: 700;
      padding: 3px 8px;
      border-radius: 6px;
    }

    /* Info section */
    .card-info-sec {
      padding: 10px 12px 12px;
      display: flex;
      flex-direction: column;
      gap: 4px;
    }
    .card-info-sec h3 {
      font-size: 0.8rem;
      font-weight: 700;
      margin: 0;
      color: var(--text-primary);
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    
    .rating-row {
      display: flex;
      align-items: center;
      gap: 4px;
      font-size: 0.7rem;
      color: var(--text-muted);
    }
    .rating-row span {
      font-weight: 700;
    }
    
    .price-row {
      margin-top: 2px;
    }
    .price-amount {
      font-size: 0.95rem;
      font-weight: 800;
      color: var(--primary);
    }

    /* Bottom add-to-cart action */
    .add-to-cart-action-btn {
      width: 100%;
      border: none;
      outline: none;
      padding: 10px;
      background: var(--primary);
      color: #ffffff;
      font-weight: 800;
      font-size: 0.8rem;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 6px;
      transition: background 0.2s;
    }
    .add-to-cart-action-btn:hover {
      background: var(--primary-dark);
    }
    .add-to-cart-action-btn.disabled {
      background: var(--border);
      color: var(--text-muted);
      cursor: not-allowed;
    }

    /* Empty state */
    .empty-favorites-state {
      text-align: center;
      padding: 60px 24px;
      flex: 1;
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      animation: fadeIn 0.4s ease-out;
    }

    .illustration-container {
      position: relative;
      width: 160px;
      height: 160px;
      display: flex;
      align-items: center;
      justify-content: center;
      margin-bottom: 24px;
    }

    .glow-ring-outer {
      position: absolute;
      width: 130px;
      height: 130px;
      border-radius: 50%;
      background: var(--danger-alpha);
      opacity: 0.4;
      animation: pulseHeartGlow 3s ease-in-out infinite;
    }

    .glow-ring-inner {
      position: absolute;
      width: 90px;
      height: 90px;
      border-radius: 50%;
      background: var(--danger-alpha);
      opacity: 0.7;
    }

    .main-heart-icon-wrapper {
      position: relative;
      width: 70px;
      height: 70px;
      border-radius: 50%;
      background: var(--surface);
      box-shadow: 0 8px 20px rgba(225, 75, 50, 0.12);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 2;
      border: 1px solid var(--border);
    }

    .empty-title {
      font-family: var(--font-heading);
      color: var(--text-primary);
      font-size: 1.3rem;
      font-weight: 800;
      margin: 0 0 8px;
    }

    .empty-subtitle {
      color: var(--text-secondary);
      font-size: 0.8rem;
      line-height: 1.45;
      max-width: 300px;
      margin: 0 0 24px;
    }

    .btn-explore-premium {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      padding: 12px 24px;
      background: linear-gradient(135deg, var(--primary) 0%, var(--primary-dark) 100%);
      color: #fff;
      border-radius: 9999px;
      text-decoration: none;
      font-weight: 800;
      font-size: 0.9rem;
      box-shadow: 0 6px 20px rgba(28, 84, 66, 0.25);
      transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
    }

    .btn-explore-premium:hover {
      transform: translateY(-2px);
      box-shadow: 0 8px 24px rgba(28, 84, 66, 0.35);
    }

    .btn-explore-premium app-icon {
      transition: transform 0.2s;
    }

    .btn-explore-premium:hover app-icon {
      transform: translateX(4px);
    }

    /* Animations */
    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(10px); }
      to { opacity: 1; transform: translateY(0); }
    }

    @keyframes pulseHeartGlow {
      0% { transform: scale(0.95); opacity: 0.3; }
      50% { transform: scale(1.15); opacity: 0.5; }
      100% { transform: scale(0.95); opacity: 0.3; }
    }

    @media (min-width: 768px) {
      .favorites-grid {
        grid-template-columns: repeat(4, 1fr);
        gap: 20px;
      }
    }
  `],
})
export class Favorites {
  protected productService = inject(ProductService);
  protected cartService = inject(CartService);

  getCategoryIcon(categoryId: string): string {
    return this.productService.getCategories().find(c => c.id === categoryId)?.icon ?? 'package';
  }
}

