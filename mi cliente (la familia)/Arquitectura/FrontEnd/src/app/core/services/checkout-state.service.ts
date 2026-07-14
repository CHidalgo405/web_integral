import { Injectable, signal } from '@angular/core';
import { Address } from '../models/address.model';
import { PaymentMethod, ShippingMethod } from '../models/order.model';

@Injectable({ providedIn: 'root' })
export class CheckoutStateService {
  guestEmail = signal('');
  selectedAddress = signal<Address | undefined>(undefined);
  selectedShipping = signal<ShippingMethod | ''>('');
  shippingFee = signal(0);
  selectedPayment = signal<PaymentMethod | ''>('');
  discountCode = signal('');

  reset(): void {
    this.guestEmail.set('');
    this.selectedAddress.set(undefined);
    this.selectedShipping.set('');
    this.shippingFee.set(0);
    this.selectedPayment.set('');
    this.discountCode.set('');
  }

  getShippingLabel(method: ShippingMethod | ''): string {
    const map: Record<ShippingMethod, string> = {
      standard: 'Envío Estándar',
      express: 'Envío exprés',
      pickup: 'Recoger en tienda',
    };
    return method ? map[method] : '';
  }

  getShippingDetail(method: ShippingMethod | ''): string {
    const map: Record<ShippingMethod, string> = {
      standard: '3-5 días hábiles',
      express: '1-2 días hábiles',
      pickup: 'Disponible en 2 horas',
    };
    return method ? map[method] : '';
  }

  getShippingPrice(method: ShippingMethod | ''): string {
    if (!method) return '';
    return method === 'pickup' || this.shippingFee() === 0
      ? 'Gratis'
      : this.shippingFee().toLocaleString('es-MX', { style: 'currency', currency: 'MXN' });
  }

  getShippingIcon(method: ShippingMethod | ''): string {
    const map: Record<ShippingMethod, string> = {
      standard: 'package',
      express: 'bolt',
      pickup: 'store',
    };
    return method ? map[method] : 'package';
  }

  getPaymentLabel(method: PaymentMethod | ''): string {
    const map: Record<PaymentMethod, string> = {
      card: 'Tarjeta de crédito/débito',
      cash: 'Efectivo al recibir',
      transfer: 'Transferencia bancaria (SPEI)',
      paypal: 'PayPal',
    };
    return method ? map[method] : '';
  }

  getPaymentIcon(method: PaymentMethod | ''): string {
    const map: Record<PaymentMethod, string> = {
      card: 'credit-card',
      cash: 'dollar-sign',
      transfer: 'landmark',
      paypal: 'paypal',
    };
    return method ? map[method] : 'credit-card';
  }
}
