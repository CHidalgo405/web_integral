import { Component, inject, signal, ViewChildren, QueryList, ElementRef, AfterViewInit } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { Location } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../../core/services/auth.service';
import { IconComponent } from '../../../shared/components/icon/icon';

@Component({
  selector: 'app-verify-otp',
  standalone: true,
  imports: [FormsModule, IconComponent, RouterLink],
  template: `
    <div class="verify-page" id="verify-otp-page">

      <!-- Hero superior con gradiente -->
      <div class="verify-hero">
        <div class="verify-blob"></div>
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

        <!-- Botón Volver atrás -->
        <button class="btn-back" type="button" (click)="goBack()" id="btn-back">
          <app-icon name="arrow-left" size="16" color="var(--primary)" />
          Volver atrás
        </button>
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
      padding: 64px 24px 80px;
      overflow: hidden;
    }

    .verify-blob {
      position: absolute;
      width: 280px;
      height: 280px;
      border-radius: 50%;
      background: rgba(255,255,255,0.05);
      top: -80px;
      right: -80px;
      pointer-events: none;
    }
    .verify-blob::after {
      content: '';
      position: absolute;
      width: 200px;
      height: 200px;
      border-radius: 50%;
      background: rgba(255,255,255,0.04);
      bottom: -120px;
      left: -60px;
    }

    .verify-icon-wrap {
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

    .verify-icon-wrap app-icon {
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

    .verify-title {
      font-size: 1.75rem;
      font-weight: 800;
      color: #fff;
      margin: 20px 0 8px;
      font-family: var(--font-heading);
      position: relative;
      z-index: 2;
      text-align: center;
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
      margin-top: -24px;
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
      .verify-hero {
        padding: 48px 20px 64px;
      }

      .verify-icon-wrap {
        width: 76px;
        height: 76px;
        border-radius: 22px;
      }

      .verify-icon-wrap app-icon {
        width: 38px;
        height: 38px;
      }

      .verify-title {
        font-size: 1.5rem;
        margin-top: 16px;
      }

      .verify-subtitle {
        font-size: 0.85rem;
      }

      .verify-body {
        padding: 28px 16px 0;
        margin-top: -24px;
      }

      .otp-input {
        width: 44px;
        height: 56px;
        font-size: 1.25rem;
      }

      .otp-container {
        gap: 8px;
      }

      .btn-verify {
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
      .verify-hero {
        padding: 40px 16px 56px;
      }

      .verify-icon-wrap {
        width: 64px;
        height: 64px;
        border-radius: 18px;
      }

      .verify-icon-wrap app-icon {
        width: 32px;
        height: 32px;
      }

      .verify-title {
        font-size: 1.25rem;
        margin-top: 12px;
      }

      .verify-subtitle {
        font-size: 0.8rem;
        margin-bottom: 12px;
      }

      .verify-body {
        padding: 24px 14px 0;
        margin-top: -20px;
        gap: 20px;
      }

      .otp-input {
        width: 38px;
        height: 48px;
        font-size: 1rem;
      }

      .otp-container {
        gap: 6px;
      }

      .btn-verify {
        padding: 12px;
        font-size: 0.85rem;
      }

      .btn-resend {
        padding: 10px;
        font-size: 0.8rem;
      }

      .btn-back {
        padding: 10px;
        font-size: 0.8rem;
      }

      .message {
        padding: 12px 14px;
        font-size: 0.8rem;
      }

      .email-badge {
        padding: 6px 12px;
      }

      .email-badge span {
        font-size: 0.75rem;
      }
    }
  `],
})
export class VerifyOtp implements AfterViewInit {
  @ViewChildren('otpInput') otpInputs!: QueryList<ElementRef<HTMLInputElement>>;

  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private location = inject(Location);
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

  goBack(): void {
    this.location.back();
  }
}