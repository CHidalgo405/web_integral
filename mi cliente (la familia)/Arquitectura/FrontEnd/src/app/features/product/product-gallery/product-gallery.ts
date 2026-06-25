import { Component, inject, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Header } from '../../../shared/components/header/header';
import { IconComponent } from '../../../shared/components/icon/icon';

@Component({
  selector: 'app-product-gallery',
  standalone: true,
  imports: [Header, IconComponent],
  template: `
    <app-header title="Galería" [showBack]="true"></app-header>
    <div class="gallery-page" id="gallery-page">
      <div class="gallery-placeholder">
        <span class="gallery-icon" style="display: block; margin-bottom: 12px;"><app-icon name="camera" size="48" /></span>
        <p>Galería de fotos del producto</p>
        <p class="hint">Las imágenes se mostrarán aquí cuando se conecte el backend.</p>
      </div>
    </div>
  `,
  styles: [`
    .gallery-page { min-height: 80dvh; display: flex; align-items: center; justify-content: center; padding: 16px; }
    .gallery-placeholder { text-align: center; }
    .gallery-placeholder p { color: var(--text-secondary); margin: 12px 0 0; }
    .hint { font-size: 0.8rem; color: var(--text-muted); }
  `],
})
export class ProductGallery implements OnInit {
  private route = inject(ActivatedRoute);
  productId = '';

  ngOnInit(): void {
    this.route.params.subscribe(p => this.productId = p['id']);
  }
}
