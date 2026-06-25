import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { IconComponent } from '../../../shared/components/icon/icon';

@Component({
  selector: 'app-order-confirmation',
  standalone: true,
  imports: [RouterLink, IconComponent],
  template: `
    <div class="confirmation-page" id="order-confirmation-page">
      <div class="success-content">
        <span class="success-icon" style="display: block; margin-bottom: 16px;"><app-icon name="check" size="64" color="var(--success)" /></span>
        <h1>¡Pedido Confirmado!</h1>
        <p>Tu pedido ha sido procesado exitosamente. Recibirás un correo de confirmación.</p>
        <a routerLink="/orders/history" class="btn-primary" id="view-orders-btn">Ver mis pedidos</a>
        <a routerLink="/home" class="btn-secondary" id="continue-shopping-btn">Seguir comprando</a>
      </div>
    </div>
  `,
  styles: [`
    .confirmation-page { min-height: 100dvh; display: flex; align-items: center; justify-content: center; padding: 24px; }
    .success-content { text-align: center; max-width: 360px; }
    h1 { font-size: 1.5rem; font-weight: 800; color: var(--text-primary); margin: 0 0 12px; }
    p { font-size: 0.9rem; color: var(--text-secondary); line-height: 1.5; margin: 0 0 28px; }
    .btn-primary { display: block; padding: 14px; background: var(--secondary); color: #fff; border-radius: 9999px; text-decoration: none; font-weight: 700; margin-bottom: 10px; transition: background 0.2s; }
    .btn-primary:hover { background: var(--secondary-dark); }
    .btn-secondary { display: block; padding: 14px; border: 1.5px solid var(--border); border-radius: 9999px; text-decoration: none; color: var(--text-secondary); font-weight: 600; transition: background 0.2s; }
    .btn-secondary:hover { background: var(--surface-raised); }
  `],
})
export class OrderConfirmation {}
