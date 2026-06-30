import { HttpClient } from '@angular/common/http';
import { Component, inject, computed, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ProductService } from '../../../core/services/product.service';
import { OrderService } from '../../../core/services/order.service';
import { MxnCurrencyPipe } from '../../../shared/pipes/currency.pipe';
import { IconComponent } from '../../../shared/components/icon/icon';
import { API_BASE_URL } from '../../../core/api.config';

interface ApiCustomer {
  id: string;
}

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [RouterLink, MxnCurrencyPipe, IconComponent],
  template: `
    <div class="dashboard-container">
      <div class="dashboard-header">
        <div>
          <h1 class="page-title">Panel de Control</h1>
          <p class="page-subtitle">Bienvenido al centro administrativo de Tiendita Maday</p>
        </div>
        <div class="header-date" style="display: inline-flex; align-items: center; gap: 6px;">
          <app-icon name="calendar" size="18" /> {{ currentDateLabel }}
        </div>
      </div>

      <!-- KPI Metrics Grid -->
      <div class="kpi-grid">
        <div class="kpi-card" id="kpi-sales">
          <div class="kpi-icon sales-icon"><app-icon name="dollar-sign" size="24" /></div>
          <div class="kpi-content">
            <h3>Ventas Totales</h3>
            <p class="kpi-value">{{ totalSales() | mxnCurrency }}</p>
            <span class="kpi-trend positive">↑ Activo</span>
          </div>
        </div>

        <div class="kpi-card" id="kpi-orders">
          <div class="kpi-icon orders-icon"><app-icon name="package" size="24" /></div>
          <div class="kpi-content">
            <h3>Pedidos Totales</h3>
            <p class="kpi-value">{{ totalOrders() }}</p>
            <span class="kpi-trend positive">↑ {{ pendingOrders() }} pendientes</span>
          </div>
        </div>

        <div class="kpi-card" id="kpi-products">
          <div class="kpi-icon products-icon"><app-icon name="leaf" size="24" /></div>
          <div class="kpi-content">
            <h3>En Catálogo</h3>
            <p class="kpi-value">{{ totalProducts() }}</p>
            <span class="kpi-trend warning" style="display: inline-flex; align-items: center; gap: 4px;">
              <app-icon name="alert-triangle" size="14" /> {{ lowStockCount() }} stock bajo
            </span>
          </div>
        </div>

        <div class="kpi-card" id="kpi-users">
          <div class="kpi-icon users-icon"><app-icon name="users" size="24" /></div>
          <div class="kpi-content">
            <h3>Clientes Activos</h3>
            <p class="kpi-value">{{ activeUsersCount() }}</p>
            <span class="kpi-trend positive" style="display: inline-flex; align-items: center; gap: 4px;">
              <app-icon name="star" size="14" fill="currentColor" /> 100% verificados
            </span>
          </div>
        </div>
      </div>

      <!-- Charts & Alerts Layout -->
      <div class="dashboard-layout">
        <!-- Sales Chart Card -->
        <section class="card chart-card">
          <div class="card-header">
            <h2>Tendencia de Ventas (Últimos 7 Días)</h2>
            <span class="chart-badge-tag">Monto (MXN)</span>
          </div>
          <div class="chart-wrapper">
            <svg viewBox="0 0 500 220" class="svg-chart" preserveAspectRatio="none">
              <!-- Grid Lines -->
              <line x1="40" y1="50" x2="460" y2="50" class="grid-line" />
              <line x1="40" y1="110" x2="460" y2="110" class="grid-line" />
              <line x1="40" y1="170" x2="460" y2="170" class="grid-line" />

              <!-- SVG Gradient definitions -->
              <defs>
                <linearGradient id="chart-grad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stop-color="var(--primary)" stop-opacity="0.3"/>
                  <stop offset="100%" stop-color="var(--primary)" stop-opacity="0.0"/>
                </linearGradient>
              </defs>

              <!-- Filled Area Under the Line -->
              <path [attr.d]="filledAreaPath()" fill="url(#chart-grad)" />

              <!-- Main Trend Line -->
              <polyline [attr.points]="chartPath()" fill="none" stroke="var(--primary)" stroke-width="3" stroke-linecap="round" />

              <!-- Markers & Tooltips -->
              @for (p of chartPoints(); track p.x; let idx = $index) {
                <g class="chart-dot-group">
                  <circle [attr.cx]="p.x" [attr.cy]="p.y" r="6" fill="#fff" stroke="var(--primary)" stroke-width="3" />
                  <circle [attr.cx]="p.x" [attr.cy]="p.y" r="10" fill="var(--primary)" fill-opacity="0" class="dot-hover-trigger" />
                  <!-- Value Tooltip -->
                  <text [attr.x]="p.x" [attr.y]="p.y - 12" text-anchor="middle" class="chart-value-label">{{ p.val | mxnCurrency }}</text>
                  <!-- X-Axis Label -->
                  <text [attr.x]="p.x" y="195" text-anchor="middle" class="axis-label">{{ p.label }}</text>
                </g>
              }
            </svg>
          </div>
        </section>

        <!-- Low Stock Alerts -->
        <section class="card alert-card">
          <div class="card-header">
            <h2>Existencias Críticas</h2>
            <a routerLink="/admin/products" class="card-action-link">Ir a inventario</a>
          </div>
          <div class="alert-list">
            @for (prod of lowStockProducts(); track prod.id) {
              <div class="alert-item" [class.danger]="prod.stockQuantity === 0">
                <span class="alert-item-emoji"><app-icon [name]="getCategoryIcon(prod.categoryId)" size="20" /></span>
                <div class="alert-item-info">
                  <h4>{{ prod.name }}</h4>
                  <p>{{ prod.category }}</p>
                </div>
                <div class="alert-item-badge">
                  @if (prod.stockQuantity === 0) {
                    <span class="badge-out">Agotado</span>
                  } @else {
                    <span class="badge-low">{{ prod.stockQuantity }} unid.</span>
                  }
                </div>
              </div>
            } @empty {
              <div class="empty-state">
                <span class="empty-emoji" style="display: flex; justify-content: center;"><app-icon name="check" size="32" color="var(--success)" /></span>
                <p>Todo el catálogo cuenta con inventario suficiente.</p>
              </div>
            }
          </div>
        </section>
      </div>

      <!-- Recent Activity Feed -->
      <section class="card activity-card">
        <div class="card-header">
          <h2>Bitácora de Actividad Reciente</h2>
          <span class="activity-status">Sistema en Vivo</span>
        </div>
        <div class="activity-list">
          @for (log of activityLogs(); track log.id) {
            <div class="activity-item">
              <div class="activity-time">{{ log.time }}</div>
              <div class="activity-indicator" [style.background-color]="log.color"></div>
              <div class="activity-desc">
                <strong>{{ log.title }}</strong>: {{ log.desc }}
              </div>
            </div>
          }
        </div>
      </section>
    </div>
  `,
  styleUrl: './dashboard.css',
})
export class Dashboard {
  protected productService = inject(ProductService);
  protected orderService = inject(OrderService);
  private http = inject(HttpClient);

  readonly currentDateLabel = new Date().toLocaleDateString('es-MX', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  readonly customerCount = signal(0);
  readonly activeUsersCount = computed(() => this.customerCount());

  constructor() {
    this.loadCustomerCount();
  }

  // Computeds for metrics
  readonly totalSales = computed(() => {
    return this.orderService.getOrders()
      .filter((o) => o.status !== 'cancelled')
      .reduce((sum, o) => sum + o.total, 0);
  });

  readonly totalOrders = computed(() => this.orderService.getOrders().length);

  readonly pendingOrders = computed(() => {
    return this.orderService.getOrders().filter((o) => o.status === 'pending').length;
  });

  readonly totalProducts = computed(() => this.productService.getProducts().length);

  readonly lowStockProducts = computed(() => {
    return this.productService.getProducts().filter((p) => p.stockQuantity <= 10 || !p.inStock);
  });

  readonly lowStockCount = computed(() => this.lowStockProducts().length);

  // SVG Chart Computations
  readonly chartPoints = computed(() => {
    const orders = this.orderService.getOrders().filter((o) => o.status !== 'cancelled');
    const days: Date[] = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      d.setHours(0, 0, 0, 0);
      days.push(d);
    }

    const dailySales = days.map((day) => {
      const nextDay = new Date(day);
      nextDay.setDate(day.getDate() + 1);

      return orders
        .filter((o) => {
          const cDate = new Date(o.createdAt);
          return cDate >= day && cDate < nextDay;
        })
        .reduce((sum, o) => sum + o.total, 0);
    });

    const maxSales = Math.max(...dailySales, 200); // Scale relative to sales (at least 200)

    // Map to SVG coordinate grid: width=420 (from 40 to 460), height=120 (from 50 to 170)
    return dailySales.map((val, idx) => {
      const x = 40 + idx * 70; // 7 points spaced evenly by 70px
      const y = 170 - (val / maxSales) * 110; // scale values up to 110px height
      return { x, y, val, label: this.getDayLabel(days[idx]) };
    });
  });

  readonly chartPath = computed(() => {
    return this.chartPoints().map((p) => `${p.x},${p.y}`).join(' ');
  });

  readonly filledAreaPath = computed(() => {
    const pts = this.chartPoints();
    if (pts.length === 0) return '';
    const first = pts[0];
    const last = pts[pts.length - 1];
    return `M ${first.x} 170 L ${pts.map((p) => `${p.x} ${p.y}`).join(' L ')} L ${last.x} 170 Z`;
  });

  readonly activityLogs = computed(() => {
    const logs: { id: string; time: string; color: string; title: string; desc: string }[] = [];

    this.orderService.getOrders().slice(0, 3).forEach((order) => {
      logs.push({
        id: `order-log-${order.id}`,
        time: order.createdAt.toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' }),
        color: order.status === 'pending' ? 'var(--secondary)' : 'var(--accent)',
        title: `Pedido ${order.id}`,
        desc: `Recibido por un total de MXN ${order.total.toFixed(2)} (${this.orderService.getStatusLabel(order.status)})`,
      });
    });

    this.lowStockProducts().slice(0, 3).forEach((product) => {
      logs.push({
        id: `stock-log-${product.id}`,
        time: this.currentDateLabel,
        color: 'var(--warning)',
        title: product.stockQuantity === 0 ? 'Producto agotado' : 'Inventario bajo',
        desc: `${product.name} tiene ${product.stockQuantity} unidades disponibles.`,
      });
    });

    return logs;
  });

  private loadCustomerCount(): void {
    this.http.get<ApiCustomer[]>(`${API_BASE_URL}/customers`).subscribe({
      next: (customers) => this.customerCount.set(customers.length),
      error: () => this.customerCount.set(0),
    });
  }

  getCategoryIcon(categoryId: string): string {
    return this.productService.getCategories().find((c) => c.id === categoryId)?.icon ?? 'package';
  }

  private getDayLabel(date: Date): string {
    const daysShort = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
    return daysShort[date.getDay()];
  }
}



