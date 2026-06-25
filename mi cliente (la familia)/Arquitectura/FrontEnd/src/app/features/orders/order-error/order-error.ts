import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { IconComponent } from '../../../shared/components/icon/icon';

@Component({
  selector: 'app-order-error',
  standalone: true,
  imports: [RouterLink, IconComponent],
  template: `
    <div class="error-page" id="order-error-page">
      <div class="error-content">
        <span class="error-icon" style="display: block; margin-bottom: 16px;"><app-icon name="x" size="64" color="var(--danger)" /></span>
        <h1>Error en el Pago</h1>
        <p>Tu transacción fue rechazada. Por favor verifica tus datos de pago e intenta de nuevo.</p>
        <a routerLink="/checkout/payment" class="btn-primary">Intentar de nuevo</a>
        <a routerLink="/home" class="btn-secondary">Volver al inicio</a>
      </div>
    </div>
  `,
  styles: [`
    .error-page { min-height: 100dvh; display: flex; align-items: center; justify-content: center; padding: 24px; }
    .error-content { text-align: center; max-width: 360px; }
    h1 { font-size: 1.5rem; font-weight: 800; color: var(--danger); margin: 0 0 12px; }
    p { font-size: 0.9rem; color: var(--text-secondary); line-height: 1.5; margin: 0 0 28px; }
    .btn-primary { display: block; padding: 14px; background: var(--secondary); color: #fff; border-radius: 9999px; text-decoration: none; font-weight: 700; margin-bottom: 10px; transition: background 0.2s; }
    .btn-primary:hover { background: var(--secondary-dark); }
    .btn-secondary { display: block; padding: 14px; border: 1.5px solid var(--border); border-radius: 9999px; text-decoration: none; color: var(--text-secondary); font-weight: 600; transition: background 0.2s; }
    .btn-secondary:hover { background: var(--surface-raised); }
  `],
})
export class OrderError {}
