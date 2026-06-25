import { Component, input } from '@angular/core';

@Component({
  selector: 'app-loading-skeleton',
  standalone: true,
  template: `
    <div class="skeleton-container">
      @for (item of skeletonItems(); track $index) {
        <div class="skeleton-item" [style.height]="item.height" [style.width]="item.width" [style.border-radius]="item.radius ?? '8px'"></div>
      }
    </div>
  `,
  styles: [`
    .skeleton-container { display: flex; flex-direction: column; gap: 12px; padding: 16px; }
    .skeleton-item {
      background: linear-gradient(90deg, var(--skeleton-base) 25%, var(--skeleton-shine) 50%, var(--skeleton-base) 75%);
      background-size: 200% 100%;
      animation: shimmer 1.5s infinite;
      border-radius: 8px;
    }
    @keyframes shimmer { 0% { background-position: 200% 0; } 100% { background-position: -200% 0; } }
  `],
})
export class LoadingSkeleton {
  skeletonItems = input<{ height: string; width: string; radius?: string }[]>([
    { height: '20px', width: '60%' },
    { height: '160px', width: '100%', radius: '12px' },
    { height: '16px', width: '80%' },
    { height: '16px', width: '40%' },
  ]);
}
