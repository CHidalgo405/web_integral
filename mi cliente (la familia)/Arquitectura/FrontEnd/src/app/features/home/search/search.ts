import { Component, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ProductService } from '../../../core/services/product.service';
import { MxnCurrencyPipe } from '../../../shared/pipes/currency.pipe';
import { Header } from '../../../shared/components/header/header';
import { Product } from '../../../core/models/product.model';
import { IconComponent } from '../../../shared/components/icon/icon';

@Component({
  selector: 'app-search',
  standalone: true,
  imports: [RouterLink, FormsModule, MxnCurrencyPipe, Header, IconComponent],
  template: `
    <app-header title="Buscar" [showBack]="true"></app-header>
    <div class="search-page" id="search-page">
      <div class="search-bar">
        <span class="search-icon"><app-icon name="search" size="18" /></span>
        <input type="text" id="search-input" [(ngModel)]="query" (input)="onSearch()" placeholder="¿Qué buscas hoy?" autofocus />
        @if (query) {
          <button class="clear-btn" (click)="clearSearch()"><app-icon name="x" size="16" /></button>
        }
      </div>

      @if (!query) {
        <section class="suggestions">
          <h3>Búsquedas populares</h3>
          <div class="suggestion-chips">
            @for (s of productService.getSuggestions(); track s) {
              <button class="chip" (click)="query = s; onSearch()">{{ s }}</button>
            }
          </div>
        </section>
      } @else if (results().length > 0) {
        <p class="result-count">{{ results().length }} resultados para "{{ query }}"</p>
        <div class="results-list">
          @for (product of results(); track product.id) {
            <a [routerLink]="['/product', product.id]" class="result-row">
              <div style="display: flex; align-items: center;">
                <div class="prod-thumb" style="width: 48px; height: 48px; border-radius: 10px; background: var(--surface); display: flex; align-items: center; justify-content: center; overflow: hidden; margin-right: 12px; flex-shrink: 0;">
                  <img [src]="product.images[0] || 'assets/images/productos/placeholder.png'" [alt]="product.name" style="width:100%;height:100%;object-fit:cover;" />
                </div>
                <div class="result-info">
                  <h3>{{ product.name }}</h3>
                  <span class="result-cat">{{ product.category }}</span>
                </div>
              </div>
              <span class="result-price">{{ product.price | mxnCurrency }}</span>
            </a>
          }
        </div>
      } @else {
        <div class="no-results" id="no-results">
          <span class="empty-icon"><app-icon name="search" size="48" /></span>
          <h3>Sin resultados</h3>
          <p>No encontramos productos para "{{ query }}". Intenta con otro término.</p>
        </div>
      }
    </div>
  `,
  styles: [`
    .search-page { padding: 16px; padding-bottom: 80px; }
    .search-bar { display: flex; align-items: center; gap: 10px; padding: 10px 14px; background: var(--surface-raised); border-radius: 12px; border: 1.5px solid var(--border); margin-bottom: 20px; }
    .search-icon { display: flex; align-items: center; }
    .search-bar input { flex: 1; border: none; background: transparent; font-size: 0.95rem; color: var(--text-primary); outline: none; }
    .clear-btn { background: none; border: none; color: var(--text-muted); cursor: pointer; padding: 4px; display: flex; align-items: center; justify-content: center; }
    .suggestions h3 { font-size: 0.9rem; font-weight: 600; color: var(--text-secondary); margin: 0 0 12px; }
    .suggestion-chips { display: flex; flex-wrap: wrap; gap: 8px; }
    .chip { padding: 8px 16px; background: var(--surface-raised); border: 1px solid var(--border); border-radius: 20px; font-size: 0.8rem; color: var(--text-primary); cursor: pointer; transition: all 0.2s; }
    .chip:hover { background: var(--primary); color: #fff; border-color: var(--primary); }
    .result-count { font-size: 0.8rem; color: var(--text-secondary); margin: 0 0 12px; }
    .results-list { display: flex; flex-direction: column; gap: 8px; }
    .result-row { display: flex; align-items: center; justify-content: space-between; padding: 12px; background: var(--surface-raised); border-radius: 12px; text-decoration: none; transition: transform 0.2s; }
    .result-row:hover { transform: translateX(4px); }
    .result-info h3 { font-size: 0.85rem; font-weight: 600; color: var(--text-primary); margin: 0 0 2px; }
    .result-cat { font-size: 0.7rem; color: var(--text-muted); }
    .result-price { font-size: 0.9rem; font-weight: 700; color: var(--primary); }
    .no-results { text-align: center; padding: 60px 20px; }
    .empty-icon { font-size: 3rem; display: block; margin-bottom: 12px; }
    .no-results h3 { color: var(--text-primary); margin: 12px 0 6px; }
    .no-results p { color: var(--text-secondary); font-size: 0.85rem; }
  `],
})
export class Search {
  protected productService = inject(ProductService);
  query = '';
  results = signal<Product[]>([]);

  onSearch(): void {
    if (this.query.trim()) {
      this.results.set(this.productService.searchProducts({ query: this.query }));
    } else {
      this.results.set([]);
    }
  }

  clearSearch(): void {
    this.query = '';
    this.results.set([]);
  }
}
