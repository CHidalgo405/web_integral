import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { InventoryMovement, InventoryService } from '../../../core/services/inventory.service';
import { IconComponent } from '../../../shared/components/icon/icon';

@Component({
  selector: 'app-inventory-movements',
  standalone: true,
  imports: [FormsModule, IconComponent],
  template: `
    <section class="movements-page">
      <div class="page-heading">
        <div>
          <span class="eyebrow">Trazabilidad</span>
          <h1>Historial de movimientos</h1>
          <p>Revisa quién ajustó las existencias, cuándo lo hizo y por qué.</p>
        </div>
        <button type="button" class="refresh-button" (click)="inventoryService.loadWorkspace()">
          <app-icon name="loader" size="15" color="currentColor" /> Actualizar
        </button>
      </div>

      @if (inventoryService.error()) {
        <div class="feedback error"><app-icon name="alert-triangle" size="16" color="currentColor" /> {{ inventoryService.error() }}</div>
      }

      <div class="summary-grid">
        <article><span class="summary-icon entry"><app-icon name="plus" size="18" color="currentColor" /></span><div><small>Entradas de hoy</small><strong>+{{ entriesToday() }}</strong></div></article>
        <article><span class="summary-icon exit">−</span><div><small>Salidas de hoy</small><strong>−{{ exitsToday() }}</strong></div></article>
        <article><span class="summary-icon total"><app-icon name="clock" size="18" color="currentColor" /></span><div><small>Movimientos registrados</small><strong>{{ inventoryService.movements().length }}</strong></div></article>
      </div>

      <div class="history-panel">
        <div class="panel-toolbar">
          <div class="search-field">
            <app-icon name="search" size="16" color="var(--text-muted)" />
            <input [ngModel]="searchQuery()" (ngModelChange)="searchQuery.set($event)" placeholder="Buscar producto, SKU o responsable" />
          </div>
          <select [ngModel]="typeFilter()" (ngModelChange)="typeFilter.set($event)">
            <option value="all">Todos los movimientos</option>
            <option value="entry">Solo entradas</option>
            <option value="exit">Solo salidas</option>
          </select>
          <select [ngModel]="dateFilter()" (ngModelChange)="dateFilter.set($event)">
            <option value="all">Cualquier fecha</option>
            <option value="today">Hoy</option>
            <option value="week">Últimos 7 días</option>
            <option value="month">Últimos 30 días</option>
          </select>
          <span class="result-count">{{ filteredMovements().length }} resultados</span>
        </div>

        @if (inventoryService.isLoading()) {
          <div class="state-box"><span class="loading-ring"></span><strong>Cargando historial…</strong></div>
        } @else if (!filteredMovements().length) {
          <div class="state-box">
            <div class="empty-icon"><app-icon name="clock" size="30" color="currentColor" /></div>
            <strong>No hay movimientos para mostrar</strong>
            <span>Los ajustes de inventario aparecerán aquí.</span>
          </div>
        } @else {
          <div class="timeline-list">
            @for (movement of filteredMovements(); track movement.id) {
              <article class="movement-row">
                <span class="movement-icon" [class.entry]="movement.movement_type === 'entry'" [class.exit]="movement.movement_type === 'exit'">
                  {{ movement.movement_type === 'entry' ? '+' : '−' }}
                </span>
                <div class="movement-main">
                  <div class="movement-title">
                    <strong>{{ movement.inventory_name }}</strong>
                    <span class="type-pill" [class.entry]="movement.movement_type === 'entry'" [class.exit]="movement.movement_type === 'exit'">
                      {{ movement.movement_type === 'entry' ? 'Entrada' : 'Salida' }}
                    </span>
                  </div>
                  <span class="movement-meta">{{ movement.sku || 'Sin SKU' }} · {{ movement.reason }}</span>
                  @if (movement.notes) { <p>{{ movement.notes }}</p> }
                </div>
                <div class="stock-change">
                  <span>{{ movement.previous_stock }}</span><app-icon name="arrow-right" size="14" color="var(--text-muted)" /><strong>{{ movement.new_stock }}</strong>
                  <small [class.positive]="movement.quantity_delta > 0" [class.negative]="movement.quantity_delta < 0">
                    {{ movement.quantity_delta > 0 ? '+' : '' }}{{ movement.quantity_delta }} unidades
                  </small>
                </div>
                <div class="movement-audit">
                  <strong>{{ movement.performed_by }}</strong>
                  <span>{{ formatDate(movement.created_at) }}</span>
                </div>
              </article>
            }
          </div>
        }
      </div>
    </section>
  `,
  styleUrl: './inventory-movements.css',
})
export class InventoryMovements implements OnInit {
  protected inventoryService = inject(InventoryService);
  searchQuery = signal('');
  typeFilter = signal<'all' | 'entry' | 'exit'>('all');
  dateFilter = signal<'all' | 'today' | 'week' | 'month'>('all');

  readonly filteredMovements = computed(() => {
    const query = this.searchQuery().trim().toLocaleLowerCase('es');
    const cutoff = this.cutoffDate(this.dateFilter());
    return this.inventoryService.movements().filter((movement) => {
      const matchesQuery = !query || [movement.inventory_name, movement.sku, movement.performed_by, movement.reason]
        .some((value) => value?.toLocaleLowerCase('es').includes(query));
      const matchesType = this.typeFilter() === 'all' || movement.movement_type === this.typeFilter();
      const matchesDate = !cutoff || new Date(movement.created_at) >= cutoff;
      return matchesQuery && matchesType && matchesDate;
    });
  });

  readonly entriesToday = computed(() => this.todayTotal('entry'));
  readonly exitsToday = computed(() => this.todayTotal('exit'));

  ngOnInit(): void {
    this.inventoryService.loadWorkspace();
  }

  formatDate(value: string): string {
    return new Intl.DateTimeFormat('es-MX', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(new Date(value));
  }

  private todayTotal(type: InventoryMovement['movement_type']): number {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return this.inventoryService.movements()
      .filter((movement) => movement.movement_type === type && new Date(movement.created_at) >= today)
      .reduce((sum, movement) => sum + Math.abs(movement.quantity_delta), 0);
  }

  private cutoffDate(filter: 'all' | 'today' | 'week' | 'month'): Date | null {
    if (filter === 'all') return null;
    const date = new Date();
    date.setHours(0, 0, 0, 0);
    if (filter === 'week') date.setDate(date.getDate() - 6);
    if (filter === 'month') date.setDate(date.getDate() - 29);
    return date;
  }
}
