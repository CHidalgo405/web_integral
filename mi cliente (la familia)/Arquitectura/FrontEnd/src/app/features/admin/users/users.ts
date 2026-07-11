// users.component.ts
import { Component, inject, signal, computed } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { API_BASE_URL } from '../../../core/api.config';
import { OrderService } from '../../../core/services/order.service';
import { AuthService } from '../../../core/services/auth.service';
import { User } from '../../../core/models/user.model';
import { MxnCurrencyPipe } from '../../../shared/pipes/currency.pipe';
import { IconComponent } from '../../../shared/components/icon/icon';

interface ApiUser {
  id: string;
  employee_id: string | null;
  username: string;
  role: 'admin' | 'manager' | 'cashier' | 'stock' | 'customer';
  active: boolean;
  must_change_password: boolean;
  created_at: string;
  first_name: string | null;
  last_name: string | null;
  phone: string | null;
  email: string;
}

interface ApiUserAddress {
  id: string;
  label: string;
  full_name: string;
  phone: string | null;
  street: string;
  exterior_number: string | null;
  interior_number: string | null;
  neighborhood: string | null;
  city: string | null;
  state: string | null;
  zip_code: string | null;
  is_default: boolean;
}

interface ApiUserPayment {
  id: string;
  type: 'card' | 'cash';
  label: string;
  last4: string | null;
  expiry: string | null;
  is_default: boolean;
}

interface ApiPurchaseRow {
  id: string;
  status: 'pending' | 'completed' | 'cancelled';
  total: string | number;
  created_at: string;
}

interface AdminOrderRow {
  id: string;
  status: 'pending' | 'delivered' | 'cancelled';
  total: number;
  createdAt: Date;
}

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

      @if (loadError()) {
        <div class="empty-state">
          <app-icon name="alert-triangle" size="48" color="var(--danger)" />
          <p>{{ loadError() }}</p>
        </div>
      }

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
                  {{ initials(usr) }}
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
                    @if (usr.active) {
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
                {{ initials(usr) }}
              </div>
              <h2 class="detail-name">{{ usr.firstName }} {{ usr.lastName }}</h2>
              <p class="detail-email">{{ usr.email }}</p>

              <!-- Quick Stats -->
              <div class="quick-stats">
                <div class="stat-item">
                  <span class="stat-number">{{ userOrders().length }}</span>
                  <span class="stat-label">
                    <app-icon name="shopping-cart" size="12" color="rgba(255,255,255,0.7)" />
                    Órdenes
                  </span>
                </div>
                <div class="stat-divider"></div>
                <div class="stat-item">
                  <span class="stat-number">{{ userAddresses().length }}</span>
                  <span class="stat-label">
                    <app-icon name="map-pin" size="12" color="rgba(255,255,255,0.7)" />
                    Direcciones
                  </span>
                </div>
                <div class="stat-divider"></div>
                <div class="stat-item">
                  <span class="stat-number">{{ userPayments().length }}</span>
                  <span class="stat-label">
                    <app-icon name="credit-card" size="12" color="rgba(255,255,255,0.7)" />
                    Pagos
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
                  Pagos
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
                      <span class="info-value">{{ usr.phone || 'No registrado' }}</span>
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
                        <span class="status-chip" [class.verified]="usr.active" [class.pending]="!usr.active">
                          <app-icon [name]="usr.active ? 'check' : 'clock'" size="12" color="currentColor" />
                          {{ usr.active ? 'Cuenta Activa' : 'Cuenta Desactivada' }}
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
                        [disabled]="isSelf(usr) || saving()"
                      />
                      <span class="toggle-slider"></span>
                      <span class="toggle-label">
                        <app-icon [name]="usr.role === 'admin' ? 'shield' : 'user'" size="16" color="var(--primary)" />
                        {{ usr.role === 'admin' ? 'Administrador' : 'Cliente Estándar' }}
                      </span>
                    </label>
                    <label class="toggle-switch">
                      <input
                        type="checkbox"
                        [checked]="usr.active"
                        (change)="toggleActive(usr)"
                        [disabled]="isSelf(usr) || saving()"
                      />
                      <span class="toggle-slider"></span>
                      <span class="toggle-label">
                        <app-icon [name]="usr.active ? 'check' : 'x'" size="16" color="var(--primary)" />
                        {{ usr.active ? 'Cuenta habilitada' : 'Cuenta deshabilitada' }}
                      </span>
                    </label>
                    @if (isSelf(usr)) {
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
                      <span class="order-count">{{ userOrders().length }}</span>
                    </div>
                    <div class="purchases-scroll-list">
                      @for (ord of userOrders(); track ord.id) {
                        <div class="purchase-item">
                          <div class="purchase-left">
                            <span class="purchase-id">{{ shortId(ord.id) }}</span>
                            <span class="purchase-date">{{ formatOrderDate(ord.createdAt) }}</span>
                          </div>
                          <div class="purchase-right">
                            <span class="status-badge" [class]="'badge-' + ord.status">
                              <app-icon [name]="getStatusIcon(ord.status)" size="10" color="currentColor" />
                              {{ statusLabel(ord.status) }}
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
                      <span class="order-count">{{ userAddresses().length }}</span>
                    </div>
                    @for (addr of userAddresses(); track addr.id) {
                      <div class="address-item">
                        <div class="address-card">
                          <div class="address-type">
                            <app-icon name="home" size="16" color="var(--primary)" />
                            <span>{{ addr.label }}{{ addr.is_default ? ' · Principal' : '' }}</span>
                          </div>
                          <p class="address-detail">{{ addr.street }} {{ addr.exterior_number }}{{ addr.interior_number ? ', Int. ' + addr.interior_number : '' }}{{ addr.neighborhood ? ', ' + addr.neighborhood : '' }}</p>
                          <p class="address-detail">{{ addr.city }}{{ addr.state ? ', ' + addr.state : '' }}{{ addr.zip_code ? ', CP ' + addr.zip_code : '' }}</p>
                          @if (addr.phone) {
                            <span class="address-phone">Tel: {{ addr.phone }}</span>
                          }
                        </div>
                      </div>
                    } @empty {
                      <div class="empty-purchases">
                        <app-icon name="map-pin" size="32" color="var(--text-muted)" />
                        <p>Este usuario no tiene direcciones guardadas.</p>
                      </div>
                    }
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
                      <span class="order-count">{{ userPayments().length }}</span>
                    </div>
                    @for (pm of userPayments(); track pm.id) {
                      <div class="payment-item">
                        <div class="payment-card">
                          <div class="payment-type">
                            <app-icon [name]="pm.type === 'card' ? 'credit-card' : 'dollar-sign'" size="16" color="var(--primary)" />
                            <span>{{ pm.label }}{{ pm.is_default ? ' · Principal' : '' }}</span>
                          </div>
                          @if (pm.last4) {
                            <p class="payment-detail">•••• •••• •••• {{ pm.last4 }}</p>
                          }
                          @if (pm.expiry) {
                            <p class="payment-detail">Vence: {{ pm.expiry }}</p>
                          }
                        </div>
                      </div>
                    } @empty {
                      <div class="empty-purchases">
                        <app-icon name="credit-card" size="32" color="var(--text-muted)" />
                        <p>Este usuario no tiene métodos de pago guardados.</p>
                      </div>
                    }
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
  private authService = inject(AuthService);
  private http = inject(HttpClient);

  searchQuery = signal('');
  usersList = signal<User[]>([]);
  selectedUser = signal<User | null>(null);
  userOrders = signal<AdminOrderRow[]>([]);
  userAddresses = signal<ApiUserAddress[]>([]);
  userPayments = signal<ApiUserPayment[]>([]);
  loadError = signal('');
  saving = signal(false);
  activeTab = 'data';

  private apiUsers = new Map<string, ApiUser>();

  constructor() {
    this.loadUsers();
  }

  private loadUsers(): void {
    this.loadError.set('');
    this.http.get<ApiUser[]>(`${API_BASE_URL}/users`).subscribe({
      next: (rows) => {
        this.apiUsers.clear();
        rows.forEach((r) => this.apiUsers.set(r.id, r));
        const users = rows.map((r) => this.mapUser(r));
        this.usersList.set(users);
        if (users.length > 0 && !this.selectedUser()) {
          this.selectUser(users[0]);
        }
      },
      error: () => this.loadError.set('No se pudieron cargar los usuarios. Verifica tu sesión de administrador.'),
    });
  }

  private mapUser(r: ApiUser): User {
    return {
      id: r.id,
      firstName: r.first_name || r.username.split('@')[0],
      lastName: r.last_name || '',
      email: r.email,
      phone: r.phone ?? undefined,
      role: r.role,
      active: r.active,
      createdAt: new Date(r.created_at),
    };
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
    this.loadUserDetail(user.id);
  }

  private loadUserDetail(userId: string): void {
    this.userOrders.set([]);
    this.userAddresses.set([]);
    this.userPayments.set([]);

    this.http.get<ApiPurchaseRow[]>(`${API_BASE_URL}/purchases`, { params: { user_id: userId } }).subscribe({
      next: (rows) =>
        this.userOrders.set(
          rows.map((r) => ({
            id: r.id,
            status: r.status === 'completed' ? 'delivered' : r.status === 'cancelled' ? 'cancelled' : 'pending',
            total: Number(r.total),
            createdAt: new Date(r.created_at),
          })),
        ),
      error: () => this.userOrders.set([]),
    });

    this.http.get<ApiUserAddress[]>(`${API_BASE_URL}/users/${userId}/addresses`).subscribe({
      next: (rows) => this.userAddresses.set(rows),
      error: () => this.userAddresses.set([]),
    });

    this.http.get<ApiUserPayment[]>(`${API_BASE_URL}/users/${userId}/payment-methods`).subscribe({
      next: (rows) => this.userPayments.set(rows),
      error: () => this.userPayments.set([]),
    });
  }

  isSelf(user: User): boolean {
    return this.authService.user()?.id === user.id;
  }

  toggleRole(user: User): void {
    if (this.isSelf(user)) return;
    const newRole = user.role === 'admin' ? 'customer' : 'admin';
    this.saveUserChange(user, { role: newRole });
  }

  toggleActive(user: User): void {
    if (this.isSelf(user)) return;
    this.saveUserChange(user, { active: !user.active });
  }

  private saveUserChange(user: User, change: { role?: string; active?: boolean }): void {
    const api = this.apiUsers.get(user.id);
    if (!api) return;

    this.saving.set(true);
    const payload = {
      username: api.username,
      role: change.role ?? api.role,
      active: change.active ?? api.active,
      must_change_password: api.must_change_password,
    };

    this.http.put<ApiUser>(`${API_BASE_URL}/users/${user.id}`, payload).subscribe({
      next: (updated) => {
        this.saving.set(false);
        // El PUT devuelve columnas sin JOIN; conservamos los datos de employee ya cargados
        const merged: ApiUser = { ...api, ...updated, first_name: api.first_name, last_name: api.last_name, phone: api.phone, email: api.email };
        this.apiUsers.set(user.id, merged);
        const mapped = this.mapUser(merged);
        this.usersList.set(this.usersList().map((u) => (u.id === user.id ? mapped : u)));
        if (this.selectedUser()?.id === user.id) this.selectedUser.set(mapped);
      },
      error: () => {
        this.saving.set(false);
        this.loadError.set('No se pudo actualizar el usuario.');
      },
    });
  }

  initials(user: User): string {
    return `${user.firstName.charAt(0)}${user.lastName.charAt(0) || user.firstName.charAt(1) || ''}`.toUpperCase();
  }

  shortId(id: string): string {
    return '#' + id.slice(0, 8).toUpperCase();
  }

  statusLabel(status: AdminOrderRow['status']): string {
    const labels: Record<AdminOrderRow['status'], string> = {
      pending: 'Pendiente',
      delivered: 'Entregado',
      cancelled: 'Cancelado',
    };
    return labels[status];
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
    return '#1a4a2e';
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
