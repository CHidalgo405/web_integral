import { Component, inject } from '@angular/core';
import { ConnectivityService } from '../../../core/services/connectivity.service';
import { IconComponent } from '../icon/icon';

@Component({
  selector: 'app-offline-banner',
  standalone: true,
  imports: [IconComponent],
  template: `
    @if (!connectivity.isOnline()) {
      <div class="offline-banner" id="offline-banner">
        <span class="offline-icon" style="display: flex; align-items: center;"><app-icon name="wifi-off" size="16" /></span>
        <span>Sin conexión a internet</span>
      </div>
    }
  `,
  styles: [`
    .offline-banner {
      position: fixed; top: 0; left: 0; right: 0; z-index: 9999;
      background: var(--warning); color: #fff;
      padding: 8px 16px; text-align: center;
      font-size: 0.85rem; font-weight: 600;
      display: flex; align-items: center; justify-content: center; gap: 8px;
      animation: slideDown 0.3s ease;
    }
    @keyframes slideDown { from { transform: translateY(-100%); } to { transform: translateY(0); } }
  `],
})
export class OfflineBanner {
  protected connectivity = inject(ConnectivityService);
}
