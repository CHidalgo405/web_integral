import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ProductService } from '../../../core/services/product.service';
import { Header } from '../../../shared/components/header/header';
import { IconComponent } from '../../../shared/components/icon/icon';

@Component({
  selector: 'app-categories',
  standalone: true,
  imports: [RouterLink, Header, IconComponent],
  template: `
    <app-header title="Categorías" [showBack]="true"></app-header>
    <div class="categories-page" id="categories-page">
      <div class="categories-grid">
        <!-- Special Favorites Card -->
        <a routerLink="/home/favorites" class="category-card favorites-card" id="category-card-favorites">
          <span class="cat-icon"><app-icon name="heart" size="32" fill="currentColor" color="var(--danger)" /></span>
          <h3>Mis Favoritos</h3>
          <p>{{ productService.getFavoriteProducts().length }} productos</p>
        </a>

        @for (cat of productService.getCategories(); track cat.id) {
          <a [routerLink]="['/home/categories', cat.id]" class="category-card" [id]="'category-card-' + cat.id">
            <span class="cat-icon"><app-icon [name]="cat.icon" size="32" /></span>
            <h3>{{ cat.name }}</h3>
            <p>{{ cat.productCount }} productos</p>
          </a>
        }
      </div>
    </div>
  `,
  styles: [`
    .categories-page { width: min(100%, 1400px); margin: 0 auto; padding: 16px; padding-bottom: 100px; }
    .categories-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 12px; }
    .category-card {
      display: flex; flex-direction: column; align-items: center; gap: 8px;
      padding: 24px 16px; background: var(--surface-raised); border-radius: 16px;
      text-decoration: none; transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
      border: 1px solid var(--border);
    }
    .category-card:hover { transform: translateY(-3px); box-shadow: 0 8px 20px rgba(0,0,0,0.05); }
    
    .category-card.favorites-card {
      border-color: rgba(225, 75, 50, 0.15);
      background: linear-gradient(135deg, var(--surface-raised) 0%, rgba(225, 75, 50, 0.03) 100%);
    }
    .category-card.favorites-card:hover {
      border-color: var(--danger);
      box-shadow: 0 8px 24px rgba(225, 75, 50, 0.08);
    }
    
    .cat-icon { font-size: 2.5rem; display: flex; align-items: center; justify-content: center; }
    .category-card h3 { font-size: 0.9rem; font-weight: 700; color: var(--text-primary); margin: 0; text-align: center; }
    .category-card p { font-size: 0.75rem; color: var(--text-secondary); margin: 0; }
    @media (min-width: 768px) {
      .categories-page { padding: 32px clamp(28px, 5vw, 72px) 130px; }
      .categories-grid { grid-template-columns: repeat(auto-fit, minmax(190px, 1fr)); gap: 20px; }
      .category-card { min-height: 180px; justify-content: center; }
      .category-card h3 { font-size: 1rem; }
    }
  `],
})
export class Categories {
  protected productService = inject(ProductService);
}
