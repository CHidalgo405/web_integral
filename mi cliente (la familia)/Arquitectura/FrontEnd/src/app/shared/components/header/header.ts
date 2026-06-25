import { Component, input } from '@angular/core';
import { Location } from '@angular/common';

@Component({
  selector: 'app-header',
  standalone: true,
  template: `
    <header class="app-header" id="app-header">
      @if (showBack()) {
        <button class="back-btn" (click)="goBack()" id="header-back-btn">←</button>
      }
      <h1 class="header-title">{{ title() }}</h1>
      <div class="header-actions">
        <ng-content></ng-content>
      </div>
    </header>
  `,
  styles: [`
    .app-header {
      display: flex; align-items: center; gap: 12px;
      padding: 12px 16px; background: var(--primary);
      color: #fff;
      position: sticky; top: 0; z-index: 50;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
    }
    .back-btn {
      background: none; border: none; font-size: 1.3rem;
      color: #fff; cursor: pointer; padding: 4px 8px;
      border-radius: 8px; transition: background 0.2s;
    }
    .back-btn:hover { background: rgba(255,255,255,0.1); }
    .header-title {
      flex: 1; font-size: 1.2rem; font-weight: 700;
      color: #fff; margin: 0; font-family: var(--font-heading);
    }
    .header-actions { display: flex; gap: 8px; align-items: center; }
  `],
})
export class Header {
  title = input<string>('');
  showBack = input<boolean>(false);

  constructor(private location: Location) {}

  goBack(): void {
    this.location.back();
  }
}
