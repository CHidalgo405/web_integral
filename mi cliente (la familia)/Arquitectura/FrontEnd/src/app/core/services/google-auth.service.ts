import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';

interface GoogleCredentialResponse {
  credential: string;
}

interface GoogleButtonConfiguration {
  type: 'standard' | 'icon';
  theme: 'outline' | 'filled_blue' | 'filled_black';
  size: 'large' | 'medium' | 'small';
  text: 'signin_with' | 'signup_with' | 'continue_with' | 'signin';
  shape: 'rectangular' | 'pill' | 'circle' | 'square';
  logo_alignment: 'left' | 'center';
  width: number;
}

// SDK global que inyecta el script de Google Identity Services.
declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (config: {
            client_id: string;
            callback: (response: GoogleCredentialResponse) => void;
            auto_select?: boolean;
          }) => void;
          renderButton: (parent: HTMLElement, options: GoogleButtonConfiguration) => void;
        };
      };
    };
  }
}

@Injectable({ providedIn: 'root' })
export class GoogleAuthService {
  private sdkLoaded: Promise<void> | null = null;
  private initialized = false;
  private credentialHandler: ((credential: string) => void) | null = null;

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

  /** Renderiza el botón oficial y entrega al consumidor el ID token de Google. */
  async renderButton(
    container: HTMLElement,
    onCredential: (credential: string) => void,
    text: 'signin_with' | 'signup_with' = 'signin_with',
  ): Promise<void> {
    await this.loadSdk();
    const googleIdentity = window.google?.accounts?.id;
    if (!googleIdentity) {
      throw new Error('Google Sign-In no está disponible');
    }

    if (!this.initialized) {
      googleIdentity.initialize({
        client_id: environment.googleClientId,
        auto_select: false,
        callback: (response) => {
          if (response.credential) {
            this.credentialHandler?.(response.credential);
          }
        },
      });
      this.initialized = true;
    }

    this.credentialHandler = onCredential;
    container.replaceChildren();

    const availableWidth = Math.floor(container.getBoundingClientRect().width || 320);
    googleIdentity.renderButton(container, {
      type: 'standard',
      theme: 'outline',
      size: 'large',
      text,
      shape: 'pill',
      logo_alignment: 'left',
      width: Math.min(400, Math.max(1, availableWidth)),
    });
  }
}
