import { Component, Input, OnInit, OnChanges, inject, ElementRef } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

@Component({
  selector: 'app-icon',
  standalone: true,
  template: `
    <svg
      [attr.width]="resolvedSize"
      [attr.height]="resolvedSize"
      [attr.viewBox]="viewBox"
      [attr.fill]="fill"
      [attr.stroke]="resolvedColor"
      [attr.stroke-width]="strokeWidth"
      stroke-linecap="round"
      stroke-linejoin="round"
      [class]="'app-icon ' + className"
      [innerHTML]="safeSvgContent"
      style="display: inline-block; vertical-align: middle; flex-shrink: 0;"
    ></svg>
  `,
  styles: [`
    :host {
      display: inline-flex;
      align-items: center;
      justify-content: center;
    }
    ::ng-deep .app-icon-spin {
      animation: app-icon-spin 1.2s linear infinite;
    }
    @keyframes app-icon-spin {
      from { transform: rotate(0deg); }
      to { transform: rotate(360deg); }
    }
  `]
})
export class IconComponent implements OnInit, OnChanges {
  @Input() name: string = '';
  @Input() size: number | string = 24;
  @Input() color: string = 'DEFAULT_COLOR';
  @Input() strokeWidth: number | string = 2;
  @Input() fill: string = 'none';
  @Input() className: string = '';

  private sanitizer = inject(DomSanitizer);
  private elementRef = inject(ElementRef);
  
  protected safeSvgContent: SafeHtml = '';
  protected viewBox: string = '0 0 24 24';
  
  protected resolvedColor: string = 'var(--primary)';
  protected resolvedSize: number = 28;

  private icons: Record<string, string> = {
    'paypal': '<path d="M6.5 21 8 13.5h3.5a5 5 0 0 0 5-4.5c.3-2.7-1.8-5-4.5-5H7L4.5 17"/><path d="M8.5 21h3a5 5 0 0 0 5-4.2l.3-1.8"/>',
    'download': '<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>',
    'trending-up': '<polyline points="22 7 13.5 15.5 8.5 10.5 2 17"/><polyline points="16 7 22 7 22 13"/>',
    'leaf': '<path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 3.5 2 5.5a7 7 0 0 1-7 7v6ZM11 20v-6"/>',
    'milk': '<path d="M15.2 22H8.8a2 2 0 0 1-2-1.79L5 3h14l-1.81 17.21A2 2 0 0 1 15.2 22Z"/><path d="M6 12h12"/>',
    'drumstick': '<path d="m16 8-5 5"/><path d="m11 8 5 5"/><path d="M18.8 3.3a4.2 4.2 0 0 0-6 0l-9.6 9.6a6 6 0 1 0 8.5 8.5l9.6-9.6a4.2 4.2 0 0 0 0-6v0Z"/>',
    'bread': '<path d="m4.3 10.3 1.4-1.4a6 6 0 0 1 8.5 8.5l-1.4 1.4a6 6 0 0 1-8.5-8.5Z"/><path d="M7.1 13.1 9 15.1"/><path d="m10.9 9.3 1.9 1.9"/><path d="m14.7 11.2-1.9-1.9"/>',
    'cup-soda': '<path d="M6 8h12M8.1 22h7.8a2 2 0 0 0 2-1.7l1.7-11.8A1 1 0 0 0 18.6 7H5.4a1 1 0 0 0-1 1.1l1.7 11.8A2 2 0 0 0 8.1 22Z"/><path d="M15 7l2-5"/>',
    'cookie': '<path d="M12 2a10 10 0 1 0 10 10 4 4 0 0 1-5-5 4 4 0 0 1-5-5Z"/><path d="M8.5 8.5v.01M16 15.5v.01M12 12v.01M11 16v.01M16 11v.01"/>',
    'brush': '<path d="m12 22 .8-3H11.2l.8 3Z"/><path d="M18 12.5V10a6 6 0 0 0-12 0v2.5M12 2v2"/><path d="M6 12h12a2 2 0 0 1 2 2v2a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-2a2 2 0 0 1 2-2Z"/>',
    'bottle-lotion': '<path d="M8 22h8a2 2 0 0 0 2-2V8H6v12a2 2 0 0 0 2 2ZM10 8V5a2 2 0 0 1 4 0v3M8 12h8M12 12v6"/>',
    'package': '<path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/>',
    'truck': '<rect x="1" y="3" width="15" height="13" rx="2" ry="2"/><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/>',
    'credit-card': '<rect x="1" y="4" width="22" height="16" rx="2" ry="2"/><line x1="1" y1="10" x2="23" y2="10"/>',
    'landmark': '<line x1="3" y1="22" x2="21" y2="22"/><line x1="6" y1="18" x2="6" y2="11"/><line x1="10" y1="18" x2="10" y2="11"/><line x1="14" y1="18" x2="14" y2="11"/><line x1="18" y1="18" x2="18" y2="11"/><polygon points="12 2 2 7 22 7 12 2"/>',
    'map-pin': '<path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>',
    'bell': '<path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/>',
    'search': '<circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>',
    'star': '<polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>',
    'heart': '<path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>',
    'trash': '<polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/>',
    'shopping-cart': '<circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>',
    'store': '<path d="m2 7 4.41-3.67A2 2 0 0 1 7.7 3h8.6a2 2 0 0 1 1.3.33L22 7"/><path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/><path d="M15 22v-4a2 2 0 0 0-2-2h-2a2 2 0 0 0-2 2v4"/><path d="M2 7h20"/><path d="M22 7v3a2 2 0 0 1-2 2v0a2 2 0 0 1-2-2V7"/><path d="M18 7v3a2 2 0 0 1-2 2v0a2 2 0 0 1-2-2V7"/><path d="M14 7v3a2 2 0 0 1-2 2v0a2 2 0 0 1-2-2V7"/><path d="M10 7v3a2 2 0 0 1-2 2v0a2 2 0 0 1-2-2V7"/><path d="M6 7v3a2 2 0 0 1-2 2v0a2 2 0 0 1-2-2V7"/>',
    'mail': '<path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/>',
    'phone': '<path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>',
    'lock': '<rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>',
    'unlock': '<rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 9.9-1"/>',
    'eye': '<path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>',
    'eye-off': '<path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/>',
    'user': '<path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>',
    'users': '<path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>',
    'shield': '<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>',
    'bar-chart': '<line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/>',
    'calendar': '<rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>',
    'log-out': '<path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/>',
    'tag': '<path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/><line x1="7" y1="7" x2="7.01" y2="7"/>',
    'plus': '<line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>',
    'pencil': '<path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"/>',
    'alert-triangle': '<path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>',
    'dollar-sign': '<line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>',
    'check': '<polyline points="20 6 9 17 4 12"/>',
    'clock': '<circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>',
    'camera': '<path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/>',
    'loader': '<line x1="12" y1="2" x2="12" y2="6"/><line x1="12" y1="18" x2="12" y2="22"/><line x1="4.93" y1="4.93" x2="7.76" y2="7.76"/><line x1="16.24" y1="16.24" x2="19.07" y2="19.07"/><line x1="2" y1="12" x2="6" y2="12"/><line x1="18" y1="12" x2="22" y2="12"/><line x1="4.93" y1="19.07" x2="7.76" y2="16.24"/><line x1="16.24" y1="7.76" x2="19.07" y2="4.93"/>',
    'x': '<line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>',
    'wifi-off': '<line x1="1" y1="1" x2="23" y2="23"/><path d="M16.72 11.06A10.94 10.94 0 0 1 19 12.5"/><path d="M5 12.5a10.94 10.94 0 0 1 5.83-2.84"/><path d="M12 18.75c-2.3 0-4.3-.9-5.83-2.34"/><path d="M17.83 16.41a8.4 8.4 0 0 0-2.01-1.74"/><circle cx="12" cy="20" r="1"/>',
    'gem': '<path d="M6 3h12l4 6-10 13L2 9z"/><path d="M11 3 8 9l4 13 4-13-3-6"/><path d="M2 9h20"/>',
    'clipboard': '<path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><rect x="8" y="2" width="8" height="4" rx="1" ry="1"/>',
    'help-circle': '<circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/>',
    'file-text': '<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/>',
    'egg': '<path d="M12 22a7 7 0 0 0 7-7c0-4.3-7-13-7-13S5 10.7 5 15a7 7 0 0 0 7 7z"/>',
    'bolt': '<polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>',
    'chevron-left': '<polyline points="15 18 9 12 15 6"/>',
    'chevron-right': '<polyline points="9 18 15 12 9 6"/>',
    'arrow-left': '<line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/>',
    'arrow-right': '<line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>',
    'hash': '<line x1="4" y1="9" x2="20" y2="9"/><line x1="4" y1="15" x2="20" y2="15"/><line x1="10" y1="3" x2="8" y2="21"/><line x1="16" y1="3" x2="14" y2="21"/>'
  };

  ngOnInit() {
    this.updateSvg();
  }

  ngOnChanges() {
    this.updateSvg();
  }

  private updateSvg() {
    const rawSvg = this.icons[this.name] || this.icons['package'];
    this.safeSvgContent = this.sanitizer.bypassSecurityTrustHtml(rawSvg);
    
    // Some icons might need filled vs non-filled or custom properties
    if (this.name === 'star' && this.fill !== 'none') {
      this.fill = 'currentColor';
    }
    if (this.name === 'heart' && this.fill !== 'none') {
      this.fill = 'currentColor';
    }
    if (this.name === 'gem' && this.fill !== 'none') {
      this.fill = 'currentColor';
    }

    // Resolve size (scale up based on current dimensions, making them slightly larger)
    let numSize = typeof this.size === 'number' ? this.size : parseInt(this.size as string, 10);
    if (isNaN(numSize)) {
      numSize = 24;
    }
    if (numSize <= 12) {
      this.resolvedSize = numSize + 3; // e.g. 12 -> 15
    } else if (numSize <= 18) {
      this.resolvedSize = numSize + 4; // e.g. 16 -> 20, 18 -> 22
    } else if (numSize <= 24) {
      this.resolvedSize = numSize + 6; // e.g. 20 -> 26, 24 -> 30
    } else if (numSize <= 48) {
      this.resolvedSize = numSize + 8; // e.g. 32 -> 40, 48 -> 56
    } else {
      this.resolvedSize = numSize + 12; // e.g. 64 -> 76
    }

    // Resolve color (default to app primary green unless in contrast containers or explicitly defined)
    if (this.color === 'DEFAULT_COLOR') {
      const hasContrastAncestor = this.elementRef.nativeElement.closest(
        '.active, .btn-primary, .btn-main, .btn-continue, .btn-pay, .btn-explore, .btn-shop, .btn-home, .btn-return, .btn-logout, .drawer-link.active, .menu-link.active, .vip-badge'
      );
      if (hasContrastAncestor) {
        this.resolvedColor = 'currentColor';
      } else {
        this.resolvedColor = 'var(--primary)';
      }
    } else {
      this.resolvedColor = this.color;
    }
  }
}
