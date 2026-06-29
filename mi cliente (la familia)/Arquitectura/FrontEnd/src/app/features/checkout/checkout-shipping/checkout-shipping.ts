import { Component, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { Header } from '../../../shared/components/header/header';
import { ShippingMethod } from '../../../core/models/order.model';
import { CheckoutStateService } from '../../../core/services/checkout-state.service';
import { IconComponent } from '../../../shared/components/icon/icon';

@Component({
  selector: 'app-checkout-shipping',
  standalone: true,
  imports: [Header, IconComponent],
  template: `
    <app-header title="Método de Envío" [showBack]="true"></app-header>
    <div class="checkout-page" id="checkout-shipping-page">
      <div class="step-indicator"><span class="step done">✓</span><span class="step done">✓</span><span class="step active">3</span><span class="step">4</span></div>
      <div class="options-list" role="radiogroup">
        @for (opt of shippingOptions; track opt.key) {
          <div class="option-card" 
               role="radio" 
               [attr.aria-checked]="selected() === opt.key" 
               tabindex="0" 
               [class.selected]="selected() === opt.key" 
               (click)="select(opt.key)"
               (keydown.enter)="select(opt.key)">
            <span class="opt-icon" style="display: flex; align-items: center;"><app-icon [name]="opt.icon" size="24" /></span>
            <div class="opt-info"><h3>{{ opt.label }}</h3><p>{{ opt.description }}</p></div>
            <span class="opt-price">{{ opt.price }}</span>
          </div>
        }
      </div>
      <button class="btn-continue" [disabled]="!selected()" (click)="next()" id="shipping-next-btn">Continuar</button>
    </div>
  `,
  styleUrl: '../checkout-shared.css',
})
export class CheckoutShipping {
  private router = inject(Router);
  private checkoutState = inject(CheckoutStateService);

  selected = signal<ShippingMethod | ''>(this.checkoutState.selectedShipping());

  shippingOptions = [
    { key: 'standard' as ShippingMethod, icon: 'package', label: 'Envío Estándar', description: '3-5 días hábiles', price: '$49.99' },
    { key: 'express' as ShippingMethod, icon: 'bolt', label: 'Envío Express', description: '1-2 días hábiles', price: '$89.99' },
    { key: 'pickup' as ShippingMethod, icon: 'store', label: 'Recoger en tienda', description: 'Disponible en 2 horas', price: 'Gratis' },
  ];

  select(key: ShippingMethod): void {
    this.selected.set(key);
    this.checkoutState.selectedShipping.set(key);
  }

  next(): void { this.router.navigate(['/checkout/payment']); }
}
