import { Component, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { CheckoutStateService } from '../../../core/services/checkout-state.service';
import { Header } from '../../../shared/components/header/header';
import { IconComponent } from '../../../shared/components/icon/icon';

@Component({
  selector: 'app-checkout-identify',
  standalone: true,
  imports: [RouterLink, Header, IconComponent],
  template: `
    <app-header title="Checkout" [showBack]="true"></app-header>
    <div class="checkout-page" id="checkout-identify-page">
      <div class="step-indicator"><span class="step active">1</span><span class="step">2</span><span class="step">3</span><span class="step">4</span></div>
      <h2>¿Cómo deseas continuar?</h2>
      @if (authService.isAuthenticated()) {
        <div class="user-card">
          <span class="user-icon" style="display: flex; align-items: center;"><app-icon name="user" size="24" /></span>
          <div>
            <p class="user-name">{{ authService.user()?.firstName }} {{ authService.user()?.lastName }}</p>
            <p class="user-email">{{ authService.user()?.email }}</p>
          </div>
        </div>
        <button class="btn-continue" (click)="continueAsUser()" id="continue-user-btn">Continuar como {{ authService.user()?.firstName }}</button>
      } @else {
        <a routerLink="/auth/login" class="btn-continue">Iniciar sesión</a>
        <div style="text-align: center; margin: 24px 0; color: #8a8a80; font-size: 0.9rem;">— o —</div>
        <div class="form-group">
          <label>Continuar como invitado</label>
          <input #guestEmail type="email" placeholder="Ingresa tu correo electrónico" (keydown.enter)="continueAsGuest(guestEmail.value)" />
        </div>
        <button class="btn-guest" (click)="continueAsGuest(guestEmail.value)" id="continue-guest-btn">Continuar</button>
      }
    </div>
  `,
  styleUrl: '../checkout-shared.css',
})
export class CheckoutIdentify {
  protected authService = inject(AuthService);
  private router = inject(Router);
  private checkoutState = inject(CheckoutStateService);

  continueAsUser(): void {
    this.checkoutState.guestEmail.set('');
    this.router.navigate(['/checkout/address']);
  }

  continueAsGuest(email: string): void {
    this.checkoutState.guestEmail.set(email ?? '');
    this.router.navigate(['/checkout/address']);
  }
}
