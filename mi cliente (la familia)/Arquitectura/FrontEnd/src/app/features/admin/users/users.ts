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
      <div class="manager-header">
        <div>
          <h1 class="page-title">Directorio de Clientes</h1>
          <p class="page-subtitle">Visualiza perfiles, cambia permisos administrativos y examina historiales de compras</p>
        </div>
      </div>

      <!-- Search Filters -->
      <div class="filters-bar">
        <div class="search-input-wrapper">
          <span class="search-icon"><app-icon name="search" size="18" /></span>
          <input 
            type="text" 
            [ngModel]="searchQuery()" 
            (ngModelChange)="searchQuery.set($event)"
            placeholder="Buscar por nombre, apellido o correo electrónico..."
            class="form-control"
          />
        </div>
      </div>

      <!-- Users Grid layout -->
      <div class="users-grid-layout">
        <!-- Users list card -->
        <div class="card list-card">
          <div class="list-header">
            <h2>Lista de Usuarios ({{ filteredUsers().length }})</h2>
          </div>
          <div class="users-scroll-list">
            @for (usr of filteredUsers(); track usr.id) {
              <div 
                (click)="selectUser(usr)" 
                [class.selected]="selectedUser()?.id === usr.id" 
                class="user-item-row"
              >
                <div class="user-avatar-bubble">
                  {{ usr.firstName.charAt(0) }}{{ usr.lastName.charAt(0) }}
                </div>
                <div class="user-item-details">
                  <div class="user-item-name-row">
                    <h4>{{ usr.firstName }} {{ usr.lastName }}</h4>
                    @if (usr.role === 'admin') {
                      <span class="admin-role-badge">Admin</span>
                    }
                  </div>
                  <p class="user-item-sub">{{ usr.email }}</p>
                </div>
                <span class="arrow-indicator">›</span>
              </div>
            } @empty {
              <div class="empty-state">
                <span class="empty-emoji"><app-icon name="users" size="48" /></span>
                <p>No se encontraron usuarios coincidentes.</p>
              </div>
            }
          </div>
        </div>

        <!-- Detail and History Card -->
        <div class="card detail-card">
          @if (selectedUser(); as usr) {
            <div class="detail-header-block">
              <div class="detail-avatar">
                {{ usr.firstName.charAt(0) }}{{ usr.lastName.charAt(0) }}
              </div>
              <h2>{{ usr.firstName }} {{ usr.lastName }}</h2>
              <span class="detail-verified-badge" [class.unverified]="!usr.isVerified" style="display: inline-flex; align-items: center; gap: 6px;">
                <app-icon [name]="usr.isVerified ? 'check' : 'clock'" size="16" />
                <span>{{ usr.isVerified ? 'Cuenta Verificada' : 'Verificación Pendiente' }}</span>
              </span>
            </div>

            <!-- Profile Fields -->
            <div class="detail-info-section">
              <div class="detail-field">
                <span class="field-label">Correo Electrónico:</span>
                <span class="field-val">{{ usr.email }}</span>
              </div>
              <div class="detail-field">
                <span class="field-label">Teléfono móvil:</span>
                <span class="field-val">{{ usr.phone }}</span>
              </div>
              <div class="detail-field">
                <span class="field-label">Miembro desde:</span>
                <span class="field-val">{{ formatDate(usr.createdAt) }}</span>
              </div>
            </div>

            <!-- Role Control Switch -->
            <div class="detail-role-section">
              <h3>Privilegios Administrativos</h3>
              <label class="switch-label role-switch">
                <input 
                  type="checkbox" 
                  [checked]="usr.role === 'admin'"
                  (change)="toggleRole(usr)"
                  [disabled]="usr.id === '1'" 
                  class="switch-input"
                />
                <span class="switch-slider"></span>
                <div class="role-switch-labels">
                  <span class="status-text font-bold" [class.active-status]="usr.role === 'admin'">
                    {{ usr.role === 'admin' ? 'Permiso Administrador Otorgado' : 'Rol Estándar de Cliente' }}
                  </span>
                  @if (usr.id === '1') {
                    <span class="lock-msg">(Tu propia cuenta no se puede modificar)</span>
                  }
                </div>
              </label>
            </div>

            <!-- Purchases list -->
            <div class="detail-purchases-section">
              <h3>Historial de Pedidos</h3>
              <div class="purchases-scroll-list">
                @for (ord of getUserOrders(usr); track ord.id) {
                  <div class="purchase-item">
                    <div class="purchase-item-header">
                      <strong>{{ ord.id }}</strong>
                      <span class="status-badge" [class]="'badge-' + ord.status">
                        {{ orderService.getStatusLabel(ord.status) }}
                      </span>
                    </div>
                    <div class="purchase-item-footer">
                      <span class="purchase-date">{{ formatOrderDate(ord.createdAt) }}</span>
                      <strong class="purchase-price">{{ ord.total | mxnCurrency }}</strong>
                    </div>
                  </div>
                } @empty {
                  <div class="empty-purchases">
                    <span class="empty-emoji"><app-icon name="shopping-cart" size="32" /></span>
                    <p>Este usuario no cuenta con pedidos registrados.</p>
                  </div>
                }
              </div>
            </div>
          } @else {
            <div class="no-selection-state">
              <span class="selection-emoji"><app-icon name="shield" size="48" /></span>
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

    // Auto-select first user if available
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
  }

  toggleRole(user: User): void {
    if (user.id === '1') return; // Cannot modify own account

    const newRole: 'admin' | 'user' = user.role === 'admin' ? 'user' : 'admin';
    const updatedList: User[] = this.usersList().map((u) =>
      u.id === user.id ? { ...u, role: newRole } : u
    );
    this.usersList.set(updatedList);
    this.saveUsers();

    // Update selection ref
    const updatedUser = updatedList.find((u) => u.id === user.id) || null;
    this.selectedUser.set(updatedUser);
  }

  getUserOrders(user: User): any[] {
    // For demo purposes, we associate ORD-001 and ORD-002 with Carlos Hernández (id: '1')
    // and let others have empty arrays or we can assign them randomly.
    if (user.id === '1') {
      return this.orderService.getOrders();
    }
    return [];
  }

  formatDate(date: Date): string {
    return date.toLocaleDateString('es-MX', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    });
  }

  formatOrderDate(date: Date): string {
    return date.toLocaleDateString('es-MX', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  }
}
