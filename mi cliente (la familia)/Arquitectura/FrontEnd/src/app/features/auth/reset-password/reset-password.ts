import { Component, inject, signal, OnInit } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { Location } from '@angular/common';
import { AuthService } from '../../../core/services/auth.service';
import { IconComponent } from '../../../shared/components/icon/icon';

export function passwordMatchValidator(control: AbstractControl): ValidationErrors | null {
  const password = control.get('password')?.value;
  const confirmPassword = control.get('confirmPassword')?.value;
  if (password && confirmPassword && password !== confirmPassword) {
    control.get('confirmPassword')?.setErrors({ passwordMismatch: true });
    return { passwordMismatch: true };
  }
  return null;
}

@Component({
  selector: 'app-reset-password',
  standalone: true,
  imports: [ReactiveFormsModule, IconComponent, RouterLink],
  template: `
    <div class="reset-page" id="reset-password-page">

      <!-- Hero superior con gradiente -->
      <div class="reset-hero">
        <div class="reset-blob"></div>
        <div class="reset-icon-wrap">
          <app-icon name="key" size="48" color="#fff" />
        </div>
        
        <h1 class="reset-title">Nueva Contraseña</h1>
        <p class="reset-subtitle">
          Elige una contraseña segura para tu cuenta
        </p>
      </div>

      <!-- Cuerpo del formulario -->
      <div class="reset-body">
        @if (errorMessage()) {
          <div class="message error">
            <app-icon name="alert-circle" size="18" />
            {{ errorMessage() }}
          </div>
        }
        @if (successMessage()) {
          <div class="message success">
            <app-icon name="check-circle" size="18" />
            {{ successMessage() }}
          </div>
        }

        @if (!successMessage()) {
          <form [formGroup]="form" (ngSubmit)="onSubmit()" class="reset-form">
            <!-- Correo informativo (read-only) -->
            <div class="email-badge-static">
              <app-icon name="mail" size="16" color="var(--primary)" />
              <span>{{ email }}</span>
            </div>

            <!-- Input: Contraseña -->
            <div class="form-group">
              <label for="reset-password">Nueva Contraseña</label>
              <div class="input-wrapper">
                <input 
                  [type]="showPassword() ? 'text' : 'password'" 
                  id="reset-password" 
                  formControlName="password" 
                  placeholder="Mínimo 8 caracteres"
                  [class.error]="form.get('password')?.touched && form.get('password')?.invalid"
                />
                <button type="button" class="eye-btn" (click)="togglePassword()">
                  <app-icon [name]="showPassword() ? 'eye-off' : 'eye'" size="18" color="var(--text-secondary)" />
                </button>
              </div>
              @if (form.get('password')?.touched && form.get('password')?.hasError('required')) {
                <span class="field-error">
                  <app-icon name="alert-circle" size="16" />
                  La contraseña es requerida
                </span>
              }
              @if (form.get('password')?.touched && form.get('password')?.hasError('minlength')) {
                <span class="field-error">
                  <app-icon name="alert-circle" size="16" />
                  Mínimo 8 caracteres
                </span>
              }
            </div>

            <!-- Input: Confirmar Contraseña -->
            <div class="form-group">
              <label for="reset-confirm-password">Confirmar Contraseña</label>
              <input 
                type="password" 
                id="reset-confirm-password" 
                formControlName="confirmPassword" 
                placeholder="Repite la contraseña"
                [class.error]="form.get('confirmPassword')?.touched && form.get('confirmPassword')?.invalid"
              />
              @if (form.get('confirmPassword')?.touched && form.get('confirmPassword')?.hasError('required')) {
                <span class="field-error">
                  <app-icon name="alert-circle" size="16" />
                  Confirma tu contraseña
                </span>
              }
              @if (form.get('confirmPassword')?.touched && form.get('confirmPassword')?.hasError('passwordMismatch')) {
                <span class="field-error">
                  <app-icon name="alert-circle" size="16" />
                  Las contraseñas no coinciden
                </span>
              }
            </div>

            <button 
              type="submit" 
              class="btn-reset" 
              id="reset-submit" 
              [disabled]="form.invalid || loading()"
            >
              @if (loading()) {
                <app-icon name="loader" class="spin" size="18" color="#fff" />
                Guardando...
              } @else {
                <app-icon name="save" size="18" color="#fff" />
                Restablecer Contraseña
              }
            </button>
          </form>
        } @else {
          <!-- Enlace alternativo si ya tuvo éxito -->
          <a routerLink="/auth/login" class="btn-login-redirect">
            <app-icon name="log-in" size="18" color="#fff" />
            Ir al Login
          </a>
        }

        <!-- Botón Volver al Login -->
        <button class="btn-back" type="button" (click)="goBack()" id="back-login-link">
          <app-icon name="arrow-left" size="16" color="var(--primary)" />
          Volver atrás
        </button>
      </div>
    </div>
  `,
  styles: [`
    .reset-page {
      min-height: 100dvh;
      background: var(--bg);
      display: flex;
      flex-direction: column;
      align-items: center;
      padding-bottom: 40px;
    }

    /* ---- Hero ---- */
    .reset-hero {
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

    .reset-blob {
      position: absolute;
      width: 280px;
      height: 280px;
      border-radius: 50%;
      background: rgba(255,255,255,0.05);
      top: -80px;
      right: -80px;
      pointer-events: none;
    }
    .reset-blob::after {
      content: '';
      position: absolute;
      width: 200px;
      height: 200px;
      border-radius: 50%;
      background: rgba(255,255,255,0.04);
      bottom: -120px;
      left: -60px;
    }

    .reset-icon-wrap {
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

    .reset-icon-wrap app-icon {
      filter: brightness(0) invert(1);
    }

    @keyframes floatUp {
      0%, 100% { transform: translateY(0); }
      50%       { transform: translateY(-10px); }
    }

    .reset-title {
      font-size: 1.75rem;
      font-weight: 800;
      color: #fff;
      margin: 0 0 8px;
      font-family: var(--font-heading);
      position: relative;
      z-index: 2;
    }

    .reset-subtitle {
      font-size: 0.9rem;
      color: rgba(255,255,255,0.7);
      line-height: 1.6;
      margin: 0;
      text-align: center;
      position: relative;
      z-index: 2;
    }

    /* ---- Cuerpo ---- */
    .reset-body {
      width: 100%;
      max-width: 420px;
      padding: 32px 20px 0;
      display: flex;
      flex-direction: column;
      gap: 24px;
      margin-top: -24px;
    }

    /* ---- Formulario ---- */
    .reset-form {
      width: 100%;
      display: flex;
      flex-direction: column;
      gap: 20px;
    }

    .email-badge-static {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      background: var(--surface-raised);
      border: 1px solid var(--border);
      border-radius: 12px;
      padding: 10px 14px;
      width: 100%;
    }

    .email-badge-static span {
      font-size: 0.9rem;
      font-weight: 600;
      color: var(--text-primary);
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

    .input-wrapper {
      position: relative;
      display: flex;
      align-items: center;
    }

    .input-wrapper input, .form-group input {
      padding: 14px 18px;
      border: 2px solid var(--border);
      border-radius: 16px;
      font-size: 0.95rem;
      background: var(--surface);
      color: var(--text-primary);
      transition: all 0.2s ease;
      outline: none;
      font-family: inherit;
      width: 100%;
    }

    .input-wrapper input {
      padding-right: 48px;
    }

    .input-wrapper input:focus, .form-group input:focus {
      border-color: var(--primary);
      box-shadow: 0 0 0 4px rgba(27,61,50,0.1);
      transform: translateY(-1px);
    }

    .form-group input.error {
      border-color: #dc2626;
    }

    .eye-btn {
      position: absolute;
      right: 14px;
      background: none;
      border: none;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 6px;
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

    .message.success {
      background: #f0fdf4;
      color: #16a34a;
      border: 1px solid #bbf7d0;
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

    /* ---- Botones ---- */
    .btn-reset, .btn-login-redirect {
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

    .btn-reset:hover:not(:disabled), .btn-login-redirect:hover {
      background: #0d3323;
      transform: translateY(-2px);
      box-shadow: 0 8px 24px rgba(27,61,50,0.3);
    }

    .btn-reset:disabled {
      opacity: 0.5;
      cursor: not-allowed;
      transform: none;
    }

    .btn-reset:active:not(:disabled), .btn-login-redirect:active {
      transform: scale(0.97);
    }

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
      .reset-hero {
        padding: 48px 20px 64px;
      }

      .reset-icon-wrap {
        width: 76px;
        height: 76px;
        border-radius: 22px;
      }

      .reset-title {
        font-size: 1.5rem;
      }

      .form-group input, .input-wrapper input {
        padding: 12px 16px;
        font-size: 0.9rem;
      }
    }
  `],
})
export class ResetPassword implements OnInit {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private location = inject(Location);

  email = '';
  token = '';
  showPassword = signal(false);
  loading = signal(false);
  errorMessage = signal('');
  successMessage = signal('');

  form = this.fb.group({
    password: ['', [Validators.required, Validators.minLength(8)]],
    confirmPassword: ['', [Validators.required]],
  }, { validators: passwordMatchValidator });

  ngOnInit(): void {
    this.route.queryParams.subscribe((p) => {
      this.email = p['email'] ?? '';
      this.token = p['token'] ?? '';
    });
  }

  togglePassword(): void {
    this.showPassword.update(v => !v);
  }

  onSubmit(): void {
    if (this.form.valid && this.email && this.token) {
      this.loading.set(true);
      this.errorMessage.set('');
      this.successMessage.set('');

      const password = this.form.value.password!;

      this.authService.resetPassword({
        email: this.email,
        token: this.token,
        password
      }).subscribe({
        next: () => {
          this.loading.set(false);
          this.successMessage.set('¡Tu contraseña ha sido restablecida exitosamente!');
          setTimeout(() => {
            this.router.navigate(['/auth/login']);
          }, 2000);
        },
        error: (err) => {
          this.loading.set(false);
          this.errorMessage.set(
            err.error?.error || 'Token inválido o expirado. Por favor solicita un nuevo correo de recuperación.'
          );
        }
      });
    } else if (!this.email || !this.token) {
      this.errorMessage.set('El enlace de recuperación es inválido o está incompleto.');
    }
  }

  goBack(): void {
    this.location.back();
  }
}
