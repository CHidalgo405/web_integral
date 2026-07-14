import { AfterViewInit, Component, ElementRef, inject, NgZone, signal, ViewChild } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { GoogleAuthService } from '../../../core/services/google-auth.service';
import { IconComponent } from '../../../shared/components/icon/icon';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink, IconComponent],
  template: `
    <div class="login-container">
      <div class="login-card">
        <div class="card-header">
          <h1>Iniciar Sesión</h1>
          <p>La Familia</p>
        </div>

        <form [formGroup]="form" (ngSubmit)="onSubmit()" class="login-form">
          
          <div class="input-group">
            <label>Correo electrónico</label>
            <div class="input-wrapper">
              <span class="input-icon" style="display: flex; align-items: center;"><app-icon name="mail" size="20" /></span>
              <input type="email" formControlName="email" placeholder="tu@email.com" />
            </div>
            @if (form.get('email')?.touched && form.get('email')?.hasError('required')) {
              <span class="error-msg">El correo es requerido</span>
            }
            @if (form.get('email')?.touched && form.get('email')?.hasError('email')) {
              <span class="error-msg">Correo inválido</span>
            }
          </div>

          <div class="input-group">
            <label>Contraseña</label>
            <div class="input-wrapper">
              <span class="input-icon" style="display: flex; align-items: center;"><app-icon name="lock" size="20" /></span>
              <input [type]="showPassword() ? 'text' : 'password'" formControlName="password" placeholder="••••••••" />
              <button type="button" class="input-icon-right" (click)="togglePasswordVisibility()" [attr.aria-label]="showPassword() ? 'Ocultar contrasena' : 'Mostrar contrasena'" style="display: flex; align-items: center;"><app-icon [name]="showPassword() ? 'eye-off' : 'eye'" size="20" /></button>
            </div>
            @if (form.get('password')?.touched && form.get('password')?.hasError('required')) {
              <span class="error-msg">La contraseña es requerida</span>
            }
          </div>

          <div class="form-options">
            <label class="remember-me">
              <input type="checkbox" formControlName="rememberMe" />
              <span>Recuérdame</span>
            </label>
            <a routerLink="/auth/forgot-password" class="forgot-link">¿Olvidaste tu contraseña?</a>
          </div>

          @if (errorMessage) {
            <div class="auth-error">{{ errorMessage }}</div>
          }

          <button type="submit" class="btn-main" [disabled]="form.invalid || isLoading()">
            {{ isLoading() ? 'Iniciando...' : 'Iniciar Sesión' }}
          </button>

          <div class="divider">
            <span>O</span>
          </div>

          <div
            #googleButton
            class="google-button-host"
            [class.google-button-disabled]="isLoading()"
            aria-label="Iniciar sesión con Google"
          ></div>

          <div class="register-prompt">
            ¿No tienes una cuenta? <a routerLink="/auth/register">Regístrate</a>
          </div>

        </form>
      </div>
      
      <div class="brand-footer">
        <h2>La Familia</h2>
      </div>
    </div>
  `,
  styles: [`
    .login-container {
      min-height: 100dvh;
      background-color: var(--primary);
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 24px;
      position: relative;
    }
    
    .login-card {
      background-color: var(--surface);
      width: 100%;
      max-width: 440px;
      border-radius: 40px;
      padding: 40px 24px;
      box-shadow: 0 16px 40px rgba(0,0,0,0.25);
      position: relative;
      z-index: 2;
    }

    .card-header {
      text-align: center;
      margin-bottom: 32px;
    }

    .card-header h1 {
      font-family: var(--font-heading);
      font-size: 2.2rem;
      font-weight: 800;
      color: var(--text-primary);
      margin: 0 0 8px;
    }

    .card-header p {
      font-size: 1.1rem;
      color: var(--text-secondary);
      margin: 0;
      font-weight: 600;
    }

    .login-form {
      display: flex;
      flex-direction: column;
      gap: 20px;
    }

    .input-group {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .input-group label {
      font-size: 0.85rem;
      font-weight: 700;
      color: var(--text-primary);
      margin-left: 8px;
    }

    .input-wrapper {
      display: flex;
      align-items: center;
      background-color: var(--surface-raised);
      border-radius: 9999px;
      padding: 0 20px;
      height: 56px;
      border: 1.5px solid transparent;
      transition: border-color 0.2s;
    }

    .input-wrapper:focus-within {
      border-color: var(--primary);
      background-color: var(--surface);
    }

    .input-icon {
      font-size: 1.2rem;
      margin-right: 12px;
      color: var(--text-muted);
    }
    
    .input-icon-right {
      border: 0;
      background: transparent;
      padding: 0;
      font-size: 1.2rem;
      margin-left: 12px;
      color: var(--text-muted);
      cursor: pointer;
      opacity: 0.6;
    }

    .input-icon-right:hover {
      opacity: 1;
    }

    .input-wrapper input {
      flex: 1;
      border: none;
      background: transparent;
      outline: none;
      font-size: 1rem;
      color: var(--text-primary);
      width: 100%;
    }

    .input-wrapper input::placeholder {
      color: var(--text-muted);
    }

    .error-msg {
      font-size: 0.75rem;
      color: var(--danger);
      margin-left: 16px;
    }

    .form-options {
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: 0.85rem;
      margin-top: -4px;
      padding: 0 4px;
    }

    .remember-me {
      display: flex;
      align-items: center;
      gap: 8px;
      color: var(--text-primary);
      font-weight: 600;
      cursor: pointer;
    }
    
    .remember-me input {
      accent-color: var(--primary);
      width: 16px;
      height: 16px;
      cursor: pointer;
    }

    .forgot-link {
      color: var(--danger);
      text-decoration: none;
      font-weight: 600;
    }

    .btn-main {
      width: 100%;
      height: 60px;
      border-radius: 9999px;
      background-color: var(--secondary);
      color: #fff;
      font-size: 1.1rem;
      font-weight: 800;
      border: none;
      cursor: pointer;
      margin-top: 8px;
      transition: transform 0.2s, background-color 0.2s;
    }

    .btn-main:hover:not(:disabled) {
      transform: translateY(-2px);
      background-color: var(--secondary-dark);
    }

    .btn-main:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }

    .divider {
      display: flex;
      align-items: center;
      text-align: center;
      color: var(--text-muted);
      font-size: 0.85rem;
      font-weight: 700;
      margin: 4px 0;
    }

    .divider::before, .divider::after {
      content: '';
      flex: 1;
      border-bottom: 1px solid var(--border);
    }

    .divider span {
      padding: 0 16px;
    }

    .google-button-host {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 100%;
      min-height: 44px;
      transition: opacity 0.2s;
    }

    .google-button-disabled {
      opacity: 0.6;
      pointer-events: none;
    }

    .register-prompt {
      text-align: center;
      font-size: 0.95rem;
      color: var(--text-secondary);
      margin-top: 16px;
      font-weight: 600;
    }

    .register-prompt a {
      color: var(--danger);
      text-decoration: none;
      font-weight: 800;
    }

    .brand-footer {
      margin-top: 32px;
      text-align: center;
      color: rgba(255, 255, 255, 0.8);
    }

    .brand-footer h2 {
      font-family: var(--font-heading);
      font-size: 1.8rem;
      margin: 0;
      font-weight: 800;
      letter-spacing: 0.5px;
    }

    .auth-error {
      padding: 12px;
      background: var(--danger-alpha);
      color: var(--danger);
      border-radius: 12px;
      font-size: 0.85rem;
      text-align: center;
      font-weight: 600;
    }

    @media (min-width: 768px) {
      .login-card {
        padding: 56px 48px;
      }
    }
  `]
})
export class Login implements AfterViewInit {
  @ViewChild('googleButton', { static: true })
  private googleButton!: ElementRef<HTMLElement>;

  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private googleAuthService = inject(GoogleAuthService);
  private router = inject(Router);
  private zone = inject(NgZone);

  errorMessage = '';
  showPassword = signal(false);

  togglePasswordVisibility(): void {
    this.showPassword.update((value) => !value);
  }

  form = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required]],
    rememberMe: [false]
  });

  isLoading = signal(false);

  ngAfterViewInit(): void {
    this.googleAuthService.renderButton(
      this.googleButton.nativeElement,
      (idToken) => this.zone.run(() => this.loginWithGoogleCredential(idToken)),
      'signin_with',
    ).catch(() => {
      this.zone.run(() => {
        this.errorMessage = 'No se pudo cargar el botón de Google. También puedes iniciar sesión con correo.';
      });
    });
  }

  onSubmit(): void {
    if (this.form.valid) {
      this.isLoading.set(true);
      this.errorMessage = '';
      const { email, password, rememberMe } = this.form.value;
      
      this.authService.login({ email: email!, password: password!, remember_me: rememberMe! }).subscribe({
        next: () => {
          this.isLoading.set(false);
          this.router.navigateByUrl(this.authService.landingRoute());
        },
        error: (err) => {
          this.isLoading.set(false);
          this.errorMessage = err.error?.error || 'Credenciales incorrectas';
        }
      });
    }
  }

  private loginWithGoogleCredential(idToken: string): void {
    if (this.isLoading()) return;
    this.errorMessage = '';
    this.isLoading.set(true);

    const rememberMe = !!this.form.value.rememberMe;
    this.authService.loginWithGoogle(idToken, rememberMe).subscribe({
      next: () => {
        this.isLoading.set(false);
        this.router.navigateByUrl(this.authService.landingRoute());
      },
      error: (err) => {
        this.isLoading.set(false);
        this.errorMessage = err.error?.error || 'No se pudo iniciar sesión con Google';
      },
    });
  }
}
