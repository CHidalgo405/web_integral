import { Component, inject, signal, ViewChildren, QueryList, ElementRef, AfterViewInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../../core/services/auth.service';
import { IconComponent } from '../../../shared/components/icon/icon';

@Component({
  selector: 'app-verify-otp',
  standalone: true,
  imports: [FormsModule, IconComponent],
  template: `
    <div class="verify-page" id="verify-otp-page">

      <!-- Hero superior con gradiente -->
      <div class="verify-hero">
        <div class="verify-blob"></div>
        <div class="verify-blob-2"></div>
        
        <div class="verify-icon-wrap">
          <app-icon name="hash" size="48" color="#fff" />
        </div>
        
        <h1 class="verify-title">Verificar Cuenta</h1>
        <p class="verify-subtitle">
          Ingresa el código de 6 dígitos<br>
          enviado a tu correo
        </p>
        <div class="email-badge">
          <app-icon name="mail" size="16" color="var(--primary)" />
          <span>{{ email }}</span>
        </div>
      </div>

      <!-- Cuerpo del formulario -->
      <div class="verify-body">
        <div class="otp-container" id="otp-container">
          @for (i of otpSlots; track i) {
            <input
              type="text"
              maxlength="1"
              class="otp-input"
              [id]="'otp-' + i"
              [value]="otpValues()[i]"
              (input)="onInput($event, i)"
              (keydown)="onKeyDown($event, i)"
              (paste)="onPaste($event)"
              inputmode="numeric"
              pattern="[0-9]"
              #otpInput
            />
          }
        </div>

        <!-- Mensajes -->
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

        <!-- Botones -->
        <div class="verify-actions">
          <button 
            class="btn-verify" 
            id="verify-submit" 
            (click)="verify()" 
            [disabled]="!isComplete()"
          >
            <app-icon name="check" size="18" color="#fff" />
            Verificar código
          </button>

          <button 
            class="btn-resend" 
            id="resend-otp-btn" 
            (click)="resend()" 
            [disabled]="resendCooldown() > 0"
          >
            <app-icon name="refresh-cw" size="16" color="var(--primary)" />
            {{ resendCooldown() > 0 ? 'Reenviar en ' + resendCooldown() + 's' : 'Reenviar código' }}
          </button>
        </div>

        <!-- Enlace para volver al login -->
        <a routerLink="/auth/login" class="back-link">
          <app-icon name="arrow-left" size="16" color="var(--text-secondary)" />
          Volver al inicio de sesión
        </a>
      </div>
    </div>
  `,
  styles: [`
    .verify-page {
      min-height: 100dvh;
      background: var(--bg);
      display: flex;
      flex-direction: column;
      align-items: center;
      padding-bottom: 40px;
    }

    /* ---- Hero ---- */
    .verify-hero {
      position: relative;
      width: 100%;
      background: linear-gradient(160deg, var(--primary) 0%, #0d3323 100%);
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 48px 24px 56px;
      overflow: hidden;
      border-bottom-left-radius: 32px;
      border-bottom-right-radius: 32px;
    }

    .verify-blob {
      position: absolute;
      width: 300px;
      height: 300px;
      border-radius: 50%;
      background: rgba(255,255,255,0.06);
      top: -120px;
      right: -100px;
      pointer-events: none;
    }

    .verify-blob-2 {
      position: absolute;
      width: 200px;
      height: 200px;
      border-radius: 50%;
      background: rgba(255,255,255,0.04);
      bottom: -80px;
      left: -60px;
      pointer-events: none;
    }

    .verify-icon-wrap {
      width: 80px;
      height: 80px;
      border-radius: 24px;
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

    .verify-icon-wrap app-icon {
      filter: brightness(0) invert(1);
    }

    @keyframes floatUp {
      0%, 100% { transform: translateY(0); }
      50%       { transform: translateY(-10px); }
    }

    .verify-title {
      font-size: 1.75rem;
      font-weight: 800;
      color: #fff;
      margin: 0 0 8px;
      font-family: var(--font-heading);
      position: relative;
      z-index: 2;
    }

    .verify-subtitle {
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
    .verify-body {
      width: 100%;
      max-width: 420px;
      padding: 32px 20px 0;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 24px;
      margin-top: -16px;
    }

    /* ---- OTP Inputs ---- */
    .otp-container {
      display: flex;
      gap: 10px;
      justify-content: center;
      width: 100%;
      padding: 4px;
    }

    .otp-input {
      width: 52px;
      height: 64px;
      border: 2px solid var(--border);
      border-radius: 16px;
      text-align: center;
      font-size: 1.5rem;
      font-weight: 700;
      font-family: var(--font-heading);
      background: var(--surface);
      color: var(--text-primary);
      transition: all 0.2s ease;
      outline: none;
      caret-color: var(--primary);
    }

    .otp-input:focus {
      border-color: var(--primary);
      box-shadow: 0 0 0 4px rgba(27,61,50,0.1);
      transform: translateY(-2px);
    }

    .otp-input:not(:placeholder-shown) {
      border-color: var(--primary);
      background: rgba(27,61,50,0.04);
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

    @keyframes slideIn {
      from {
        opacity: 0;
        transform: translateY(-10px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    /* ---- Botones ---- */
    .verify-actions {
      width: 100%;
      display: flex;
      flex-direction: column;
      gap: 10px;
    }

    .btn-verify {
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

    .btn-verify:hover:not(:disabled) {
      background: #0d3323;
      transform: translateY(-2px);
      box-shadow: 0 8px 24px rgba(27,61,50,0.3);
    }

    .btn-verify:disabled {
      opacity: 0.5;
      cursor: not-allowed;
      transform: none;
    }

    .btn-verify:active:not(:disabled) {
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

    .btn-resend:hover:not(:disabled) {
      background: rgba(27,61,50,0.05);
      border-color: var(--primary);
      transform: translateY(-1px);
    }

    .btn-resend:disabled {
      opacity: 0.5;
      cursor: not-allowed;
      transform: none;
    }

    /* ---- Back link ---- */
    .back-link {
      display: flex;
      align-items: center;
      gap: 8px;
      color: var(--text-secondary);
      text-decoration: none;
      font-size: 0.85rem;
      font-weight: 500;
      padding: 6px 12px;
      border-radius: 8px;
      transition: all 0.2s ease;
      margin-top: 4px;
    }

    .back-link:hover {
      color: var(--text-primary);
      background: rgba(0,0,0,0.04);
    }

    /* ---- Responsive ---- */
    @media (max-width: 480px) {
      .verify-hero {
        padding: 36px 20px 44px;
      }

      .verify-icon-wrap {
        width: 64px;
        height: 64px;
        border-radius: 18px;
      }

      .verify-title {
        font-size: 1.5rem;
      }

      .otp-input {
        width: 44px;
        height: 56px;
        font-size: 1.25rem;
      }

      .otp-container {
        gap: 8px;
      }
    }

    @media (max-width: 380px) {
      .otp-input {
        width: 38px;
        height: 48px;
        font-size: 1rem;
      }

      .otp-container {
        gap: 6px;
      }
    }
  `],
})
export class VerifyOtp implements AfterViewInit {
  @ViewChildren('otpInput') otpInputs!: QueryList<ElementRef<HTMLInputElement>>;

  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private authService = inject(AuthService);

  email = '';
  otpSlots = [0, 1, 2, 3, 4, 5];
  otpValues = signal<string[]>(['', '', '', '', '', '']);
  errorMessage = signal('');
  successMessage = signal('');
  resendCooldown = signal(0);

  isComplete = () => this.otpValues().every((v) => v !== '');

  ngOnInit(): void {
    this.route.queryParams.subscribe((p) => (this.email = p['email'] ?? ''));
  }

  ngAfterViewInit(): void {
    this.otpInputs.first?.nativeElement.focus();
  }

  onInput(event: Event, index: number): void {
    const input = event.target as HTMLInputElement;
    const value = input.value.replace(/[^0-9]/g, '');
    const values = [...this.otpValues()];
    values[index] = value;
    this.otpValues.set(values);
    input.value = value;

    if (value && index < 5) {
      this.otpInputs.get(index + 1)?.nativeElement.focus();
    }
  }

  onKeyDown(event: KeyboardEvent, index: number): void {
    if (event.key === 'Backspace' && !this.otpValues()[index] && index > 0) {
      this.otpInputs.get(index - 1)?.nativeElement.focus();
    }
  }

  onPaste(event: ClipboardEvent): void {
    event.preventDefault();
    const paste = event.clipboardData?.getData('text')?.replace(/[^0-9]/g, '').slice(0, 6) ?? '';
    const values = paste.split('');
    while (values.length < 6) values.push('');
    this.otpValues.set(values);
    this.otpInputs.forEach((ref, i) => (ref.nativeElement.value = values[i]));
    if (paste.length >= 6) this.otpInputs.last?.nativeElement.focus();
  }

  verify(): void {
    const code = this.otpValues().join('');
    const success = this.authService.verifyOtp({ email: this.email, code });
    if (success) {
      this.successMessage.set('¡Cuenta verificada exitosamente!');
      this.errorMessage.set('');
      setTimeout(() => this.router.navigate(['/auth/login']), 1500);
    } else {
      this.errorMessage.set('Código incorrecto. Intenta de nuevo.');
      this.successMessage.set('');
    }
  }

  resend(): void {
    this.resendCooldown.set(60);
    const interval = setInterval(() => {
      this.resendCooldown.update((v) => {
        if (v <= 1) { clearInterval(interval); return 0; }
        return v - 1;
      });
    }, 1000);
  }
}