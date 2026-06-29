import { Component, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { Header } from '../../../shared/components/header/header';
import { PaymentMethod } from '../../../core/models/order.model';
import { CheckoutStateService } from '../../../core/services/checkout-state.service';
import { IconComponent } from '../../../shared/components/icon/icon';

@Component({
  selector: 'app-checkout-payment',
  standalone: true,
  imports: [RouterLink, Header, IconComponent],
  template: `
    <app-header title="Método de Pago" [showBack]="true"></app-header>
    <div class="checkout-page" id="checkout-payment-page">
      <div class="step-indicator"><span class="step done">✓</span><span class="step done">✓</span><span class="step done">✓</span><span class="step active">4</span></div>
      <div class="options-list" role="radiogroup">
        @for (opt of paymentOptions; track opt.key) {
          <div class="option-card"
               role="radio"
               [attr.aria-checked]="selected() === opt.key"
               tabindex="0"
               [class.selected]="selected() === opt.key"
               (click)="select(opt.key)"
               (keydown.enter)="select(opt.key)">
            <span class="opt-icon" style="display: flex; align-items: center;"><app-icon [name]="opt.icon" size="24" /></span>
            <div class="opt-info"><h3>{{ opt.label }}</h3><p>{{ opt.description }}</p></div>
          </div>
        }
      </div>

      @if (selected() === 'transfer') {
        <div class="transfer-info-block">
          <div class="transfer-info-header">
            <span style="display: flex; align-items: center;"><app-icon name="landmark" size="18" /></span>
            <span>Datos para transferencia SPEI</span>
          </div>
          <div class="transfer-row">
            <span class="transfer-label">Banco</span>
            <span class="transfer-value">BBVA México</span>
          </div>
          <div class="transfer-row">
            <span class="transfer-label">CLABE</span>
            <span class="transfer-value transfer-clabe">0121 0000 1234 5678 90</span>
          </div>
          <div class="transfer-row">
            <span class="transfer-label">Beneficiario</span>
            <span class="transfer-value">La Familia S.A. de C.V.</span>
          </div>
          <div class="transfer-row">
            <span class="transfer-label">Concepto</span>
            <span class="transfer-value">Tu número de pedido</span>
          </div>
          <p class="transfer-note">
            Realiza tu transferencia y envía el comprobante por WhatsApp al
            <strong>+52 55 1234 5678</strong> para confirmar tu pedido.
          </p>
        </div>
      }

      @if (selected() === 'card') {
        <a routerLink="/checkout/payment/card" class="btn-continue" id="card-form-btn">Ingresar datos de tarjeta</a>
      } @else {
        <button class="btn-continue" [disabled]="!selected()" (click)="next()" id="payment-next-btn">Continuar</button>
      }
    </div>
  `,
  styleUrl: '../checkout-shared.css',
})
export class CheckoutPayment {
  private router = inject(Router);
  private checkoutState = inject(CheckoutStateService);

  selected = signal<PaymentMethod | ''>(this.checkoutState.selectedPayment());

  paymentOptions = [
    { key: 'card' as PaymentMethod, icon: 'credit-card', label: 'Tarjeta de crédito/débito', description: 'Visa, Mastercard, AMEX' },
    { key: 'cash' as PaymentMethod, icon: 'dollar-sign', label: 'Efectivo', description: 'Paga al recibir tu pedido' },
    { key: 'transfer' as PaymentMethod, icon: 'landmark', label: 'Transferencia bancaria', description: 'SPEI / CLABE interbancaria' },
  ];

  select(key: PaymentMethod): void {
    this.selected.set(key);
    this.checkoutState.selectedPayment.set(key);
  }

  next(): void { this.router.navigate(['/checkout/summary']); }
}
