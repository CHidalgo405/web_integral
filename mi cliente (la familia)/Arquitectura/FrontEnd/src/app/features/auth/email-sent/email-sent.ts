import { Component, inject } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { Location } from '@angular/common';
import { IconComponent } from '../../../shared/components/icon/icon';

@Component({
  selector: 'app-email-sent',
  standalone: true,
  imports: [RouterLink, IconComponent],
  template: `
    <div class="email-sent-page" id="email-sent-page">

      <!-- Hero superior con gradiente -->
      <div class="email-sent-hero">
        <div class="email-sent-blob"></div>
        <div class="email-sent-icon-wrap">
          <app-icon name="mail" size="48" color="#fff" />
        </div>
        
        <h1 class="email-sent-title">Correo Enviado</h1>
        <p class="email-sent-subtitle">
          Hemos enviado un enlace de recuperación<br>
          a tu correo electrónico
        </p>
        <div class="email-badge">
          <app-icon name="mail" size="16" color="var(--primary)" />
          <span>{{ email }}</span>
        </div>
      </div>

      <!-- Cuerpo -->
      <div class="email-sent-body">
        <div class="info-card">
          <app-icon name="info" size="20" color="var(--primary)" />
          <p>
            Revisa tu bandeja de entrada y sigue las instrucciones del correo. 
            Si no lo encuentras, revisa la carpeta de spam.
          </p>
        </div>

        <div class="email-sent-actions">
          <button class="btn-resend" id="resend-email-btn" (click)="resend()">
            <app-icon name="refresh-cw" size="16" color="var(--primary)" />
            Reenviar correo
          </button>

          <a routerLink="/auth/login" class="btn-login" id="back-to-login-btn">
            <app-icon name="log-in" size="18" color="#fff" />
            Volver al Login
          </a>
        </div>

        <!-- Botón Volver atrás -->
        <button class="btn-back" type="button" (click)="goBack()" id="btn-back">
          <app-icon name="arrow-left" size="16" color="var(--primary)" />
          Volver atrás
        </button>
      </div>
    </div>
  `,
  styles: [`
    .email-sent-page {
      min-height: 100dvh;
      background: var(--bg);
      display: flex;
      flex-direction: column;
      align-items: center;
      padding-bottom: 40px;
    }

    /* ---- Hero ---- */
    .email-sent-hero {
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

    .email-sent-blob {
      position: absolute;
      width: 280px;
      height: 280px;
      border-radius: 50%;
      background: rgba(255,255,255,0.05);
      top: -80px;
      right: -80px;
      pointer-events: none;
    }
    .email-sent-blob::after {
      content: '';
      position: absolute;
      width: 200px;
      height: 200px;
      border-radius: 50%;
      background: rgba(255,255,255,0.04);
      bottom: -120px;
      left: -60px;
    }

    .email-sent-icon-wrap {
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

    .email-sent-icon-wrap app-icon {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 48px;
      height: 48px;
      filter: brightness(0) invert(1);
    }

    @keyframes floatUp {
      0%, 100% { transform: translateY(0); }
      50%       { transform: translateY(-10px); }
    }

    .email-sent-title {
      font-size: 1.75rem;
      font-weight: 800;
      color: #fff;
      margin: 20px 0 8px;
      font-family: var(--font-heading);
      position: relative;
      z-index: 2;
      text-align: center;
    }

    .email-sent-subtitle {
      font-size: 0.9rem;
      color: rgba(255,255,255,0.7);
      line-height: 1.6;
      margin: 0 0 16px;
      text-align: center;
      position: relative;
      z-index: 2;
    }

    .email-badge {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      padding: 8px 16px;
      background: rgba(255,255,255,0.1);
      border-radius: 9999px;
      backdrop-filter: blur(8px);
      border: 1px solid rgba(255,255,255,0.1);
      position: relative;
      z-index: 2;
    }

    .email-badge span {
      color: #fff;
      font-weight: 500;
      font-size: 0.85rem;
    }

    .email-badge app-icon {
      filter: brightness(0) invert(1);
      opacity: 0.7;
    }

    /* ---- Cuerpo ---- */
    .email-sent-body {
      width: 100%;
      max-width: 420px;
      padding: 32px 20px 0;
      display: flex;
      flex-direction: column;
      gap: 24px;
      margin-top: -24px;
    }

    /* ---- Info Card ---- */
    .info-card {
      display: flex;
      align-items: flex-start;
      gap: 12px;
      padding: 16px 18px;
      background: rgba(27,61,50,0.05);
      border: 1px solid rgba(27,61,50,0.1);
      border-radius: 16px;
      width: 100%;
    }

    .info-card app-icon {
      flex-shrink: 0;
      margin-top: 2px;
    }

    .info-card p {
      margin: 0;
      font-size: 0.875rem;
      line-height: 1.6;
      color: var(--text-secondary);
    }

    /* ---- Botones ---- */
    .email-sent-actions {
      width: 100%;
      display: flex;
      flex-direction: column;
      gap: 10px;
    }

    .btn-login {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      padding: 16px;
      background: var(--primary);
      color: #fff;
      border: none;
      border-radius: 9999px;
      font-weight: 800;
      font-size: 0.95rem;
      cursor: pointer;
      transition: all 0.2s ease;
      box-shadow: 0 4px 14px rgba(27,61,50,0.25);
      width: 100%;
      text-decoration: none;
    }

    .btn-login:hover {
      background: #0d3323;
      transform: translateY(-2px);
      box-shadow: 0 8px 24px rgba(27,61,50,0.3);
    }

    .btn-login:active {
      transform: scale(0.97);
    }

    .btn-resend {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      padding: 14px;
      background: none;
      border: 2px solid var(--border);
      border-radius: 9999px;
      color: var(--text-primary);
      font-weight: 700;
      font-size: 0.9rem;
      cursor: pointer;
      transition: all 0.2s ease;
      width: 100%;
    }

    .btn-resend:hover {
      background: rgba(27,61,50,0.05);
      border-color: var(--primary);
      transform: translateY(-1px);
    }

    .btn-resend:active {
      transform: scale(0.97);
    }

    /* ---- Back button ---- */
    .btn-back {
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
      transition: all 0.2s ease;
      width: 100%;
    }

    .btn-back:hover {
      background: rgba(27,61,50,0.05);
      border-color: var(--primary);
      transform: translateY(-1px);
    }

    .btn-back:active {
      transform: scale(0.97);
    }

    /* ---- Responsive ---- */
    @media (max-width: 480px) {
      .email-sent-hero {
        padding: 48px 20px 64px;
      }

      .email-sent-icon-wrap {
        width: 76px;
        height: 76px;
        border-radius: 22px;
      }

      .email-sent-icon-wrap app-icon {
        width: 38px;
        height: 38px;
      }

      .email-sent-title {
        font-size: 1.5rem;
        margin-top: 16px;
      }

      .email-sent-subtitle {
        font-size: 0.85rem;
      }

      .email-sent-body {
        padding: 28px 16px 0;
        margin-top: -24px;
        gap: 20px;
      }

      .info-card {
        padding: 14px 16px;
      }

      .info-card p {
        font-size: 0.85rem;
      }

      .btn-login {
        padding: 14px;
        font-size: 0.9rem;
      }

      .btn-resend {
        padding: 12px;
        font-size: 0.85rem;
      }

      .btn-back {
        padding: 12px;
        font-size: 0.85rem;
      }
    }

    @media (max-width: 380px) {
      .email-sent-hero {
        padding: 40px 16px 56px;
      }

      .email-sent-icon-wrap {
        width: 64px;
        height: 64px;
        border-radius: 18px;
      }

      .email-sent-icon-wrap app-icon {
        width: 32px;
        height: 32px;
      }

      .email-sent-title {
        font-size: 1.25rem;
        margin-top: 12px;
      }

      .email-sent-subtitle {
        font-size: 0.8rem;
        margin-bottom: 12px;
      }

      .email-sent-body {
        padding: 24px 14px 0;
        margin-top: -20px;
        gap: 16px;
      }

      .info-card {
        padding: 12px 14px;
      }

      .info-card p {
        font-size: 0.8rem;
      }

      .info-card app-icon {
        width: 18px;
        height: 18px;
      }

      .btn-login {
        padding: 12px;
        font-size: 0.85rem;
      }

      .btn-login app-icon {
        width: 16px;
        height: 16px;
      }

      .btn-resend {
        padding: 10px;
        font-size: 0.8rem;
      }

      .btn-resend app-icon {
        width: 14px;
        height: 14px;
      }

      .btn-back {
        padding: 10px;
        font-size: 0.8rem;
      }

      .btn-back app-icon {
        width: 14px;
        height: 14px;
      }

      .email-badge {
        padding: 6px 12px;
      }

      .email-badge span {
        font-size: 0.75rem;
      }

      .email-badge app-icon {
        width: 14px;
        height: 14px;
      }
    }
  `],
})
export class EmailSent {
  private route = inject(ActivatedRoute);
  private location = inject(Location);
  email = '';

  ngOnInit(): void {
    this.route.queryParams.subscribe((p) => (this.email = p['email'] ?? ''));
  }

  resend(): void {
    alert('El backend aun no expone reenvio de correo de recuperacion.');
  }

  goBack(): void {
    this.location.back();
  }
}