import { Component, computed, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CashierService } from '../../../core/services/cashier.service';
import { MxnCurrencyPipe } from '../../../shared/pipes/currency.pipe';
import { IconComponent } from '../../../shared/components/icon/icon';

@Component({
  selector: 'app-cashier-sales',
  standalone: true,
  imports: [FormsModule, DatePipe, MxnCurrencyPipe, IconComponent],
  template: `
    <div class="sales-page">
      <header class="sales-heading">
        <div><span class="eyebrow">Actividad de caja</span><h2>Mis ventas</h2><p>Consulta operaciones y realiza el corte al terminar tu turno.</p></div>
        <div class="heading-actions">
          <label class="date-picker"><app-icon name="calendar" size="16" /><input type="date" [(ngModel)]="selectedDate" (change)="changeDate()" /></label>
          @if (service.status()?.is_open) {
            <button type="button" class="close-register-button" (click)="openCloseModal()"><app-icon name="lock" size="16" color="currentColor" /> Cerrar caja</button>
          }
        </div>
      </header>

      @if (service.error() || localError()) { <div class="error-banner">{{ localError() || service.error() }}</div> }

      <section class="summary-grid">
        <article><span class="summary-icon green"><app-icon name="shopping-cart" size="22" color="currentColor" /></span><div><small>Ventas del día</small><strong>{{ service.sales().length }}</strong></div></article>
        <article><span class="summary-icon orange"><app-icon name="dollar-sign" size="22" color="currentColor" /></span><div><small>Importe vendido</small><strong>{{ salesTotal() | mxnCurrency }}</strong></div></article>
        <article><span class="summary-icon blue"><app-icon name="store" size="22" color="currentColor" /></span><div><small>Efectivo esperado</small><strong>{{ service.status()?.expected_cash || 0 | mxnCurrency }}</strong></div></article>
        <article><span class="summary-icon gray"><app-icon name="clock" size="22" color="currentColor" /></span><div><small>Estado de caja</small><strong>{{ service.status()?.is_open ? 'Abierta' : 'Cerrada' }}</strong></div></article>
      </section>

      <section class="sales-card">
        <div class="table-toolbar">
          <div><h3>Operaciones</h3><p>{{ selectedDate | date:'longDate' }}</p></div>
          <label class="search-field"><app-icon name="search" size="16" color="var(--text-muted)" /><input [ngModel]="search()" (ngModelChange)="search.set($event)" placeholder="Buscar folio o cliente" /></label>
        </div>

        @if (service.loading()) {
          <div class="table-state"><app-icon name="loader" size="30" className="app-icon-spin" /><p>Cargando ventas...</p></div>
        } @else {
          <div class="sales-table">
            <div class="table-row table-head"><span>Folio</span><span>Hora</span><span>Cliente</span><span>Pago</span><span>Estado</span><span class="amount">Total</span></div>
            @for (sale of filteredSales(); track sale.id) {
              <div class="table-row">
                <span class="folio">#{{ sale.id.slice(0, 8).toUpperCase() }}</span>
                <span>{{ sale.created_at | date:'shortTime' }}</span>
                <span>{{ sale.customer_name || 'Público general' }}</span>
                <span><i class="payment-icon"><app-icon [name]="sale.payment_method === 'cash' ? 'dollar-sign' : 'credit-card'" size="13" color="currentColor" /></i>{{ sale.payment_method === 'cash' ? 'Efectivo' : 'Tarjeta' }}</span>
                <span><b class="status-pill">Completada</b></span>
                <strong class="amount">{{ sale.total | mxnCurrency }}</strong>
              </div>
            } @empty {
              <div class="table-state"><app-icon name="clipboard" size="38" color="var(--text-muted)" /><h3>Sin ventas</h3><p>No hay operaciones para esta fecha.</p></div>
            }
          </div>
        }
      </section>

      @if (showCloseModal()) {
        <div class="modal-backdrop">
          <section class="modal-card">
            <button type="button" class="modal-close" (click)="showCloseModal.set(false)">×</button>
            <div class="modal-icon"><app-icon name="lock" size="28" color="white" /></div>
            <span class="eyebrow">Corte de turno</span><h2>Cerrar caja</h2>
            <p>Cuenta el efectivo físico. El sistema comparará el monto con lo esperado.</p>
            <div class="expected-row"><span>Efectivo esperado</span><strong>{{ service.status()?.expected_cash || 0 | mxnCurrency }}</strong></div>
            <label class="field"><span>Efectivo contado</span><div class="money-input"><b>$</b><input type="number" min="0" step="0.01" [(ngModel)]="countedAmount" /></div></label>
            <div class="difference-row" [class.negative]="difference() < 0" [class.positive]="difference() > 0"><span>Diferencia</span><strong>{{ difference() | mxnCurrency }}</strong></div>
            @if (localError()) { <div class="error-banner">{{ localError() }}</div> }
            <button type="button" class="primary-button" [disabled]="processing()" (click)="closeRegister()">{{ processing() ? 'Cerrando...' : 'Confirmar corte' }}</button>
          </section>
        </div>
      }

      @if (closeResult()) {
        <div class="modal-backdrop">
          <section class="modal-card result-card">
            <div class="result-icon"><app-icon name="check" size="30" color="white" /></div>
            <span class="eyebrow">Turno finalizado</span><h2>Caja cerrada</h2>
            <div class="result-lines"><div><span>Esperado</span><strong>{{ closeResult().expected_amount | mxnCurrency }}</strong></div><div><span>Contado</span><strong>{{ closeResult().counted_amount | mxnCurrency }}</strong></div><div><span>Diferencia</span><strong>{{ closeResult().difference | mxnCurrency }}</strong></div></div>
            <button type="button" class="primary-button" (click)="closeResult.set(null)">Aceptar</button>
          </section>
        </div>
      }
    </div>
  `,
  styleUrl: './cashier-sales.css',
})
export class CashierSales {
  protected service = inject(CashierService);
  readonly search = signal('');
  readonly localError = signal('');
  readonly processing = signal(false);
  readonly showCloseModal = signal(false);
  readonly closeResult = signal<any | null>(null);
  selectedDate = this.service.today();
  countedAmount = 0;

  readonly salesTotal = computed(() => this.service.sales().reduce((sum, sale) => sum + Number(sale.total), 0));
  readonly filteredSales = computed(() => {
    const query = this.search().trim().toLowerCase();
    return this.service.sales().filter((sale) => !query || sale.id.toLowerCase().includes(query) || sale.customer_name?.toLowerCase().includes(query));
  });

  constructor() { void this.service.loadWorkspace(this.selectedDate); }

  async changeDate(): Promise<void> { try { await this.service.loadSales(this.selectedDate); } catch { this.localError.set('No se pudieron cargar las ventas.'); } }
  openCloseModal(): void { this.countedAmount = this.service.status()?.expected_cash ?? 0; this.localError.set(''); this.showCloseModal.set(true); }
  difference(): number { return Math.round((this.countedAmount - (this.service.status()?.expected_cash ?? 0)) * 100) / 100; }

  async closeRegister(): Promise<void> {
    this.processing.set(true); this.localError.set('');
    try {
      const result = await this.service.closeRegister(this.countedAmount);
      this.showCloseModal.set(false);
      this.closeResult.set(result);
    } catch (err: any) { this.localError.set(err?.error?.error || 'No se pudo cerrar la caja.'); }
    finally { this.processing.set(false); }
  }
}
