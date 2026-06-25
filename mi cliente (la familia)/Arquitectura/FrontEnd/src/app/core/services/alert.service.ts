import { Injectable, signal } from '@angular/core';

export type AlertType = 'success' | 'warning' | 'info' | 'error';

export interface Alert {
  id: string;
  type: AlertType;
  title: string;
  message: string;
}

@Injectable({
  providedIn: 'root'
})
export class AlertService {
  alerts = signal<Alert[]>([]);

  show(type: AlertType, title: string, message: string, durationMs = 4000) {
    const id = Math.random().toString(36).substring(2, 9);
    const newAlert: Alert = { id, type, title, message };
    
    this.alerts.update(current => [...current, newAlert]);

    if (durationMs > 0) {
      setTimeout(() => this.remove(id), durationMs);
    }
  }

  remove(id: string) {
    this.alerts.update(current => current.filter(a => a.id !== id));
  }
}
