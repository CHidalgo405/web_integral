import { Component, inject, signal, computed } from '@angular/core';

import { FormsModule } from '@angular/forms';
import { OrderService } from '../../../core/services/order.service';
import { Order, OrderStatus } from '../../../core/models/order.model';
import { MxnCurrencyPipe } from '../../../shared/pipes/currency.pipe';
import { IconComponent } from '../../../shared/components/icon/icon';

@Component({
  selector: 'app-order-tracker',
  standalone: true,
  imports: [FormsModule, MxnCurrencyPipe, IconComponent],
  template: `
    <div class="order-tracker">
      <div class="manager-header">
        <div>
          <h1 class="page-title">Flujo de Pedidos</h1>
          <p class="page-subtitle">Monitorea compras, gestiona envíos, actualiza estados y realiza devoluciones</p>
        </div>
      </div>

      <!-- Pipeline Tabs -->
      <div class="pipeline-tabs">
        <button 
          (click)="selectedTab.set('all')" 
          [class.active]="selectedTab() === 'all'" 
          class="tab-btn"
        >
          Todos <span class="tab-count">{{ countAll() }}</span>
        </button>
        <button 
          (click)="selectedTab.set('pending')" 
          [class.active]="selectedTab() === 'pending'" 
          class="tab-btn pending-tab"
        >
          Pendientes <span class="tab-count count-pending">{{ countPending() }}</span>
        </button>
        <button 
          (click)="selectedTab.set('preparing')" 
          [class.active]="selectedTab() === 'preparing'" 
          class="tab-btn preparing-tab"
        >
          Preparando <span class="tab-count count-preparing">{{ countPreparing() }}</span>
        </button>
        <button 
          (click)="selectedTab.set('shipped')" 
          [class.active]="selectedTab() === 'shipped'" 
          class="tab-btn shipped-tab"
        >
          En Camino <span class="tab-count count-shipped">{{ countShipped() }}</span>
        </button>
        <button 
          (click)="selectedTab.set('completed')" 
          [class.active]="selectedTab() === 'completed'" 
          class="tab-btn completed-tab"
        >
          Entregados <span class="tab-count count-completed">{{ countCompleted() }}</span>
        </button>
      </div>

      <!-- Filters & Search Bar -->
      <div class="filters-bar">
        <div class="search-input-wrapper">
          <span class="search-icon"><app-icon name="search" size="18" /></span>
          <input 
            type="text" 
            [ngModel]="searchQuery()" 
            (ngModelChange)="searchQuery.set($event)"
            placeholder="Buscar por ID de pedido o nombre de cliente..."
            class="form-control"
          />
        </div>
      </div>

      <!-- Orders List / Grid -->
      <div class="orders-grid">
        @for (order of filteredOrders(); track order.id) {
          <div class="order-card" (click)="openDetailDrawer(order)">
            <div class="order-card-header">
              <div>
                <span class="order-id">{{ order.id }}</span>
                <span class="order-date">{{ formatDate(order.createdAt) }}</span>
              </div>
              <span class="status-badge" [class]="'badge-' + order.status">
                {{ orderService.getStatusLabel(order.status) }}
              </span>
            </div>

            <div class="order-card-body">
              <div class="info-row">
                <span class="info-label">Cliente:</span>
                <span class="info-value font-bold">{{ order.shippingAddress.fullName }}</span>
              </div>
              <div class="info-row">
                <span class="info-label">Ubicación:</span>
                <span class="info-value">{{ order.shippingAddress.neighborhood }}, {{ order.shippingAddress.city }}</span>
              </div>
              <div class="info-row">
                <span class="info-label">Método Pago:</span>
                <span class="info-value text-uppercase">{{ order.paymentMethod }}</span>
              </div>
            </div>

            <div class="order-card-footer">
              <span class="items-summary">
                {{ getItemsSummary(order) }}
              </span>
              <span class="order-total-price">
                {{ order.total | mxnCurrency }}
              </span>
            </div>
          </div>
        } @empty {
          <div class="card empty-orders-card">
            <span class="empty-emoji"><app-icon name="package" size="48" /></span>
            <h3>No se encontraron pedidos</h3>
            <p>No existen compras en este estado de procesamiento actualmente.</p>
          </div>
        }
      </div>
    </div>

    <!-- Order Detail Slide-Over/Drawer -->
    @if (isDetailDrawerOpen()) {
      <div class="modal-backdrop" (click)="closeDetailDrawer()"></div>
      <div class="modal-drawer order-detail-drawer">
        <div class="modal-header">
          <div class="drawer-header-title">
            <h2>Pedido {{ selectedOrder()?.id }}</h2>
            <span class="status-badge" [class]="'badge-' + selectedOrder()?.status">
              {{ orderService.getStatusLabel(selectedOrder()?.status || 'pending') }}
            </span>
          </div>
          <button (click)="closeDetailDrawer()" class="modal-close-btn">&times;</button>
        </div>

        <div class="drawer-content-scroll">
          <!-- Timeline Tracker -->
          <div class="detail-section">
            <h3 class="section-title">Progreso del Pedido</h3>
            <div class="order-timeline">
              @for (step of getStatusSteps(); track step.key; let idx = $index) {
                <div class="timeline-step" [class.completed]="isStepCompleted(step.key)" [class.current]="selectedOrder()?.status === step.key">
                  <div class="step-circle">{{ idx + 1 }}</div>
                  <span class="step-label">{{ step.label }}</span>
                </div>
              }
            </div>
          </div>

          <!-- Customer Address Info -->
          <div class="detail-section">
            <h3 class="section-title">Dirección de Entrega</h3>
            <div class="address-box">
              <span class="address-icon-badge" style="display: inline-flex; align-items: center; gap: 4px;">
                <app-icon name="map-pin" size="14" />
                <span>{{ selectedOrder()?.shippingAddress?.label }}</span>
              </span>
              <h4 class="addr-name">{{ selectedOrder()?.shippingAddress?.fullName }}</h4>
              <p class="addr-text">
                {{ selectedOrder()?.shippingAddress?.street }} {{ selectedOrder()?.shippingAddress?.exteriorNumber }}
                @if (selectedOrder()?.shippingAddress?.interiorNumber) {
                  Int. {{ selectedOrder()?.shippingAddress?.interiorNumber }}
                }
              </p>
              <p class="addr-text">Col. {{ selectedOrder()?.shippingAddress?.neighborhood }}, {{ selectedOrder()?.shippingAddress?.zipCode }}</p>
              <p class="addr-text">{{ selectedOrder()?.shippingAddress?.city }}, {{ selectedOrder()?.shippingAddress?.state }}</p>
              <p class="addr-phone" style="display: flex; align-items: center; gap: 4px;">
                <app-icon name="phone" size="14" />
                <span>Teléfono: {{ selectedOrder()?.shippingAddress?.phone }}</span>
              </p>
            </div>
          </div>

          <!-- Shipping Details & Tracking -->
          <div class="detail-section">
            <h3 class="section-title">Información de Envío</h3>
            <div class="form-row-2">
              <div class="form-group">
                <label class="label-control">Método de Envío</label>
                <span class="form-value-tag" style="display: inline-flex; align-items: center; gap: 4px;">
                  <app-icon [name]="selectedOrder()?.shippingMethod === 'express' ? 'bolt' : 'truck'" size="14" />
                  <span>{{ selectedOrder()?.shippingMethod === 'express' ? 'Express' : 'Estándar' }}</span>
                </span>
              </div>
              <div class="form-group">
                <label class="label-control">Método de Pago</label>
                <span class="form-value-tag text-uppercase" style="display: inline-flex; align-items: center; gap: 4px;">
                  <app-icon name="credit-card" size="14" />
                  <span>{{ selectedOrder()?.paymentMethod }}</span>
                </span>
              </div>
            </div>

            <!-- Tracking number configurator -->
            @if (selectedOrder()?.status === 'shipped' || selectedOrder()?.status === 'delivered' || selectedOrder()?.status === 'preparing') {
              <div class="tracking-manager">
                <div class="form-group">
                  <label for="tracking-num" class="label-control">Código de Rastreo / Guía</label>
                  <div class="input-with-button">
                    <input 
                      type="text" 
                      id="tracking-num" 
                      [(ngModel)]="tempTrackingNumber"
                      placeholder="Ej. TRK-MX98765"
                      class="form-control"
                    />
                    <button (click)="saveTracking()" class="btn btn-primary btn-sm-save">Guardar</button>
                  </div>
                </div>
              </div>
            }
          </div>

          <!-- Items Table -->
          <div class="detail-section">
            <h3 class="section-title">Productos del Pedido</h3>
            <div class="items-list">
              @for (item of selectedOrder()?.items; track item.product.id) {
                <div class="order-item-row">
                  <span class="order-item-emoji"><app-icon name="package" size="18" /></span>
                  <div class="order-item-info">
                    <h4>{{ item.product.name }}</h4>
                    <p>{{ item.product.price | mxnCurrency }} c/u</p>
                  </div>
                  <div class="order-item-totals">
                    <span class="order-item-qty">x{{ item.quantity }}</span>
                    <span class="order-item-sum">{{ (item.product.price * item.quantity) | mxnCurrency }}</span>
                  </div>
                </div>
              } @empty {
                <div class="empty-purchases">
                  <span class="empty-emoji"><app-icon name="package" size="32" /></span>
                  <p>Sin productos cargados para este pedido.</p>
                </div>
              }
            </div>
          </div>
        </div>

        <!-- Order Workflow Transition Actions Footer -->
        <div class="modal-footer workflow-actions">
          @if (selectedOrder()?.status === 'pending') {
            <button (click)="cancelOrder()" class="btn btn-secondary flex-grow-1">Cancelar Compra</button>
            <button (click)="advanceStatus('preparing')" class="btn btn-primary flex-grow-1" style="display: inline-flex; align-items: center; justify-content: center; gap: 8px;">Preparar Pedido <app-icon name="egg" size="18" /></button>
          }
          @if (selectedOrder()?.status === 'preparing') {
            <button (click)="cancelOrder()" class="btn btn-secondary flex-grow-1">Cancelar Compra</button>
            <button (click)="advanceStatus('shipped')" class="btn btn-primary flex-grow-1" style="display: inline-flex; align-items: center; justify-content: center; gap: 8px;">Marcar En Camino <app-icon name="truck" size="18" /></button>
          }
          @if (selectedOrder()?.status === 'shipped') {
            <button (click)="advanceStatus('preparing')" class="btn btn-secondary flex-grow-1">Regresar a Cocina</button>
            <button (click)="advanceStatus('delivered')" class="btn btn-primary flex-grow-1" style="display: inline-flex; align-items: center; justify-content: center; gap: 8px;">Entregado con Éxito <app-icon name="check" size="18" /></button>
          }
          @if (selectedOrder()?.status === 'delivered') {
            <button (click)="advanceStatus('refunded')" class="btn btn-secondary btn-full" style="display: inline-flex; align-items: center; justify-content: center; gap: 8px;">Realizar Reembolso <app-icon name="arrow-left" size="18" /></button>
          }
          @if (selectedOrder()?.status === 'cancelled' || selectedOrder()?.status === 'refunded') {
            <div class="closed-flow-msg">
              Este flujo de pedido se encuentra cerrado. No se requieren más acciones.
            </div>
          }
        </div>
      </div>
    }
  `,
  styleUrl: './orders.css',
})
export class OrderTracker {
  protected orderService = inject(OrderService);

  // Filters State Signals
  selectedTab = signal<string>('all');
  searchQuery = signal('');

  // Detail Modal Overlay Signals
  isDetailDrawerOpen = signal<boolean>(false);
  selectedOrder = signal<Order | null>(null);

  // Temporary courier tracking fields
  tempTrackingNumber = '';

  // Pipeline counters
  readonly countAll = computed(() => this.orderService.getOrders().length);
  readonly countPending = computed(() => this.orderService.getOrders().filter(o => o.status === 'pending').length);
  readonly countPreparing = computed(() => this.orderService.getOrders().filter(o => o.status === 'preparing').length);
  readonly countShipped = computed(() => this.orderService.getOrders().filter(o => o.status === 'shipped').length);
  readonly countCompleted = computed(() => this.orderService.getOrders().filter(o => o.status === 'delivered' || o.status === 'cancelled').length);

  // Filtered Orders Pipeline
  readonly filteredOrders = computed(() => {
    let list = this.orderService.getOrders();

    // Tab filter
    const tab = this.selectedTab();
    if (tab === 'pending') {
      list = list.filter((o) => o.status === 'pending');
    } else if (tab === 'preparing') {
      list = list.filter((o) => o.status === 'preparing');
    } else if (tab === 'shipped') {
      list = list.filter((o) => o.status === 'shipped');
    } else if (tab === 'completed') {
      list = list.filter((o) => o.status === 'delivered' || o.status === 'cancelled' || o.status === 'refunded');
    }

    // Text search
    if (this.searchQuery()) {
      const q = this.searchQuery().toLowerCase();
      list = list.filter(
        (o) =>
          o.id.toLowerCase().includes(q) ||
          o.shippingAddress.fullName.toLowerCase().includes(q)
      );
    }

    return list;
  });

  formatDate(date: Date): string {
    return date.toLocaleString('es-MX', {
      day: '2-digit',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  getItemsSummary(order: Order): string {
    if (order.items && order.items.length > 0) {
      const names = order.items.map((it) => it.product.name).join(', ');
      return names.length > 30 ? `${names.slice(0, 30)}...` : names;
    }
    return 'Sin productos cargados';
  }

  // --- Detail Drawer Managers ---

  openDetailDrawer(order: Order): void {
    this.selectedOrder.set(order);
    this.tempTrackingNumber = order.trackingNumber || '';
    this.isDetailDrawerOpen.set(true);
  }

  closeDetailDrawer(): void {
    this.isDetailDrawerOpen.set(false);
    this.selectedOrder.set(null);
  }

  // --- Timeline computations ---

  getStatusSteps() {
    return this.orderService.getStatusSteps();
  }

  isStepCompleted(stepKey: OrderStatus): boolean {
    const order = this.selectedOrder();
    if (!order) return false;

    const sequence: OrderStatus[] = ['pending', 'preparing', 'shipped', 'delivered'];
    const currentIdx = sequence.indexOf(order.status);
    const stepIdx = sequence.indexOf(stepKey);

    if (currentIdx === -1) return false; // for cancelled/refunded
    return stepIdx <= currentIdx;
  }

  // --- Actions ---

  advanceStatus(nextStatus: string): void {
    const order = this.selectedOrder();
    if (!order) return;

    this.orderService.updateOrderStatus(order.id, nextStatus as OrderStatus);

    // Refresh selected order reactively
    const updated = this.orderService.getOrderById(order.id);
    if (updated) {
      this.selectedOrder.set(updated);
    }
  }

  cancelOrder(): void {
    const order = this.selectedOrder();
    if (!order) return;

    const confirmCancel = confirm('¿Deseas cancelar definitivamente este pedido? Se notificará al usuario.');
    if (confirmCancel) {
      this.orderService.cancelOrder(order.id);
      const updated = this.orderService.getOrderById(order.id);
      if (updated) {
        this.selectedOrder.set(updated);
      }
    }
  }

  saveTracking(): void {
    const order = this.selectedOrder();
    if (!order) return;

    this.orderService.updateOrderStatus(order.id, order.status, this.tempTrackingNumber);
    alert('Código de rastreo actualizado.');

    const updated = this.orderService.getOrderById(order.id);
    if (updated) {
      this.selectedOrder.set(updated);
    }
  }
}



