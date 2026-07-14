import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { API_BASE_URL } from '../api.config';
import { CheckoutPayload } from './order.service';

// SDK global que inyecta el script de PayPal
declare global {
  interface Window {
    paypal?: {
      Buttons: (options: PayPalButtonsOptions) => { render: (el: HTMLElement | string) => Promise<void> };
    };
  }
}

interface PayPalButtonsOptions {
  style?: Record<string, string | number>;
  createOrder: () => Promise<string>;
  onApprove: (data: { orderID: string }) => Promise<void>;
  onError?: (err: unknown) => void;
  onCancel?: () => void;
}

interface PayPalConfig {
  clientId: string;
  currency: string;
}

interface CaptureResult {
  id: string;
  status: string;
  completed: boolean;
  payer_email: string | null;
}

@Injectable({ providedIn: 'root' })
export class PaypalService {
  private http = inject(HttpClient);
  private sdkLoaded: Promise<void> | null = null;

  /** Carga el SDK de PayPal una sola vez, con el client id que expone el backend. */
  loadSdk(): Promise<void> {
    if (this.sdkLoaded) return this.sdkLoaded;

    this.sdkLoaded = (async () => {
      const config = await firstValueFrom(this.http.get<PayPalConfig>(`${API_BASE_URL}/paypal/config`));
      if (window.paypal) return;

      await new Promise<void>((resolve, reject) => {
        const script = document.createElement('script');
        script.src = `https://www.paypal.com/sdk/js?client-id=${encodeURIComponent(config.clientId)}&currency=${config.currency}&intent=capture`;
        script.onload = () => resolve();
        script.onerror = () => reject(new Error('No se pudo cargar el SDK de PayPal'));
        document.head.appendChild(script);
      });
    })();

    // Si falla, permitir reintentar en el siguiente llamado
    this.sdkLoaded.catch(() => (this.sdkLoaded = null));
    return this.sdkLoaded;
  }

  createOrder(checkout: CheckoutPayload): Promise<{ id: string }> {
    return firstValueFrom(this.http.post<{ id: string }>(`${API_BASE_URL}/paypal/create-order`, checkout));
  }

  captureOrder(paypalOrderId: string): Promise<CaptureResult> {
    return firstValueFrom(this.http.post<CaptureResult>(`${API_BASE_URL}/paypal/capture-order`, { paypalOrderId }));
  }

  /**
   * Renderiza los botones de PayPal dentro del contenedor dado.
   * La cotización se vuelve a calcular en el servidor al momento del click.
   */
  async renderButtons(
    container: HTMLElement,
    createCheckout: () => CheckoutPayload,
    onPaid: (paypalOrderId: string) => Promise<void>,
    onFail: (message: string) => void,
  ): Promise<void> {
    await this.loadSdk();
    if (!window.paypal) throw new Error('SDK de PayPal no disponible');

    container.innerHTML = '';
    await window.paypal
      .Buttons({
        style: { layout: 'vertical', color: 'gold', shape: 'pill', label: 'paypal' },
        createOrder: async () => {
          const { id } = await this.createOrder(createCheckout());
          return id;
        },
        onApprove: async (data) => {
          try {
            const capture = await this.captureOrder(data.orderID);
            if (!capture.completed) {
              onFail('El pago no se completó en PayPal. Intenta de nuevo.');
              return;
            }
            await onPaid(data.orderID);
          } catch {
            onFail('Ocurrió un error al confirmar el pago con PayPal.');
          }
        },
        onError: () => onFail('PayPal reportó un error al procesar el pago.'),
        onCancel: () => onFail('Cancelaste el pago en PayPal.'),
      })
      .render(container);
  }
}
