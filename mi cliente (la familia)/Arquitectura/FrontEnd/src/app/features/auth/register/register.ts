import { AfterViewInit, Component, ElementRef, inject, NgZone, signal, ViewChild } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { GoogleAuthService } from '../../../core/services/google-auth.service';
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
              <input type="tel" formControlName="phone" placeholder="5551234567" maxlength="15" (input)="onPhoneInput($event)" />
            </div>
            @if (form.get('phone')?.touched && form.get('phone')?.hasError('required')) {
              <span class="error-msg">Requerido</span>
            }
            @if (form.get('phone')?.touched && form.get('phone')?.hasError('pattern')) {
              <span class="error-msg">Debe tener entre 8 y 15 números</span>
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

          @if (errorMessage) {
            <div class="auth-error">{{ errorMessage }}</div>
          }

          <button type="submit" class="btn-main" [disabled]="form.invalid || isLoading()">
            {{ isLoading() ? 'Registrando...' : 'Regístrate' }}
          </button>

          <div class="divider">
            <span>O</span>
          </div>

          <div
            #googleButton
            class="google-button-host"
            [class.google-button-disabled]="isLoading()"
            aria-label="Registrarse con Google"
          ></div>

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
      .register-card {
        padding: 48px;
      }
    }
  `]
})
export class Register implements AfterViewInit {
  @ViewChild('googleButton', { static: true })
  private googleButton!: ElementRef<HTMLElement>;

  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private googleAuthService = inject(GoogleAuthService);
  private router = inject(Router);
  private zone = inject(NgZone);
  showPassword = signal(false);

  form = this.fb.group({
    firstName: ['', Validators.required],
    lastName: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    phone: ['', [Validators.required, Validators.pattern('^[0-9]{8,15}$')]],
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

  errorMessage = '';
  isLoading = signal(false);

  ngAfterViewInit(): void {
    this.googleAuthService.renderButton(
      this.googleButton.nativeElement,
      (idToken) => this.zone.run(() => this.registerWithGoogleCredential(idToken)),
      'signup_with',
    ).catch(() => {
      this.zone.run(() => {
        this.errorMessage = 'No se pudo cargar el botón de Google. También puedes registrarte con correo.';
      });
    });
  }

  onPhoneInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    const sanitized = input.value.replace(/[^0-9]/g, '');
    this.form.patchValue({ phone: sanitized }, { emitEvent: false });
    input.value = sanitized;
  }

  onSubmit(): void {
    if (this.form.valid) {
      this.isLoading.set(true);
      this.errorMessage = '';
      const v = this.form.value;
      this.authService.register({
        firstName: v.firstName!, lastName: v.lastName!, email: v.email!,
        phone: v.phone!, password: v.password!, confirmPassword: v.confirmPassword!,
      }).subscribe({
        next: (res) => {
          this.isLoading.set(false);
          // Ya no hay auto-login: se manda a verificar el código OTP
          this.router.navigate(['/auth/verify-otp'], { queryParams: { email: res.email } });
        },
        error: (err) => {
          this.isLoading.set(false);
          this.errorMessage = err.error?.error || 'Error al registrar usuario';
        }
      });
    }
  }

  private registerWithGoogleCredential(idToken: string): void {
    if (this.isLoading()) return;
    this.errorMessage = '';
    this.isLoading.set(true);

    this.authService.loginWithGoogle(idToken).subscribe({
      next: () => {
        this.isLoading.set(false);
        this.router.navigateByUrl(this.authService.landingRoute());
      },
      error: (err) => {
        this.isLoading.set(false);
        this.errorMessage = err.error?.error || 'No se pudo registrar con Google';
      },
    });
  }
}
