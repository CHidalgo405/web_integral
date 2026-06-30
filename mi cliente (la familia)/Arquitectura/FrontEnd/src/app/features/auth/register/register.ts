import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { IconComponent } from '../../../shared/components/icon/icon';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink, IconComponent],
  template: `
    <div class="register-container">
      <div class="register-card">
        <div class="card-header">
          <h1>Regístrate</h1>
          <p>La Familia</p>
        </div>

        <form [formGroup]="form" (ngSubmit)="onSubmit()" class="register-form">
          
          <div class="form-row">
            <div class="input-group">
              <label>Nombre</label>
              <div class="input-wrapper">
                <span class="input-icon" style="display: flex; align-items: center;"><app-icon name="user" size="18" /></span>
                <input type="text" formControlName="firstName" placeholder="Tu nombre" />
              </div>
              @if (form.get('firstName')?.touched && form.get('firstName')?.hasError('required')) {
                <span class="error-msg">Requerido</span>
              }
            </div>
            
            <div class="input-group">
              <label>Apellido</label>
              <div class="input-wrapper">
                <span class="input-icon" style="display:none;"></span> <!-- spacer or omit -->
                <input type="text" formControlName="lastName" placeholder="Tu apellido" style="padding-left: 0;" />
              </div>
              @if (form.get('lastName')?.touched && form.get('lastName')?.hasError('required')) {
                <span class="error-msg">Requerido</span>
              }
            </div>
          </div>

          <div class="input-group">
            <label>Correo electrónico</label>
            <div class="input-wrapper">
              <span class="input-icon" style="display: flex; align-items: center;"><app-icon name="mail" size="18" /></span>
              <input type="email" formControlName="email" placeholder="tu@email.com" />
            </div>
            @if (form.get('email')?.touched && form.get('email')?.hasError('email')) {
              <span class="error-msg">Correo inválido</span>
            }
          </div>

          <div class="input-group">
            <label>Teléfono</label>
            <div class="input-wrapper">
              <span class="input-icon" style="display: flex; align-items: center;"><app-icon name="phone" size="18" /></span>
              <input type="tel" formControlName="phone" placeholder="+52 555 123 4567" />
            </div>
            @if (form.get('phone')?.touched && form.get('phone')?.hasError('required')) {
              <span class="error-msg">Requerido</span>
            }
          </div>

          <div class="input-group">
            <label>Contraseña</label>
            <div class="input-wrapper">
              <span class="input-icon" style="display: flex; align-items: center;"><app-icon name="lock" size="18" /></span>
              <input [type]="showPassword() ? 'text' : 'password'" formControlName="password" placeholder="••••••••" />
              <button type="button" class="input-icon-right" (click)="togglePasswordVisibility()" [attr.aria-label]="showPassword() ? 'Ocultar contrasena' : 'Mostrar contrasena'" style="display: flex; align-items: center;"><app-icon [name]="showPassword() ? 'eye-off' : 'eye'" size="18" /></button>
            </div>
            @if (form.get('password')?.touched && form.get('password')?.hasError('minlength')) {
              <span class="error-msg">Mínimo 6 caracteres</span>
            }
          </div>

          <div class="input-group">
            <label>Confirmar contraseña</label>
            <div class="input-wrapper">
              <span class="input-icon" style="display: flex; align-items: center;"><app-icon name="lock" size="18" /></span>
              <input type="password" formControlName="confirmPassword" placeholder="••••••••" />
            </div>
            @if (form.get('confirmPassword')?.touched && form.hasError('mismatch')) {
              <span class="error-msg">Las contraseñas no coinciden</span>
            }
          </div>

          <button type="submit" class="btn-main" [disabled]="form.invalid">
            Regístrate
          </button>

          <div class="divider">
            <span>O</span>
          </div>

          <button type="button" class="btn-google">
            <svg viewBox="0 0 24 24" width="20" height="20">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            <span>Google</span>
          </button>

          <div class="login-prompt">
            ¿Ya tienes una cuenta? <a routerLink="/auth/login">Inicia sesión</a>
          </div>

        </form>
      </div>
      
      <div class="brand-footer">
        <h2>La Familia</h2>
      </div>
    </div>
  `,
  styles: [`
    .register-container {
      min-height: 100dvh;
      background-color: var(--primary);
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 24px;
      position: relative;
    }
    
    .register-card {
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
      margin-bottom: 24px;
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

    .register-form {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }

    .form-row {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 12px;
    }

    .input-group {
      display: flex;
      flex-direction: column;
      gap: 6px;
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
      padding: 0 16px;
      height: 52px;
      border: 1.5px solid transparent;
      transition: border-color 0.2s;
    }

    .input-wrapper:focus-within {
      border-color: var(--primary);
      background-color: var(--surface);
    }

    .input-icon {
      font-size: 1.1rem;
      margin-right: 10px;
      color: var(--text-muted);
    }
    
    .input-icon-right {
      border: 0;
      background: transparent;
      padding: 0;
      font-size: 1.1rem;
      margin-left: 10px;
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
      font-size: 0.95rem;
      color: var(--text-primary);
      width: 100%;
    }

    .input-wrapper input::placeholder {
      color: var(--text-muted);
    }

    .error-msg {
      font-size: 0.7rem;
      color: var(--danger);
      margin-left: 16px;
    }

    .btn-main {
      width: 100%;
      height: 56px;
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

    .btn-google {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 12px;
      width: 100%;
      height: 56px;
      border-radius: 9999px;
      background-color: var(--surface-raised);
      color: var(--text-primary);
      font-size: 1rem;
      font-weight: 700;
      border: 1.5px solid transparent;
      cursor: pointer;
      transition: background-color 0.2s, border-color 0.2s;
    }

    .btn-google:hover {
      background-color: var(--surface);
      border-color: var(--border);
    }

    .login-prompt {
      text-align: center;
      font-size: 0.9rem;
      color: var(--text-secondary);
      margin-top: 12px;
      font-weight: 600;
    }

    .login-prompt a {
      color: var(--danger);
      text-decoration: none;
      font-weight: 800;
    }

    .brand-footer {
      margin-top: 24px;
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

    @media (min-width: 768px) {
      .register-card {
        padding: 48px;
      }
    }
  `]
})
export class Register {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);
  showPassword = signal(false);

  form = this.fb.group({
    firstName: ['', Validators.required],
    lastName: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    phone: ['', Validators.required],
    password: ['', [Validators.required, Validators.minLength(6)]],
    confirmPassword: ['', Validators.required],
  }, { validators: this.passwordMatchValidator });

  togglePasswordVisibility(): void {
    this.showPassword.update((value) => !value);
  }

  passwordMatchValidator(control: AbstractControl): ValidationErrors | null {
    const password = control.get('password')?.value;
    const confirm = control.get('confirmPassword')?.value;
    return password === confirm ? null : { mismatch: true };
  }

  onSubmit(): void {
    if (this.form.valid) {
      const v = this.form.value;
      this.authService.register({
        firstName: v.firstName!, lastName: v.lastName!, email: v.email!,
        phone: v.phone!, password: v.password!, confirmPassword: v.confirmPassword!,
      });
      this.router.navigate(['/auth/verify'], { queryParams: { email: v.email } });
    }
  }
}

