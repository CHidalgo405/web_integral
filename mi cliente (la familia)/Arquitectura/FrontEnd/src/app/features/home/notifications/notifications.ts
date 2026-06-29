import { Component, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Header } from '../../../shared/components/header/header';
import { IconComponent } from '../../../shared/components/icon/icon';

interface Notification {
  id: string;
  type: 'order' | 'promo' | 'system';
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

      @if (notifications().length > 0) {

        <!-- Acciones rápidas -->
        <div class="notif-toolbar">
          <span class="notif-count">
            {{ unreadCount() }} sin leer
          </span>
          <button class="mark-all-btn" (click)="markAllRead()" [disabled]="unreadCount() === 0">
            Marcar todas como leídas
          </button>
        </div>

        <!-- Lista de notificaciones -->
        <div class="notif-list">
          @for (notif of notifications(); track notif.id) {
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

        <!-- Estado vacío -->
        <div class="notif-empty">
          <div class="empty-icon-wrap">
            <app-icon name="bell-off" size="40" color="var(--text-muted)" />
          </div>
          <h3>Sin notificaciones</h3>
          <p>Cuando haya novedades de tus pedidos o promociones exclusivas, las verás aquí.</p>
          <a routerLink="/home" class="btn-go-home">Ir al inicio</a>
        </div>

      }

    </div>
  `,
  styles: [`
    .notif-page {
      padding-bottom: 100px;
      background: var(--bg);
      min-height: 100dvh;
    }

    /* ---- Toolbar ---- */
    .notif-toolbar {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 14px 20px;
      border-bottom: 1px solid var(--border);
      background: var(--surface);
    }

    .notif-count {
      font-size: 0.8rem;
      font-weight: 700;
      color: var(--text-muted);
    }

    .mark-all-btn {
      background: none;
      border: none;
      font-size: 0.8rem;
      font-weight: 700;
      color: var(--primary);
      cursor: pointer;
      padding: 6px 10px;
      border-radius: 8px;
      transition: background 0.2s;
    }
    .mark-all-btn:hover:not(:disabled) { background: rgba(27,61,50,0.07); }
    .mark-all-btn:disabled { color: var(--text-muted); cursor: default; }

    /* ---- Lista ---- */
    .notif-list {
      display: flex;
      flex-direction: column;
    }

    .notif-item {
      display: flex;
      align-items: flex-start;
      gap: 14px;
      padding: 16px 20px;
      border-bottom: 1px solid var(--border);
      background: var(--surface);
      cursor: pointer;
      position: relative;
      transition: background 0.15s;
    }
    .notif-item:hover { background: var(--surface-raised); }
    .notif-item.unread { background: rgba(27,61,50,0.03); }

    .notif-icon-wrap {
      width: 44px;
      height: 44px;
      border-radius: 14px;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }

    .notif-content {
      flex: 1;
      min-width: 0;
    }

    .notif-title {
      font-size: 0.9rem;
      font-weight: 700;
      color: var(--text-primary);
      margin: 0 0 4px;
    }

    .notif-body {
      font-size: 0.82rem;
      color: var(--text-secondary);
      line-height: 1.45;
      margin: 0 0 6px;
    }

    .notif-time {
      font-size: 0.72rem;
      color: var(--text-muted);
      font-weight: 600;
    }

    .unread-dot {
      width: 10px;
      height: 10px;
      border-radius: 50%;
      background: var(--primary);
      flex-shrink: 0;
      margin-top: 4px;
    }

    /* ---- Estado vacío ---- */
    .notif-empty {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 80px 40px 40px;
      text-align: center;
      gap: 12px;
    }

    .empty-icon-wrap {
      width: 88px;
      height: 88px;
      border-radius: 50%;
      background: var(--surface-raised);
      border: 1px solid var(--border);
      display: flex;
      align-items: center;
      justify-content: center;
      margin-bottom: 8px;
    }

    .notif-empty h3 {
      font-size: 1.25rem;
      font-weight: 800;
      color: var(--text-primary);
      margin: 0;
    }

    .notif-empty p {
      font-size: 0.875rem;
      color: var(--text-secondary);
      line-height: 1.55;
      margin: 0;
      max-width: 280px;
    }

    .btn-go-home {
      margin-top: 8px;
      display: inline-block;
      padding: 14px 32px;
      background: var(--primary);
      color: #fff;
      border-radius: 9999px;
      text-decoration: none;
      font-weight: 700;
      font-size: 0.9rem;
      transition: background 0.2s, transform 0.2s;
      box-shadow: 0 4px 14px rgba(27,61,50,0.25);
    }
    .btn-go-home:hover { background: #0d3323; transform: translateY(-1px); }
  `],
})
export class Notifications {
  notifications = signal<Notification[]>([
    {
      id: '1',
      type: 'order',
      icon: 'package',
      iconColor: 'var(--primary)',
      title: 'Pedido en camino',
      body: 'Tu pedido #PED-001 fue enviado y llegará en 2–3 días hábiles.',
      time: 'Hace 10 min',
      read: false,
    },
    {
      id: '2',
      type: 'promo',
      icon: 'tag',
      iconColor: 'var(--secondary)',
      title: '¡Oferta exclusiva!',
      body: 'Usa el código FAMILIA10 y obtén 10% de descuento en tu próxima compra.',
      time: 'Hace 2 horas',
      read: false,
    },
    {
      id: '3',
      type: 'order',
      icon: 'check-circle',
      iconColor: 'var(--success)',
      title: 'Pedido entregado',
      body: 'Tu pedido #PED-000 fue entregado exitosamente. ¡Gracias por tu compra!',
      time: 'Ayer',
      read: true,
    },
    {
      id: '4',
      type: 'system',
      icon: 'info',
      iconColor: 'var(--text-muted)',
      title: 'Bienvenido a La Familia',
      body: 'Explora nuestros productos y disfruta de las mejores ofertas de tu tienda de confianza.',
      time: 'Hace 3 días',
      read: true,
    },
  ]);

  unreadCount = () => this.notifications().filter(n => !n.read).length;

  markRead(id: string): void {
    this.notifications.update(list =>
      list.map(n => n.id === id ? { ...n, read: true } : n)
    );
  }

  markAllRead(): void {
    this.notifications.update(list => list.map(n => ({ ...n, read: true })));
  }
}
