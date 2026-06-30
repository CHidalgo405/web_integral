import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ProductService } from '../../../core/services/product.service';
import { CartService } from '../../../core/services/cart.service';
import { AuthService } from '../../../core/services/auth.service';
import { MxnCurrencyPipe } from '../../../shared/pipes/currency.pipe';
import { Product } from '../../../core/models/product.model';
import { IconComponent } from '../../../shared/components/icon/icon';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [RouterLink, MxnCurrencyPipe, IconComponent],
  template: `
    <div class="home-page" id="home-page">
      
      <!-- Premium Green Top Section -->
      <div class="top-section">
        
        <div class="header-row">
          <div class="location-info">
            <span class="loc-icon"><app-icon name="map-pin" size="16" /></span>
            <div class="loc-text">
              <p>Tu Ubicación</p>
              <h4>Ciudad de México, MX <span class="dropdown-icon">⋁</span></h4>
            </div>
          </div>
          <div class="header-actions">
            <a routerLink="/home/notifications" class="action-btn">
              <span class="bell-icon"><app-icon name="bell" size="20" /></span>
              <span class="badge"></span>
            </a>
            <a routerLink="/profile" class="user-avatar">
              {{ authService.user()?.firstName?.charAt(0) || 'U' }}
            </a>
          </div>
        </div>

        <a routerLink="/home/search" class="search-bar" id="home-search-btn">
          <span class="search-icon"><app-icon name="search" size="18" /></span>
          <span class="search-placeholder">Busca un producto...</span>
        </a>

        <div class="hero-banner">
          <div class="hero-content">
            <h2>¡TU SOLUCIÓN,<br>A UN TOQUE!</h2>
            <p>Servicio rápido, fresco and confiable en la puerta de tu hogar.</p>
            <a routerLink="/home/categories" class="hero-btn">Explorar</a>
          </div>
          <div class="hero-image">
            <div class="hero-emoji"><app-icon name="store" size="48" color="var(--primary)" /></div>
          </div>
        </div>

      </div>

      <!-- Main Content Area -->
      <div class="home-content">
        <section class="section">
          <div class="section-header">
            <h2>Categorías</h2>
            <a routerLink="/home/categories" class="see-all">Ver todas →</a>
          </div>
          <div class="categories-scroll">
            @for (cat of productService.getCategories().slice(0, 6); track cat.id) {
              <a [routerLink]="['/home/categories', cat.id]" class="category-chip" [id]="'cat-' + cat.id">
                <span class="cat-icon"><app-icon [name]="cat.icon" size="20" /></span>
                <span class="cat-name">{{ cat.name }}</span>
              </a>
            }
          </div>
        </section>

        <section class="section">
          <div class="section-header">
            <h2>Productos Populares</h2>
          </div>
          <div class="products-grid">
            @for (product of productService.getProducts(); track product.id) {
              <div class="product-card" [id]="'product-' + product.id">
                <a [routerLink]="['/product', product.id]" class="product-link">
                  <div class="product-image" style="overflow: hidden;">
                    <img [src]="product.images[0] || 'assets/images/productos/placeholder.png'" [alt]="product.name" style="width:100%;height:100%;object-fit:cover;display:block;" />
                    @if (product.originalPrice) {
                      <span class="discount-badge">-{{ getDiscount(product) }}%</span>
                    }
                    @if (!product.inStock) {
                      <span class="out-badge">Agotado</span>
                    }
                  </div>
                  <div class="product-info">
                    <h3>{{ product.name }}</h3>
                    <div class="product-rating" style="display: flex; align-items: center; gap: 4px;">
                      <app-icon name="star" size="14" fill="currentColor" color="var(--warning)" />
                      <span>{{ product.rating }} ({{ product.reviewCount }})</span>
                    </div>
                    <div class="product-price">
                      <span class="price">{{ product.price | mxnCurrency }}</span>
                      @if (product.originalPrice) {
                        <span class="original-price">{{ product.originalPrice | mxnCurrency }}</span>
                      }
                    </div>
                  </div>
                </a>
                
                <button class="fav-toggle-btn" (click)="toggleFav(product.id, $event)" title="Favorito">
                  <app-icon name="heart" size="16" [fill]="isFav(product.id) ? 'currentColor' : 'none'" [color]="isFav(product.id) ? 'var(--danger)' : 'var(--text-muted)'" />
                </button>

                @if (product.inStock) {
                  <button class="add-cart-btn" (click)="addToCart(product)" [id]="'add-cart-' + product.id">+</button>
                }
              </div>
            }
          </div>
        </section>
      </div>
    </div>
  `,
  styleUrl: './home.css',
})
export class Home {
  protected productService = inject(ProductService);
  protected authService = inject(AuthService);
  private cartService = inject(CartService);

  getCategoryIcon(categoryId: string): string {
    return this.productService.getCategories().find(c => c.id === categoryId)?.icon ?? 'package';
  }

  getDiscount(product: Product): number {
    if (!product.originalPrice) return 0;
    return Math.round((1 - product.price / product.originalPrice) * 100);
  }

  addToCart(product: Product): void {
    this.cartService.addItem(product);
  }

  toggleFav(productId: string, event: Event): void {
    event.preventDefault();
    event.stopPropagation();
    this.productService.toggleFavorite(productId);
  }

  isFav(productId: string): boolean {
    return this.productService.isFavorite(productId);
  }
}
