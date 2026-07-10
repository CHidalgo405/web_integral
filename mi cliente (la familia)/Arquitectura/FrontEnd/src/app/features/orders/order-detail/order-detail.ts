import { Component, inject, OnInit } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { OrderService } from '../../../core/services/order.service';
import { ReceiptService } from '../../../core/services/receipt.service';
import { ProductService } from '../../../core/services/product.service';
import { MxnCurrencyPipe } from '../../../shared/pipes/currency.pipe';
import { Header } from '../../../shared/components/header/header';
import { DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Order, OrderStatus } from '../../../core/models/order.model';
import { IconComponent } from '../../../shared/components/icon/icon';

@Component({
  selector: 'app-order-detail',
  standalone: true,
  imports: [MxnCurrencyPipe, Header, DatePipe, IconComponent, FormsModule],
  template: `
    @if (order) {
      <app-header title="Detalle del Envío" [showBack]="true">
        <button (click)="openHelp()" class="support-header-btn" style="background: none; border: none; color: #fff; cursor: pointer; display: flex; align-items: center; justify-content: center; padding: 6px;">
          <app-icon name="phone" size="20" color="#fff" />
        </button>
      </app-header>
      
      <div class="order-detail-page" id="order-detail-page">
        
        <!-- Hero tracking section -->
        <div class="hero-tracking-card">
          <div class="rapidito-badge">
            <app-icon name="bolt" size="12" fill="currentColor" />
            <span>RAPIDITO</span>
          </div>
          
          @if (order.estimatedDelivery && order.status !== 'cancelled' && order.status !== 'refunded') {
            <p class="est-delivery">Llega entre el {{ getDeliveryStart() }} y {{ getDeliveryEnd() }}</p>
          } @else if (order.status === 'delivered') {
            <p class="est-delivery">Entregado el {{ order.updatedAt | date:'dd \\'de\\' MMMM' }}</p>
          } @else if (order.status === 'cancelled' || order.status === 'refunded') {
            <p class="est-delivery" style="color: var(--danger);">Cancelado el {{ order.updatedAt | date:'dd \\'de\\' MMMM' }}</p>
          }
          
          <div class="status-title-row">
            <h2>{{ getHeroTitle() }}</h2>
            <div class="status-gallery-preview">
              @if (order.items.length > 0) {
                <app-icon [name]="getCategoryIcon(order.items[0].product.categoryId)" size="28" />
              } @else {
                <app-icon name="package" size="28" />
              }
            </div>
          </div>

          <!-- Stepper progress line -->
          <div class="progress-bar-container">
            <div class="progress-line-bg"></div>
            <div class="progress-line-active" [class.cancelled]="order.status === 'cancelled' || order.status === 'refunded'" [style.width]="getActiveProgressWidth()"></div>
            <div class="progress-steps">
              @for (step of statusOrder; track step) {
                <div class="progress-step-node" [class.completed]="isStepCompleted(step)" [class.cancelled]="order.status === 'cancelled' || order.status === 'refunded'">
                  @if (order.status === step) {
                    <div class="step-icon-badge" [class.cancelled]="order.status === 'cancelled' || order.status === 'refunded'">
                      <app-icon [name]="getStepIcon(step)" size="18" color="#fff" />
                    </div>
                  } @else {
                    <div class="step-dot-node"></div>
                  }
                </div>
              }
            </div>
          </div>

          <!-- Expandable Logs Toggle -->
          <button class="expand-logs-btn" (click)="showLogs = !showLogs">
            <span>Detalle del envío</span>
            <span class="chevron" [class.open]="showLogs"><app-icon name="chevron-down" size="14" /></span>
          </button>
          
          @if (showLogs) {
            <div class="logs-container">
              @for (log of getStatusLogs(); track log.status) {
                <div class="log-row" [class.active]="order.status === log.status">
                  <span class="log-time">{{ log.time | date:'HH:mm' }}</span>
                  <span class="log-indicator"><span class="log-dot"></span></span>
                  <span class="log-text">
                    <strong>{{ log.label }}</strong>
                    <p>{{ log.desc }}</p>
                  </span>
                </div>
              }
            </div>
          }
        </div>

        <!-- Quick actions circles -->
        @if (order.status !== 'cancelled' && order.status !== 'refunded' && order.status !== 'delivered') {
          <div class="quick-actions-row">
            <button class="action-circle-btn" (click)="deliverToNeighbor()">
              <div class="circle-icon">
                <app-icon name="user" size="22" />
              </div>
              <span class="circle-label">Entregar a un vecino</span>
            </button>
            <button class="action-circle-btn" (click)="deliverToReception()">
              <div class="circle-icon">
                <app-icon name="bell" size="22" />
              </div>
              <span class="circle-label">Entregar en portería</span>
            </button>
            <button class="action-circle-btn" (click)="rateDelivery()">
              <div class="circle-icon">
                <app-icon name="star" size="22" />
              </div>
              <span class="circle-label">Opinar del envío</span>
            </button>
          </div>
        } @else if (order.status === 'delivered') {
          <div class="quick-actions-row" style="justify-content: center;">
            <button class="action-circle-btn" (click)="rateDelivery()" style="max-width: 120px;">
              <div class="circle-icon">
                <app-icon name="star" size="22" />
              </div>
              <span class="circle-label">Calificar compra</span>
            </button>
          </div>
        }

        <!-- Help Desk Button -->
        <div class="help-card-row" (click)="openHelp()">
          <span class="help-icon"><app-icon name="phone" size="18" /></span>
          <span class="help-text">¿Necesitas ayuda?</span>
          <span class="help-arrow"><app-icon name="chevron-right" size="16" /></span>
        </div>

        <!-- Purchase details list group -->
        <div class="details-card-group">
          <h3>Detalle de la compra</h3>
          
          <div class="card-item-row">
            <div class="row-left">
              <span class="row-icon"><app-icon name="map-pin" size="18" /></span>
              <div class="row-text">
                <strong>Dirección de entrega</strong>
                <p>{{ order.shippingAddress.street }} {{ order.shippingAddress.exteriorNumber }}, {{ order.shippingAddress.neighborhood }}</p>
                @if (order.shippingAddress.notes) {
                  <span class="address-notes">{{ order.shippingAddress.notes }}</span>
                }
              </div>
            </div>
          </div>

          <div class="card-item-row clickable" (click)="showProductsList = !showProductsList">
            <div class="row-left">
              <span class="row-icon"><app-icon name="shopping-cart" size="18" /></span>
              <div class="row-text">
                <strong>{{ order.items.length }} {{ order.items.length === 1 ? 'producto' : 'productos' }}</strong>
                <p>{{ getItemsTotalQuantity() }} u.</p>
              </div>
            </div>
            <span class="row-chevron" [class.open]="showProductsList">
              <app-icon name="chevron-down" size="16" />
            </span>
          </div>

          @if (showProductsList) {
            <div class="expanded-products-list">
              @for (item of order.items; track item.product.id) {
                <div class="product-item-detail">
                  <span class="prod-icon"><app-icon [name]="getCategoryIcon(item.product.categoryId)" size="18" /></span>
                  <div class="prod-desc">
                    <span class="p-name">{{ item.product.name }}</span>
                    <span class="p-qty-price">{{ item.quantity }} x {{ item.product.price | mxnCurrency }}</span>
                  </div>
                  <span class="p-total">{{ (item.product.price * item.quantity) | mxnCurrency }}</span>
                </div>
              }
            </div>
          }

          <div class="card-item-row clickable" (click)="showPriceDetails = !showPriceDetails">
            <div class="row-left">
              <span class="row-icon"><app-icon name="credit-card" size="18" /></span>
              <div class="row-text">
                <strong>{{ getPaymentMethodLabel() }}</strong>
                <p>Pago total: {{ order.total | mxnCurrency }}</p>
              </div>
            </div>
            <span class="row-chevron" [class.open]="showPriceDetails">
              <app-icon name="chevron-down" size="16" />
            </span>
          </div>

          @if (showPriceDetails) {
            <div class="expanded-totals-card">
              <div class="total-row"><span>Subtotal</span><span>{{ order.subtotal | mxnCurrency }}</span></div>
              @if (order.discount > 0) {
                <div class="total-row discount"><span>Descuento</span><span>-{{ order.discount | mxnCurrency }}</span></div>
              }
              <div class="total-row"><span>Envío</span><span>{{ order.shippingCost === 0 ? 'Gratis' : (order.shippingCost | mxnCurrency) }}</span></div>
              <div class="total-row grand"><span>Total</span><span>{{ order.total | mxnCurrency }}</span></div>
            </div>
          }
        </div>

        <button class="receipt-btn" (click)="downloadReceipt()" [disabled]="downloadingReceipt" id="download-receipt-btn">
          <app-icon name="download" size="16" color="var(--primary)" />
          {{ downloadingReceipt ? 'Generando recibo...' : 'Descargar recibo (PDF)' }}
        </button>

        @if (order.status === 'pending' || order.status === 'preparing') {
          <button class="cancel-btn" (click)="cancelOrder()" id="cancel-order-btn">Cancelar pedido</button>
        }
      </div>

      <!-- Neighbor instruction Modal dialog -->
      @if (showNeighborModal) {
        <div class="modal-backdrop">
          <div class="modal-dialog">
            <h3>Entregar a un vecino</h3>
            <p>Indica el nombre o número de casa del vecino que recibirá tu entrega:</p>
            <input 
              type="text" 
              [(ngModel)]="tempNeighborName" 
              placeholder="Ej. Vecina María (Casa 8)" 
              class="form-control"
              style="width: 100%; padding: 12px 16px; border: 1px solid var(--border); border-radius: 12px; font-family: var(--font-body); font-weight: 600; font-size: 0.9rem; margin-bottom: 20px; outline: none;"
            />
            <div class="modal-actions">
              <button class="btn btn-secondary" (click)="showNeighborModal = false">Cancelar</button>
              <button class="btn btn-primary" (click)="saveNeighborName()">Guardar</button>
            </div>
          </div>
        </div>
      }

      <!-- Help Modal dialog -->
      @if (showHelpModal) {
        <div class="modal-backdrop">
          <div class="modal-dialog">
            <h3>¿Necesitas ayuda con tu pedido?</h3>
            <p>Nuestro equipo de soporte está disponible de 8:00 AM a 8:00 PM para resolver cualquier duda sobre tu entrega o tus productos.</p>
            <div style="display: flex; flex-direction: column; gap: 8px; margin-bottom: 20px;">
              <a href="tel:+525551234567" class="btn btn-primary-call" style="display: flex; align-items: center; justify-content: center; gap: 8px; text-decoration: none; font-weight: 700; padding: 12px; border-radius: 12px; background: var(--primary); color: #fff; border: none; font-size: 0.85rem; font-family: var(--font-body);">
                <app-icon name="phone" size="18" color="#fff" /> Llamar a soporte
              </a>
            </div>
            <div class="modal-actions">
              <button class="btn btn-secondary" style="width: 100%; padding: 12px; border-radius: 12px;" (click)="showHelpModal = false">Cerrar</button>
            </div>
          </div>
        </div>
      }

      <!-- Toast notifications -->
      @if (toastMessage) {
        <div class="toast-notification">
          <app-icon name="check" size="16" color="#fff" />
          <span>{{ toastMessage }}</span>
        </div>
      }
    }
  `,
  styles: [`
    .order-detail-page { padding: 16px; padding-bottom: 100px; background-color: var(--bg); min-height: 100dvh; }
    
    /* Hero status card */
    .hero-tracking-card {
      background: var(--surface-raised);
      border-radius: 24px;
      padding: 24px 20px;
      box-shadow: 0 6px 20px rgba(0, 0, 0, 0.04);
      border: 1px solid var(--border);
      margin-bottom: 20px;
      position: relative;
    }
    
    .rapidito-badge {
      display: inline-flex;
      align-items: center;
      gap: 4px;
      background: var(--primary-alpha);
      color: var(--primary);
      font-size: 0.7rem;
      font-weight: 800;
      padding: 4px 10px;
      border-radius: 6px;
      letter-spacing: 0.5px;
      margin-bottom: 12px;
      text-transform: uppercase;
    }
    
    .est-delivery {
      font-size: 0.85rem;
      color: var(--text-secondary);
      font-weight: 600;
      margin: 0 0 6px;
    }
    
    .status-title-row {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 24px;
      gap: 12px;
    }
    
    .status-title-row h2 {
      font-size: 1.5rem;
      font-weight: 800;
      line-height: 1.2;
      color: var(--text-primary);
      margin: 0;
    }
    
    .status-gallery-preview {
      width: 56px;
      height: 56px;
      border-radius: 12px;
      background: var(--bg);
      border: 1px solid var(--border);
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
      box-shadow: 0 4px 10px rgba(0,0,0,0.03);
    }
    .status-gallery-preview app-icon {
      color: var(--primary);
    }
    
    /* Progress Stepper */
    .progress-bar-container {
      position: relative;
      height: 40px;
      margin-bottom: 20px;
      padding: 0 10px;
    }
    
    .progress-line-bg {
      position: absolute;
      top: 18px;
      left: 10px;
      right: 10px;
      height: 4px;
      background: var(--border);
      border-radius: 2px;
      z-index: 0;
    }
    
    .progress-line-active {
      position: absolute;
      top: 18px;
      left: 10px;
      height: 4px;
      background: var(--primary);
      border-radius: 2px;
      z-index: 0;
      transition: width 0.4s ease;
    }
    
    .progress-line-active.cancelled {
      background: var(--danger);
    }
    
    .progress-steps {
      display: flex;
      justify-content: space-between;
      position: relative;
      z-index: 1;
    }
    
    .progress-step-node {
      width: 40px;
      height: 40px;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    
    .step-dot-node {
      width: 12px;
      height: 12px;
      border-radius: 50%;
      background: #fff;
      border: 3px solid var(--border);
      transition: all 0.3s ease;
    }
    
    .progress-step-node.completed .step-dot-node {
      background: var(--primary);
      border-color: var(--primary);
    }
    
    .progress-step-node.completed.cancelled .step-dot-node {
      background: var(--danger);
      border-color: var(--danger);
    }
    
    .step-icon-badge {
      width: 36px;
      height: 36px;
      border-radius: 50%;
      background: var(--primary-dark);
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 4px 10px rgba(28, 84, 66, 0.25);
    }
    
    .step-icon-badge.cancelled {
      background: var(--danger);
      box-shadow: 0 4px 10px rgba(225, 75, 50, 0.25);
    }

    /* Expand logs */
    .expand-logs-btn {
      width: 100%;
      background: none;
      border: none;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 6px;
      font-size: 0.85rem;
      font-weight: 700;
      color: var(--primary);
      padding: 10px 0 0;
      border-top: 1px dashed var(--border);
    }
    .expand-logs-btn .chevron {
      display: flex;
      align-items: center;
      transition: transform 0.25s;
    }
    .expand-logs-btn .chevron.open {
      transform: rotate(180deg);
    }
    
    .logs-container {
      margin-top: 16px;
      padding: 4px 8px;
      animation: slideDown 0.3s ease-out;
    }
    
    .log-row {
      display: flex;
      gap: 12px;
      margin-bottom: 14px;
      position: relative;
    }
    
    .log-row:not(:last-child)::after {
      content: '';
      position: absolute;
      left: 54px;
      top: 14px;
      bottom: -18px;
      width: 1.5px;
      background: var(--border);
    }
    
    .log-time {
      font-size: 0.75rem;
      font-weight: 700;
      color: var(--text-muted);
      width: 42px;
      text-align: right;
    }
    
    .log-indicator {
      display: flex;
      justify-content: center;
      width: 12px;
      position: relative;
      z-index: 1;
    }
    
    .log-dot {
      width: 10px;
      height: 10px;
      border-radius: 50%;
      background: var(--border);
      border: 2px solid #fff;
      box-shadow: 0 0 0 2px var(--border);
      margin-top: 4px;
    }
    
    .log-row.active .log-dot {
      background: var(--primary);
      box-shadow: 0 0 0 2px var(--primary);
    }
    .log-row.active .log-time {
      color: var(--primary);
    }
    .log-row.active .log-text strong {
      color: var(--primary);
    }
    
    .log-text {
      flex: 1;
    }
    .log-text strong {
      display: block;
      font-size: 0.85rem;
      color: var(--text-primary);
      font-weight: 700;
    }
    .log-text p {
      font-size: 0.75rem;
      color: var(--text-secondary);
      margin: 2px 0 0;
      line-height: 1.3;
    }
    
    /* Quick actions */
    .quick-actions-row {
      display: flex;
      justify-content: space-around;
      margin: 24px 0;
      gap: 12px;
    }
    .action-circle-btn {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 8px;
      background: none;
      border: none;
      cursor: pointer;
      flex: 1;
    }
    .circle-icon {
      width: 56px;
      height: 56px;
      border-radius: 50%;
      background: var(--surface-raised);
      border: 1px solid var(--border);
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
      transition: all 0.2s;
    }
    .action-circle-btn:hover .circle-icon {
      transform: scale(1.05);
      border-color: var(--primary);
      box-shadow: 0 6px 16px rgba(28, 84, 66, 0.12);
    }
    .circle-label {
      font-size: 0.75rem;
      font-weight: 700;
      color: var(--text-secondary);
      text-align: center;
      line-height: 1.2;
    }
    
    /* Help Bar Card */
    .help-card-row {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 16px;
      background: var(--surface-raised);
      border-radius: 16px;
      border: 1px solid var(--border);
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.03);
      cursor: pointer;
      margin-bottom: 24px;
      transition: all 0.2s;
    }
    .help-card-row:hover {
      border-color: var(--primary);
      background: var(--hover);
    }
    .help-icon {
      color: var(--primary);
      display: flex;
      align-items: center;
    }
    .help-text {
      flex: 1;
      font-size: 0.85rem;
      font-weight: 700;
      color: var(--primary);
    }
    .help-arrow {
      color: var(--text-muted);
      display: flex;
      align-items: center;
    }
    
    /* Purchase Details list group */
    .details-card-group {
      background: var(--surface-raised);
      border-radius: 24px;
      border: 1px solid var(--border);
      box-shadow: 0 6px 20px rgba(0, 0, 0, 0.04);
      overflow: hidden;
      margin-bottom: 24px;
    }
    
    .details-card-group h3 {
      font-family: var(--font-heading);
      font-size: 1.1rem;
      font-weight: 800;
      color: var(--text-primary);
      padding: 20px 20px 12px;
      margin: 0;
      border-bottom: 1px solid var(--border);
    }
    
    .card-item-row {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 18px 20px;
      border-bottom: 1px solid var(--border);
      transition: background 0.2s;
    }
    
    .card-item-row.clickable {
      cursor: pointer;
    }
    .card-item-row.clickable:hover {
      background-color: var(--hover);
    }
    
    .row-left {
      display: flex;
      align-items: flex-start;
      gap: 14px;
      flex: 1;
    }
    
    .row-icon {
      color: var(--text-secondary);
      display: flex;
      align-items: center;
      margin-top: 2px;
    }
    
    .row-text strong {
      display: block;
      font-size: 0.85rem;
      color: var(--text-primary);
      font-weight: 700;
      margin-bottom: 2px;
    }
    .row-text p {
      font-size: 0.8rem;
      color: var(--text-secondary);
      margin: 0;
      line-height: 1.3;
    }
    .address-notes {
      display: inline-block;
      font-size: 0.75rem;
      color: var(--primary);
      font-weight: 600;
      margin-top: 4px;
      background: var(--primary-alpha);
      padding: 2px 8px;
      border-radius: 6px;
    }
    
    .row-chevron {
      color: var(--text-muted);
      display: flex;
      align-items: center;
      transition: transform 0.2s;
    }
    .row-chevron.open {
      transform: rotate(180deg);
    }
    
    /* Expandable sub-cards */
    .expanded-products-list {
      background: var(--bg);
      padding: 8px 20px;
      border-bottom: 1px solid var(--border);
      animation: slideDown 0.25s ease-out;
    }
    .product-item-detail {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 10px 0;
    }
    .product-item-detail:not(:last-child) {
      border-bottom: 1px solid rgba(0,0,0,0.04);
    }
    .prod-icon {
      color: var(--primary);
      display: flex;
      align-items: center;
      margin-right: 12px;
    }
    .prod-desc {
      flex: 1;
      display: flex;
      flex-direction: column;
    }
    .p-name {
      font-size: 0.8rem;
      font-weight: 700;
      color: var(--text-primary);
    }
    .p-qty-price {
      font-size: 0.75rem;
      color: var(--text-secondary);
      margin-top: 2px;
    }
    .p-total {
      font-size: 0.85rem;
      font-weight: 700;
      color: var(--primary);
    }
    
    .expanded-totals-card {
      background: var(--bg);
      padding: 14px 20px;
      border-bottom: 1px solid var(--border);
      animation: slideDown 0.25s ease-out;
    }
    .total-row {
      display: flex;
      justify-content: space-between;
      padding: 4px 0;
      font-size: 0.8rem;
      color: var(--text-secondary);
    }
    .total-row.discount {
      color: var(--success);
    }
    .total-row.grand {
      border-top: 1px dashed var(--border);
      padding-top: 8px;
      margin-top: 4px;
      font-weight: 800;
      color: var(--text-primary);
      font-size: 0.95rem;
    }
    
    .cancel-btn {
      display: block;
      width: 100%;
      padding: 14px;
      background: transparent;
      color: var(--danger);
      border: 1.5px solid var(--danger);
      border-radius: 9999px;
      font-weight: 700;
      font-size: 0.9rem;
      cursor: pointer;
      margin-top: 24px;
      transition: all 0.2s;
    }
    .cancel-btn:hover {
      background: var(--danger-alpha);
    }

    .receipt-btn {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      width: 100%;
      padding: 14px;
      background: var(--surface);
      color: var(--primary);
      border: 1.5px solid var(--primary);
      border-radius: 9999px;
      font-weight: 700;
      font-size: 0.9rem;
      cursor: pointer;
      margin-top: 24px;
      transition: background 0.2s;
    }
    .receipt-btn:hover:not(:disabled) {
      background: rgba(27, 61, 50, 0.05);
    }
    .receipt-btn:disabled { opacity: 0.6; cursor: wait; }
    
    /* Sliding Toast */
    .toast-notification {
      position: fixed;
      bottom: 24px;
      left: 20px;
      right: 20px;
      background: rgba(15, 42, 32, 0.9);
      color: #fff;
      padding: 14px 20px;
      border-radius: 12px;
      display: flex;
      align-items: center;
      gap: 10px;
      box-shadow: 0 8px 24px rgba(0,0,0,0.2);
      z-index: 1000;
      animation: slideUpToast 0.35s cubic-bezier(0.16, 1, 0.3, 1);
    }
    .toast-notification span {
      font-size: 0.8rem;
      font-weight: 700;
    }
    
    /* Modals */
    .modal-backdrop {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(15, 42, 32, 0.4);
      backdrop-filter: blur(4px);
      z-index: 1100;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .modal-dialog {
      background: var(--surface);
      border-radius: 24px;
      width: 90%;
      max-width: 400px;
      padding: 24px;
      box-shadow: 0 10px 30px rgba(0,0,0,0.15);
      animation: zoomIn 0.25s cubic-bezier(0.16, 1, 0.3, 1);
    }
    .modal-dialog h3 {
      font-family: var(--font-heading);
      font-size: 1.2rem;
      font-weight: 800;
      color: var(--text-primary);
      margin: 0 0 12px;
    }
    .modal-dialog p {
      font-size: 0.85rem;
      color: var(--text-secondary);
      margin: 0 0 16px;
      line-height: 1.4;
    }
    .modal-actions {
      display: flex;
      gap: 12px;
      justify-content: flex-end;
    }
    .modal-actions .btn {
      padding: 10px 20px;
      border-radius: 12px;
      font-weight: 700;
      font-size: 0.85rem;
      border: none;
      cursor: pointer;
    }
    .modal-actions .btn-secondary {
      background: var(--bg);
      color: var(--text-secondary);
      border: 1px solid var(--border);
    }
    .modal-actions .btn-primary {
      background: var(--primary);
      color: #fff;
    }
    
    @keyframes slideDown {
      from { opacity: 0; transform: translateY(-8px); }
      to { opacity: 1; transform: translateY(0); }
    }
    
    @keyframes slideUpToast {
      from { transform: translateY(100%); opacity: 0; }
      to { transform: translateY(0); opacity: 1; }
    }
    
    @keyframes zoomIn {
      from { transform: scale(0.9); opacity: 0; }
      to { transform: scale(1); opacity: 1; }
    }
  `],
})
export class OrderDetail implements OnInit {
  protected orderService = inject(OrderService);
  private route = inject(ActivatedRoute);
  private productService = inject(ProductService);
  private receiptService = inject(ReceiptService);

  order: Order | undefined;
  statusOrder: OrderStatus[] = ['pending', 'preparing', 'shipped', 'delivered'];

  showLogs = false;
  showProductsList = false;
  showPriceDetails = false;
  downloadingReceipt = false;

  showNeighborModal = false;
  showHelpModal = false;
  tempNeighborName = '';
  neighborName = '';
  toastMessage = '';

  async downloadReceipt(): Promise<void> {
    if (!this.order || this.downloadingReceipt) return;
    this.downloadingReceipt = true;
    try {
      await this.receiptService.downloadReceipt(this.order);
    } finally {
      this.downloadingReceipt = false;
    }
  }

  ngOnInit(): void {
    this.route.params.subscribe(p => {
      this.order = this.orderService.getOrderById(p['id']);
      if (this.order && this.order.shippingAddress.notes) {
        if (this.order.shippingAddress.notes.startsWith('Entregar a vecino:')) {
          this.neighborName = this.order.shippingAddress.notes.replace('Entregar a vecino:', '').trim();
        }
      }
    });
  }

  getHeroTitle(): string {
    if (!this.order) return '';
    switch (this.order.status) {
      case 'pending': return 'Tu compra está siendo procesada';
      case 'preparing': return 'Estamos preparando tu pedido';
      case 'shipped': return 'Tu compra ya está en camino';
      case 'delivered': return 'Tu compra ya fue entregada';
      case 'cancelled': return 'Tu compra fue cancelada';
      case 'refunded': return 'Tu compra fue reembolsada';
      default: return 'Detalle de tu envío';
    }
  }

  getDeliveryStart(): string {
    if (!this.order?.estimatedDelivery) return 'pronto';
    const d = new Date(this.order.estimatedDelivery);
    const options: Intl.DateTimeFormatOptions = { day: '2-digit', month: 'long' };
    return d.toLocaleDateString('es-MX', options);
  }

  getDeliveryEnd(): string {
    if (!this.order?.estimatedDelivery) return '';
    const d = new Date(this.order.estimatedDelivery);
    const dEnd = new Date(d);
    dEnd.setDate(dEnd.getDate() + 1);
    const options: Intl.DateTimeFormatOptions = { day: '2-digit', month: 'long' };
    return dEnd.toLocaleDateString('es-MX', options);
  }

  isStepActive(step: OrderStatus): boolean {
    if (!this.order) return false;
    const currentIdx = this.statusOrder.indexOf(this.order.status);
    const stepIdx = this.statusOrder.indexOf(step);
    return stepIdx <= currentIdx;
  }

  isStepCompleted(step: OrderStatus): boolean {
    if (!this.order) return false;
    const orderIndex = this.statusOrder.indexOf(this.order.status);
    const stepIndex = this.statusOrder.indexOf(step);
    return stepIndex <= orderIndex;
  }

  getActiveProgressWidth(): string {
    if (!this.order) return '0%';
    if (this.order.status === 'cancelled' || this.order.status === 'refunded') return '100%';
    const orderIndex = this.statusOrder.indexOf(this.order.status);
    if (orderIndex < 0) return '0%';
    const pct = (orderIndex / 3) * 100;
    return `${pct}%`;
  }

  getStepIcon(step: OrderStatus): string {
    switch (step) {
      case 'pending': return 'credit-card';
      case 'preparing': return 'egg';
      case 'shipped': return 'truck';
      case 'delivered': return 'check';
      default: return 'package';
    }
  }

  getCategoryIcon(categoryId: string): string {
    return this.productService.getCategories().find(c => c.id === categoryId)?.icon ?? 'package';
  }

  getItemsTotalQuantity(): number {
    if (!this.order) return 0;
    return this.order.items.reduce((acc, item) => acc + item.quantity, 0);
  }

  getPaymentMethodLabel(): string {
    if (!this.order) return '';
    const labels: Record<string, string> = {
      card: 'Tarjeta de crédito/débito',
      cash: 'Efectivo contra entrega',
      transfer: 'Transferencia bancaria'
    };
    return labels[this.order.paymentMethod] || this.order.paymentMethod;
  }

  getStatusLogs(): { status: OrderStatus; label: string; desc: string; time: Date }[] {
    if (!this.order) return [];
    
    const logs: { status: OrderStatus; label: string; desc: string; time: Date }[] = [];
    const baseTime = new Date(this.order.createdAt);
    
    logs.push({
      status: 'pending',
      label: 'Pedido Realizado',
      desc: 'Recibimos tu compra y estamos procesando el pago.',
      time: baseTime
    });

    if (this.order.status === 'preparing' || this.order.status === 'shipped' || this.order.status === 'delivered') {
      const prepTime = new Date(baseTime);
      prepTime.setMinutes(prepTime.getMinutes() + 15);
      logs.push({
        status: 'preparing',
        label: 'Preparación en Sucursal',
        desc: 'Estamos preparando tus productos frescos.',
        time: prepTime
      });
    }

    if (this.order.status === 'shipped' || this.order.status === 'delivered') {
      const shipTime = new Date(baseTime);
      shipTime.setHours(shipTime.getHours() + 1);
      logs.push({
        status: 'shipped',
        label: 'En camino',
        desc: 'El repartidor está en ruta a tu ubicación.',
        time: shipTime
      });
    }

    if (this.order.status === 'delivered') {
      const delTime = new Date(this.order.updatedAt);
      logs.push({
        status: 'delivered',
        label: 'Entregado con Éxito',
        desc: 'Entregado en la dirección seleccionada.',
        time: delTime
      });
    }

    return logs.reverse();
  }

  deliverToNeighbor() {
    this.tempNeighborName = this.neighborName;
    this.showNeighborModal = true;
  }

  saveNeighborName() {
    if (this.tempNeighborName.trim()) {
      this.neighborName = this.tempNeighborName.trim();
      this.showNeighborModal = false;
      this.showToast(`Instrucción guardada: Entregar a vecino (${this.neighborName})`);
      if (this.order) {
        this.order.shippingAddress.notes = `Entregar a vecino: ${this.neighborName}`;
        this.orderService.updateOrder(this.order);
      }
    }
  }

  deliverToReception() {
    this.showToast('Instrucción guardada: Dejar en portería');
    if (this.order) {
      this.order.shippingAddress.notes = 'Dejar en portería.';
      this.orderService.updateOrder(this.order);
    }
  }

  rateDelivery() {
    this.showToast('¡Gracias por calificar tu envío! Tu opinión nos ayuda a mejorar.');
  }

  openHelp() {
    this.showHelpModal = true;
  }

  showToast(msg: string) {
    this.toastMessage = msg;
    setTimeout(() => this.toastMessage = '', 3000);
  }

  cancelOrder(): void {
    if (this.order) {
      this.orderService.cancelOrder(this.order.id);
      this.order = this.orderService.getOrderById(this.order.id);
      this.showToast('Pedido cancelado con éxito.');
    }
  }
}

