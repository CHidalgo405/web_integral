import { Component, inject, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { DatePipe } from '@angular/common';
import { ProductService } from '../../../core/services/product.service';
import { Header } from '../../../shared/components/header/header';
import { ProductReview } from '../../../core/models/product.model';
import { IconComponent } from '../../../shared/components/icon/icon';

@Component({
  selector: 'app-product-reviews',
  standalone: true,
  imports: [Header, DatePipe, IconComponent],
  template: `
    <app-header title="Reseñas" [showBack]="true"></app-header>
    <div class="reviews-page" id="reviews-page">
      <div class="reviews-summary">
        <span class="avg-rating" style="display: inline-flex; align-items: center; gap: 6px;">
          <app-icon name="star" size="20" fill="currentColor" color="var(--warning)" />
          <span>{{ avgRating }}</span>
        </span>
        <span class="total-reviews">{{ reviews.length }} reseña(s)</span>
      </div>
      <div class="reviews-list">
        @for (review of reviews; track review.id) {
          <div class="review-card">
            <div class="review-header">
              <div class="reviewer-avatar">{{ review.userName.charAt(0) }}</div>
              <div>
                <p class="reviewer-name">{{ review.userName }}</p>
                <div class="review-stars" style="display: flex; align-items: center; gap: 2px;">
                  @for (idx of [0, 1, 2, 3, 4]; track idx) {
                    <app-icon name="star" size="14" [fill]="idx < review.rating ? 'currentColor' : 'none'" color="var(--warning)" />
                  }
                </div>
              </div>
              <span class="review-date">{{ review.date | date:'dd/MM/yyyy' }}</span>
            </div>
            <p class="review-comment">{{ review.comment }}</p>
          </div>
        }
      </div>
    </div>
  `,
  styles: [`
    .reviews-page { padding: 16px; padding-bottom: 80px; }
    .reviews-summary { display: flex; align-items: center; gap: 12px; margin-bottom: 20px; padding: 16px; background: var(--surface-raised); border-radius: 12px; }
    .avg-rating { font-size: 1.3rem; font-weight: 800; }
    .total-reviews { font-size: 0.85rem; color: var(--text-secondary); }
    .reviews-list { display: flex; flex-direction: column; gap: 12px; }
    .review-card { padding: 14px; background: var(--surface-raised); border-radius: 12px; }
    .review-header { display: flex; align-items: center; gap: 10px; margin-bottom: 10px; }
    .reviewer-avatar { width: 36px; height: 36px; border-radius: 50%; background: var(--primary); color: #fff; display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 0.9rem; }
    .reviewer-name { font-size: 0.85rem; font-weight: 600; color: var(--text-primary); margin: 0; }
    .review-stars { display: flex; }
    .review-date { margin-left: auto; font-size: 0.7rem; color: var(--text-muted); }
    .review-comment { font-size: 0.85rem; color: var(--text-primary); line-height: 1.5; margin: 0; }
  `],
})
export class ProductReviews implements OnInit {
  private route = inject(ActivatedRoute);
  private productService = inject(ProductService);

  reviews: ProductReview[] = [];
  avgRating = '0.0';

  ngOnInit(): void {
    this.route.params.subscribe(p => {
      this.reviews = this.productService.getReviews(p['id']);
      const sum = this.reviews.reduce((a, r) => a + r.rating, 0);
      this.avgRating = this.reviews.length ? (sum / this.reviews.length).toFixed(1) : '0.0';
    });
  }
}
