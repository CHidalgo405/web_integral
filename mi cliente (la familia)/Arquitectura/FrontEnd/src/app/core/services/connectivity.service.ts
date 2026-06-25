import { Injectable, signal, computed, OnDestroy } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class ConnectivityService implements OnDestroy {
  private online = signal<boolean>(navigator.onLine);
  readonly isOnline = computed(() => this.online());

  private onlineHandler = () => this.online.set(true);
  private offlineHandler = () => this.online.set(false);

  constructor() {
    window.addEventListener('online', this.onlineHandler);
    window.addEventListener('offline', this.offlineHandler);
  }

  ngOnDestroy(): void {
    window.removeEventListener('online', this.onlineHandler);
    window.removeEventListener('offline', this.offlineHandler);
  }
}
