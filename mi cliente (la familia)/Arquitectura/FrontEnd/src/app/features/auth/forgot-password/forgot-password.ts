import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Location } from '@angular/common';
import { AuthService } from '../../../core/services/auth.service';
import { IconComponent } from '../../../shared/components/icon/icon';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [ReactiveFormsModule, IconComponent],
  template: `
    <div class="forgot-page" id="forgot-password-page">

      <!-- Hero superior con gradiente -->
      <div class="forgot-hero">
        <div class="forgot-blob"></div>
        <div class="forgot-icon-wrap">
          <app-icon name="lock" size="48" color="#fff" />
        </div>
        
        <h1 class="forgot-title">Recuperar Contraseña</h1>
        <p class="forgot-subtitle">
          Ingresa tu correo y te enviaremos<br>
          un enlace de recuperación
        </p>
      </div>

      <!-- Cuerpo del formulario -->
      <div class="forgot-body">
        @if (errorMessage()) {
          <div class="message error">
            <app-icon name="alert-circle" size="18" />
            {{ errorMessage() }}
          </div>
        }

        <form [formGroup]="form" (ngSubmit)="onSubmit()" class="forgot-form">
          <div class="form-group">
            <label for="forgot-email">Correo electrónico</label>
            <input 
              type="email" 
              id="forgot-email" 
              formControlName="email" 
              placeholder="tu@email.com"
              [class.error]="form.get('email')?.touched && form.get('email')?.invalid"
            />
            @if (form.get('email')?.touched && form.get('email')?.hasError('required')) {
              <span class="field-error">
                <app-icon name="alert-circle" size="16" />
                El correo es requerido
              </span>
            }
            @if (form.get('email')?.touched && form.get('email')?.hasError('email')) {
              <span class="field-error">
                <app-icon name="alert-circle" size="16" />
                Ingresa un correo válido
              </span>
            }
          </div>

          <button 
            type="submit" 
            class="btn-forgot" 
            id="forgot-submit" 
            [disabled]="form.invalid || loading()"
          >
            @if (loading()) {
              <app-icon name="loader" class="spin" size="18" color="#fff" />
              Enviando...
            } @else {
              <app-icon name="send" size="18" color="#fff" />
              Enviar Enlace
            }
          </button>
        </form>

        <!-- Botón Volver atrás -->
        <button class="btn-back" type="button" (click)="goBack()" id="back-login-link">
          <app-icon name="arrow-left" size="16" color="var(--primary)" />
          Volver atrás
        </button>
      </div>
    </div>
  `,
  styles: [`
    .forgot-page {
      min-height: 100dvh;
      background: var(--bg);
      display: flex;
      flex-direction: column;
      align-items: center;
      padding-bottom: 40px;
    }

    /* ---- Hero ---- */
    .forgot-hero {
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

    .forgot-blob {
      position: absolute;
      width: 280px;
      height: 280px;
      border-radius: 50%;
      background: rgba(255,255,255,0.05);
      top: -80px;
      right: -80px;
      pointer-events: none;
    }
    .forgot-blob::after {
      content: '';
      position: absolute;
      width: 200px;
      height: 200px;
      border-radius: 50%;
      background: rgba(255,255,255,0.04);
      bottom: -120px;
      left: -60px;
    }

    .forgot-icon-wrap {
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
      margin-bottom: 20px;
    }

    .forgot-icon-wrap app-icon {
      filter: brightness(0) invert(1);
    }

    @keyframes floatUp {
      0%, 100% { transform: translateY(0); }
      50%       { transform: translateY(-10px); }
    }

    .forgot-title {
      font-size: 1.75rem;
      font-weight: 800;
      color: #fff;
      margin: 0 0 8px;
      font-family: var(--font-heading);
      position: relative;
      z-index: 2;
    }

    .forgot-subtitle {
      font-size: 0.9rem;
      color: rgba(255,255,255,0.7);
      line-height: 1.6;
      margin: 0;
      text-align: center;
      position: relative;
      z-index: 2;
    }

    /* ---- Cuerpo ---- */
    .forgot-body {
      width: 100%;
      max-width: 420px;
      padding: 32px 20px 0;
      display: flex;
      flex-direction: column;
      gap: 24px;
      margin-top: -24px;
    }

    /* ---- Formulario ---- */
    .forgot-form {
      width: 100%;
      display: flex;
      flex-direction: column;
      gap: 20px;
    }

    .form-group {
      display: flex;
      flex-direction: column;
      gap: 6px;
    }

    .form-group label {
      font-size: 0.875rem;
      font-weight: 700;
      color: var(--text-primary);
      margin-left: 4px;
    }

    .form-group input {
      padding: 14px 18px;
      border: 2px solid var(--border);
      border-radius: 16px;
      font-size: 0.95rem;
      background: var(--surface);
      color: var(--text-primary);
      transition: all 0.2s ease;
      outline: none;
      font-family: inherit;
    }

    .form-group input:focus {
      border-color: var(--primary);
      box-shadow: 0 0 0 4px rgba(27,61,50,0.1);
      transform: translateY(-1px);
    }

    .form-group input.error {
      border-color: #dc2626;
    }

    .form-group input.error:focus {
      box-shadow: 0 0 0 4px rgba(220,38,38,0.1);
    }

    .field-error {
      display: flex;
      align-items: center;
      gap: 6px;
      font-size: 0.8rem;
      color: #dc2626;
      font-weight: 500;
      margin-top: 2px;
      animation: slideIn 0.3s ease;
    }

    /* ---- Mensajes ---- */
    .message {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 14px 18px;
      border-radius: 12px;
      font-size: 0.875rem;
      font-weight: 500;
      width: 100%;
      animation: slideIn 0.3s ease;
    }

    .message.error {
      background: #fef2f2;
      color: #dc2626;
      border: 1px solid #fecaca;
    }

    .spin {
      animation: spin 1s linear infinite;
    }

    @keyframes spin {
      to { transform: rotate(360deg); }
    }

    @keyframes slideIn {
      from {
        opacity: 0;
        transform: translateY(-6px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    /* ---- Botón principal ---- */
    .btn-forgot {
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
    }

    .btn-forgot:hover:not(:disabled) {
      background: #0d3323;
      transform: translateY(-2px);
      box-shadow: 0 8px 24px rgba(27,61,50,0.3);
    }

    .btn-forgot:disabled {
      opacity: 0.5;
      cursor: not-allowed;
      transform: none;
    }

    .btn-forgot:active:not(:disabled) {
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
      .forgot-hero {
        padding: 48px 20px 64px;
      }

      .forgot-icon-wrap {
        width: 76px;
        height: 76px;
        border-radius: 22px;
      }

      .forgot-title {
        font-size: 1.5rem;
      }

      .form-group input {
        padding: 12px 16px;
        font-size: 0.9rem;
      }
    }

    @media (max-width: 380px) {
      .forgot-icon-wrap {
        width: 64px;
        height: 64px;
        border-radius: 18px;
      }

      .forgot-title {
        font-size: 1.25rem;
      }
    }
  `],
})
export class ForgotPassword {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);
  private location = inject(Location);

  form = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
  });

  loading = signal(false);
  errorMessage = signal('');

  onSubmit(): void {
    if (this.form.valid) {
      this.loading.set(true);
      this.errorMessage.set('');
      this.authService.forgotPassword({ email: this.form.value.email! }).subscribe({
        next: () => {
          this.loading.set(false);
          this.router.navigate(['/auth/email-sent'], { queryParams: { email: this.form.value.email } });
        },
        error: (err) => {
          this.loading.set(false);
          this.errorMessage.set(err.error?.error || 'Ocurrió un error al enviar el correo. Por favor intenta de nuevo.');
        }
      });
    }
  }

  goBack(): void {
    this.location.back();
  }
}