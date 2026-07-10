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
    { key: 'paypal' as PaymentMethod, icon: 'paypal', label: 'PayPal', description: 'Paga seguro con tu cuenta PayPal o tarjeta' },
    { key: 'card' as PaymentMethod, icon: 'credit-card', label: 'Tarjeta de crédito/débito', description: 'Visa, Mastercard, AMEX' },
    { key: 'cash' as PaymentMethod, icon: 'dollar-sign', label: 'Efectivo', description: 'Paga al recibir tu pedido' },
  ];

  select(key: PaymentMethod): void {
    this.selected.set(key);
    this.checkoutState.selectedPayment.set(key);
  }

  next(): void { this.router.navigate(['/checkout/summary']); }
}


