import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { CartService } from '../../../core/services/cart.service';
import { OrderService } from '../../../core/services/order.service';
import { UserService } from '../../../core/services/user.service';
import { MxnCurrencyPipe } from '../../../shared/pipes/currency.pipe';
import { Header } from '../../../shared/components/header/header';

@Component({
  selector: 'app-checkout-summary',
  standalone: true,
  imports: [MxnCurrencyPipe, Header],
  template: `
    <app-header title="Resumen del Pedido" [showBack]="true"></app-header>
    <div class="checkout-page" id="checkout-summary-page">
      <div class="summary-section">
        <h3>Productos ({{ cartService.itemCount() }})</h3>
        @for (item of cartService.items(); track item.id) {
          <div class="summary-item">
            <span>{{ item.product.name }} x{{ item.quantity }}</span>
            <span>{{ (item.product.price * item.quantity) | mxnCurrency }}</span>
          </div>
        }
      </div>
      <div class="summary-section">
        <h3>Dirección de envío</h3>
        @if (userService.defaultAddress(); as addr) {
          <p class="addr-text">{{ addr.street }} {{ addr.exteriorNumber }}, {{ addr.neighborhood }}, {{ addr.city }}</p>
        }
      </div>
      <div class="summary-totals">
        <div class="summary-row"><span>Subtotal</span><span>{{ cartService.cart().subtotal | mxnCurrency }}</span></div>
        @if (cartService.cart().discount > 0) {
          <div class="summary-row discount"><span>Descuento</span><span>-{{ cartService.cart().discount | mxnCurrency }}</span></div>
        }
        <div class="summary-row"><span>Envío</span><span>{{ cartService.cart().shipping === 0 ? 'Gratis' : (cartService.cart().shipping | mxnCurrency) }}</span></div>
        <div class="summary-row total"><span>Total</span><span>{{ cartService.cart().total | mxnCurrency }}</span></div>
      </div>
      <button class="btn-pay" (click)="placeOrder()" id="place-order-btn">Pagar · {{ cartService.cart().total | mxnCurrency }}</button>
    </div>
  `,
  styleUrl: '../checkout-shared.css',
})
export class CheckoutSummary {
  protected cartService = inject(CartService);
  protected userService = inject(UserService);
  private orderService = inject(OrderService);
  private router = inject(Router);

  placeOrder(): void {
    const cart = this.cartService.cart();
    const addr = this.userService.defaultAddress();
    if (addr) {
      this.orderService.createOrder(cart.items, addr, 'standard', 'card', cart.subtotal, cart.discount, cart.shipping, cart.total);
      this.cartService.clearCart();
      this.router.navigate(['/orders/confirmation']);
    }
  }
}
