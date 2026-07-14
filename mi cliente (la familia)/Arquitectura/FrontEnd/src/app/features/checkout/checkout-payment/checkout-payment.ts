import { Component, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { Header } from '../../../shared/components/header/header';
import { PaymentMethod } from '../../../core/models/order.model';
import { CheckoutStateService } from '../../../core/services/checkout-state.service';
import { IconComponent } from '../../../shared/components/icon/icon';
import { CheckoutOrderSummary } from '../checkout-order-summary/checkout-order-summary';

@Component({
  selector: 'app-checkout-payment',
  standalone: true,
  imports: [Header, IconComponent, CheckoutOrderSummary],
  template: `
    <app-header title="Método de Pago" [showBack]="true"></app-header>
    <div class="checkout-layout"><main class="checkout-page" id="checkout-payment-page">
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

      <button class="btn-continue" [disabled]="!selected()" (click)="next()" id="payment-next-btn">Continuar</button>
    </main><app-checkout-order-summary /></div>
  `,
  styleUrl: '../checkout-shared.css',
})
export class CheckoutPayment {
  private router = inject(Router);
  private checkoutState = inject(CheckoutStateService);

  selected = signal<PaymentMethod | ''>(this.checkoutState.selectedPayment());

  paymentOptions = [
    { key: 'paypal' as PaymentMethod, icon: 'paypal', label: 'PayPal', description: 'Paga seguro con tu cuenta PayPal o tarjeta' },
    { key: 'cash' as PaymentMethod, icon: 'dollar-sign', label: 'Efectivo', description: 'Paga al recibir tu pedido' },
  ];

  select(key: PaymentMethod): void {
    this.selected.set(key);
    this.checkoutState.selectedPayment.set(key);
  }

  next(): void { this.router.navigate(['/checkout/summary']); }
}


