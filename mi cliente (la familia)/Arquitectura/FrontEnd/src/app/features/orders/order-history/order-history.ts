import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { OrderService } from '../../../core/services/order.service';
import { ProductService } from '../../../core/services/product.service';
import { MxnCurrencyPipe } from '../../../shared/pipes/currency.pipe';
import { Header } from '../../../shared/components/header/header';
import { DatePipe } from '@angular/common';
import { IconComponent } from '../../../shared/components/icon/icon';

@Component({
  selector: 'app-order-history',
  standalone: true,
  imports: [RouterLink, MxnCurrencyPipe, Header, DatePipe, IconComponent],
  template: `
    <app-header title="Mis Pedidos" [showBack]="true"></app-header>
    <div class="history-page" id="order-history-page">
      @if (orderService.getOrders().length === 0) {
        <div class="empty-state">
          <span style="display: block; margin-bottom: 12px;"><app-icon name="clipboard" size="48" /></span>
          <h3>Sin pedidos</h3>
          <p>Aún no has realizado ningún pedido.</p>
          <a routerLink="/home" class="btn-shop">Ir a comprar</a>
        </div>
      } @else {
        @for (order of orderService.getOrders(); track order.id) {
          <a [routerLink]="['/orders', order.id]" class="order-card-v2" [id]="'order-' + order.id">
            <div class="card-header">
              <div class="id-wrapper">
                <span class="pkg-icon"><app-icon name="package" size="18" /></span>
                <span class="order-id">{{ order.id }}</span>
              </div>
              <span class="order-status-badge" [attr.data-status]="order.status">
                {{ orderService.getStatusLabel(order.status) }}
              </span>
            </div>
            
            <div class="order-items-preview">
              @for (item of order.items.slice(0, 3); track item.product.id) {
                <div class="item-preview-badge">
                  <app-icon [name]="getCategoryIcon(item.product.categoryId)" size="14" />
                  <span class="item-name">{{ item.product.name.split(' ')[0] }}</span>
                  @if (item.quantity > 1) {
                    <span class="item-qty">x{{ item.quantity }}</span>
                  }
                </div>
              }
              @if (order.items.length > 3) {
                <div class="item-preview-badge more">
                  <span>+{{ order.items.length - 3 }}</span>
                </div>
              }
            </div>

            <div class="card-footer">
              <div class="footer-meta">
                <span class="order-date">{{ order.createdAt | date:'dd MMM yyyy' }}</span>
                <span class="dot-separator">·</span>
                <span class="items-count">{{ order.items.length }} {{ order.items.length === 1 ? 'producto' : 'productos' }}</span>
              </div>
              <div class="footer-price">
                <span class="price-label">Total:</span>
                <span class="order-total">{{ order.total | mxnCurrency }}</span>
                <span class="chevron-arrow"><app-icon name="chevron-right" size="16" /></span>
              </div>
            </div>
          </a>
        }
      }
    </div>
  `,
  styles: [`
    .history-page { padding: 16px; padding-bottom: 80px; }
    .order-card-v2 {
      display: flex;
      flex-direction: column;
      padding: 16px;
      background: var(--surface-raised);
      border-radius: 20px;
      box-shadow: 0 6px 16px rgba(0, 0, 0, 0.04);
      margin-bottom: 14px;
      text-decoration: none;
      transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
      border: 1px solid var(--border);
    }
    .order-card-v2:hover {
      transform: translateY(-2px);
      box-shadow: 0 8px 24px rgba(28, 84, 66, 0.08);
      border-color: var(--primary);
    }
    .card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 12px;
    }
    .id-wrapper {
      display: flex;
      align-items: center;
      gap: 6px;
    }
    .pkg-icon {
      color: var(--primary);
      display: flex;
      align-items: center;
    }
    .order-id {
      font-size: 0.9rem;
      font-weight: 800;
      color: var(--text-primary);
    }
    .order-status-badge {
      font-size: 0.7rem;
      font-weight: 800;
      padding: 4px 12px;
      border-radius: 12px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    [data-status="pending"] { background: #fff3cd; color: #856404; }
    [data-status="preparing"] { background: #cce5ff; color: #004085; }
    [data-status="shipped"] { background: #d4edda; color: #155724; }
    [data-status="delivered"] { background: var(--success-alpha); color: var(--success); }
    [data-status="cancelled"], [data-status="refunded"] { background: var(--danger-alpha); color: var(--danger); }

    .order-items-preview {
      display: flex;
      flex-wrap: wrap;
      gap: 6px;
      margin-bottom: 16px;
    }
    .item-preview-badge {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      background: var(--bg);
      padding: 4px 10px;
      border-radius: 10px;
      font-size: 0.75rem;
      font-weight: 700;
      color: var(--text-secondary);
      border: 1px solid var(--border);
    }
    .item-preview-badge app-icon {
      color: var(--primary);
    }
    .item-name {
      max-width: 80px;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
    .item-qty {
      color: var(--secondary);
      font-weight: 800;
    }
    .item-preview-badge.more {
      background: var(--primary-alpha);
      color: var(--primary);
      border-color: transparent;
    }

    .card-footer {
      display: flex;
      justify-content: space-between;
      align-items: center;
      border-top: 1px dashed var(--border);
      padding-top: 12px;
    }
    .footer-meta {
      display: flex;
      align-items: center;
      gap: 6px;
      font-size: 0.8rem;
      color: var(--text-muted);
      font-weight: 600;
    }
    .dot-separator {
      color: var(--border);
    }
    .footer-price {
      display: flex;
      align-items: center;
      gap: 4px;
    }
    .price-label {
      font-size: 0.75rem;
      color: var(--text-muted);
      font-weight: 700;
    }
    .order-total {
      font-size: 1rem;
      font-weight: 800;
      color: var(--primary);
    }
    .chevron-arrow {
      color: var(--text-muted);
      display: flex;
      align-items: center;
      margin-left: 2px;
      transition: transform 0.2s;
    }
    .order-card-v2:hover .chevron-arrow {
      transform: translateX(2px);
      color: var(--primary);
    }

    .empty-state { text-align: center; padding: 60px 20px; }
    .empty-state h3 { color: var(--text-primary); margin: 12px 0 6px; }
    .empty-state p { color: var(--text-secondary); font-size: 0.85rem; margin: 0 0 16px; }
    .btn-shop { display: inline-block; padding: 12px 32px; background: var(--secondary); color: #fff; border-radius: 9999px; text-decoration: none; font-weight: 700; font-size: 0.9rem; transition: background 0.2s; box-shadow: 0 4px 12px rgba(225, 75, 50, 0.2); }
    .btn-shop:hover { background: var(--secondary-dark); }
  `],
})
export class OrderHistory {
  protected orderService = inject(OrderService);
  private productService = inject(ProductService);

  getCategoryIcon(categoryId: string): string {
    return this.productService.mockCategories.find(c => c.id === categoryId)?.icon ?? 'package';
  }
}
