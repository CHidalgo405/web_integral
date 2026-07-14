import { ChangeDetectorRef, Component, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { Location } from '@angular/common';
import { ProductService } from '../../../core/services/product.service';
import { CartService } from '../../../core/services/cart.service';
import { MxnCurrencyPipe } from '../../../shared/pipes/currency.pipe';
import { Product, ProductReview, ProductVariant } from '../../../core/models/product.model';
import { IconComponent } from '../../../shared/components/icon/icon';

@Component({
  selector: 'app-product-detail',
  standalone: true,
  imports: [RouterLink, MxnCurrencyPipe, IconComponent],
  template: `
    @if (product) {
      <div class="product-detail-page">

        <!-- Hero / Imagen principal -->
        <div class="product-hero-section">
          <button class="back-btn" (click)="goBack()" style="display: flex; align-items: center; justify-content: center;">
            <app-icon name="arrow-left" size="24" />
          </button>

          <button class="fav-detail-toggle-btn" (click)="toggleFav()" style="display: flex; align-items: center; justify-content: center;" title="Favorito">
            <app-icon name="heart" size="20" [fill]="isFav() ? 'currentColor' : 'none'" [color]="isFav() ? 'var(--danger)' : 'var(--text-primary)'" />
          </button>

          @if (product.images.length > 1) {
            <a [routerLink]="['/product', product.id, 'gallery']" class="gallery-link-btn" title="Ver galería">
              <app-icon name="camera" size="18" />
            </a>
          }

          <img
            [src]="product.images[activeImageIndex()] || 'assets/images/productos/placeholder.png'"
            [alt]="product.name"
            class="hero-image"
          />

          @if (product.images.length > 1) {
            <div class="gallery-dots">
              @for (img of product.images; track $index) {
                <button
                  class="dot"
                  [class.active]="activeImageIndex() === $index"
                  (click)="activeImageIndex.set($index)"
                  [attr.aria-label]="'Imagen ' + ($index + 1)"
                ></button>
              }
            </div>
          }
        </div>

        <!-- Contenido -->
        <div class="product-content">

          <!-- Nombre, stock y cantidad -->
          <div class="title-row">
            <div class="title-info">
              <h1>{{ product.name }}</h1>
              <span class="stock-status" [style.color]="product.inStock ? 'var(--success)' : 'var(--danger)'">
                {{ product.inStock ? '● Disponible en inventario' : '● Agotado' }}
              </span>
            </div>
            @if (product.inStock) {
              <div class="qty-selector">
                <button (click)="changeQty(-1)" [disabled]="quantity() <= 1">−</button>
                <span>{{ quantity() }}</span>
                <button (click)="changeQty(1)" [disabled]="quantity() >= product.stockQuantity">+</button>
              </div>
            }
          </div>

          <!-- Selector de variantes -->
          @if (product.variants?.length) {
            <div class="section-block">
              <h3>Presentación</h3>
              <div class="variants-row">
                @for (variant of product.variants; track variant.id) {
                  <button
                    class="variant-chip"
                    [class.selected]="selectedVariant()?.id === variant.id"
                    [class.out-of-stock]="!variant.inStock"
                    [disabled]="!variant.inStock"
                    (click)="selectVariant(variant)"
                  >
                    {{ variant.value }}
                    @if (variant.priceModifier && variant.priceModifier !== 0) {
                      <span class="variant-price-hint">
                        {{ variant.priceModifier > 0 ? '+' : '' }}{{ variant.priceModifier | mxnCurrency }}
                      </span>
                    }
                  </button>
                }
              </div>
            </div>
          }

          <!-- Descripción -->
          <div class="section-block">
            <h3>Descripción</h3>
            <p>{{ product.description || 'Disfruta de nuestros productos frescos y de alta calidad, cosechados y seleccionados cuidadosamente para brindarte el mejor sabor y nutrición.' }}</p>
          </div>

          <!-- Reseñas (1 preview + link a todas) -->
          <div class="section-block">
            <div class="section-block-header">
              <h3>Reseñas</h3>
              <a [routerLink]="['/product', product.id, 'reviews']" class="see-all-link" id="see-all-reviews-btn">
                Ver todas ({{ product.reviewCount }}) →
              </a>
            </div>

            <!-- Rating summary -->
            <div class="rating-summary-row">
              <span class="rating-avg">{{ product.rating }}</span>
              <div class="rating-right">
                <div class="rating-stars-row">
                  @for (idx of [0,1,2,3,4]; track idx) {
                    <app-icon name="star" size="14"
                      [fill]="idx < Math.round(product.rating) ? 'currentColor' : 'none'"
                      color="var(--warning)" />
                  }
                </div>
                <span class="rating-count">{{ product.reviewCount }} reseñas</span>
              </div>
            </div>

            <!-- Primera reseña real del servicio -->
            @if (firstReview(); as review) {
              <div class="review-card">
                <div class="review-header">
                  <div class="reviewer-avatar-initial">{{ review.userName.charAt(0) }}</div>
                  <div class="reviewer-info">
                    <h4>{{ review.userName }}</h4>
                    <div class="stars" style="display: flex; align-items: center; gap: 2px;">
                      @for (idx of [0,1,2,3,4]; track idx) {
                        <app-icon name="star" size="13"
                          [fill]="idx < review.rating ? 'currentColor' : 'none'"
                          color="var(--warning)" />
                      }
                    </div>
                  </div>
                  <span class="review-date">{{ formatDate(review.date) }}</span>
                </div>
                <p class="review-comment">{{ review.comment }}</p>
              </div>
            }
          </div>

        </div>

        <!-- Barra inferior fija -->
        <div class="bottom-action-bar">
          <div class="price-info">
            <span class="price-amount">{{ getEffectivePrice() | mxnCurrency }}</span>
            @if (selectedVariant()) {
              <span class="price-unit">/ {{ selectedVariant()!.value }}</span>
            } @else {
              <span class="price-unit">/ {{ product.variants?.[0]?.value || 'unidad' }}</span>
            }
          </div>
          <button class="add-to-cart-btn" (click)="addToCart()" [disabled]="!product.inStock" id="add-to-cart-btn">
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
  private changeDetector = inject(ChangeDetectorRef);

  protected Math = Math;

  product: Product | undefined;
  selectedVariant = signal<ProductVariant | undefined>(undefined);
  quantity = signal(1);
  activeImageIndex = signal(0);
  firstReview = signal<ProductReview | null>(null);

  ngOnInit(): void {
    this.route.params.subscribe(p => {
      const productId = p['id'];
      this.product = this.productService.getProductById(productId);
      this.activeImageIndex.set(0);
      this.quantity.set(1);
      this.configureVariants();
      this.firstReview.set(null);

      this.productService.loadProduct(productId).subscribe({
        next: (product) => {
          this.product = product;
          this.configureVariants();
          this.changeDetector.markForCheck();
        },
      });

      this.productService.getReviews(productId).subscribe({
        next: (result) => {
          this.firstReview.set(result.reviews[0] ?? null);
          const currentProduct = this.product;
          if (currentProduct && currentProduct.id === productId) {
            this.product = {
              ...currentProduct,
              rating: result.summary.average,
              reviewCount: result.summary.total,
            };
          }
          this.changeDetector.markForCheck();
        },
      });
    });
  }

  formatDate(date: Date): string {
    return new Intl.DateTimeFormat('es-MX', { day: '2-digit', month: 'short', year: 'numeric' }).format(new Date(date));
  }

  getEffectivePrice(): number {
    const base = this.product?.price ?? 0;
    return base + (this.selectedVariant()?.priceModifier ?? 0);
  }

  selectVariant(variant: ProductVariant): void {
    if (!variant.inStock) return;
    this.selectedVariant.set(variant);
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
    if (this.product) this.productService.toggleFavorite(this.product.id);
  }

  isFav(): boolean {
    return this.product ? this.productService.isFavorite(this.product.id) : false;
  }

  private configureVariants(): void {
    if (this.product?.variants?.length) {
      this.selectedVariant.set(this.product.variants.find((variant) => variant.inStock));
    } else {
      this.selectedVariant.set(undefined);
    }
  }
}
