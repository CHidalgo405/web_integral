import { Component, inject, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { DatePipe } from '@angular/common';
import { OrderService } from '../../../core/services/order.service';
import { MxnCurrencyPipe } from '../../../shared/pipes/currency.pipe';
import { IconComponent } from '../../../shared/components/icon/icon';
import { Order, ShippingMethod } from '../../../core/models/order.model';

@Component({
  selector: 'app-order-confirmation',
  standalone: true,
  imports: [RouterLink, DatePipe, MxnCurrencyPipe, IconComponent],
  template: `
    <div class="confirmation-page" id="order-confirmation-page">

      <!-- Encabezado verde de éxito -->
      <div class="success-header">
        <div class="check-circle">
          <svg class="check-svg" viewBox="0 0 52 52" fill="none">
            <circle class="check-bg" cx="26" cy="26" r="25" stroke="rgba(255,255,255,0.25)" stroke-width="2"/>
            <path class="check-mark" d="M14 26 L22 34 L38 18" stroke="#fff" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
          </svg>
        </div>
        <h1>¡Pedido Confirmado!</h1>
        @if (order) {
          <div class="order-id-badge">
            <app-icon name="package" size="14" color="rgba(255,255,255,0.8)" />
            <span>{{ order.id }}</span>
          </div>
        }
        <p>Recibirás un correo de confirmación en breve.</p>
      </div>

      <!-- Cuerpo -->
      <div class="confirmation-body">

        @if (order) {

          <!-- Entrega estimada -->
          <div class="info-card delivery-card">
            <div class="info-card-icon">
              <app-icon [name]="deliveryIcon()" size="20" color="var(--primary)" />
            </div>
            <div class="info-card-content">
              <span class="info-card-label">Entrega estimada</span>
              <span class="info-card-value">{{ deliveryLabel() }}</span>
              <span class="info-card-sub">{{ deliveryDate() }}</span>
            </div>
          </div>

          <!-- Dirección de envío -->
          <div class="info-card">
            <div class="info-card-icon">
              <app-icon name="map-pin" size="20" color="var(--primary)" />
            </div>
            <div class="info-card-content">
              <span class="info-card-label">Enviar a</span>
              <span class="info-card-value">{{ order.shippingAddress.fullName }}</span>
              <span class="info-card-sub">{{ order.shippingAddress.street }} {{ order.shippingAddress.exteriorNumber }}, {{ order.shippingAddress.neighborhood }}, {{ order.shippingAddress.city }}</span>
            </div>
          </div>

          <!-- Resumen de productos -->
          <div class="items-card">
            <div class="items-card-header">
              <span class="items-card-title">Productos pedidos</span>
              <span class="items-card-count">{{ order.items.length }} {{ order.items.length === 1 ? 'artículo' : 'artículos' }}</span>
            </div>
            @for (item of order.items.slice(0, 3); track item.id) {
              <div class="order-item-row">
                <div class="order-item-qty">× {{ item.quantity }}</div>
                <span class="order-item-name">{{ item.product.name }}</span>
                <span class="order-item-price">{{ (item.product.price * item.quantity) | mxnCurrency }}</span>
              </div>
            }
            @if (order.items.length > 3) {
              <p class="items-more">+ {{ order.items.length - 3 }} producto(s) más</p>
            }
            <div class="order-total-row">
              <span>Total pagado</span>
              <span class="order-total-amount">{{ order.total | mxnCurrency }}</span>
            </div>
          </div>

        } @else {
          <!-- Sin datos de pedido (caso borde) -->
          <div class="info-card">
            <div class="info-card-icon">
              <app-icon name="info" size="20" color="var(--primary)" />
            </div>
            <div class="info-card-content">
              <span class="info-card-value">Tu pedido fue procesado exitosamente.</span>
              <span class="info-card-sub">Revisa el historial de pedidos para ver los detalles.</span>
            </div>
          </div>
        }

        <!-- Acciones -->
        <div class="cta-group">
          <a routerLink="/orders/history" class="btn-primary-conf" id="view-orders-btn">
            <app-icon name="clipboard" size="18" color="#fff" />
            Ver mis pedidos
          </a>
          <a routerLink="/home" class="btn-secondary-conf" id="continue-shopping-btn">
            Seguir comprando
          </a>
        </div>

      </div>
    </div>
  `,
  styles: [`
    .confirmation-page {
      min-height: 100dvh;
      background: var(--bg);
      padding-bottom: 100px;
    }

    /* ---- Encabezado ---- */
    .success-header {
      background: linear-gradient(160deg, var(--primary) 0%, #0d3323 100%);
      padding: 48px 24px 40px;
      text-align: center;
      color: #fff;
    }

    .check-circle {
      width: 80px;
      height: 80px;
      border-radius: 50%;
      background: rgba(255,255,255,0.15);
      border: 2px solid rgba(255,255,255,0.3);
      display: flex;
      align-items: center;
      justify-content: center;
      margin: 0 auto 20px;
      animation: popIn 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) both;
    }

    .check-svg { width: 52px; height: 52px; }

    .check-mark {
      stroke-dasharray: 38;
      stroke-dashoffset: 38;
      animation: drawCheck 0.5s 0.4s ease forwards;
    }

    @keyframes popIn {
      from { transform: scale(0); opacity: 0; }
      to   { transform: scale(1); opacity: 1; }
    }

    @keyframes drawCheck {
      to { stroke-dashoffset: 0; }
    }

    .success-header h1 {
      font-size: 1.6rem;
      font-weight: 800;
      margin: 0 0 12px;
      color: #fff;
    }

    .order-id-badge {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      background: rgba(255,255,255,0.15);
      border: 1px solid rgba(255,255,255,0.25);
      border-radius: 20px;
      padding: 5px 14px;
      font-size: 0.85rem;
      font-weight: 700;
      color: #fff;
      letter-spacing: 0.5px;
      margin-bottom: 12px;
    }

    .success-header p {
      font-size: 0.85rem;
      color: rgba(255,255,255,0.75);
      margin: 0;
      line-height: 1.5;
    }

    /* ---- Cuerpo ---- */
    .confirmation-body {
      padding: 20px 16px;
      display: flex;
      flex-direction: column;
      gap: 12px;
      max-width: 600px;
      margin: 0 auto;
    }

    /* ---- Info cards ---- */
    .info-card {
      display: flex;
      align-items: flex-start;
      gap: 14px;
      background: var(--surface-raised);
      border-radius: 20px;
      padding: 18px;
      border: 1px solid var(--border);
    }

    .delivery-card {
      border-color: rgba(27, 61, 50, 0.2);
      background: rgba(27, 61, 50, 0.03);
    }

    .info-card-icon {
      width: 40px;
      height: 40px;
      border-radius: 12px;
      background: rgba(27, 61, 50, 0.08);
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }

    .info-card-content {
      display: flex;
      flex-direction: column;
      gap: 3px;
      flex: 1;
    }

    .info-card-label {
      font-size: 0.72rem;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      color: var(--text-muted);
    }

    .info-card-value {
      font-size: 0.95rem;
      font-weight: 700;
      color: var(--text-primary);
    }

    .info-card-sub {
      font-size: 0.8rem;
      color: var(--text-secondary);
      line-height: 1.4;
    }

    /* ---- Tarjeta de productos ---- */
    .items-card {
      background: var(--surface-raised);
      border-radius: 20px;
      padding: 18px;
      border: 1px solid var(--border);
    }

    .items-card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 14px;
      padding-bottom: 12px;
      border-bottom: 1px dashed var(--border);
    }

    .items-card-title {
      font-size: 0.85rem;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      color: var(--text-secondary);
    }

    .items-card-count {
      font-size: 0.75rem;
      font-weight: 700;
      color: var(--text-muted);
      background: var(--bg);
      padding: 3px 10px;
      border-radius: 20px;
      border: 1px solid var(--border);
    }

    .order-item-row {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 8px 0;
      border-bottom: 1px solid var(--bg);
    }

    .order-item-row:last-of-type { border-bottom: none; }

    .order-item-qty {
      font-size: 0.75rem;
      font-weight: 800;
      color: var(--primary);
      background: rgba(27, 61, 50, 0.08);
      padding: 3px 8px;
      border-radius: 8px;
      flex-shrink: 0;
    }

    .order-item-name {
      flex: 1;
      font-size: 0.85rem;
      font-weight: 600;
      color: var(--text-primary);
    }

    .order-item-price {
      font-size: 0.85rem;
      font-weight: 700;
      color: var(--text-secondary);
      flex-shrink: 0;
    }

    .items-more {
      font-size: 0.8rem;
      color: var(--text-muted);
      font-style: italic;
      margin: 6px 0 0;
      text-align: center;
    }

    .order-total-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-top: 14px;
      padding-top: 14px;
      border-top: 2px dashed var(--border);
      font-size: 0.9rem;
      font-weight: 700;
      color: var(--text-secondary);
    }

    .order-total-amount {
      font-size: 1.2rem;
      font-weight: 900;
      color: var(--primary);
    }

    /* ---- Botones ---- */
    .cta-group {
      display: flex;
      flex-direction: column;
      gap: 10px;
      margin-top: 8px;
    }

    .btn-primary-conf {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      padding: 16px;
      background: var(--secondary);
      color: #fff;
      border-radius: 9999px;
      text-decoration: none;
      font-weight: 700;
      font-size: 0.95rem;
      transition: background 0.2s, transform 0.2s;
      box-shadow: 0 4px 14px rgba(225, 75, 50, 0.25);
    }

    .btn-primary-conf:hover { background: var(--secondary-dark); transform: translateY(-1px); }

    .btn-secondary-conf {
      display: block;
      text-align: center;
      padding: 16px;
      border: 1.5px solid var(--border);
      border-radius: 9999px;
      text-decoration: none;
      color: var(--text-secondary);
      font-weight: 600;
      font-size: 0.9rem;
      transition: background 0.2s;
    }

    .btn-secondary-conf:hover { background: var(--surface-raised); }
  `],
})
export class OrderConfirmation implements OnInit {
  private orderService = inject(OrderService);
  order: Order | undefined;

  ngOnInit(): void {
    this.order = this.orderService.getOrders()[0];
  }

  deliveryIcon(): string {
    const map: Record<ShippingMethod, string> = { standard: 'package', express: 'bolt', pickup: 'store' };
    return this.order ? map[this.order.shippingMethod] : 'package';
  }

  deliveryLabel(): string {
    const map: Record<ShippingMethod, string> = {
      standard: 'Envío Estándar · 3-5 días hábiles',
      express: 'Envío Express · 1-2 días hábiles',
      pickup: 'Recoger en tienda · ~2 horas',
    };
    return this.order ? map[this.order.shippingMethod] : 'En camino';
  }

  deliveryDate(): string {
    const today = new Date();
    const add = (days: number) => {
      const d = new Date(today);
      d.setDate(today.getDate() + days);
      return d.toLocaleDateString('es-MX', { weekday: 'long', day: 'numeric', month: 'long' });
    };
    if (!this.order) return '';
    switch (this.order.shippingMethod) {
      case 'express': return 'Antes del ' + add(2);
      case 'pickup':  return 'Hoy, ' + today.toLocaleDateString('es-MX', { day: 'numeric', month: 'long' });
      default:        return 'Antes del ' + add(5);
    }
  }
}
