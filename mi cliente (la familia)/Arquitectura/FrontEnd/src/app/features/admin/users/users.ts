// users.component.ts
import { Component, inject, signal, computed } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { OrderService } from '../../../core/services/order.service';
import { User } from '../../../core/models/user.model';
import { MxnCurrencyPipe } from '../../../shared/pipes/currency.pipe';
import { IconComponent } from '../../../shared/components/icon/icon';

const INITIAL_USERS: User[] = [
  { id: '1', firstName: 'Carlos', lastName: 'Hernández', email: 'carlos.hdz@maday.com', phone: '+52 555 123 4567', isVerified: true, createdAt: new Date('2026-01-10'), role: 'admin' },
  { id: '2', firstName: 'María', lastName: 'López', email: 'maria.lopez@gmail.com', phone: '+52 555 321 7654', isVerified: true, createdAt: new Date('2026-03-05'), role: 'user' },
  { id: '3', firstName: 'Juan', lastName: 'García', email: 'j.garcia@outlook.com', phone: '+52 555 890 1234', isVerified: true, createdAt: new Date('2026-04-12'), role: 'user' },
  { id: '4', firstName: 'Ana', lastName: 'Martínez', email: 'ana.mtz@yahoo.com', phone: '+52 555 456 7890', isVerified: false, createdAt: new Date('2026-05-18'), role: 'user' },
];

@Component({
  selector: 'app-user-directory',
  standalone: true,
  imports: [FormsModule, MxnCurrencyPipe, IconComponent],
  template: `
    <div class="user-directory">
      <!-- Header -->
      <div class="manager-header">
        <div class="header-content">
          <h1 class="page-title">Directorio de Clientes</h1>
          <p class="page-subtitle">Visualiza perfiles, cambia permisos administrativos y examina historiales de compras</p>
        </div>
      </div>

      <!-- Search Bar -->
      <div class="filters-bar">
        <div class="search-input-wrapper">
          <span class="search-icon"><app-icon name="search" size="18" color="var(--text-muted)" /></span>
          <input 
            type="text" 
            [ngModel]="searchQuery()" 
            (ngModelChange)="searchQuery.set($event)"
            placeholder="Buscar por nombre, apellido o correo electrónico..."
            class="form-control"
          />
        </div>
        <div class="stats-badge">
          <app-icon name="users" size="16" color="white" />
          <span>{{ filteredUsers().length }} clientes</span>
        </div>
      </div>

      <!-- Main Grid -->
      <div class="users-grid-layout">
        <!-- Users List -->
        <div class="card list-card">
          <div class="list-header">
            <h2>
              <app-icon name="users" size="18" color="var(--primary)" />
              Lista de Usuarios
            </h2>
            <span class="list-count">{{ filteredUsers().length }}</span>
          </div>
          <div class="users-scroll-list">
            @for (usr of filteredUsers(); track usr.id) {
              <div 
                (click)="selectUser(usr)" 
                [class.selected]="selectedUser()?.id === usr.id" 
                class="user-item-row"
              >
                <div class="user-avatar-bubble" [style.background]="getAvatarColor(usr)">
                  {{ usr.firstName.charAt(0) }}{{ usr.lastName.charAt(0) }}
                </div>
                <div class="user-item-details">
                  <div class="user-item-name-row">
                    <h4>{{ usr.firstName }} {{ usr.lastName }}</h4>
                    @if (usr.role === 'admin') {
                      <span class="admin-role-badge">
                        <app-icon name="shield" size="12" color="white" />
                        Admin
                      </span>
                    }
                    @if (usr.isVerified) {
                      <span class="verified-badge">
                        <app-icon name="check" size="14" color="var(--success)" />
                      </span>
                    }
                  </div>
                  <p class="user-item-sub">{{ usr.email }}</p>
                </div>
                <span class="arrow-indicator">
                  <app-icon name="chevron-right" size="16" color="var(--text-muted)" />
                </span>
              </div>
            } @empty {
              <div class="empty-state">
                <app-icon name="users" size="48" color="var(--text-muted)" />
                <p>No se encontraron usuarios coincidentes.</p>
              </div>
            }
          </div>
        </div>

        <!-- Detail Card -->
        <div class="card detail-card">
          @if (selectedUser(); as usr) {
            <!-- VIP Header -->
            <div class="vip-header">
              <div class="vip-banner"></div>
              <div class="detail-avatar-large" [style.background]="getAvatarColor(usr)">
                {{ usr.firstName.charAt(0) }}{{ usr.lastName.charAt(0) }}
              </div>
              <h2 class="detail-name">{{ usr.firstName }} {{ usr.lastName }}</h2>
              <p class="detail-email">{{ usr.email }}</p>
              
              <!-- Quick Stats -->
              <div class="quick-stats">
                <div class="stat-item">
                  <span class="stat-number">{{ getUserOrders(usr).length }}</span>
                  <span class="stat-label">
                    <app-icon name="shopping-cart" size="12" color="rgba(255,255,255,0.7)" />
                    Órdenes
                  </span>
                </div>
                <div class="stat-divider"></div>
                <div class="stat-item">
                  <span class="stat-number">1</span>
                  <span class="stat-label">
                    <app-icon name="map-pin" size="12" color="rgba(255,255,255,0.7)" />
                    Direcciones
                  </span>
                </div>
                <div class="stat-divider"></div>
                <div class="stat-item">
                  <span class="stat-number">2</span>
                  <span class="stat-label">
                    <app-icon name="credit-card" size="12" color="rgba(255,255,255,0.7)" />
                    Pagados
                  </span>
                </div>
              </div>

              <!-- Tabs Navigation -->
              <div class="profile-tabs">
                <button class="tab-btn" [class.active]="activeTab === 'data'" (click)="activeTab = 'data'">
                  <app-icon name="user" size="14" color="currentColor" />
                  Datos
                </button>
                <button class="tab-btn" [class.active]="activeTab === 'orders'" (click)="activeTab = 'orders'">
                  <app-icon name="shopping-cart" size="14" color="currentColor" />
                  Órdenes
                </button>
                <button class="tab-btn" [class.active]="activeTab === 'addresses'" (click)="activeTab = 'addresses'">
                  <app-icon name="map-pin" size="14" color="currentColor" />
                  Direcciones
                </button>
                <button class="tab-btn" [class.active]="activeTab === 'payments'" (click)="activeTab = 'payments'">
                  <app-icon name="credit-card" size="14" color="currentColor" />
                  Pagados
                </button>
                <button class="tab-btn" [class.active]="activeTab === 'activity'" (click)="activeTab = 'activity'">
                  <app-icon name="activity" size="14" color="currentColor" />
                  Mi Actividad
                </button>
              </div>
            </div>

            <!-- Content Sections -->
            <div class="detail-content">
              <!-- Data Tab -->
              @if (activeTab === 'data') {
                <div class="tab-content">
                  <!-- Profile Info -->
                  <div class="info-grid">
                    <div class="info-item">
                      <span class="info-label">
                        <app-icon name="mail" size="14" color="var(--text-muted)" />
                        Correo Electrónico
                      </span>
                      <span class="info-value">{{ usr.email }}</span>
                    </div>
                    <div class="info-item">
                      <span class="info-label">
                        <app-icon name="phone" size="14" color="var(--text-muted)" />
                        Teléfono móvil
                      </span>
                      <span class="info-value">{{ usr.phone }}</span>
                    </div>
                    <div class="info-item">
                      <span class="info-label">
                        <app-icon name="calendar" size="14" color="var(--text-muted)" />
                        Miembro desde
                      </span>
                      <span class="info-value">{{ formatDate(usr.createdAt) }}</span>
                    </div>
                    <div class="info-item">
                      <span class="info-label">
                        <app-icon name="check" size="14" color="var(--text-muted)" />
                        Estado
                      </span>
                      <span class="info-value">
                        <span class="status-chip" [class.verified]="usr.isVerified" [class.pending]="!usr.isVerified">
                          <app-icon [name]="usr.isVerified ? 'check' : 'clock'" size="12" color="currentColor" />
                          {{ usr.isVerified ? 'Cuenta Verificada' : 'Verificación Pendiente' }}
                        </span>
                      </span>
                    </div>
                  </div>

                  <!-- Role Control -->
                  <div class="role-control-card">
                    <div class="role-control-header">
                      <app-icon name="shield" size="18" color="var(--primary)" />
                      <h3>Privilegios Administrativos</h3>
                    </div>
                    <label class="toggle-switch">
                      <input 
                        type="checkbox" 
                        [checked]="usr.role === 'admin'"
                        (change)="toggleRole(usr)"
                        [disabled]="usr.id === '1'"
                      />
                      <span class="toggle-slider"></span>
                      <span class="toggle-label">
                        <app-icon [name]="usr.role === 'admin' ? 'shield' : 'user'" size="16" color="var(--primary)" />
                        {{ usr.role === 'admin' ? 'Administrador' : 'Cliente Estándar' }}
                      </span>
                    </label>
                    @if (usr.id === '1') {
                      <span class="lock-hint">
                        <app-icon name="lock" size="14" color="var(--text-muted)" />
                        Tu propia cuenta no se puede modificar
                      </span>
                    }
                  </div>
                </div>
              }

              <!-- Orders Tab -->
              @if (activeTab === 'orders') {
                <div class="tab-content">
                  <div class="purchase-section">
                    <div class="section-header">
                      <app-icon name="package" size="18" color="var(--primary)" />
                      <h3>Historial de Pedidos</h3>
                      <span class="order-count">{{ getUserOrders(usr).length }}</span>
                    </div>
                    <div class="purchases-scroll-list">
                      @for (ord of getUserOrders(usr); track ord.id) {
                        <div class="purchase-item">
                          <div class="purchase-left">
                            <span class="purchase-id">{{ ord.id }}</span>
                            <span class="purchase-date">{{ formatOrderDate(ord.createdAt) }}</span>
                          </div>
                          <div class="purchase-right">
                            <span class="status-badge" [class]="'badge-' + ord.status">
                              <app-icon [name]="getStatusIcon(ord.status)" size="10" color="currentColor" />
                              {{ orderService.getStatusLabel(ord.status) }}
                            </span>
                            <strong class="purchase-price">{{ ord.total | mxnCurrency }}</strong>
                          </div>
                        </div>
                      } @empty {
                        <div class="empty-purchases">
                          <app-icon name="shopping-cart" size="32" color="var(--text-muted)" />
                          <p>Este usuario no cuenta con pedidos registrados.</p>
                        </div>
                      }
                    </div>
                  </div>
                </div>
              }

              <!-- Addresses Tab -->
              @if (activeTab === 'addresses') {
                <div class="tab-content">
                  <div class="addresses-section">
                    <div class="section-header">
                      <app-icon name="map-pin" size="18" color="var(--primary)" />
                      <h3>Direcciones Guardadas</h3>
                      <span class="order-count">1</span>
                    </div>
                    <div class="address-item">
                      <div class="address-card">
                        <div class="address-type">
                          <app-icon name="home" size="16" color="var(--primary)" />
                          <span>Principal</span>
                        </div>
                        <p class="address-detail">Calle Principal #123, Colonia Centro</p>
                        <p class="address-detail">Ciudad de México, CP 12345</p>
                        <span class="address-phone">Tel: {{ usr.phone }}</span>
                      </div>
                    </div>
                  </div>
                </div>
              }

              <!-- Payments Tab -->
              @if (activeTab === 'payments') {
                <div class="tab-content">
                  <div class="payments-section">
                    <div class="section-header">
                      <app-icon name="credit-card" size="18" color="var(--primary)" />
                      <h3>Métodos de Pago</h3>
                      <span class="order-count">2</span>
                    </div>
                    <div class="payment-item">
                      <div class="payment-card">
                        <div class="payment-type">
                          <app-icon name="credit-card" size="16" color="var(--primary)" />
                          <span>Tarjeta de Crédito</span>
                        </div>
                        <p class="payment-detail">•••• •••• •••• 1234</p>
                        <p class="payment-detail">Vence: 12/26</p>
                      </div>
                    </div>
                    <div class="payment-item">
                      <div class="payment-card">
                        <div class="payment-type">
                          <app-icon name="credit-card" size="16" color="var(--primary)" />
                          <span>Tarjeta de Débito</span>
                        </div>
                        <p class="payment-detail">•••• •••• •••• 5678</p>
                        <p class="payment-detail">Vence: 08/25</p>
                      </div>
                    </div>
                  </div>
                </div>
              }

              <!-- Activity Tab -->
              @if (activeTab === 'activity') {
                <div class="tab-content">
                  <div class="activity-section">
                    <div class="section-header">
                      <app-icon name="activity" size="18" color="var(--primary)" />
                      <h3>Actividad Reciente</h3>
                    </div>
                    <div class="activity-timeline">
                      <div class="activity-item">
                        <div class="activity-icon">
                          <app-icon name="shopping-cart" size="14" color="var(--primary)" />
                        </div>
                        <div class="activity-content">
                          <p class="activity-text">Realizó un pedido</p>
                          <span class="activity-date">Hace 2 días</span>
                        </div>
                      </div>
                      <div class="activity-item">
                        <div class="activity-icon">
                          <app-icon name="log-in" size="14" color="var(--primary)" />
                        </div>
                        <div class="activity-content">
                          <p class="activity-text">Inició sesión</p>
                          <span class="activity-date">Hace 3 días</span>
                        </div>
                      </div>
                      <div class="activity-item">
                        <div class="activity-icon">
                          <app-icon name="eye" size="14" color="var(--primary)" />
                        </div>
                        <div class="activity-content">
                          <p class="activity-text">Vio productos en oferta</p>
                          <span class="activity-date">Hace 5 días</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              }
            </div>
          } @else {
            <div class="no-selection-state">
              <div class="no-selection-icon">
                <app-icon name="users" size="56" color="var(--text-muted)" />
              </div>
              <h3>Selecciona un Usuario</h3>
              <p>Haz clic en cualquier cliente de la lista para examinar su ficha de perfil, roles de acceso e historial de transacciones.</p>
            </div>
          }
        </div>
      </div>
    </div>
  `,
  styleUrl: './users.css',
})
export class UserDirectory {
  protected orderService = inject(OrderService);

  searchQuery = signal('');
  usersList = signal<User[]>([]);
  selectedUser = signal<User | null>(null);
  activeTab = 'data';

  private avatarColors = [
    '#1a4a2e', '#1a4a2e', '#1a4a2e', '#1a4a2e'
  ];

  constructor() {
    this.loadUsers();
  }

  private loadUsers(): void {
    const stored = localStorage.getItem('admin_users');
    if (stored) {
      const parsed = JSON.parse(stored).map((u: any) => ({
        ...u,
        createdAt: new Date(u.createdAt),
      }));
      this.usersList.set(parsed);
    } else {
      this.usersList.set(INITIAL_USERS);
      this.saveUsers();
    }

    const list = this.usersList();
    if (list.length > 0) {
      this.selectedUser.set(list[0]);
    }
  }

  private saveUsers(): void {
    localStorage.setItem('admin_users', JSON.stringify(this.usersList()));
  }

  readonly filteredUsers = computed(() => {
    const list = this.usersList();
    if (!this.searchQuery()) return list;

    const q = this.searchQuery().toLowerCase();
    return list.filter(
      (u) =>
        u.firstName.toLowerCase().includes(q) ||
        u.lastName.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q)
    );
  });

  selectUser(user: User): void {
    this.selectedUser.set(user);
    this.activeTab = 'data';
  }

  toggleRole(user: User): void {
    if (user.id === '1') return;

    const newRole: 'admin' | 'user' = user.role === 'admin' ? 'user' : 'admin';
    const updatedList: User[] = this.usersList().map((u) =>
      u.id === user.id ? { ...u, role: newRole } : u
    );
    this.usersList.set(updatedList);
    this.saveUsers();

    const updatedUser = updatedList.find((u) => u.id === user.id) || null;
    this.selectedUser.set(updatedUser);
  }

  getUserOrders(user: User): any[] {
    if (user.id === '1') {
      return this.orderService.getOrders();
    }
    return [];
  }

  getStatusIcon(status: string): string {
    const icons: Record<string, string> = {
      'delivered': 'check',
      'shipped': 'truck',
      'pending': 'clock',
      'cancelled': 'x'
    };
    return icons[status] || 'clock';
  }

  getAvatarColor(user: User): string {
    const index = this.usersList().indexOf(user) % this.avatarColors.length;
    return this.avatarColors[index];
  }

  formatDate(date: Date | string): string {
    const d = new Date(date);
    return d.toLocaleDateString('es-MX', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    });
  }

  formatOrderDate(date: Date | string): string {
    const d = new Date(date);
    return d.toLocaleDateString('es-MX', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  }
}