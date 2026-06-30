import { HttpClient } from '@angular/common/http';
import { Component, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { API_BASE_URL } from '../../../core/api.config';
import { Header } from '../../../shared/components/header/header';
import { IconComponent } from '../../../shared/components/icon/icon';

interface Notification {
  id: string;
  type: string;
  reference_id?: string | null;
  message: string;
  seen: boolean;
  created_at: string;
}

interface NotificationView {
  id: string;
  icon: string;
  iconColor: string;
  title: string;
  body: string;
  time: string;
  read: boolean;
}

@Component({
  selector: 'app-notifications',
  standalone: true,
  imports: [RouterLink, Header, IconComponent],
  template: `
    <app-header title="Notificaciones" [showBack]="true"></app-header>

    <div class="notif-page" id="notifications-page">
      @if (loadError()) {
        <div class="notif-empty">
          <div class="empty-icon-wrap">
            <app-icon name="alert-triangle" size="40" color="var(--danger)" />
          </div>
          <h3>No se pudieron cargar</h3>
          <p>{{ loadError() }}</p>
          <button type="button" class="btn-go-home" (click)="loadNotifications()">Reintentar</button>
        </div>
      } @else if (notifications().length > 0) {
        <div class="notif-toolbar">
          <span class="notif-count">{{ unreadCount() }} sin leer</span>
          <button class="mark-all-btn" (click)="markAllRead()" [disabled]="unreadCount() === 0">
            Marcar todas como leidas
          </button>
        </div>

        <div class="notif-list">
          @for (notif of notificationViews(); track notif.id) {
            <div class="notif-item" [class.unread]="!notif.read" (click)="markRead(notif.id)">
              <div class="notif-icon-wrap" [style.background]="notif.iconColor + '18'">
                <app-icon [name]="notif.icon" size="20" [color]="notif.iconColor" />
              </div>
              <div class="notif-content">
                <p class="notif-title">{{ notif.title }}</p>
                <p class="notif-body">{{ notif.body }}</p>
                <span class="notif-time">{{ notif.time }}</span>
              </div>
              @if (!notif.read) {
                <span class="unread-dot"></span>
              }
            </div>
          }
        </div>
      } @else {
        <div class="notif-empty">
          <div class="empty-icon-wrap">
            <app-icon name="bell" size="40" color="var(--text-muted)" />
          </div>
          <h3>Sin notificaciones</h3>
          <p>Cuando haya novedades de tus pedidos o promociones exclusivas, las veras aqui.</p>
          <a routerLink="/home" class="btn-go-home">Ir al inicio</a>
        </div>
      }
    </div>
  `,
  styles: [`
    .notif-page { padding-bottom: 100px; background: var(--bg); min-height: 100dvh; }
    .notif-toolbar { display: flex; justify-content: space-between; align-items: center; padding: 14px 20px; border-bottom: 1px solid var(--border); background: var(--surface); }
    .notif-count { font-size: 0.8rem; font-weight: 700; color: var(--text-muted); }
    .mark-all-btn { background: none; border: none; font-size: 0.8rem; font-weight: 700; color: var(--primary); cursor: pointer; padding: 6px 10px; border-radius: 8px; transition: background 0.2s; }
    .mark-all-btn:hover:not(:disabled) { background: rgba(27,61,50,0.07); }
    .mark-all-btn:disabled { color: var(--text-muted); cursor: default; }
    .notif-list { display: flex; flex-direction: column; }
    .notif-item { display: flex; align-items: flex-start; gap: 14px; padding: 16px 20px; border-bottom: 1px solid var(--border); background: var(--surface); cursor: pointer; position: relative; transition: background 0.15s; }
    .notif-item:hover { background: var(--surface-raised); }
    .notif-item.unread { background: rgba(27,61,50,0.03); }
    .notif-icon-wrap { width: 44px; height: 44px; border-radius: 14px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
    .notif-content { flex: 1; min-width: 0; }
    .notif-title { font-size: 0.9rem; font-weight: 700; color: var(--text-primary); margin: 0 0 4px; }
    .notif-body { font-size: 0.82rem; color: var(--text-secondary); line-height: 1.45; margin: 0 0 6px; }
    .notif-time { font-size: 0.72rem; color: var(--text-muted); font-weight: 600; }
    .unread-dot { width: 10px; height: 10px; border-radius: 50%; background: var(--primary); flex-shrink: 0; margin-top: 4px; }
    .notif-empty { display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 80px 40px 40px; text-align: center; gap: 12px; }
    .empty-icon-wrap { width: 88px; height: 88px; border-radius: 50%; background: var(--surface-raised); border: 1px solid var(--border); display: flex; align-items: center; justify-content: center; margin-bottom: 8px; }
    .notif-empty h3 { font-size: 1.25rem; font-weight: 800; color: var(--text-primary); margin: 0; }
    .notif-empty p { font-size: 0.875rem; color: var(--text-secondary); line-height: 1.55; margin: 0; max-width: 280px; }
    .btn-go-home { margin-top: 8px; display: inline-block; padding: 14px 32px; background: var(--primary); color: #fff; border: 0; border-radius: 9999px; text-decoration: none; font-weight: 700; font-size: 0.9rem; cursor: pointer; transition: background 0.2s, transform 0.2s; box-shadow: 0 4px 14px rgba(27,61,50,0.25); }
    .btn-go-home:hover { background: #0d3323; transform: translateY(-1px); }
  `],
})
export class Notifications {
  private http = inject(HttpClient);

  notifications = signal<Notification[]>([]);
  loadError = signal('');

  constructor() {
    this.loadNotifications();
  }

  notificationViews = () => this.notifications().map((notification) => this.toView(notification));
  unreadCount = () => this.notifications().filter((n) => !n.seen).length;

  loadNotifications(): void {
    this.loadError.set('');
    this.http.get<Notification[]>(`${API_BASE_URL}/notifications`).subscribe({
      next: (notifications) => this.notifications.set(notifications),
      error: () => this.loadError.set('No se pudo conectar con el servidor de notificaciones.'),
    });
  }

  markRead(id: string): void {
    const notification = this.notifications().find((n) => n.id === id);
    if (!notification || notification.seen) return;

    this.http.patch<Notification>(`${API_BASE_URL}/notifications/${id}/seen`, {}).subscribe({
      next: (updated) => this.notifications.update((list) => list.map((n) => (n.id === id ? updated : n))),
      error: () => this.loadError.set('No se pudo marcar la notificacion como leida.'),
    });
  }

  markAllRead(): void {
    this.http.patch<{ marked: number }>(`${API_BASE_URL}/notifications/seen-all`, {}).subscribe({
      next: () => this.notifications.update((list) => list.map((n) => ({ ...n, seen: true }))),
      error: () => this.loadError.set('No se pudieron marcar las notificaciones como leidas.'),
    });
  }

  private toView(notification: Notification): NotificationView {
    const meta = this.notificationMeta(notification.type);
    return {
      id: notification.id,
      icon: meta.icon,
      iconColor: meta.iconColor,
      title: meta.title,
      body: notification.message,
      time: this.relativeTime(notification.created_at),
      read: notification.seen,
    };
  }

  private notificationMeta(type: string): { icon: string; iconColor: string; title: string } {
    switch (type) {
      case 'low_stock': return { icon: 'alert-triangle', iconColor: 'var(--warning)', title: 'Stock bajo' };
      case 'promo_created': return { icon: 'tag', iconColor: 'var(--secondary)', title: 'Promocion creada' };
      case 'expired_removed': return { icon: 'trash', iconColor: 'var(--danger)', title: 'Producto vencido retirado' };
      case 'expiry_warning': return { icon: 'clock', iconColor: 'var(--warning)', title: 'Producto por vencer' };
      case 'cash_discrepancy': return { icon: 'dollar-sign', iconColor: 'var(--danger)', title: 'Diferencia de caja' };
      default: return { icon: 'bell', iconColor: 'var(--primary)', title: 'Notificacion' };
    }
  }

  private relativeTime(value: string): string {
    const date = new Date(value);
    const diffMinutes = Math.max(0, Math.floor((Date.now() - date.getTime()) / 60000));
    if (diffMinutes < 1) return 'Ahora';
    if (diffMinutes < 60) return `Hace ${diffMinutes} min`;
    const diffHours = Math.floor(diffMinutes / 60);
    if (diffHours < 24) return `Hace ${diffHours} h`;
    return date.toLocaleDateString('es-MX', { day: '2-digit', month: 'short' });
  }
}
