import { Component, inject, OnInit } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { ProductService } from '../../../core/services/product.service';
import { CartService } from '../../../core/services/cart.service';
import { MxnCurrencyPipe } from '../../../shared/pipes/currency.pipe';
import { Header } from '../../../shared/components/header/header';
import { Product, ProductCategory } from '../../../core/models/product.model';
import { IconComponent } from '../../../shared/components/icon/icon';

@Component({
  selector: 'app-category-detail',
  standalone: true,
  imports: [RouterLink, MxnCurrencyPipe, Header, IconComponent],
  template: `
    <app-header [title]="category?.name ?? 'Categoría'" [showBack]="true"></app-header>
    <div class="category-detail" id="category-detail-page">
      @if (products.length === 0) {
        <div class="empty-state">
          <span class="empty-icon"><app-icon name="package" size="48" /></span>
          <h3>Sin productos</h3>
          <p>No hay productos en esta categoría aún.</p>
        </div>
      } @else {
        <div class="products-list">
          @for (product of products; track product.id) {
            <a [routerLink]="['/product', product.id]" class="product-row" [id]="'prod-row-' + product.id">
              <div class="prod-thumb" style="overflow: hidden;">
                <img [src]="product.images[0] || 'assets/images/productos/placeholder.png'" [alt]="product.name" style="width:100%;height:100%;object-fit:cover;" />
              </div>
              <div class="prod-info">
                <h3>{{ product.name }}</h3>
                <span class="prod-rating" style="display: inline-flex; align-items: center; gap: 4px; color: var(--text-secondary);">
                  <app-icon name="star" size="12" fill="currentColor" color="var(--warning)" />
                  <span>{{ product.rating }}</span>
                </span>
              </div>
              <div class="prod-price-col">
                <span class="prod-price">{{ product.price | mxnCurrency }}</span>
                @if (!product.inStock) {
                  <span class="out-label">Agotado</span>
                }
              </div>
            </a>
          }
        </div>
      }
    </div>
  `,
  styles: [`
    .category-detail { padding: 16px; padding-bottom: 80px; }
    .products-list { display: flex; flex-direction: column; gap: 10px; }
    .product-row { display: flex; align-items: center; gap: 12px; padding: 12px; background: var(--surface-raised); border-radius: 12px; text-decoration: none; transition: transform 0.2s; }
    .product-row:hover { transform: translateX(4px); }
    .prod-thumb { width: 48px; height: 48px; border-radius: 10px; background: var(--surface); display: flex; align-items: center; justify-content: center; }
    .prod-info { flex: 1; }
    .prod-info h3 { font-size: 0.85rem; font-weight: 600; color: var(--text-primary); margin: 0 0 4px; }
    .prod-rating { font-size: 0.7rem; }
    .prod-price-col { text-align: right; }
    .prod-price { font-size: 0.9rem; font-weight: 700; color: var(--primary); display: block; }
    .out-label { font-size: 0.65rem; color: var(--danger); font-weight: 600; }
    .empty-state { text-align: center; padding: 60px 20px; }
    .empty-icon { font-size: 3rem; }
    .empty-state h3 { color: var(--text-primary); margin: 12px 0 6px; }
    .empty-state p { color: var(--text-secondary); font-size: 0.85rem; }
  `],
})
export class CategoryDetail implements OnInit {
  private route = inject(ActivatedRoute);
  private productService = inject(ProductService);

  category: ProductCategory | undefined;
  products: Product[] = [];

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      const id = params['id'];
      this.category = this.productService.mockCategories.find(c => c.id === id);
      this.products = this.productService.getProductsByCategory(id);
    });
  }

  getCategoryIcon(): string {
    return this.category?.icon ?? 'package';
  }
}
