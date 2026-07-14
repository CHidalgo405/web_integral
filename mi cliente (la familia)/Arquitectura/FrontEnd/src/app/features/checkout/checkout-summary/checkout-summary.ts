import { AfterViewInit, Component, ElementRef, ViewChild, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CartService } from '../../../core/services/cart.service';
import { CheckoutPayload, CheckoutQuote, OrderService } from '../../../core/services/order.service';
import { CheckoutStateService } from '../../../core/services/checkout-state.service';
import { AuthService } from '../../../core/services/auth.service';
import { PaypalService } from '../../../core/services/paypal.service';
import { MxnCurrencyPipe } from '../../../shared/pipes/currency.pipe';
import { Header } from '../../../shared/components/header/header';
import { IconComponent } from '../../../shared/components/icon/icon';
import { ShippingMethod, PaymentMethod } from '../../../core/models/order.model';
import { CheckoutOrderSummary } from '../checkout-order-summary/checkout-order-summary';

@Component({
  selector: 'app-checkout-summary',
  standalone: true,
  imports: [RouterLink, FormsModule, MxnCurrencyPipe, Header, IconComponent, CheckoutOrderSummary],
  template: `
    <app-header title="Resumen del Pedido" [showBack]="true"></app-header>
    <div class="checkout-layout"><main class="checkout-page" id="checkout-summary-page">

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
        <div class="summary-row"><span>Subtotal</span><span>{{ (serverQuote()?.subtotal ?? cartService.cart().subtotal) | mxnCurrency }}</span></div>
        @if ((serverQuote()?.discount_total ?? cartService.cart().discount) > 0) {
          <div class="summary-row discount"><span>Descuento</span><span>-{{ (serverQuote()?.discount_total ?? cartService.cart().discount) | mxnCurrency }}</span></div>
        }
        <div class="summary-row"><span>Envío</span><span>{{ (serverQuote()?.delivery_fee ?? cartService.cart().shipping) === 0 ? 'Gratis' : ((serverQuote()?.delivery_fee ?? cartService.cart().shipping) | mxnCurrency) }}</span></div>
        <div class="summary-row total"><span>Total</span><span>{{ (serverQuote()?.total ?? cartService.cart().total) | mxnCurrency }}</span></div>
      </div>

      @if (orderError()) {
        <p class="coupon-msg error">{{ orderError() }}</p>
      }

      @if (checkoutState.selectedPayment() === 'paypal') {
        <!-- Botones oficiales de PayPal -->
        @if (!canPlaceOrder()) {
          <p class="coupon-msg error">Completa dirección, envío y pago para continuar.</p>
        }
        @if (paypalLoading()) {
          <div class="paypal-loading">
            <app-icon name="loader" size="18" className="app-icon-spin" />
            Cargando PayPal...
          </div>
        }
        <div #paypalContainer class="paypal-container" [style.display]="canPlaceOrder() ? 'block' : 'none'"></div>
      } @else {
        <button class="btn-pay" [disabled]="isPlacingOrder() || quoteLoading() || !canPlaceOrder() || !serverQuote()" (click)="placeOrder()" id="place-order-btn">
          @if (isPlacingOrder()) {
            <app-icon name="loader" size="18" className="app-icon-spin" style="margin-right: 8px;" />
            Procesando...
          } @else {
            Confirmar · {{ (serverQuote()?.total ?? cartService.cart().total) | mxnCurrency }}
          }
        </button>
      }

    </main><app-checkout-order-summary /></div>
  `,
  styleUrl: '../checkout-shared.css',
})
export class CheckoutSummary implements AfterViewInit {
  protected cartService = inject(CartService);
  protected checkoutState = inject(CheckoutStateService);
  protected authService = inject(AuthService);
  private orderService = inject(OrderService);
  private paypalService = inject(PaypalService);
  private router = inject(Router);

  @ViewChild('paypalContainer') paypalContainer?: ElementRef<HTMLElement>;

  isPlacingOrder = signal(false);
  paypalLoading = signal(false);
  quoteLoading = signal(false);
  serverQuote = signal<CheckoutQuote | null>(null);
  couponInput = '';
  couponApplied = signal(false);
  couponError = signal('');
  orderError = signal('');

  async ngAfterViewInit(): Promise<void> {
    await this.refreshQuote();
    if (this.checkoutState.selectedPayment() === 'paypal') {
      this.setupPaypal();
    }
  }

  private async setupPaypal(): Promise<void> {
    const container = this.paypalContainer?.nativeElement;
    if (!container) return;

    this.paypalLoading.set(true);
    try {
      await this.paypalService.renderButtons(
        container,
        () => this.checkoutPayload(),
        async (paypalOrderId) => {
          await this.finalizeOrder('paypal', { orderId: paypalOrderId });
        },
        (message) => this.orderError.set(message),
      );
    } catch {
      this.orderError.set('No se pudo cargar PayPal. Verifica tu conexión o elige otro método de pago.');
    } finally {
      this.paypalLoading.set(false);
    }
  }

  canPlaceOrder(): boolean {
    return this.cartService.items().length > 0 &&
           !!this.checkoutState.selectedAddress() &&
           !!this.checkoutState.selectedShipping() &&
           !!this.checkoutState.selectedPayment();
  }

  private checkoutPayload(): CheckoutPayload {
    return this.orderService.buildCheckoutPayload(
      this.cartService.items(),
      this.checkoutState.selectedAddress()!,
      this.checkoutState.selectedShipping() as ShippingMethod,
      this.cartService.cart().couponCode,
    );
  }

  private async refreshQuote(): Promise<void> {
    if (!this.canPlaceOrder()) {
      this.serverQuote.set(null);
      return;
    }
    this.quoteLoading.set(true);
    this.orderError.set('');
    try {
      this.serverQuote.set(await this.orderService.quoteCheckout(this.checkoutPayload()));
    } catch {
      this.serverQuote.set(null);
      this.orderError.set('No se pudo validar el total del pedido con el servidor.');
    } finally {
      this.quoteLoading.set(false);
    }
  }

  async applyCoupon(): Promise<void> {
    const code = this.couponInput.trim().toUpperCase();
    if (!code) return;
    this.couponError.set('');
    const result = await this.cartService.applyCoupon(code);
    this.couponApplied.set(result.valid);
    if (!result.valid) {
      this.couponError.set(result.message);
    } else {
      await this.refreshQuote();
    }
  }

  async placeOrder(): Promise<void> {
    if (this.isPlacingOrder() || !this.canPlaceOrder()) return;
    const payment = this.checkoutState.selectedPayment() as PaymentMethod;
    await this.finalizeOrder(payment);
  }

  /** Crea el pedido en el backend. Para PayPal se llama después de capturar el pago. */
  private async finalizeOrder(payment: PaymentMethod, paypal?: { orderId: string }): Promise<void> {
    this.isPlacingOrder.set(true);
    this.orderError.set('');

    const addr = this.checkoutState.selectedAddress()!;

    try {
      await this.orderService.createOrder(
        this.checkoutPayload(), this.cartService.items(), addr, payment,
        paypal,
      );
      this.cartService.clearCart();
      this.checkoutState.reset();
      this.router.navigate(['/orders/confirmation']);
    } catch (error) {
      this.orderError.set(
        paypal
          ? 'Tu pago con PayPal fue procesado, pero el pedido no se pudo registrar. Contacta a soporte con este dato: ' + paypal.orderId
          : error instanceof Error ? error.message : 'No se pudo crear el pedido. Intenta de nuevo.',
      );
    } finally {
      this.isPlacingOrder.set(false);
    }
  }
}


