import { Component, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ProductService } from '../../../core/services/product.service';
import { Header } from '../../../shared/components/header/header';
import { IconComponent } from '../../../shared/components/icon/icon';
import { Product } from '../../../core/models/product.model';

@Component({
  selector: 'app-product-gallery',
  standalone: true,
  imports: [Header, IconComponent],
  template: `
    <app-header [title]="product?.name ?? 'Galería'" [showBack]="true"></app-header>

    <div class="gallery-page" id="gallery-page">
      @if (product) {

        <!-- Imagen principal grande -->
        <div class="gallery-featured">
          <img
            [src]="product.images[activeIndex()] || 'assets/images/productos/placeholder.png'"
            [alt]="product.name"
            class="featured-img product-media-img"
            (click)="toggleFullscreen()"
          />

          <!-- Navegación si hay múltiples imágenes -->
          @if (product.images.length > 1) {
            <button class="nav-btn prev" (click)="prev()" [disabled]="activeIndex() === 0" aria-label="Anterior">
              <app-icon name="chevron-left" size="22" />
            </button>
            <button class="nav-btn next" (click)="next()" [disabled]="activeIndex() === product.images.length - 1" aria-label="Siguiente">
              <app-icon name="chevron-right" size="22" />
            </button>
            <span class="img-counter">{{ activeIndex() + 1 }} / {{ product.images.length }}</span>
          }
        </div>

        <!-- Tira de miniaturas (solo si > 1 imagen) -->
        @if (product.images.length > 1) {
          <div class="thumbs-strip">
            @for (img of product.images; track $index) {
              <button
                class="thumb-btn"
                [class.active]="activeIndex() === $index"
                (click)="activeIndex.set($index)"
                [attr.aria-label]="'Imagen ' + ($index + 1)"
              >
                <img [src]="img || 'assets/images/productos/placeholder.png'" [alt]="'Miniatura ' + ($index + 1)" class="product-media-img" />
              </button>
            }
          </div>
        }

        <!-- Nombre del producto -->
        <div class="gallery-footer">
          <h2>{{ product.name }}</h2>
          <p>{{ product.images.length }} {{ product.images.length === 1 ? 'imagen' : 'imágenes' }}</p>
        </div>

        <!-- Fullscreen overlay -->
        @if (fullscreen()) {
          <div class="fullscreen-overlay" (click)="toggleFullscreen()">
            <img
              [src]="product.images[activeIndex()] || 'assets/images/productos/placeholder.png'"
              [alt]="product.name"
              class="fullscreen-img"
            />
            <button class="fullscreen-close" (click)="toggleFullscreen()" aria-label="Cerrar">
              <app-icon name="x" size="22" color="#fff" />
            </button>
          </div>
        }

      } @else {
        <div class="gallery-empty">
          <app-icon name="camera" size="48" />
          <p>Producto no encontrado.</p>
        </div>
      }
    </div>
  `,
  styles: [`
    .gallery-page {
      padding-bottom: 80px;
      background: var(--bg);
      min-height: 100dvh;
    }

    /* Imagen principal */
    .gallery-featured {
      position: relative;
      width: min(100%, 720px);
      aspect-ratio: 1 / 1;
      margin: 24px auto 0;
      background: var(--surface-raised);
      display: flex;
      align-items: center;
      justify-content: center;
      border: 1px solid var(--border);
      border-radius: 24px;
      overflow: hidden;
    }
    .featured-img {
      cursor: zoom-in;
      filter: drop-shadow(0 12px 24px rgba(0,0,0,0.08));
      padding: clamp(24px, 6vw, 56px);
      box-sizing: border-box;
    }

    /* Botones prev/next */
    .nav-btn {
      position: absolute;
      top: 50%;
      transform: translateY(-50%);
      width: 40px;
      height: 40px;
      border-radius: 50%;
      background: var(--surface);
      border: 1px solid var(--border);
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      box-shadow: 0 4px 12px rgba(0,0,0,0.08);
      z-index: 5;
      transition: all 0.2s;
    }
    .nav-btn:hover:not(:disabled) { background: var(--primary); color: #fff; }
    .nav-btn:disabled { opacity: 0.3; cursor: not-allowed; }
    .nav-btn.prev { left: 12px; }
    .nav-btn.next { right: 12px; }

    /* Contador */
    .img-counter {
      position: absolute;
      bottom: 12px;
      right: 16px;
      font-size: 0.75rem;
      font-weight: 700;
      color: var(--text-muted);
      background: var(--surface);
      padding: 4px 10px;
      border-radius: 20px;
      border: 1px solid var(--border);
    }

    /* Tira de miniaturas */
    .thumbs-strip {
      display: flex;
      gap: 10px;
      padding: 16px;
      width: min(100%, 752px);
      margin: 0 auto;
      overflow-x: auto;
      scrollbar-width: none;
    }
    .thumbs-strip::-webkit-scrollbar { display: none; }
    .thumb-btn {
      flex-shrink: 0;
      width: 72px;
      aspect-ratio: 1 / 1;
      border-radius: 12px;
      overflow: hidden;
      border: 2.5px solid transparent;
      cursor: pointer;
      background: var(--surface-raised);
      padding: 5px;
      transition: border-color 0.2s;
    }
    .thumb-btn.active { border-color: var(--primary); }
    .thumb-btn img { border-radius: 7px; }

    /* Pie de galería */
    .gallery-footer {
      padding: 16px 20px;
      width: min(100%, 752px);
      margin: 0 auto;
      border-top: 1px solid var(--border);
    }
    .gallery-footer h2 {
      font-size: 1rem;
      font-weight: 800;
      color: var(--text-primary);
      margin: 0 0 4px;
    }
    .gallery-footer p {
      font-size: 0.8rem;
      color: var(--text-muted);
      margin: 0;
    }

    /* Fullscreen overlay */
    .fullscreen-overlay {
      position: fixed;
      inset: 0;
      background: rgba(0,0,0,0.92);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 9999;
      cursor: zoom-out;
    }
    .fullscreen-img {
      max-width: 95vw;
      max-height: 90dvh;
      aspect-ratio: 1 / 1;
      object-fit: contain;
    }

    @media (max-width: 767px) {
      .gallery-featured { margin-top: 0; border-radius: 0; border-inline: 0; }
    }
    .fullscreen-close {
      position: fixed;
      top: max(20px, env(safe-area-inset-top));
      right: 20px;
      width: 44px;
      height: 44px;
      border-radius: 50%;
      background: rgba(255,255,255,0.15);
      border: none;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      z-index: 10000;
      transition: background 0.2s;
    }
    .fullscreen-close:hover { background: rgba(255,255,255,0.25); }

    /* Empty state */
    .gallery-empty {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      min-height: 60dvh;
      gap: 16px;
      color: var(--text-muted);
      font-size: 0.9rem;
    }
  `],
})
export class ProductGallery implements OnInit {
  private route = inject(ActivatedRoute);
  private productService = inject(ProductService);

  product: Product | undefined;
  activeIndex = signal(0);
  fullscreen = signal(false);

  ngOnInit(): void {
    this.route.params.subscribe(p => {
      this.product = this.productService.getProductById(p['id']);
      this.activeIndex.set(0);
    });
  }

  prev(): void {
    if (this.activeIndex() > 0) this.activeIndex.update(i => i - 1);
  }

  next(): void {
    if (this.product && this.activeIndex() < this.product.images.length - 1) {
      this.activeIndex.update(i => i + 1);
    }
  }

  toggleFullscreen(): void {
    this.fullscreen.update(v => !v);
  }
}
