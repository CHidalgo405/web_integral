import { Component, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CartService } from '../../../core/services/cart.service';
import { OrderService } from '../../../core/services/order.service';
import { CheckoutStateService } from '../../../core/services/checkout-state.service';
import { AuthService } from '../../../core/services/auth.service';
import { MxnCurrencyPipe } from '../../../shared/pipes/currency.pipe';
import { Header } from '../../../shared/components/header/header';
import { IconComponent } from '../../../shared/components/icon/icon';
import { ShippingMethod, PaymentMethod } from '../../../core/models/order.model';

@Component({
  selector: 'app-checkout-summary',
  standalone: true,
  imports: [RouterLink, FormsModule, MxnCurrencyPipe, Header, IconComponent],
  template: `
    <app-header title="Resumen del Pedido" [showBack]="true"></app-header>
    <div class="checkout-page" id="checkout-summary-page">

      <!-- Productos -->
      <div class="summary-section">
        <h3>Productos ({{ cartService.itemCount() }})</h3>
        @for (item of cartService.items(); track item.id) {
          <div class="summary-item">
            <div class="summary-item-content">
              <img [src]="item.product.images[0]" [alt]="item.product.name" class="item-image"
                   onerror="this.src='https://placehold.co/48x48/f5f5f0/a0a0a0?text=Img'" />
              <div class="summary-item-title">
                <span>{{ item.product.name }}</span>
                <span class="summary-item-qty">Cant: {{ item.quantity }}</span>
              </div>
            </div>
            <span>{{ (item.product.price * item.quantity) | mxnCurrency }}</span>
          </div>
        }
      </div>

      <!-- Dirección de envío -->
      <div class="summary-section">
        <div class="summary-section-header">
          <h3>Dirección de envío</h3>
          <a routerLink="/checkout/address" class="summary-edit-link" id="edit-address-btn">Editar</a>
        </div>
        @if (checkoutState.selectedAddress(); as addr) {
          <div class="summary-info-row">
            <span class="summary-info-icon" style="display: flex; align-items: flex-start; padding-top: 2px;">
              <app-icon name="map-pin" size="16" color="var(--primary)" />
            </span>
            <div>
              <p class="addr-text" style="margin: 0 0 2px; font-weight: 600;">{{ addr.fullName }}</p>
              <p class="addr-text" style="margin: 0;">{{ addr.street }} {{ addr.exteriorNumber }}{{ addr.interiorNumber ? ', ' + addr.interiorNumber : '' }}, {{ addr.neighborhood }}</p>
              <p class="addr-text" style="margin: 0;">{{ addr.city }}, {{ addr.state }} {{ addr.zipCode }}</p>
            </div>
          </div>
        } @else {
          <p class="addr-text" style="color: var(--danger); font-size: 0.85rem;">Sin dirección seleccionada</p>
        }
        @if (!authService.isAuthenticated() && checkoutState.guestEmail()) {
          <div class="summary-info-row" style="margin-top: 12px; padding-top: 12px; border-top: 1px dashed var(--border);">
            <span style="display: flex; align-items: center;"><app-icon name="mail" size="16" color="var(--primary)" /></span>
            <span class="addr-text">{{ checkoutState.guestEmail() }}</span>
          </div>
        }
      </div>

      <!-- Método de envío -->
      <div class="summary-section">
        <div class="summary-section-header">
          <h3>Método de envío</h3>
          <a routerLink="/checkout/shipping" class="summary-edit-link" id="edit-shipping-btn">Editar</a>
        </div>
        @if (checkoutState.selectedShipping(); as shipping) {
          <div class="summary-info-row">
            <span class="summary-info-icon" style="display: flex; align-items: center;">
              <app-icon [name]="checkoutState.getShippingIcon(shipping)" size="16" color="var(--primary)" />
            </span>
            <div>
              <p class="addr-text" style="margin: 0 0 2px; font-weight: 600;">{{ checkoutState.getShippingLabel(shipping) }}</p>
              <p class="addr-text" style="margin: 0;">{{ checkoutState.getShippingDetail(shipping) }} · {{ checkoutState.getShippingPrice(shipping) }}</p>
            </div>
          </div>
        } @else {
          <p class="addr-text" style="color: var(--danger); font-size: 0.85rem;">Sin método de envío seleccionado</p>
        }
      </div>

      <!-- Método de pago -->
      <div class="summary-section">
        <div class="summary-section-header">
          <h3>Método de pago</h3>
          <a routerLink="/checkout/payment" class="summary-edit-link" id="edit-payment-btn">Editar</a>
        </div>
        @if (checkoutState.selectedPayment(); as payment) {
          <div class="summary-info-row">
            <span class="summary-info-icon" style="display: flex; align-items: center;">
              <app-icon [name]="checkoutState.getPaymentIcon(payment)" size="16" color="var(--primary)" />
            </span>
            <p class="addr-text" style="margin: 0; font-weight: 600;">{{ checkoutState.getPaymentLabel(payment) }}</p>
          </div>
        } @else {
          <p class="addr-text" style="color: var(--danger); font-size: 0.85rem;">Sin método de pago seleccionado</p>
        }
      </div>

      <!-- Cupón de descuento -->
      <div class="summary-section">
        <h3>Cupón de descuento</h3>
        <div class="coupon-row">
          <input
            type="text"
            [(ngModel)]="couponInput"
            placeholder="Ingresa tu código de cupón"
            class="coupon-input"
            [disabled]="couponApplied()"
            id="coupon-input"
          />
          <button
            class="coupon-btn"
            (click)="applyCoupon()"
            [disabled]="!couponInput.trim() || couponApplied()"
            id="apply-coupon-btn"
          >
            @if (couponApplied()) { ✓ } @else { Aplicar }
          </button>
        </div>
        @if (couponError()) {
          <p class="coupon-msg error">{{ couponError() }}</p>
        }
        @if (couponApplied()) {
          <p class="coupon-msg success">¡Cupón aplicado correctamente!</p>
        }
      </div>

      <!-- Totales -->
      <div class="summary-totals">
        <div class="summary-row"><span>Subtotal</span><span>{{ cartService.cart().subtotal | mxnCurrency }}</span></div>
        @if (cartService.cart().discount > 0) {
          <div class="summary-row discount"><span>Descuento</span><span>-{{ cartService.cart().discount | mxnCurrency }}</span></div>
        }
        <div class="summary-row"><span>Envío</span><span>{{ cartService.cart().shipping === 0 ? 'Gratis' : (cartService.cart().shipping | mxnCurrency) }}</span></div>
        <div class="summary-row total"><span>Total</span><span>{{ cartService.cart().total | mxnCurrency }}</span></div>
      </div>

      <button class="btn-pay" [disabled]="isPlacingOrder() || !canPlaceOrder()" (click)="placeOrder()" id="place-order-btn">
        @if (isPlacingOrder()) {
          <app-icon name="loader" size="18" className="app-icon-spin" style="margin-right: 8px;" />
          Procesando...
        } @else {
          Pagar · {{ cartService.cart().total | mxnCurrency }}
        }
      </button>

    </div>
  `,
  styleUrl: '../checkout-shared.css',
})
export class CheckoutSummary {
  protected cartService = inject(CartService);
  protected checkoutState = inject(CheckoutStateService);
  protected authService = inject(AuthService);
  private orderService = inject(OrderService);
  private router = inject(Router);

  isPlacingOrder = signal(false);
  couponInput = '';
  couponApplied = signal(false);
  couponError = signal('');

  canPlaceOrder(): boolean {
    return !!this.checkoutState.selectedAddress() &&
           !!this.checkoutState.selectedShipping() &&
           !!this.checkoutState.selectedPayment();
  }

  applyCoupon(): void {
    const code = this.couponInput.trim().toUpperCase();
    if (!code) return;
    // Placeholder: cuando se conecte el backend se validará aquí
    this.couponError.set('Este cupón no es válido o ya expiró.');
  }

  placeOrder(): void {
    if (this.isPlacingOrder() || !this.canPlaceOrder()) return;
    this.isPlacingOrder.set(true);

    const cart = this.cartService.cart();
    const addr = this.checkoutState.selectedAddress()!;
    const shipping = this.checkoutState.selectedShipping() as ShippingMethod;
    const payment = this.checkoutState.selectedPayment() as PaymentMethod;

    setTimeout(() => {
      this.orderService.createOrder(
        cart.items, addr, shipping, payment,
        cart.subtotal, cart.discount, cart.shipping, cart.total
      );
      this.cartService.clearCart();
      this.checkoutState.reset();
      this.router.navigate(['/orders/confirmation']);
      this.isPlacingOrder.set(false);
    }, 1500);
  }
}
