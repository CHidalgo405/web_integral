import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { IconComponent } from '../../../shared/components/icon/icon';

@Component({
  selector: 'app-order-error',
  standalone: true,
  imports: [RouterLink, IconComponent],
  template: `
    <div class="error-page" id="order-error-page">

      <!-- Encabezado de error -->
      <div class="error-header">
        <div class="error-circle">
          <app-icon name="x" size="36" color="#fff" />
        </div>
        <h1>Error en el pago</h1>
        <p>Tu transacción no pudo completarse.<br>Tu carrito sigue intacto.</p>
      </div>

      <!-- Cuerpo -->
      <div class="error-body">

        <!-- Posibles causas -->
        <div class="causes-card">
          <div class="causes-header">
            <app-icon name="info" size="16" color="var(--text-secondary)" />
            <span>Posibles causas</span>
          </div>
          <ul class="causes-list">
            @for (cause of causes; track cause.text) {
              <li class="cause-item">
                <span class="cause-dot" [style.background]="cause.color"></span>
                <span>{{ cause.text }}</span>
              </li>
            }
          </ul>
        </div>

        <!-- Qué puedes hacer -->
        <div class="tips-card">
          <div class="tips-header">
            <app-icon name="lightbulb" size="16" color="var(--warning)" />
            <span>¿Qué puedo hacer?</span>
          </div>
          <ul class="tips-list">
            @for (tip of tips; track tip) {
              <li class="tip-item">
                <app-icon name="check" size="14" color="var(--success)" />
                <span>{{ tip }}</span>
              </li>
            }
          </ul>
        </div>

        <!-- Acciones -->
        <div class="cta-group">
          <a routerLink="/checkout/summary" class="btn-retry" id="retry-btn">
            <app-icon name="refresh-cw" size="18" color="#fff" />
            Intentar de nuevo
          </a>
          <a routerLink="/cart" class="btn-cart" id="go-cart-btn">
            <app-icon name="shopping-cart" size="18" color="var(--primary)" />
            Ver mi carrito
          </a>
          <a routerLink="/home" class="btn-home" id="go-home-btn">
            Volver al inicio
          </a>
        </div>

      </div>
    </div>
  `,
  styles: [`
    .error-page {
      min-height: 100dvh;
      background: var(--bg);
      padding-bottom: 100px;
    }

    /* ---- Encabezado ---- */
    .error-header {
      background: linear-gradient(160deg, #c0392b 0%, #922b21 100%);
      padding: 48px 24px 40px;
      text-align: center;
      color: #fff;
    }

    .error-circle {
      width: 80px;
      height: 80px;
      border-radius: 50%;
      background: rgba(255,255,255,0.15);
      border: 2px solid rgba(255,255,255,0.3);
      display: flex;
      align-items: center;
      justify-content: center;
      margin: 0 auto 20px;
      animation: shakeIn 0.5s cubic-bezier(0.36, 0.07, 0.19, 0.97) both;
    }

    @keyframes shakeIn {
      0%   { transform: scale(0); opacity: 0; }
      60%  { transform: scale(1.08); opacity: 1; }
      80%  { transform: scale(0.96) rotate(-3deg); }
      100% { transform: scale(1) rotate(0deg); }
    }

    .error-header h1 {
      font-size: 1.6rem;
      font-weight: 800;
      margin: 0 0 12px;
      color: #fff;
    }

    .error-header p {
      font-size: 0.85rem;
      color: rgba(255,255,255,0.8);
      margin: 0;
      line-height: 1.5;
    }

    /* ---- Cuerpo ---- */
    .error-body {
      padding: 20px 16px;
      display: flex;
      flex-direction: column;
      gap: 12px;
      max-width: 600px;
      margin: 0 auto;
    }

    /* ---- Causas ---- */
    .causes-card, .tips-card {
      background: var(--surface-raised);
      border-radius: 20px;
      padding: 18px;
      border: 1px solid var(--border);
    }

    .causes-header, .tips-header {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 0.85rem;
      font-weight: 700;
      color: var(--text-secondary);
      margin-bottom: 14px;
      padding-bottom: 10px;
      border-bottom: 1px dashed var(--border);
      text-transform: uppercase;
      letter-spacing: 0.04em;
    }

    .causes-list, .tips-list {
      list-style: none;
      margin: 0;
      padding: 0;
      display: flex;
      flex-direction: column;
      gap: 10px;
    }

    .cause-item {
      display: flex;
      align-items: center;
      gap: 10px;
      font-size: 0.875rem;
      color: var(--text-primary);
      font-weight: 500;
    }

    .cause-dot {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      flex-shrink: 0;
    }

    .tip-item {
      display: flex;
      align-items: flex-start;
      gap: 10px;
      font-size: 0.875rem;
      color: var(--text-primary);
      font-weight: 500;
      line-height: 1.4;
    }

    .tip-item app-icon { flex-shrink: 0; margin-top: 1px; }

    /* ---- Botones ---- */
    .cta-group {
      display: flex;
      flex-direction: column;
      gap: 10px;
      margin-top: 8px;
    }

    .btn-retry {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      padding: 16px;
      background: var(--secondary);
      color: #fff;
      border-radius: 9999px;
      text-decoration: none;
      font-weight: 700;
      font-size: 0.95rem;
      transition: background 0.2s, transform 0.2s;
      box-shadow: 0 4px 14px rgba(225, 75, 50, 0.25);
    }

    .btn-retry:hover { background: var(--secondary-dark); transform: translateY(-1px); }

    .btn-cart {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      padding: 16px;
      background: rgba(27, 61, 50, 0.06);
      color: var(--primary);
      border-radius: 9999px;
      text-decoration: none;
      font-weight: 700;
      font-size: 0.9rem;
      border: 1.5px solid rgba(27, 61, 50, 0.15);
      transition: background 0.2s;
    }

    .btn-cart:hover { background: rgba(27, 61, 50, 0.1); }

    .btn-home {
      display: block;
      text-align: center;
      padding: 14px;
      text-decoration: none;
      color: var(--text-muted);
      font-weight: 600;
      font-size: 0.85rem;
      transition: color 0.2s;
    }

    .btn-home:hover { color: var(--text-secondary); }
  `],
})
export class OrderError {
  causes = [
    { text: 'Fondos insuficientes en la cuenta', color: 'var(--danger)' },
    { text: 'Datos de tarjeta incorrectos o vencida', color: '#e67e22' },
    { text: 'Límite de tarjeta excedido', color: '#e67e22' },
    { text: 'Error temporal del banco', color: 'var(--text-muted)' },
  ];

  tips = [
    'Verifica que el número, fecha y CVV de tu tarjeta sean correctos.',
    'Asegúrate de tener saldo suficiente.',
    'Intenta con otra tarjeta o método de pago.',
    'Contacta a tu banco si el problema persiste.',
  ];
}
