import { Component, inject } from '@angular/core';
import { CartService } from '../../../core/services/cart.service';
import { MxnCurrencyPipe } from '../../../shared/pipes/currency.pipe';
import { IconComponent } from '../../../shared/components/icon/icon';

@Component({
  selector: 'app-checkout-order-summary',
  standalone: true,
  imports: [MxnCurrencyPipe, IconComponent],
  template: `
    <aside class="order-summary-card" id="checkout-order-summary" aria-label="Resumen de tu pedido">
      <div class="summary-heading">
        <div>
          <span class="summary-eyebrow">Tu compra</span>
          <h2>Resumen del pedido</h2>
        </div>
        <span class="item-count">{{ cartService.itemCount() }}</span>
      </div>

      <div class="summary-products">
        @for (item of cartService.items(); track item.id) {
          <div class="summary-product">
            <div class="product-image-wrap">
              <img
                [src]="item.product.images[0] || 'assets/images/productos/placeholder.png'"
                [alt]="item.product.name"
                class="product-media-img"
              />
              <span class="quantity-badge">{{ item.quantity }}</span>
            </div>
            <div class="product-copy">
              <strong>{{ item.product.name }}</strong>
              <span>{{ item.selectedVariant?.value || 'Presentación regular' }}</span>
            </div>
            <span class="product-total">{{ (item.product.price * item.quantity) | mxnCurrency }}</span>
          </div>
        } @empty {
          <div class="empty-summary">
            <app-icon name="shopping-cart" size="24" />
            <span>Tu carrito está vacío</span>
          </div>
        }
      </div>

      <div class="summary-values">
        <div><span>Subtotal</span><strong>{{ cartService.cart().subtotal | mxnCurrency }}</strong></div>
        @if (cartService.cart().discount > 0) {
          <div class="discount"><span>Descuento</span><strong>-{{ cartService.cart().discount | mxnCurrency }}</strong></div>
        }
        <div><span>Envío</span><strong>{{ cartService.cart().shipping === 0 ? 'Por calcular' : (cartService.cart().shipping | mxnCurrency) }}</strong></div>
        <div class="grand-total"><span>Total estimado</span><strong>{{ cartService.cart().total | mxnCurrency }}</strong></div>
      </div>

      <div class="secure-note">
        <app-icon name="shield" size="16" />
        <span>Compra protegida y total validado por el servidor</span>
      </div>
    </aside>
  `,
  styles: [`
    :host { display: block; min-width: 0; }
    .order-summary-card { background: var(--surface); border: 1px solid var(--border); border-radius: 26px; padding: 24px; box-shadow: 0 18px 50px rgba(15,42,32,.08); }
    .summary-heading { display:flex; align-items:center; justify-content:space-between; gap:16px; padding-bottom:18px; border-bottom:1px solid var(--border); }
    .summary-eyebrow { display:block; color:var(--accent); font-size:.66rem; font-weight:900; letter-spacing:.14em; text-transform:uppercase; margin-bottom:3px; }
    h2 { margin:0; color:var(--text-primary); font:700 1.25rem var(--font-heading); }
    .item-count { min-width:34px; height:34px; display:grid; place-items:center; border-radius:12px; background:var(--primary); color:#fff; font-weight:900; }
    .summary-products { display:grid; gap:13px; max-height:330px; overflow:auto; padding:18px 2px; scrollbar-width:thin; }
    .summary-product { display:grid; grid-template-columns:58px minmax(0,1fr) auto; align-items:center; gap:11px; }
    .product-image-wrap { width:58px; aspect-ratio:1; position:relative; padding:5px; background:var(--bg); border:1px solid var(--border); border-radius:14px; }
    .quantity-badge { position:absolute; top:-6px; right:-6px; min-width:20px; height:20px; padding:0 5px; display:grid; place-items:center; border-radius:10px; background:var(--secondary); color:#fff; border:2px solid var(--surface); font-size:.66rem; font-weight:900; }
    .product-copy { min-width:0; display:grid; gap:2px; }
    .product-copy strong { overflow:hidden; text-overflow:ellipsis; white-space:nowrap; color:var(--text-primary); font-size:.82rem; }
    .product-copy span { overflow:hidden; text-overflow:ellipsis; white-space:nowrap; color:var(--text-muted); font-size:.69rem; }
    .product-total { color:var(--text-primary); font-size:.78rem; font-weight:900; white-space:nowrap; }
    .summary-values { border-top:1px solid var(--border); padding-top:14px; display:grid; gap:10px; }
    .summary-values>div { display:flex; justify-content:space-between; gap:18px; color:var(--text-secondary); font-size:.82rem; }
    .summary-values strong { color:var(--text-primary); }
    .summary-values .discount,.summary-values .discount strong { color:var(--success); }
    .summary-values .grand-total { margin-top:3px; padding-top:14px; border-top:1px dashed var(--border); align-items:baseline; font-size:.98rem; font-weight:900; }
    .grand-total strong { font-size:1.35rem; }
    .secure-note { margin-top:18px; padding:12px; display:flex; align-items:center; justify-content:center; gap:8px; border-radius:14px; background:var(--primary-alpha); color:var(--primary); font-size:.7rem; font-weight:800; text-align:center; }
    .empty-summary { min-height:100px; display:flex; flex-direction:column; align-items:center; justify-content:center; gap:8px; color:var(--text-muted); font-size:.8rem; }
    @media (min-width:900px) { :host { position:sticky; top:28px; } }
    @media (max-width:899px) { .order-summary-card { margin:0 16px 110px; } }
    @media (max-width:480px) { .order-summary-card { margin-inline:10px; padding:18px 14px; border-radius:20px; } }
  `],
})
export class CheckoutOrderSummary {
  protected cartService = inject(CartService);
}
