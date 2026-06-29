import { Component, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { UserService } from '../../../core/services/user.service';
import { CheckoutStateService } from '../../../core/services/checkout-state.service';
import { Header } from '../../../shared/components/header/header';
import { Address } from '../../../core/models/address.model';

@Component({
  selector: 'app-checkout-address',
  standalone: true,
  imports: [RouterLink, Header],
  template: `
    <app-header title="Dirección de Envío" [showBack]="true"></app-header>
    <div class="checkout-page" id="checkout-address-page">
      <div class="step-indicator"><span class="step done">✓</span><span class="step active">2</span><span class="step">3</span><span class="step">4</span></div>
      <div class="address-list" role="radiogroup">
        @if (userService.getAddresses().length === 0) {
          <div class="empty-state">
            <span class="empty-state-icon">🏠</span>
            <h4>No tienes direcciones</h4>
            <p>Agrega una dirección para poder enviar tus pedidos.</p>
          </div>
        } @else {
          @for (addr of userService.getAddresses(); track addr.id) {
            <div class="address-card" 
                 role="radio" 
                 [attr.aria-checked]="selectedAddress()?.id === addr.id"
                 tabindex="0" 
                 [class.selected]="selectedAddress()?.id === addr.id" 
                 (click)="selectAddress(addr)" 
                 (keydown.enter)="selectAddress(addr)"
                 [id]="'addr-' + addr.id">
              <div class="addr-header"><span class="addr-label">{{ addr.label }}</span>@if (addr.isDefault) { <span class="default-badge">Principal</span> }</div>
              <p class="addr-name">{{ addr.fullName }}</p>
              <p class="addr-detail">{{ addr.street }} {{ addr.exteriorNumber }}{{ addr.interiorNumber ? ', ' + addr.interiorNumber : '' }}</p>
              <p class="addr-detail">{{ addr.neighborhood }}, {{ addr.city }}, {{ addr.state }} {{ addr.zipCode }}</p>
            </div>
          }
        }
      </div>
      <a routerLink="/checkout/address/new" class="btn-add-address" id="add-address-btn">+ Agregar nueva dirección</a>
      <button class="btn-continue" [disabled]="!selectedAddress()" (click)="next()" id="address-next-btn">Continuar</button>
    </div>
  `,
  styleUrl: '../checkout-shared.css',
})
export class CheckoutAddress {
  protected userService = inject(UserService);
  protected checkoutState = inject(CheckoutStateService);
  private router = inject(Router);

  selectedAddress = signal<Address | undefined>(
    this.checkoutState.selectedAddress() ?? this.userService.defaultAddress()
  );

  selectAddress(addr: Address): void {
    this.selectedAddress.set(addr);
    this.checkoutState.selectedAddress.set(addr);
  }

  next(): void {
    if (this.selectedAddress()) {
      this.checkoutState.selectedAddress.set(this.selectedAddress());
    }
    this.router.navigate(['/checkout/shipping']);
  }
}
