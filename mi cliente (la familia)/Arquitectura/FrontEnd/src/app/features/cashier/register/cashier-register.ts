import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import {
  CashierCustomer,
  CashierProduct,
  CashierService,
  PosSale,
} from '../../../core/services/cashier.service';
import { MxnCurrencyPipe } from '../../../shared/pipes/currency.pipe';
import { IconComponent } from '../../../shared/components/icon/icon';

interface RegisterCartItem {
  product: CashierProduct;
  quantity: number;
}

@Component({
  selector: 'app-cashier-register',
  standalone: true,
  imports: [FormsModule, MxnCurrencyPipe, IconComponent],
  template: `
    <div class="register-page">
      <section class="catalog-panel">
        <div class="page-heading">
          <div>
            <span class="eyebrow">Punto de venta</span>
            <h2>Nueva venta</h2>
          </div>
          <div class="daily-cards">
            <div><small>Ventas</small><strong>{{ service.status()?.sales_count || 0 }}</strong></div>
            <div><small>Total del día</small><strong>{{ service.status()?.sales_total || 0 | mxnCurrency }}</strong></div>
          </div>
        </div>

        @if (service.error() || localError()) {
          <div class="error-banner"><app-icon name="alert-triangle" size="16" color="currentColor" />{{ localError() || service.error() }}</div>
        }

        <div class="search-row">
          <label class="search-box">
            <app-icon name="search" size="18" color="var(--text-muted)" />
            <input [ngModel]="searchQuery()" (ngModelChange)="searchQuery.set($event)" placeholder="Buscar producto o SKU" />
          </label>
          <label class="barcode-box">
            <app-icon name="hash" size="17" color="var(--primary)" />
            <input [(ngModel)]="barcode" (keyup.enter)="scanBarcode()" placeholder="Código de barras" />
            <button type="button" (click)="scanBarcode()">Agregar</button>
          </label>
        </div>

        <div class="category-tabs">
          <button type="button" [class.active]="selectedCategory() === 'all'" (click)="selectedCategory.set('all')">Todos</button>
          @for (category of categories(); track category) {
            <button type="button" [class.active]="selectedCategory() === category" (click)="selectedCategory.set(category)">{{ category }}</button>
          }
        </div>

        @if (service.loading()) {
          <div class="catalog-state"><app-icon name="loader" size="32" className="app-icon-spin" /><p>Cargando caja...</p></div>
        } @else {
          <div class="product-grid">
            @for (product of filteredProducts(); track product.id) {
              <button type="button" class="product-card" [disabled]="product.stock <= 0" (click)="addProduct(product)">
                <span class="product-symbol"><app-icon name="package" size="25" color="var(--primary)" /></span>
                <span class="product-data">
                  <strong>{{ product.name }}</strong>
                  <small>{{ product.category || 'General' }} · {{ product.sku || 'Sin SKU' }}</small>
                </span>
                <span class="product-footer">
                  <b>{{ product.price | mxnCurrency }}</b>
                  <em [class.low]="product.stock <= 5">{{ product.stock }} disponibles</em>
                </span>
              </button>
            } @empty {
              <div class="catalog-state empty"><app-icon name="search" size="34" color="var(--text-muted)" /><p>No encontramos productos.</p></div>
            }
          </div>
        }
      </section>

      <aside class="cart-panel">
        <div class="cart-heading">
          <div><span class="eyebrow">Ticket actual</span><h2>{{ itemCount() }} productos</h2></div>
          @if (cart().length) { <button type="button" class="clear-button" (click)="clearCart()">Vaciar</button> }
        </div>

        <div class="customer-row">
          <label>
            <span>Cliente</span>
            <select [(ngModel)]="selectedCustomerId">
              <option value="">Público general</option>
              @for (customer of service.customers(); track customer.id) {
                <option [value]="customer.id">{{ customer.name }}{{ customer.phone ? ' · ' + customer.phone : '' }}</option>
              }
            </select>
          </label>
          <button type="button" class="add-customer" (click)="showCustomerModal.set(true)" aria-label="Agregar cliente">
            <app-icon name="plus" size="17" color="currentColor" />
          </button>
        </div>

        <div class="cart-items">
          @for (item of cart(); track item.product.id) {
            <article class="cart-item">
              <div class="cart-item-icon"><app-icon name="package" size="18" /></div>
              <div class="cart-item-info"><strong>{{ item.product.name }}</strong><small>{{ item.product.price | mxnCurrency }} c/u</small></div>
              <div class="quantity-control">
                <button type="button" (click)="decrement(item.product.id)">−</button>
                <span>{{ item.quantity }}</span>
                <button type="button" (click)="increment(item.product.id)" [disabled]="item.quantity >= item.product.stock">+</button>
              </div>
              <b class="line-total">{{ (+item.product.price * item.quantity) | mxnCurrency }}</b>
              <button type="button" class="remove-line" (click)="remove(item.product.id)">×</button>
            </article>
          } @empty {
            <div class="empty-cart"><div><app-icon name="shopping-cart" size="38" color="var(--text-muted)" /></div><h3>Ticket vacío</h3><p>Selecciona productos para comenzar.</p></div>
          }
        </div>

        <div class="cart-summary">
          <div><span>Subtotal</span><span>{{ total() | mxnCurrency }}</span></div>
          <div><span>Descuentos</span><span>{{ 0 | mxnCurrency }}</span></div>
          <div class="grand-total"><strong>Total</strong><strong>{{ total() | mxnCurrency }}</strong></div>
          <button type="button" class="charge-button" [disabled]="!cart().length || !service.status()?.is_open" (click)="showPaymentModal.set(true)">
            <app-icon name="dollar-sign" size="18" color="currentColor" />
            {{ service.status()?.is_open ? 'Cobrar ' + (total() | mxnCurrency) : 'Abre la caja para cobrar' }}
          </button>
        </div>
      </aside>
    </div>

    @if (!service.loading() && service.status() && !service.status()?.is_open) {
      <div class="modal-backdrop mandatory">
        <section class="modal-card register-modal">
          <div class="modal-icon"><app-icon name="unlock" size="30" color="white" /></div>
          <span class="eyebrow">Inicio de turno</span><h2>Abrir caja</h2>
          <p>Registra el efectivo inicial antes de comenzar a cobrar.</p>
          @if (localError()) { <div class="inline-error">{{ localError() }}</div> }
          <label class="field"><span>Fondo inicial</span><div class="money-input"><b>$</b><input type="number" min="0" step="0.01" [(ngModel)]="openingAmount" /></div></label>
          <label class="field"><span>Turno</span><select [(ngModel)]="shift"><option value="morning">Matutino</option><option value="afternoon">Vespertino</option></select></label>
          <button type="button" class="primary-button" [disabled]="processing()" (click)="openRegister()">{{ processing() ? 'Abriendo...' : 'Abrir caja' }}</button>
        </section>
      </div>
    }

    @if (showPaymentModal()) {
      <div class="modal-backdrop">
        <section class="modal-card payment-modal">
          <button type="button" class="modal-close" (click)="showPaymentModal.set(false)">×</button>
          <span class="eyebrow">Finalizar venta</span><h2>Cobrar {{ total() | mxnCurrency }}</h2>
          <div class="payment-options">
            <button type="button" [class.active]="paymentMethod === 'cash'" (click)="paymentMethod = 'cash'"><app-icon name="dollar-sign" size="22" color="currentColor" /><b>Efectivo</b></button>
            <button type="button" [class.active]="paymentMethod === 'card'" (click)="paymentMethod = 'card'"><app-icon name="credit-card" size="22" color="currentColor" /><b>Tarjeta</b></button>
          </div>
          @if (paymentMethod === 'cash') {
            <label class="field"><span>Efectivo recibido</span><div class="money-input"><b>$</b><input type="number" min="0" step="0.01" [(ngModel)]="cashReceived" /></div></label>
            <div class="change-box"><span>Cambio</span><strong>{{ changeDue() | mxnCurrency }}</strong></div>
          } @else {
            <div class="card-note"><app-icon name="credit-card" size="22" /><div><strong>Cobro con terminal</strong><p>Confirma que la terminal haya aprobado el pago.</p></div></div>
          }
          @if (localError()) { <div class="inline-error">{{ localError() }}</div> }
          <button type="button" class="primary-button" [disabled]="processing() || (paymentMethod === 'cash' && cashReceived < total())" (click)="completeSale()">
            {{ processing() ? 'Procesando...' : 'Confirmar cobro' }}
          </button>
        </section>
      </div>
    }

    @if (showCustomerModal()) {
      <div class="modal-backdrop">
        <section class="modal-card customer-modal">
          <button type="button" class="modal-close" (click)="showCustomerModal.set(false)">×</button>
          <span class="eyebrow">Directorio</span><h2>Nuevo cliente</h2>
          <label class="field"><span>Nombre *</span><input [(ngModel)]="customerDraft.name" /></label>
          <label class="field"><span>Teléfono</span><input [(ngModel)]="customerDraft.phone" /></label>
          <label class="field"><span>Correo</span><input type="email" [(ngModel)]="customerDraft.email" /></label>
          @if (localError()) { <div class="inline-error">{{ localError() }}</div> }
          <button type="button" class="primary-button" [disabled]="!customerDraft.name.trim() || processing()" (click)="saveCustomer()">Guardar cliente</button>
        </section>
      </div>
    }

    @if (completedSale(); as sale) {
      <div class="modal-backdrop">
        <section class="modal-card success-modal">
          <div class="success-mark"><app-icon name="check" size="32" color="white" /></div>
          <span class="eyebrow">Venta completada</span><h2>{{ sale.total | mxnCurrency }}</h2>
          <p>Folio {{ sale.id.slice(0, 8).toUpperCase() }}</p>
          @if (sale.payment_method === 'cash') { <div class="change-box"><span>Cambio entregado</span><strong>{{ sale.change_given || 0 | mxnCurrency }}</strong></div> }
          <div class="success-actions"><button type="button" class="secondary-button" (click)="printTicket()"><app-icon name="file-text" size="16" color="currentColor" /> Imprimir</button><button type="button" class="primary-button" (click)="newSale()">Nueva venta</button></div>
        </section>
      </div>
    }
  `,
  styleUrl: './cashier-register.css',
})
export class CashierRegister {
  protected service = inject(CashierService);
  readonly cart = signal<RegisterCartItem[]>([]);
  readonly selectedCategory = signal('all');
  readonly localError = signal('');
  readonly processing = signal(false);
  readonly showPaymentModal = signal(false);
  readonly showCustomerModal = signal(false);
  readonly completedSale = signal<PosSale | null>(null);

  readonly searchQuery = signal('');
  barcode = '';
  selectedCustomerId = '';
  openingAmount = 500;
  shift: 'morning' | 'afternoon' = new Date().getHours() < 14 ? 'morning' : 'afternoon';
  paymentMethod: 'cash' | 'card' = 'cash';
  cashReceived = 0;
  customerDraft: Omit<CashierCustomer, 'id'> = { name: '', phone: '', email: '', address: '' };

  readonly categories = computed(() =>
    [...new Set(this.service.products().map((product) => product.category || 'General'))].sort(),
  );
  readonly filteredProducts = computed(() => {
    const query = this.searchQuery().trim().toLowerCase();
    return this.service.products().filter((product) => {
      const categoryMatches = this.selectedCategory() === 'all' || (product.category || 'General') === this.selectedCategory();
      const queryMatches = !query || product.name.toLowerCase().includes(query) || product.sku?.toLowerCase().includes(query);
      return categoryMatches && queryMatches;
    });
  });
  readonly total = computed(() =>
    Math.round(this.cart().reduce((sum, item) => sum + Number(item.product.price) * item.quantity, 0) * 100) / 100,
  );
  readonly itemCount = computed(() => this.cart().reduce((sum, item) => sum + item.quantity, 0));

  constructor() { void this.service.loadWorkspace(); }

  changeDue(): number { return Math.max(0, Math.round((this.cashReceived - this.total()) * 100) / 100); }

  addProduct(product: CashierProduct): void {
    if (product.stock <= 0) return;
    this.localError.set('');
    this.cart.update((items) => {
      const current = items.find((item) => item.product.id === product.id);
      if (current) {
        if (current.quantity >= product.stock) return items;
        return items.map((item) => item.product.id === product.id ? { ...item, quantity: item.quantity + 1 } : item);
      }
      return [...items, { product, quantity: 1 }];
    });
  }

  increment(id: string): void { const item = this.cart().find((line) => line.product.id === id); if (item) this.addProduct(item.product); }
  decrement(id: string): void { this.cart.update((items) => items.map((item) => item.product.id === id ? { ...item, quantity: item.quantity - 1 } : item).filter((item) => item.quantity > 0)); }
  remove(id: string): void { this.cart.update((items) => items.filter((item) => item.product.id !== id)); }
  clearCart(): void { this.cart.set([]); this.selectedCustomerId = ''; }

  async scanBarcode(): Promise<void> {
    const code = this.barcode.trim();
    if (!code) return;
    this.localError.set('');
    try { this.addProduct(await this.service.findByBarcode(code)); this.barcode = ''; }
    catch (err: any) { this.localError.set(err?.error?.error || 'No se encontró el código de barras.'); }
  }

  async openRegister(): Promise<void> {
    this.processing.set(true); this.localError.set('');
    try { await this.service.openRegister(this.openingAmount, this.shift); }
    catch (err: any) { this.localError.set(err?.error?.error || 'No se pudo abrir la caja.'); }
    finally { this.processing.set(false); }
  }

  async saveCustomer(): Promise<void> {
    this.processing.set(true); this.localError.set('');
    try {
      const customer = await this.service.createCustomer(this.customerDraft);
      this.selectedCustomerId = customer.id;
      this.customerDraft = { name: '', phone: '', email: '', address: '' };
      this.showCustomerModal.set(false);
    } catch (err: any) { this.localError.set(err?.error?.error || 'No se pudo guardar el cliente.'); }
    finally { this.processing.set(false); }
  }

  async completeSale(): Promise<void> {
    this.processing.set(true); this.localError.set('');
    try {
      const sale = await this.service.createSale({
        items: this.cart().map((item) => ({ inventory_id: item.product.id, quantity: item.quantity })),
        customer_id: this.selectedCustomerId || null,
        payment_method: this.paymentMethod,
        cash_tendered: this.paymentMethod === 'cash' ? this.cashReceived : null,
      });
      this.showPaymentModal.set(false);
      this.completedSale.set(sale);
    } catch (err: any) { this.localError.set(err?.error?.error || 'No se pudo completar la venta.'); }
    finally { this.processing.set(false); }
  }

  printTicket(): void { window.print(); }
  newSale(): void { this.completedSale.set(null); this.clearCart(); this.cashReceived = 0; this.paymentMethod = 'cash'; }
}
