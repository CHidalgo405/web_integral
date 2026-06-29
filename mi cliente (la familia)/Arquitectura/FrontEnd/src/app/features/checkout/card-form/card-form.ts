import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Header } from '../../../shared/components/header/header';
import { CommonModule } from '@angular/common';
import { IconComponent } from '../../../shared/components/icon/icon';

@Component({
  selector: 'app-card-form',
  standalone: true,
  imports: [ReactiveFormsModule, Header, CommonModule, IconComponent],
  template: `
    <app-header title="Datos de Tarjeta" [showBack]="true"></app-header>
    
    <div class="checkout-page" id="card-form-page">
      
      <div class="card-list">
        <div class="card-item" [class.-active]="isCardFlipped()">
          
          <div class="card-item__side -front">
            <div class="card-item__focus" [class.-active]="focusElementStyle()" [ngStyle]="focusElementStyle()"></div>
            <div class="card-item__cover">
              <img [src]="'https://raw.githubusercontent.com/muhammederdem/credit-card-form/master/src/assets/images/' + currentBackground + '.jpeg'" class="card-item__bg" alt="Card Background">
            </div>
            <div class="card-item__wrapper">
              <div class="card-item__top">
                <img src="https://raw.githubusercontent.com/muhammederdem/credit-card-form/master/src/assets/images/chip.png" class="card-item__chip" alt="Chip">
                <div class="card-item__type">
                  <img [src]="'https://raw.githubusercontent.com/muhammederdem/credit-card-form/master/src/assets/images/' + getCardType() + '.png'" class="card-item__typeImg" alt="Card Type">
                </div>
              </div>
              
              <label class="card-item__number" #cardNumberRef>
                @for (char of getCardMaskArray(); track $index) {
                  <div class="card-item__numberItem" [class.-active]="char === ' '">
                    {{ getCardNumberChar(char, $index) }}
                  </div>
                }
              </label>
              
              <div class="card-item__content">
                <label class="card-item__info" #cardNameRef>
                  <div class="card-item__holder">Card Holder</div>
                  <div class="card-item__name">
                    {{ form.get('holderName')?.value || 'FULL NAME' }}
                  </div>
                </label>
                <div class="card-item__date" #cardDateRef>
                  <label class="card-item__dateTitle">Expires</label>
                  <label class="card-item__dateItem">
                    <span>{{ getExpiryMonth() }}</span>/<span>{{ getExpiryYear() }}</span>
                  </label>
                </div>
              </div>
            </div>
          </div>
          
          <div class="card-item__side -back">
            <div class="card-item__cover">
              <img [src]="'https://raw.githubusercontent.com/muhammederdem/credit-card-form/master/src/assets/images/' + currentBackground + '.jpeg'" class="card-item__bg" alt="Card Background">
            </div>
            <div class="card-item__band"></div>
            
            <div class="card-item__cvv">
              <div class="card-item__cvvTitle">CVV</div>
              <div class="card-item__cvvBand">
                @for (char of (form.get('cvv')?.value || ''); track $index) {
                  <span>*</span>
                }
              </div>
              <div class="card-item__type -back-logo">
                <img [src]="'https://raw.githubusercontent.com/muhammederdem/credit-card-form/master/src/assets/images/' + getCardType() + '.png'" class="card-item__typeImg" alt="Card Type">
              </div>
            </div>
          </div>
          
        </div>
      </div>

      <form [formGroup]="form" (ngSubmit)="onSubmit()" class="form-layout card-form__inner">
        <div class="form-group">
          <label for="cardNumber">Número de tarjeta</label>
          <input 
             id="cardNumber"
             formControlName="number" 
             placeholder="1234 5678 9012 3456" 
             maxlength="19" 
             [class.input-error]="form.get('number')?.invalid && form.get('number')?.touched"
             (input)="onNumberInput($event)" 
             (focus)="focusInput(cardNumberRef)" 
             (blur)="blurInput()" 
          />
          @if (form.get('number')?.invalid && form.get('number')?.touched) { <span class="error-text">Número inválido</span> }
        </div>
        
        <div class="form-group">
          <label for="cardHolder">Titular</label>
          <input 
             id="cardHolder"
             formControlName="holderName" 
             maxlength="30"
             placeholder="Nombre en la tarjeta" 
             [class.input-error]="form.get('holderName')?.invalid && form.get('holderName')?.touched"
             (focus)="focusInput(cardNameRef)" 
             (blur)="blurInput()" 
          />
          @if (form.get('holderName')?.invalid && form.get('holderName')?.touched) { <span class="error-text">El titular es requerido</span> }
        </div>
        
        <div class="form-row">
          <div class="form-group">
            <label for="cardExpiry">Vencimiento</label>
            <input 
               id="cardExpiry"
               formControlName="expiry" 
               placeholder="MM/AA" 
               maxlength="5" 
               [class.input-error]="form.get('expiry')?.invalid && form.get('expiry')?.touched"
               (input)="onExpiryInput($event)" 
               (focus)="focusInput(cardDateRef)" 
               (blur)="blurInput()" 
            />
            @if (form.get('expiry')?.invalid && form.get('expiry')?.touched) { <span class="error-text">Fecha inválida</span> }
          </div>
          <div class="form-group">
            <label for="cardCvv">CVV</label>
            <input 
               id="cardCvv"
               formControlName="cvv" 
               type="password" 
               placeholder="•••" 
               maxlength="4" 
               [class.input-error]="form.get('cvv')?.invalid && form.get('cvv')?.touched"
               (focus)="flipCard(true)" 
               (blur)="flipCard(false)" 
            />
            @if (form.get('cvv')?.invalid && form.get('cvv')?.touched) { <span class="error-text">CVV inválido</span> }
          </div>
        </div>

        @if (validating()) {
          <div class="validating-msg" style="display: flex; align-items: center; justify-content: center; gap: 8px;">
            <app-icon name="loader" size="18" className="app-icon-spin" />
            <span>Validando tarjeta...</span>
          </div>
        }
        
        <button type="submit" class="btn-continue" [disabled]="form.invalid || validating()" id="save-card-btn">
          Guardar y continuar
        </button>
      </form>
      
    </div>
  `,
  styleUrl: '../checkout-shared.css',
})
export class CardForm {
  private fb = inject(FormBuilder);
  private router = inject(Router);

  validating = signal(false);
  isCardFlipped = signal(false);
  focusElementStyle = signal<any>(null);
  currentBackground = Math.floor(Math.random() * 25 + 1);

  amexCardMask = "#### ###### #####";
  otherCardMask = "#### #### #### ####";

  form = this.fb.group({
    number: ['', [Validators.required, Validators.minLength(15)]],
    holderName: ['', Validators.required],
    expiry: ['', [Validators.required, Validators.pattern(/^\d{2}\/\d{2}$/)]],
    cvv: ['', [Validators.required, Validators.minLength(3)]],
  });

  getCardType(): string {
    const number = this.form.get('number')?.value || '';
    if (/^4/.test(number)) return 'visa';
    if (/^(34|37)/.test(number)) return 'amex';
    if (/^5[1-5]/.test(number)) return 'mastercard';
    if (/^6011/.test(number)) return 'discover';
    if (/^9792/.test(number)) return 'troy';
    return 'visa';
  }

  getCardMaskArray(): string[] {
    return this.getCardType() === 'amex' ? this.amexCardMask.split('') : this.otherCardMask.split('');
  }

  getCardNumberChar(maskChar: string, index: number): string {
    const rawNumber = this.form.get('number')?.value || '';
    if (maskChar === ' ') return ' ';

    const cleanNumber = rawNumber.replace(/\s/g, '');
    const maskUpToCurrent = this.getCardMaskArray().slice(0, index).join('').replace(/\s/g, '');
    const actualDigitsEntered = maskUpToCurrent.length;

    if (actualDigitsEntered >= cleanNumber.length) {
      return '#';
    }

    const isAmex = this.getCardType() === 'amex';
    const totalDigits = isAmex ? 15 : 16;

    if (actualDigitsEntered < 4 || actualDigitsEntered >= (totalDigits - 4)) {
      return cleanNumber[actualDigitsEntered];
    }

    return '*';
  }

  getExpiryMonth(): string {
    return (this.form.get('expiry')?.value || '').split('/')[0] || 'MM';
  }

  getExpiryYear(): string {
    return (this.form.get('expiry')?.value || '').split('/')[1] || 'YY';
  }

  onNumberInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    let value = input.value.replace(/\D/g, '');
    if (this.getCardType() === 'amex') {
      value = value.replace(/^(\d{4})(\d{0,6})(\d{0,5})/, (_, p1, p2, p3) => [p1, p2, p3].filter(Boolean).join(' '));
    } else {
      value = value.replace(/(\d{4})(?=\d)/g, '$1 ');
    }
    this.form.get('number')?.setValue(value, { emitEvent: false });
  }

  onExpiryInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    let value = input.value.replace(/\D/g, '');
    if (value.length > 2) value = value.substring(0, 2) + '/' + value.substring(2, 4);
    this.form.get('expiry')?.setValue(value, { emitEvent: false });
  }

  flipCard(status: boolean): void {
    this.isCardFlipped.set(status);
  }

  focusInput(target: HTMLElement): void {
    setTimeout(() => {
      this.focusElementStyle.set({
        width: `${target.offsetWidth}px`,
        height: `${target.offsetHeight}px`,
        transform: `translateX(${target.offsetLeft}px) translateY(${target.offsetTop}px)`,
        opacity: '1'
      });
    }, 50);
  }

  blurInput(): void {
    setTimeout(() => { this.focusElementStyle.set(null); }, 200);
  }

  onSubmit(): void {
    if (this.form.valid) {
      this.validating.set(true);
      setTimeout(() => {
        this.validating.set(false);
        this.router.navigate(['/checkout/summary']);
      }, 2000);
    }
  }
}