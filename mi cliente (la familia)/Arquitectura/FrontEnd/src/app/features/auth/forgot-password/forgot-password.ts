import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { IconComponent } from '../../../shared/components/icon/icon';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink, IconComponent],
  template: `
    <div class="auth-page" id="forgot-password-page">
      <div class="auth-header">
        <div class="auth-logo" style="color: var(--primary);"><app-icon name="lock" size="48" /></div>
        <h1>Recuperar Contraseña</h1>
        <p>Ingresa tu correo y te enviaremos un enlace de recuperación</p>
      </div>

      <form [formGroup]="form" (ngSubmit)="onSubmit()" class="auth-form">
        <div class="form-group">
          <label for="forgot-email">Correo electrónico</label>
          <input type="email" id="forgot-email" formControlName="email" placeholder="tu@email.com" />
          @if (form.get('email')?.touched && form.get('email')?.hasError('required')) {
            <span class="error">El correo es requerido</span>
          }
        </div>

        <button type="submit" class="btn btn-primary" id="forgot-submit" [disabled]="form.invalid">
          Enviar Enlace
        </button>
      </form>

      <p class="auth-footer">
        <a routerLink="/auth/login" id="back-login-link">← Volver al inicio de sesión</a>
      </p>
    </div>
  `,
  styleUrl: '../auth-shared.css',
})
export class ForgotPassword {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);

  form = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
  });

  onSubmit(): void {
    if (this.form.valid) {
      this.authService.forgotPassword({ email: this.form.value.email! });
      this.router.navigate(['/auth/email-sent'], { queryParams: { email: this.form.value.email } });
    }
  }
}
