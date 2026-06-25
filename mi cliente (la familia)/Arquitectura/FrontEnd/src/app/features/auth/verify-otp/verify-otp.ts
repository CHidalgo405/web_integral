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
    <div class="auth-page" id="verify-otp-page">
      <div class="auth-header">
        <div class="auth-logo" style="color: var(--primary);"><app-icon name="hash" size="48" /></div>
        <h1>Verificar Cuenta</h1>
        <p>Ingresa el código de 6 dígitos enviado a:</p>
        <p class="email-display">{{ email }}</p>
      </div>

      <div class="auth-form">
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

        @if (errorMessage()) {
          <div class="auth-error">{{ errorMessage() }}</div>
        }
        @if (successMessage()) {
          <div class="auth-success">{{ successMessage() }}</div>
        }

        <button class="btn btn-primary" id="verify-submit" (click)="verify()" [disabled]="!isComplete()">
          Verificar
        </button>

        <button class="btn btn-secondary" id="resend-otp-btn" (click)="resend()" [disabled]="resendCooldown() > 0">
          {{ resendCooldown() > 0 ? 'Reenviar en ' + resendCooldown() + 's' : 'Reenviar código' }}
        </button>
      </div>
    </div>
  `,
  styleUrl: '../auth-shared.css',
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
