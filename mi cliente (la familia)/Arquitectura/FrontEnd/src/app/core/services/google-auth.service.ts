import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';

// SDK global que inyecta el script de Google Identity Services
declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (config: {
            client_id: string;
            callback: (response: { credential: string }) => void;
            auto_select?: boolean;
            cancel_on_tap_outside?: boolean;
          }) => void;
          prompt: (momentListener?: (notification: GoogleMoment) => void) => void;
        };
      };
    };
  }
}

interface GoogleMoment {
  isNotDisplayed: () => boolean;
  isSkippedMoment: () => boolean;
  isDismissedMoment: () => boolean;
}

@Injectable({ providedIn: 'root' })
export class GoogleAuthService {
  private sdkLoaded: Promise<void> | null = null;

  private loadSdk(): Promise<void> {
    if (this.sdkLoaded) return this.sdkLoaded;

    this.sdkLoaded = new Promise<void>((resolve, reject) => {
      if (window.google?.accounts?.id) {
        resolve();
        return;
      }
      const script = document.createElement('script');
      script.src = 'https://accounts.google.com/gsi/client';
      script.async = true;
      script.defer = true;
      script.onload = () => resolve();
      script.onerror = () => reject(new Error('No se pudo cargar Google Sign-In'));
      document.head.appendChild(script);
    });

    this.sdkLoaded.catch(() => (this.sdkLoaded = null));
    return this.sdkLoaded;
  }

  /** Abre el flujo de Google y devuelve el ID token verificable por el backend. */
  async signIn(): Promise<string> {
    await this.loadSdk();
    if (!window.google?.accounts?.id) {
      throw new Error('Google Sign-In no está disponible');
    }

    return new Promise<string>((resolve, reject) => {
      let settled = false;

      window.google!.accounts.id.initialize({
        client_id: environment.googleClientId,
        auto_select: false,
        cancel_on_tap_outside: true,
        callback: (response) => {
          settled = true;
          resolve(response.credential);
        },
      });

      window.google!.accounts.id.prompt((notification) => {
        if (settled) return;
        if (notification.isNotDisplayed?.() || notification.isSkippedMoment?.()) {
          reject(new Error('No se pudo abrir la ventana de Google. Verifica que los popups estén permitidos e intenta de nuevo.'));
        }
      });
    });
  }
}
