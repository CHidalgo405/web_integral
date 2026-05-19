import { Component, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { Location } from '@angular/common';
import { ProductService } from '../../../core/services/product.service';
import { CartService } from '../../../core/services/cart.service';
import { MxnCurrencyPipe } from '../../../shared/pipes/currency.pipe';
import { Product, ProductVariant } from '../../../core/models/product.model';

@Component({
  selector: 'app-product-detail',
  standalone: true,
  imports: [RouterLink, MxnCurrencyPipe],
  template: `
    @if (product) {
      <div class="product-detail-page">
        <!-- Hero Section -->
        <div class="product-hero-section">
          <button class="back-btn" (click)="goBack()">
            <svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round">
              <line x1="19" y1="12" x2="5" y2="12"></line>
              <polyline points="12 19 5 12 12 5"></polyline>
            </svg>
          </button>
          <img src="https://media.istockphoto.com/id/185284489/photo/orange.jpg?s=612x612&w=0&k=20&c=m4EXniUNMHTOUDOZfm2h-dD01M8l3Q00r6T8j7Bf3G0=" alt="Product" class="hero-image" referrerpolicy="no-referrer" />
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
                  <div class="stars">⭐⭐⭐⭐⭐</div>
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
}
