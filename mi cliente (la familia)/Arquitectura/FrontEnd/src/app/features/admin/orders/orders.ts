// orders.component.ts
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
      <!-- Header -->
      <div class="manager-header">
        <div class="header-content">
          <h1 class="page-title">
            Flujo de Pedidos
          </h1>
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
          <app-icon name="package" size="14" color="currentColor" />
          Todos <span class="tab-count">{{ countAll() }}</span>
        </button>
        <button 
          (click)="selectedTab.set('pending')" 
          [class.active]="selectedTab() === 'pending'" 
          class="tab-btn pending-tab"
        >
          <app-icon name="clock" size="14" color="currentColor" />
          Pendientes <span class="tab-count count-pending">{{ countPending() }}</span>
        </button>
        <button 
          (click)="selectedTab.set('preparing')" 
          [class.active]="selectedTab() === 'preparing'" 
          class="tab-btn preparing-tab"
        >
          <app-icon name="egg" size="14" color="currentColor" />
          Preparando <span class="tab-count count-preparing">{{ countPreparing() }}</span>
        </button>
        <button 
          (click)="selectedTab.set('shipped')" 
          [class.active]="selectedTab() === 'shipped'" 
          class="tab-btn shipped-tab"
        >
          <app-icon name="truck" size="14" color="currentColor" />
          En Camino <span class="tab-count count-shipped">{{ countShipped() }}</span>
        </button>
        <button 
          (click)="selectedTab.set('completed')" 
          [class.active]="selectedTab() === 'completed'" 
          class="tab-btn completed-tab"
        >
          <app-icon name="check" size="14" color="currentColor" />
          Entregados <span class="tab-count count-completed">{{ countCompleted() }}</span>
        </button>
      </div>

      <!-- Search Bar -->
      <div class="filters-bar">
        <div class="search-input-wrapper">
          <span class="search-icon"><app-icon name="search" size="18" color="var(--text-muted)" /></span>
          <input 
            type="text" 
            [ngModel]="searchQuery()" 
            (ngModelChange)="searchQuery.set($event)"
            placeholder="Buscar por ID de pedido o nombre de cliente..."
            class="form-control"
          />
        </div>
        <div class="stats-badge">
          <app-icon name="package" size="16" color="white" />
          <span>{{ filteredOrders().length }} pedidos</span>
        </div>
      </div>

      <!-- Orders Grid -->
      <div class="orders-grid">
        @for (order of filteredOrders(); track order.id) {
          <div class="order-card" (click)="openDetailDrawer(order)">
            <div class="order-card-header">
              <div>
                <span class="order-id">{{ order.id }}</span>
                <span class="order-date">{{ formatDate(order.createdAt) }}</span>
              </div>
              <span class="status-badge" [class]="'badge-' + order.status">
                <app-icon [name]="getStatusIcon(order.status)" size="10" color="currentColor" />
                {{ orderService.getStatusLabel(order.status) }}
              </span>
            </div>

            <div class="order-card-body">
              <div class="info-row">
                <span class="info-label">
                  <app-icon name="user" size="12" color="var(--text-muted)" />
                  Cliente:
                </span>
                <span class="info-value font-bold">{{ order.shippingAddress.fullName }}</span>
              </div>
              <div class="info-row">
                <span class="info-label">
                  <app-icon name="map-pin" size="12" color="var(--text-muted)" />
                  Ubicación:
                </span>
                <span class="info-value">{{ order.shippingAddress.neighborhood }}, {{ order.shippingAddress.city }}</span>
              </div>
              <div class="info-row">
                <span class="info-label">
                  <app-icon name="credit-card" size="12" color="var(--text-muted)" />
                  Método Pago:
                </span>
                <span class="info-value text-uppercase">{{ order.paymentMethod }}</span>
              </div>
            </div>

            <div class="order-card-footer">
              <span class="items-summary">
                <app-icon name="shopping-cart" size="12" color="var(--text-muted)" />
                {{ getItemsSummary(order) }}
              </span>
              <span class="order-total-price">
                {{ order.total | mxnCurrency }}
              </span>
            </div>
          </div>
        } @empty {
          <div class="card empty-orders-card">
            <app-icon name="package" size="48" color="var(--text-muted)" />
            <h3>No se encontraron pedidos</h3>
            <p>No existen compras en este estado de procesamiento actualmente.</p>
          </div>
        }
      </div>
    </div>

    <!-- Order Detail Drawer -->
    @if (isDetailDrawerOpen()) {
      <div class="modal-backdrop" (click)="closeDetailDrawer()"></div>
      <div class="modal-drawer order-detail-drawer">
        <div class="modal-header">
          <div class="drawer-header-title">
            <h2>
              <app-icon name="package" size="20" color="var(--primary)" />
              Pedido {{ selectedOrder()?.id }}
            </h2>
            <span class="status-badge" [class]="'badge-' + selectedOrder()?.status">
              <app-icon [name]="getStatusIcon(selectedOrder()?.status || 'pending')" size="10" color="currentColor" />
              {{ orderService.getStatusLabel(selectedOrder()?.status || 'pending') }}
            </span>
          </div>
          <button (click)="closeDetailDrawer()" class="modal-close-btn">&times;</button>
        </div>

        <div class="drawer-content-scroll">
          <!-- Timeline Tracker -->
          <div class="detail-section">
            <h3 class="section-title">
              <app-icon name="activity" size="16" color="var(--primary)" />
              Progreso del Pedido
            </h3>
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
            <h3 class="section-title">
              <app-icon name="map-pin" size="16" color="var(--primary)" />
              Dirección de Entrega
            </h3>
            <div class="address-box">
              <span class="address-icon-badge">
                <app-icon name="home" size="14" color="var(--primary)" />
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
              <p class="addr-phone">
                <app-icon name="phone" size="14" color="var(--primary)" />
                <span>Teléfono: {{ selectedOrder()?.shippingAddress?.phone }}</span>
              </p>
            </div>
          </div>

          <!-- Shipping Details -->
          <div class="detail-section">
            <h3 class="section-title">
              <app-icon name="truck" size="16" color="var(--primary)" />
              Información de Envío
            </h3>
            <div class="form-row-2">
              <div class="form-group">
                <label class="label-control">Método de Envío</label>
                <span class="form-value-tag">
                  <app-icon [name]="selectedOrder()?.shippingMethod === 'express' ? 'bolt' : 'truck'" size="14" color="var(--primary)" />
                  <span>{{ selectedOrder()?.shippingMethod === 'express' ? 'Express' : 'Estándar' }}</span>
                </span>
              </div>
              <div class="form-group">
                <label class="label-control">Método de Pago</label>
                <span class="form-value-tag text-uppercase">
                  <app-icon name="credit-card" size="14" color="var(--primary)" />
                  <span>{{ selectedOrder()?.paymentMethod }}</span>
                </span>
              </div>
            </div>

            <!-- Tracking number -->
            @if (selectedOrder()?.status === 'shipped' || selectedOrder()?.status === 'delivered' || selectedOrder()?.status === 'preparing') {
              <div class="tracking-manager">
                <div class="form-group">
                  <label for="tracking-num" class="label-control">
                    <app-icon name="hash" size="14" color="var(--text-muted)" />
                    Código de Rastreo / Guía
                  </label>
                  <div class="input-with-button">
                    <input 
                      type="text" 
                      id="tracking-num" 
                      [(ngModel)]="tempTrackingNumber"
                      placeholder="Ej. TRK-MX98765"
                      class="form-control"
                    />
                    <button (click)="saveTracking()" class="btn btn-primary btn-sm-save">
                      <app-icon name="check" size="14" color="white" />
                      Guardar
                    </button>
                  </div>
                </div>
              </div>
            }
          </div>

          <!-- Items Table -->
          <div class="detail-section">
            <h3 class="section-title">
              <app-icon name="shopping-cart" size="16" color="var(--primary)" />
              Productos del Pedido
            </h3>
            <div class="items-list">
              @for (item of selectedOrder()?.items; track item.product.id) {
                <div class="order-item-row">
                  <div class="order-item-emoji">
                    <app-icon name="package" size="18" color="var(--primary)" />
                  </div>
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
                  <app-icon name="package" size="32" color="var(--text-muted)" />
                  <p>Sin productos cargados para este pedido.</p>
                </div>
              }
            </div>
          </div>
        </div>

        <!-- Order Workflow Actions Footer -->
        <div class="modal-footer workflow-actions">
          @if (selectedOrder()?.status === 'pending') {
            <button (click)="cancelOrder()" class="btn btn-secondary flex-grow-1">
              <app-icon name="x" size="16" />
              Cancelar Compra
            </button>
            <button (click)="advanceStatus('preparing')" class="btn btn-primary flex-grow-1">
              <app-icon name="egg" size="16" color="white" />
              Preparar Pedido
            </button>
          }
          @if (selectedOrder()?.status === 'preparing') {
            <button (click)="cancelOrder()" class="btn btn-secondary flex-grow-1">
              <app-icon name="x" size="16" />
              Cancelar Compra
            </button>
            <button (click)="advanceStatus('shipped')" class="btn btn-primary flex-grow-1">
              <app-icon name="truck" size="16" color="white" />
              Marcar En Camino
            </button>
          }
          @if (selectedOrder()?.status === 'shipped') {
            <button (click)="advanceStatus('preparing')" class="btn btn-secondary flex-grow-1">
              <app-icon name="arrow-left" size="16" />
              Regresar a Cocina
            </button>
            <button (click)="advanceStatus('delivered')" class="btn btn-primary flex-grow-1">
              <app-icon name="check" size="16" color="white" />
              Entregado con Éxito
            </button>
          }
          @if (selectedOrder()?.status === 'delivered') {
            <button (click)="advanceStatus('refunded')" class="btn btn-secondary btn-full">
              <app-icon name="arrow-left" size="16" />
              Realizar Reembolso
            </button>
          }
          @if (selectedOrder()?.status === 'cancelled' || selectedOrder()?.status === 'refunded') {
            <div class="closed-flow-msg">
              <app-icon name="lock" size="16" color="var(--text-muted)" />
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

  selectedTab = signal<string>('all');
  searchQuery = signal('');
  isDetailDrawerOpen = signal<boolean>(false);
  selectedOrder = signal<Order | null>(null);
  tempTrackingNumber = '';

  readonly countAll = computed(() => this.orderService.getOrders().length);
  readonly countPending = computed(() => this.orderService.getOrders().filter(o => o.status === 'pending').length);
  readonly countPreparing = computed(() => this.orderService.getOrders().filter(o => o.status === 'preparing').length);
  readonly countShipped = computed(() => this.orderService.getOrders().filter(o => o.status === 'shipped').length);
  readonly countCompleted = computed(() => this.orderService.getOrders().filter(o => o.status === 'delivered' || o.status === 'cancelled').length);

  readonly filteredOrders = computed(() => {
    let list = this.orderService.getOrders();

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

  getStatusIcon(status: string): string {
    const icons: Record<string, string> = {
      'pending': 'clock',
      'preparing': 'egg',
      'shipped': 'truck',
      'delivered': 'check',
      'cancelled': 'x',
      'refunded': 'arrow-left'
    };
    return icons[status] || 'package';
  }

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

  openDetailDrawer(order: Order): void {
    this.selectedOrder.set(order);
    this.tempTrackingNumber = order.trackingNumber || '';
    this.isDetailDrawerOpen.set(true);
  }

  closeDetailDrawer(): void {
    this.isDetailDrawerOpen.set(false);
    this.selectedOrder.set(null);
  }

  getStatusSteps() {
    return this.orderService.getStatusSteps();
  }

  isStepCompleted(stepKey: OrderStatus): boolean {
    const order = this.selectedOrder();
    if (!order) return false;

    const sequence: OrderStatus[] = ['pending', 'preparing', 'shipped', 'delivered'];
    const currentIdx = sequence.indexOf(order.status);
    const stepIdx = sequence.indexOf(stepKey);

    if (currentIdx === -1) return false;
    return stepIdx <= currentIdx;
  }

  advanceStatus(nextStatus: string): void {
    const order = this.selectedOrder();
    if (!order) return;

    this.orderService.updateOrderStatus(order.id, nextStatus as OrderStatus);

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