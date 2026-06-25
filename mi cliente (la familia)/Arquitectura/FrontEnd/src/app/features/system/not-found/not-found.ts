import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { IconComponent } from '../../../shared/components/icon/icon';

@Component({
  selector: 'app-not-found',
  standalone: true,
  imports: [RouterLink, IconComponent],
  template: `
    <div class="not-found-page" id="not-found-page">
      <span class="nf-icon" style="display: block; margin-bottom: 12px;"><app-icon name="search" size="64" /></span>
      <h1>404</h1>
      <p>Página no encontrada</p>
      <a routerLink="/home" class="btn-home">Ir al inicio</a>
    </div>
  `,
  styles: [`
    .not-found-page { min-height: 100dvh; display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 24px; text-align: center; }
    h1 { font-size: 3rem; font-weight: 900; color: var(--text-primary); margin: 12px 0 8px; }
    p { font-size: 1rem; color: var(--text-secondary); margin: 0 0 24px; }
    .btn-home { display: inline-block; padding: 12px 28px; background: var(--secondary); color: #fff; border-radius: 9999px; text-decoration: none; font-weight: 700; transition: background 0.2s; }
    .btn-home:hover { background: var(--secondary-dark); }
  `],
})
export class NotFound {}
