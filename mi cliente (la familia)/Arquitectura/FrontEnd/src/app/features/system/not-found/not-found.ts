import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Location } from '@angular/common';
import { IconComponent } from '../../../shared/components/icon/icon';

@Component({
  selector: 'app-not-found',
  standalone: true,
  imports: [RouterLink, IconComponent],
  template: `
    <div class="nf-page" id="not-found-page">

      <!-- Ilustración superior -->
      <div class="nf-hero">
        <div class="nf-blob"></div>
        <div class="nf-number">404</div>
        <div class="nf-icon-wrap">
          <app-icon name="map-pin-off" size="48" color="var(--primary)" />
        </div>
      </div>

      <!-- Texto -->
      <div class="nf-body">
        <h1 class="nf-title">Página no encontrada</h1>
        <p class="nf-subtitle">
          Parece que esta ruta no existe o fue movida.<br>
          No te preocupes, te ayudamos a volver.
        </p>

        <!-- Sugerencias rápidas -->
        <div class="nf-suggestions">
          <p class="suggestions-label">Puede que estés buscando:</p>
          <div class="suggestions-grid">
            <a routerLink="/home" class="suggestion-chip" id="nf-go-home">
              <app-icon name="home" size="18" color="var(--primary)" />
              <span>Inicio</span>
            </a>
            <a routerLink="/home/categories" class="suggestion-chip" id="nf-go-categories">
              <app-icon name="grid" size="18" color="var(--primary)" />
              <span>Categorías</span>
            </a>
            <a routerLink="/orders/history" class="suggestion-chip" id="nf-go-orders">
              <app-icon name="clipboard" size="18" color="var(--primary)" />
              <span>Mis pedidos</span>
            </a>
            <a routerLink="/cart" class="suggestion-chip" id="nf-go-cart">
              <app-icon name="shopping-cart" size="18" color="var(--primary)" />
              <span>Mi carrito</span>
            </a>
          </div>
        </div>

        <!-- CTAs principales -->
        <div class="nf-ctas">
          <a routerLink="/home" class="btn-primary-nf" id="nf-btn-home">
            <app-icon name="home" size="18" color="#fff" />
            Ir al inicio
          </a>
          <button class="btn-back-nf" type="button" (click)="goBack()" id="nf-btn-back">
            <app-icon name="arrow-left" size="16" color="var(--primary)" />
            Volver atrás
          </button>
        </div>
      </div>

    </div>
  `,
  styles: [`
    .nf-page {
      min-height: 100dvh;
      background: var(--bg);
      display: flex;
      flex-direction: column;
      align-items: center;
      padding-bottom: 40px;
    }

    /* ---- Hero ---- */
    .nf-hero {
      position: relative;
      width: 100%;
      background: linear-gradient(160deg, var(--primary) 0%, #0d3323 100%);
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 64px 24px 80px;
      overflow: hidden;
    }

    .nf-blob {
      position: absolute;
      width: 280px;
      height: 280px;
      border-radius: 50%;
      background: rgba(255,255,255,0.05);
      top: -80px;
      right: -80px;
      pointer-events: none;
    }
    .nf-blob::after {
      content: '';
      position: absolute;
      width: 200px;
      height: 200px;
      border-radius: 50%;
      background: rgba(255,255,255,0.04);
      bottom: -120px;
      left: -60px;
    }

    .nf-number {
      font-size: 7rem;
      font-weight: 900;
      color: rgba(255,255,255,0.15);
      line-height: 1;
      font-family: var(--font-heading);
      letter-spacing: -4px;
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      white-space: nowrap;
      pointer-events: none;
      user-select: none;
    }

    .nf-icon-wrap {
      width: 96px;
      height: 96px;
      border-radius: 28px;
      background: rgba(255,255,255,0.12);
      border: 2px solid rgba(255,255,255,0.2);
      display: flex;
      align-items: center;
      justify-content: center;
      position: relative;
      z-index: 2;
      animation: floatUp 3s ease-in-out infinite;
      box-shadow: 0 12px 32px rgba(0,0,0,0.15);
    }

    .nf-icon-wrap app-icon {
      filter: brightness(0) invert(1);
    }

    @keyframes floatUp {
      0%, 100% { transform: translateY(0); }
      50%       { transform: translateY(-10px); }
    }

    /* ---- Cuerpo ---- */
    .nf-body {
      width: 100%;
      max-width: 480px;
      padding: 32px 20px 0;
      display: flex;
      flex-direction: column;
      align-items: center;
      text-align: center;
      gap: 24px;
      margin-top: -24px;
    }

    .nf-title {
      font-size: 1.5rem;
      font-weight: 800;
      color: var(--text-primary);
      margin: 0;
      font-family: var(--font-heading);
    }

    .nf-subtitle {
      font-size: 0.9rem;
      color: var(--text-secondary);
      line-height: 1.6;
      margin: 0;
    }

    /* ---- Sugerencias ---- */
    .nf-suggestions {
      width: 100%;
    }

    .suggestions-label {
      font-size: 0.75rem;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.06em;
      color: var(--text-muted);
      margin: 0 0 12px;
    }

    .suggestions-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 10px;
    }

    .suggestion-chip {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 14px 16px;
      background: var(--surface);
      border: 1.5px solid var(--border);
      border-radius: 16px;
      text-decoration: none;
      color: var(--text-primary);
      font-size: 0.875rem;
      font-weight: 700;
      transition: all 0.2s;
      box-shadow: 0 2px 8px rgba(0,0,0,0.04);
    }

    .suggestion-chip:hover {
      border-color: var(--primary);
      background: rgba(27,61,50,0.04);
      transform: translateY(-2px);
      box-shadow: 0 6px 16px rgba(0,0,0,0.07);
    }

    /* ---- CTAs ---- */
    .nf-ctas {
      width: 100%;
      display: flex;
      flex-direction: column;
      gap: 10px;
    }

    .btn-primary-nf {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      padding: 16px;
      background: var(--primary);
      color: #fff;
      border-radius: 9999px;
      text-decoration: none;
      font-weight: 800;
      font-size: 0.95rem;
      transition: background 0.2s, transform 0.2s;
      box-shadow: 0 4px 14px rgba(27,61,50,0.25);
    }
    .btn-primary-nf:hover { background: #0d3323; transform: translateY(-1px); }

    .btn-back-nf {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      padding: 14px;
      background: none;
      border: 1.5px solid var(--border);
      border-radius: 9999px;
      color: var(--primary);
      font-weight: 700;
      font-size: 0.9rem;
      cursor: pointer;
      transition: background 0.2s, border-color 0.2s;
    }
    .btn-back-nf:hover {
      background: rgba(27,61,50,0.05);
      border-color: var(--primary);
    }
  `],
})
export class NotFound {
  private location = inject(Location);

  goBack(): void {
    this.location.back();
  }
}
