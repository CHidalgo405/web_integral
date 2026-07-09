import { ApplicationConfig, inject, provideBrowserGlobalErrorListeners, isDevMode } from '@angular/core';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideRouter, withNavigationErrorHandler } from '@angular/router';

import { routes } from './app.routes';
import { provideServiceWorker } from '@angular/service-worker';
import { AlertService } from './core/services/alert.service';
import { authInterceptor } from './core/interceptors/auth.interceptor';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideHttpClient(withInterceptors([authInterceptor])),
    provideRouter(
      routes,
      withNavigationErrorHandler((error) => {
        const alertService = inject(AlertService);
        const details = String(error.error?.message ?? error.error ?? '');
        const isChunkLoadFailure =
          details.includes('dynamically imported module') ||
          details.includes('Loading chunk') ||
          details.includes('Failed to fetch');

        alertService.show(
          'error',
          isChunkLoadFailure ? 'No se pudo abrir la pantalla' : 'Error de navegacion',
          isChunkLoadFailure
            ? 'El modulo de la pantalla no se pudo descargar. Revisa que el servidor siga corriendo y recarga la pagina.'
            : 'No se pudo completar la navegacion. Intenta de nuevo.',
          8000,
        );
      }),
    ),
    provideServiceWorker('ngsw-worker.js', {
      enabled: !isDevMode(),
      registrationStrategy: 'registerWhenStable:30000',
    }),
  ],
};


