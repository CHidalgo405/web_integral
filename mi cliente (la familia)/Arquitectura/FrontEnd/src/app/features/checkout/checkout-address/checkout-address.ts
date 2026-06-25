import { Component, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { UserService } from '../../../core/services/user.service';
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
      <div class="address-list">
        @for (addr of userService.getAddresses(); track addr.id) {
          <div class="address-card" [class.selected]="selectedAddress()?.id === addr.id" (click)="selectAddress(addr)" [id]="'addr-' + addr.id">
            <div class="addr-header"><span class="addr-label">{{ addr.label }}</span>@if (addr.isDefault) { <span class="default-badge">Principal</span> }</div>
            <p class="addr-name">{{ addr.fullName }}</p>
            <p class="addr-detail">{{ addr.street }} {{ addr.exteriorNumber }}{{ addr.interiorNumber ? ', ' + addr.interiorNumber : '' }}</p>
            <p class="addr-detail">{{ addr.neighborhood }}, {{ addr.city }}, {{ addr.state }} {{ addr.zipCode }}</p>
          </div>
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
  private router = inject(Router);
  selectedAddress = signal<Address | undefined>(this.userService.defaultAddress());

  selectAddress(addr: Address): void { this.selectedAddress.set(addr); }
  next(): void { this.router.navigate(['/checkout/shipping']); }
}
