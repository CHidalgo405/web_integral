import { Component, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Location } from '@angular/common';
import { ProductService } from '../../../core/services/product.service';
import { CartService } from '../../../core/services/cart.service';
import { MxnCurrencyPipe } from '../../../shared/pipes/currency.pipe';
import { Product, ProductVariant } from '../../../core/models/product.model';
import { IconComponent } from '../../../shared/components/icon/icon';

@Component({
  selector: 'app-product-detail',
  standalone: true,
  imports: [MxnCurrencyPipe, IconComponent],
  template: `
    @if (product) {
      <div class="product-detail-page">
        <!-- Hero Section -->
        <div class="product-hero-section">
          <button class="back-btn" (click)="goBack()" style="display: flex; align-items: center; justify-content: center;">
            <app-icon name="arrow-left" size="24" />
          </button>

          <button class="fav-detail-toggle-btn" (click)="toggleFav()" style="display: flex; align-items: center; justify-content: center;" title="Favorito">
            <app-icon name="heart" size="20" [fill]="isFav() ? 'currentColor' : 'none'" [color]="isFav() ? 'var(--danger)' : 'var(--text-primary)'" />
          </button>

          <img [src]="product.images[0] || 'assets/images/productos/placeholder.png'" [alt]="product.name" class="hero-image" />
        </div>

        <!-- Content Area -->
        <div class="product-content">
          
          <div class="title-row">
            <div class="title-info">
              <h1>{{ product.name }}</h1>
              <span class="stock-status">
                {{ product.inStock ? 'Disponible en inventario' : 'Agotado' }}
              </span>
            </div>
            
            @if (product.inStock) {
              <div class="qty-selector">
                <button (click)="changeQty(-1)" [disabled]="quantity() <= 1">−</button>
                <span>{{ quantity() }} {{ product.variants?.[0]?.value || 'kg' }}</span>
                <button (click)="changeQty(1)" [disabled]="quantity() >= product.stockQuantity">+</button>
              </div>
            }
          </div>

          <div class="section-block">
            <h3>Descripción del Producto</h3>
            <p>{{ product.description || 'Disfruta de nuestros productos frescos y de alta calidad. Cosechados y seleccionados cuidadosamente para brindarte el mejor sabor y nutrición para ti y tu familia.' }}</p>
          </div>

          <div class="section-block">
            <h3>Reseñas del Producto</h3>
            <div class="review-card">
              <div class="review-header">
                <img src="https://ui-avatars.com/api/?name=Victor+Flexin&background=random&color=fff" alt="User" class="reviewer-avatar">
                <div class="reviewer-info">
                  <h4>Victor Flexin</h4>
                  <div class="stars" style="display: flex; align-items: center; gap: 2px;">
                    @for (idx of [0, 1, 2, 3, 4]; track idx) {
                      <app-icon name="star" size="14" fill="currentColor" color="var(--warning)" />
                    }
                  </div>
                </div>
                <span class="review-date">18 Sep, 2023</span>
              </div>
              <p class="review-comment">La calidad de este producto es excepcionalmente única. La próxima vez quiero comprarlo de nuevo.</p>
            </div>
          </div>

        </div> <!-- end product content -->

        <!-- Bottom Action Bar -->
        <div class="bottom-action-bar">
          <div class="price-info">
            <span class="price-amount">{{ getEffectivePrice() | mxnCurrency }}</span>
            <span class="price-unit">/ {{ product.variants?.[0]?.value || 'kg' }}</span>
          </div>
          <button class="add-to-cart-btn" (click)="addToCart()" [disabled]="!product.inStock">
            Agregar al carrito
          </button>
        </div>
      </div>
    }
  `,
  styleUrl: './product-detail.css',
})
export class ProductDetail implements OnInit {
  protected productService = inject(ProductService);
  private cartService = inject(CartService);
  private route = inject(ActivatedRoute);
  private location = inject(Location);

  product: Product | undefined;
  selectedVariant = signal<ProductVariant | undefined>(undefined);
  quantity = signal(1);

  ngOnInit(): void {
    this.route.params.subscribe(p => {
      this.product = this.productService.getProductById(p['id']);
    });
  }

  getEffectivePrice(): number {
    const base = this.product?.price ?? 0;
    return base + (this.selectedVariant()?.priceModifier ?? 0);
  }

  changeQty(delta: number): void {
    this.quantity.update(q => Math.max(1, q + delta));
  }

  addToCart(): void {
    if (this.product) this.cartService.addItem(this.product, this.quantity(), this.selectedVariant());
  }

  goBack(): void {
    this.location.back();
  }

  toggleFav(): void {
    if (this.product) {
      this.productService.toggleFavorite(this.product.id);
    }
  }

  isFav(): boolean {
    return this.product ? this.productService.isFavorite(this.product.id) : false;
  }
}
