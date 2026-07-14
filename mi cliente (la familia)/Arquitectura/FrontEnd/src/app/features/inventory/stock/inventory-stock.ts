import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { InventoryItem, InventoryService } from '../../../core/services/inventory.service';
import { IconComponent } from '../../../shared/components/icon/icon';
import { MxnCurrencyPipe } from '../../../shared/pipes/currency.pipe';

@Component({
  selector: 'app-inventory-stock',
  standalone: true,
  imports: [FormsModule, IconComponent, MxnCurrencyPipe],
  template: `
    <section class="stock-page">
      <div class="page-heading">
        <div>
          <span class="eyebrow">Operación diaria</span>
          <h1>Control de existencias</h1>
          <p>Consulta el catálogo y registra cada entrada o salida de mercancía.</p>
        </div>
        <button type="button" class="refresh-button" (click)="inventoryService.loadWorkspace()">
          <app-icon name="loader" size="15" color="currentColor" /> Actualizar
        </button>
      </div>

      @if (successMessage()) {
        <div class="feedback success"><app-icon name="check" size="16" color="currentColor" /> {{ successMessage() }}</div>
      }
      @if (pageError() || inventoryService.error()) {
        <div class="feedback error">
          <app-icon name="alert-triangle" size="16" color="currentColor" />
          {{ pageError() || inventoryService.error() }}
        </div>
      }

      <div class="metric-grid">
        <article class="metric-card">
          <div class="metric-icon green"><app-icon name="package" size="21" color="currentColor" /></div>
          <div><span>Productos activos</span><strong>{{ inventoryService.items().length }}</strong><small>en catálogo</small></div>
        </article>
        <article class="metric-card">
          <div class="metric-icon blue"><app-icon name="bar-chart" size="21" color="currentColor" /></div>
          <div><span>Unidades disponibles</span><strong>{{ totalUnits() }}</strong><small>piezas registradas</small></div>
        </article>
        <article class="metric-card" [class.attention]="lowStockCount() > 0">
          <div class="metric-icon orange"><app-icon name="alert-triangle" size="21" color="currentColor" /></div>
          <div><span>Stock bajo</span><strong>{{ lowStockCount() }}</strong><small>requieren atención</small></div>
        </article>
        <article class="metric-card">
          <div class="metric-icon purple"><app-icon name="dollar-sign" size="21" color="currentColor" /></div>
          <div><span>Valor a costo</span><strong>{{ inventoryValue() | mxnCurrency }}</strong><small>inventario estimado</small></div>
        </article>
      </div>

      <div class="scanner-card">
        <div class="scanner-copy">
          <div class="scanner-icon"><app-icon name="hash" size="21" color="currentColor" /></div>
          <div><strong>Buscar por código de barras</strong><span>Escanea o escribe el código para localizar el producto.</span></div>
        </div>
        <form class="scanner-form" (submit)="searchBarcode(); $event.preventDefault()">
          <input name="barcode" [(ngModel)]="barcodeQuery" autocomplete="off" placeholder="Código de barras" />
          <button type="submit" [disabled]="barcodeLoading() || !barcodeQuery.trim()">
            <app-icon [name]="barcodeLoading() ? 'loader' : 'search'" [className]="barcodeLoading() ? 'app-icon-spin' : ''" size="15" color="currentColor" />
            Buscar
          </button>
        </form>
      </div>

      <div class="inventory-panel">
        <div class="panel-toolbar">
          <div class="search-field">
            <app-icon name="search" size="16" color="var(--text-muted)" />
            <input
              [ngModel]="searchQuery()"
              (ngModelChange)="searchQuery.set($event)"
              placeholder="Buscar producto o SKU"
              aria-label="Buscar producto"
            />
          </div>
          <select [ngModel]="categoryFilter()" (ngModelChange)="categoryFilter.set($event)" aria-label="Filtrar categoría">
            <option value="all">Todas las categorías</option>
            @for (category of categories(); track category) { <option [value]="category">{{ category }}</option> }
          </select>
          <select [ngModel]="statusFilter()" (ngModelChange)="statusFilter.set($event)" aria-label="Filtrar estado">
            <option value="all">Todos los estados</option>
            <option value="low">Stock bajo</option>
            <option value="ok">Stock suficiente</option>
            <option value="empty">Agotados</option>
          </select>
          <span class="result-count">{{ filteredItems().length }} productos</span>
        </div>

        @if (inventoryService.isLoading()) {
          <div class="state-box"><span class="loading-ring"></span><strong>Cargando inventario…</strong></div>
        } @else if (!filteredItems().length) {
          <div class="state-box">
            <div class="empty-icon"><app-icon name="package" size="30" color="currentColor" /></div>
            <strong>No encontramos productos</strong><span>Prueba con otros filtros o actualiza la información.</span>
          </div>
        } @else {
          <div class="desktop-table">
            <table>
              <thead><tr><th>Producto</th><th>Categoría</th><th>Existencias</th><th>Valor</th><th>Estado</th><th></th></tr></thead>
              <tbody>
                @for (item of filteredItems(); track item.id) {
                  <tr [class.low-row]="item.low_stock">
                    <td>
                      <div class="product-cell">
                        <span class="product-avatar">{{ initials(item.name) }}</span>
                        <div><strong>{{ item.name }}</strong><small>{{ item.sku || 'Sin SKU' }} · {{ item.unit || 'pza' }}</small></div>
                      </div>
                    </td>
                    <td>{{ item.category || 'Sin categoría' }}</td>
                    <td>
                      <div class="stock-cell">
                        <div><strong>{{ item.stock }}</strong><span>mín. {{ item.min_stock }}</span></div>
                        <div class="stock-track"><span [class.low]="item.low_stock" [style.width.%]="stockPercent(item)"></span></div>
                      </div>
                    </td>
                    <td>{{ (item.cost || 0) * item.stock | mxnCurrency }}</td>
                    <td><span class="status-pill" [class.low]="item.low_stock" [class.empty]="item.stock === 0">{{ stockLabel(item) }}</span></td>
                    <td><button type="button" class="adjust-button" (click)="openAdjustment(item)">Ajustar</button></td>
                  </tr>
                }
              </tbody>
            </table>
          </div>

          <div class="mobile-list">
            @for (item of filteredItems(); track item.id) {
              <article class="product-card" [class.low]="item.low_stock">
                <div class="card-top">
                  <span class="product-avatar">{{ initials(item.name) }}</span>
                  <div class="card-name"><strong>{{ item.name }}</strong><span>{{ item.sku || 'Sin SKU' }}</span></div>
                  <span class="status-pill" [class.low]="item.low_stock" [class.empty]="item.stock === 0">{{ stockLabel(item) }}</span>
                </div>
                <div class="mobile-stock-row">
                  <div><span>Existencias</span><strong>{{ item.stock }} {{ item.unit || 'pza' }}</strong></div>
                  <div><span>Stock mínimo</span><strong>{{ item.min_stock }}</strong></div>
                  <div><span>Categoría</span><strong>{{ item.category || 'General' }}</strong></div>
                </div>
                <button type="button" class="adjust-button wide" (click)="openAdjustment(item)">
                  <app-icon name="plus" size="14" color="currentColor" /> Registrar movimiento
                </button>
              </article>
            }
          </div>
        }
      </div>
    </section>

    @if (selectedItem()) {
      <div class="modal-backdrop" (click)="closeAdjustment()">
        <section class="adjustment-modal" role="dialog" aria-modal="true" aria-labelledby="adjustment-title" (click)="$event.stopPropagation()">
          <button type="button" class="modal-close" (click)="closeAdjustment()" aria-label="Cerrar">×</button>
          <span class="modal-eyebrow">Movimiento de inventario</span>
          <h2 id="adjustment-title">{{ selectedItem()!.name }}</h2>
          <p class="modal-product-meta">{{ selectedItem()!.sku || 'Sin SKU' }} · Existencia actual: <strong>{{ selectedItem()!.stock }}</strong></p>

          <div class="direction-picker">
            <button type="button" [class.active]="adjustmentDirection() === 'entry'" (click)="adjustmentDirection.set('entry'); pageError.set('')">
              <span class="direction-icon entry"><app-icon name="plus" size="18" color="currentColor" /></span>
              <span><strong>Entrada</strong><small>Agregar mercancía</small></span>
            </button>
            <button type="button" [class.active]="adjustmentDirection() === 'exit'" (click)="adjustmentDirection.set('exit'); pageError.set('')">
              <span class="direction-icon exit">−</span>
              <span><strong>Salida</strong><small>Retirar mercancía</small></span>
            </button>
          </div>

          <label class="form-field">
            <span>Cantidad *</span>
            <input
              type="number"
              min="1"
              step="1"
              [ngModel]="adjustmentQuantity()"
              (ngModelChange)="adjustmentQuantity.set($event)"
              inputmode="numeric"
            />
          </label>
          <label class="form-field">
            <span>Motivo *</span>
            <select [(ngModel)]="adjustmentReason">
              <option value="">Selecciona un motivo</option>
              @for (reason of reasons(); track reason) { <option [value]="reason">{{ reason }}</option> }
            </select>
          </label>
          <label class="form-field">
            <span>Notas <small>(opcional)</small></span>
            <textarea rows="3" maxlength="500" [(ngModel)]="adjustmentNotes" placeholder="Agrega detalles para identificar este movimiento"></textarea>
          </label>

          <div class="stock-preview" [class.invalid]="previewStock() < 0">
            <span>Existencia después del movimiento</span>
            <div><strong>{{ selectedItem()!.stock }}</strong><span>→</span><strong>{{ previewStock() }}</strong></div>
          </div>

          @if (pageError()) { <div class="modal-error">{{ pageError() }}</div> }
          <button type="button" class="submit-adjustment" [disabled]="savingAdjustment()" (click)="saveAdjustment()">
            @if (savingAdjustment()) { <span class="button-spinner"></span> Guardando… } @else { Confirmar movimiento }
          </button>
        </section>
      </div>
    }
  `,
  styleUrl: './inventory-stock.css',
})
export class InventoryStock implements OnInit {
  protected inventoryService = inject(InventoryService);

  searchQuery = signal('');
  categoryFilter = signal('all');
  statusFilter = signal<'all' | 'low' | 'ok' | 'empty'>('all');
  selectedItem = signal<InventoryItem | null>(null);
  adjustmentDirection = signal<'entry' | 'exit'>('entry');
  savingAdjustment = signal(false);
  barcodeLoading = signal(false);
  pageError = signal('');
  successMessage = signal('');

  barcodeQuery = '';
  adjustmentQuantity = signal(1);
  adjustmentReason = '';
  adjustmentNotes = '';

  readonly categories = computed(() =>
    [...new Set(this.inventoryService.items().map((item) => item.category).filter((value): value is string => !!value))]
      .sort((a, b) => a.localeCompare(b, 'es')),
  );
  readonly totalUnits = computed(() => this.inventoryService.items().reduce((sum, item) => sum + item.stock, 0));
  readonly lowStockCount = computed(() => this.inventoryService.items().filter((item) => item.low_stock).length);
  readonly inventoryValue = computed(() =>
    this.inventoryService.items().reduce((sum, item) => sum + (item.cost || 0) * item.stock, 0),
  );
  readonly filteredItems = computed(() => {
    const query = this.searchQuery().trim().toLocaleLowerCase('es');
    return this.inventoryService.items().filter((item) => {
      const matchesQuery = !query || item.name.toLocaleLowerCase('es').includes(query) || item.sku?.toLocaleLowerCase('es').includes(query);
      const matchesCategory = this.categoryFilter() === 'all' || item.category === this.categoryFilter();
      const status = this.statusFilter();
      const matchesStatus = status === 'all' || (status === 'empty' && item.stock === 0) || (status === 'low' && item.low_stock) || (status === 'ok' && !item.low_stock);
      return matchesQuery && matchesCategory && matchesStatus;
    });
  });
  readonly previewStock = computed(() => {
    const item = this.selectedItem();
    if (!item) return 0;
    const amount = Number(this.adjustmentQuantity()) || 0;
    return item.stock + (this.adjustmentDirection() === 'entry' ? amount : -amount);
  });
  readonly reasons = computed(() =>
    this.adjustmentDirection() === 'entry'
      ? ['Recepción de mercancía', 'Devolución', 'Corrección de conteo', 'Inventario inicial', 'Otro']
      : ['Venta no registrada', 'Merma o daño', 'Caducidad', 'Uso interno', 'Corrección de conteo', 'Otro'],
  );

  ngOnInit(): void {
    this.inventoryService.loadWorkspace();
  }

  searchBarcode(): void {
    const barcode = this.barcodeQuery.trim();
    if (!barcode) return;
    this.barcodeLoading.set(true);
    this.pageError.set('');
    this.inventoryService.clearError();
    this.inventoryService.findByBarcode(barcode).subscribe({
      next: (item) => {
        this.barcodeLoading.set(false);
        this.barcodeQuery = '';
        this.openAdjustment(item);
      },
      error: (error) => {
        this.barcodeLoading.set(false);
        this.pageError.set(error?.status === 404 ? 'No encontramos un producto con ese código de barras.' : 'No se pudo consultar el código.');
      },
    });
  }

  openAdjustment(item: InventoryItem): void {
    this.selectedItem.set(item);
    this.adjustmentDirection.set('entry');
    this.adjustmentQuantity.set(1);
    this.adjustmentReason = '';
    this.adjustmentNotes = '';
    this.pageError.set('');
  }

  closeAdjustment(): void {
    if (this.savingAdjustment()) return;
    this.selectedItem.set(null);
    this.pageError.set('');
  }

  saveAdjustment(): void {
    const item = this.selectedItem();
    const amount = Number(this.adjustmentQuantity());
    if (!item || !Number.isInteger(amount) || amount <= 0) {
      this.pageError.set('Ingresa una cantidad válida en números enteros.');
      return;
    }
    if (!this.adjustmentReason) {
      this.pageError.set('Selecciona el motivo del movimiento.');
      return;
    }
    if (this.previewStock() < 0) {
      this.pageError.set(`No puedes retirar más de las ${item.stock} unidades disponibles.`);
      return;
    }

    const quantityDelta = this.adjustmentDirection() === 'entry' ? amount : -amount;
    this.savingAdjustment.set(true);
    this.pageError.set('');
    this.inventoryService.adjustStock(item.id, {
      quantity_delta: quantityDelta,
      reason: this.adjustmentReason,
      notes: this.adjustmentNotes.trim() || null,
    }).subscribe({
      next: (movement) => {
        this.savingAdjustment.set(false);
        this.selectedItem.set(null);
        this.successMessage.set(`${movement.movement_type === 'entry' ? 'Entrada' : 'Salida'} registrada. Nueva existencia: ${movement.new_stock}.`);
        window.setTimeout(() => this.successMessage.set(''), 4500);
      },
      error: (error) => {
        this.savingAdjustment.set(false);
        const message = error?.error?.error;
        this.pageError.set(message === 'Stock cannot be negative' ? 'La existencia no puede quedar en números negativos.' : message || 'No se pudo registrar el movimiento.');
      },
    });
  }

  initials(name: string): string {
    return name.split(/\s+/).slice(0, 2).map((part) => part.charAt(0)).join('').toUpperCase();
  }

  stockPercent(item: InventoryItem): number {
    const healthyLevel = Math.max(item.min_stock * 2, 1);
    return Math.min((item.stock / healthyLevel) * 100, 100);
  }

  stockLabel(item: InventoryItem): string {
    if (item.stock === 0) return 'Agotado';
    return item.low_stock ? 'Stock bajo' : 'Disponible';
  }
}
