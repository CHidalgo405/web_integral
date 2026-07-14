import { DatePipe } from '@angular/common';
import { ChangeDetectorRef, Component, inject, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import {
  ProductReview,
  ReviewEligibility,
  ReviewSummary,
} from '../../../core/models/product.model';
import { AlertService } from '../../../core/services/alert.service';
import { AuthService } from '../../../core/services/auth.service';
import { ProductService } from '../../../core/services/product.service';
import { Header } from '../../../shared/components/header/header';
import { IconComponent } from '../../../shared/components/icon/icon';

const EMPTY_SUMMARY: ReviewSummary = {
  average: 0,
  total: 0,
  distribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
};

@Component({
  selector: 'app-product-reviews',
  standalone: true,
  imports: [Header, DatePipe, FormsModule, IconComponent],
  template: `
    <app-header title="Reseñas" [showBack]="true"></app-header>

    <main class="reviews-page" id="reviews-page">
      @if (loading) {
        <div class="loading-state" aria-live="polite">
          <app-icon name="loader" size="28" className="app-icon-spin" />
          <p>Cargando reseñas...</p>
        </div>
      } @else {
        <div class="reviews-layout">
        <aside class="reviews-sidebar">
        <section class="reviews-summary" aria-label="Resumen de calificaciones">
          <div class="average-block">
            <strong>{{ summary.average.toFixed(1) }}</strong>
            <div class="summary-stars" [attr.aria-label]="summary.average.toFixed(1) + ' de 5 estrellas'">
              @for (star of stars; track star) {
                <app-icon
                  name="star"
                  size="17"
                  [fill]="star <= roundedAverage ? 'currentColor' : 'none'"
                  color="var(--warning)"
                />
              }
            </div>
            <span>{{ summary.total }} {{ summary.total === 1 ? 'reseña' : 'reseñas' }}</span>
          </div>

          <div class="rating-distribution">
            @for (level of ratingLevels; track level) {
              <div class="distribution-row">
                <span>{{ level }}</span>
                <app-icon name="star" size="10" fill="currentColor" color="var(--warning)" />
                <div class="distribution-track" aria-hidden="true">
                  <span [style.width.%]="distributionPercent(level)"></span>
                </div>
                <small>{{ summary.distribution[level] }}</small>
              </div>
            }
          </div>
        </section>

        <section class="review-filters" aria-label="Filtrar reseñas por calificación">
          <div class="filter-heading">
            <span class="eyebrow">Filtrar opiniones</span>
            @if (ratingFilter !== null) {
              <button type="button" (click)="ratingFilter = null">Limpiar</button>
            }
          </div>
          <div class="filter-options">
            <button type="button" [class.active]="ratingFilter === null" [attr.aria-pressed]="ratingFilter === null" (click)="ratingFilter = null">
              Todas <span>{{ summary.total }}</span>
            </button>
            @for (level of ratingLevels; track level) {
              <button type="button" [class.active]="ratingFilter === level" [attr.aria-pressed]="ratingFilter === level" (click)="ratingFilter = level">
                {{ level }} <app-icon name="star" size="11" fill="currentColor" />
                <span>{{ summary.distribution[level] }}</span>
              </button>
            }
          </div>
        </section>

        @if (eligibility?.canReview && !formOpen) {
          <section class="review-invitation">
            <div>
              <span class="eyebrow">Compra verificada</span>
              <h2>¿Qué te pareció este producto?</h2>
              <p>Tu experiencia ayuda a otros clientes a elegir mejor.</p>
            </div>
            <button type="button" class="primary-button" (click)="startCreate()">
              Escribir reseña
            </button>
          </section>
        } @else if (eligibility?.reason === 'purchase_required' && !formOpen) {
          <section class="eligibility-note">
            <app-icon name="shopping-cart" size="20" />
            <div>
              <strong>Reseñas de compras reales</strong>
              <p>Podrás calificar este producto cuando tu pedido aparezca como entregado o completado.</p>
            </div>
          </section>
        } @else if (eligibility?.reason === 'already_reviewed' && !formOpen) {
          <section class="eligibility-note success-note">
            <app-icon name="check" size="20" />
            <div>
              <strong>Ya compartiste tu experiencia</strong>
              <p>Puedes editar tu reseña desde la tarjeta marcada como “Tu reseña”.</p>
            </div>
          </section>
        }

        @if (formOpen) {
          <section class="review-form" id="review-form">
            <div class="form-heading">
              <div>
                <span class="eyebrow">{{ editingReviewId ? 'Editar reseña' : 'Nueva reseña' }}</span>
                <h2>Comparte tu experiencia</h2>
              </div>
              <button type="button" class="icon-button" (click)="cancelForm()" aria-label="Cerrar formulario">
                <app-icon name="x" size="18" />
              </button>
            </div>

            <label class="rating-label">Tu calificación</label>
            <div class="rating-picker" role="group" aria-label="Selecciona una calificación">
              @for (star of stars; track star) {
                <button
                  type="button"
                  (click)="rating = star"
                  (mouseenter)="hoveredRating = star"
                  (mouseleave)="hoveredRating = 0"
                  [attr.aria-label]="star + (star === 1 ? ' estrella' : ' estrellas')"
                  [class.selected]="star <= (hoveredRating || rating)"
                >
                  <app-icon
                    name="star"
                    size="28"
                    [fill]="star <= (hoveredRating || rating) ? 'currentColor' : 'none'"
                    color="var(--warning)"
                  />
                </button>
              }
              <span>{{ ratingLabel }}</span>
            </div>

            <label for="review-comment">Tu reseña</label>
            <textarea
              id="review-comment"
              [(ngModel)]="comment"
              rows="5"
              maxlength="1000"
              placeholder="Cuéntanos sobre la calidad, presentación o sabor del producto..."
            ></textarea>
            <div class="comment-meta">
              <span>Mínimo 10 caracteres</span>
              <span>{{ comment.length }}/1000</span>
            </div>

            <div class="form-actions">
              <button type="button" class="secondary-button" (click)="cancelForm()" [disabled]="saving">
                Cancelar
              </button>
              <button
                type="button"
                class="primary-button"
                (click)="submitReview()"
                [disabled]="saving || rating < 1 || comment.trim().length < 10"
              >
                @if (saving) {
                  <app-icon name="loader" size="15" className="app-icon-spin" color="currentColor" />
                  Guardando...
                } @else {
                  {{ editingReviewId ? 'Guardar cambios' : 'Publicar reseña' }}
                }
              </button>
            </div>
          </section>
        }

        </aside>

        <div class="reviews-content">
        @if (errorMessage) {
          <div class="feedback error" role="alert">{{ errorMessage }}</div>
        }

        <section class="reviews-section">
          <div class="list-heading">
            <div>
              <span class="eyebrow">Opiniones de clientes</span>
              <h2>Todas las reseñas</h2>
            </div>
            <span class="review-total">{{ filteredReviews.length }}</span>
          </div>

          @if (filteredReviews.length) {
            <div class="reviews-list">
              @for (review of filteredReviews; track review.id) {
                <article class="review-card" [class.own-review]="review.isMine">
                  <div class="review-header">
                    <div class="reviewer-avatar" aria-hidden="true">{{ reviewerInitial(review) }}</div>
                    <div class="reviewer-details">
                      <div class="reviewer-line">
                        <strong>{{ review.userName }}</strong>
                        @if (review.isMine) {
                          <span class="own-badge">Tu reseña</span>
                        }
                      </div>
                      <div class="review-stars" [attr.aria-label]="review.rating + ' de 5 estrellas'">
                        @for (star of stars; track star) {
                          <app-icon
                            name="star"
                            size="13"
                            [fill]="star <= review.rating ? 'currentColor' : 'none'"
                            color="var(--warning)"
                          />
                        }
                      </div>
                    </div>
                    <time [attr.datetime]="review.date.toISOString()">{{ review.date | date:'dd MMM yyyy' }}</time>
                  </div>

                  @if (review.verifiedPurchase) {
                    <div class="verified-badge">
                      <app-icon name="check" size="11" />
                      Compra verificada
                    </div>
                  }

                  <p class="review-comment">{{ review.comment }}</p>

                  @if (wasEdited(review)) {
                    <span class="edited-label">Editada</span>
                  }

                  @if (review.isMine || canModerate) {
                    <div class="review-actions">
                      @if (review.isMine) {
                        <button type="button" (click)="startEdit(review)">
                          <app-icon name="pencil" size="13" />
                          Editar
                        </button>
                      }
                      <button
                        type="button"
                        class="danger-action"
                        (click)="deleteReview(review)"
                        [disabled]="deletingId === review.id"
                      >
                        <app-icon [name]="deletingId === review.id ? 'loader' : 'trash'" size="13" [className]="deletingId === review.id ? 'app-icon-spin' : ''" />
                        {{ deletingId === review.id ? 'Eliminando...' : 'Eliminar' }}
                      </button>
                    </div>
                  }
                </article>
              }
            </div>
          } @else {
            <div class="empty-state">
              <div class="empty-icon"><app-icon name="star" size="30" /></div>
              <h3>{{ ratingFilter === null ? 'Aún no hay reseñas' : 'No hay reseñas con esta calificación' }}</h3>
              <p>{{ ratingFilter === null ? 'Sé la primera persona en compartir su experiencia con este producto.' : 'Prueba con otra cantidad de estrellas o muestra todas las opiniones.' }}</p>
            </div>
          }
        </section>
        </div>
        </div>
      }
    </main>
  `,
  styles: [`
    :host { display: block; min-height: 100dvh; background: var(--surface); }
    .reviews-page { width: min(760px, 100%); margin: 0 auto; padding: 20px 16px 96px; }
    .loading-state { min-height: 320px; display: grid; place-items: center; align-content: center; gap: 12px; color: var(--text-secondary); }
    .loading-state p { margin: 0; font-size: .9rem; font-weight: 700; }
    .reviews-summary { display: grid; grid-template-columns: 150px 1fr; gap: 28px; padding: 24px; background: var(--surface-raised); border: 1px solid var(--border); border-radius: 24px; box-shadow: 0 10px 30px rgba(25, 58, 43, .06); }
    .average-block { display: grid; place-items: center; align-content: center; border-right: 1px solid var(--border); }
    .average-block > strong { font-family: var(--font-heading); font-size: 3rem; line-height: 1; color: var(--text-primary); }
    .average-block > span { margin-top: 7px; color: var(--text-muted); font-size: .75rem; font-weight: 700; }
    .summary-stars, .review-stars { display: flex; align-items: center; gap: 1px; margin-top: 7px; }
    .rating-distribution { display: grid; gap: 7px; }
    .distribution-row { display: grid; grid-template-columns: 12px 18px 1fr 24px; align-items: center; gap: 4px; color: var(--text-secondary); font-size: .72rem; font-weight: 800; }
    .distribution-row small { text-align: right; color: var(--text-muted); }
    .distribution-track { height: 7px; overflow: hidden; border-radius: 99px; background: var(--border); }
    .distribution-track span { display: block; height: 100%; border-radius: inherit; background: var(--warning); transition: width .25s ease; }
    .review-filters { margin-top: 14px; padding: 16px; border: 1px solid var(--border); border-radius: 18px; background: var(--surface-raised); }
    .filter-heading { display: flex; align-items: center; justify-content: space-between; gap: 12px; margin-bottom: 10px; }
    .filter-heading button { border: 0; background: none; color: var(--primary); font-size: .7rem; font-weight: 900; cursor: pointer; }
    .filter-options { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 7px; }
    .filter-options button { min-height: 38px; display: flex; align-items: center; justify-content: center; gap: 4px; border: 1px solid var(--border); border-radius: 11px; background: var(--surface); color: var(--text-secondary); font-size: .72rem; font-weight: 900; cursor: pointer; }
    .filter-options button span { color: var(--text-muted); font-size: .64rem; }
    .filter-options button.active { border-color: var(--primary); background: var(--primary-alpha); color: var(--primary); }
    .feedback { margin-top: 14px; padding: 12px 14px; border-radius: 12px; font-size: .82rem; font-weight: 700; }
    .feedback.error { color: var(--danger); background: var(--danger-alpha); }
    .review-invitation, .eligibility-note, .review-form { margin-top: 18px; border-radius: 20px; }
    .review-invitation { display: flex; justify-content: space-between; align-items: center; gap: 20px; padding: 22px; color: #fff; background: linear-gradient(135deg, var(--primary), #1f5940); }
    .review-invitation h2, .review-form h2, .list-heading h2 { margin: 3px 0 4px; font-family: var(--font-heading); font-size: 1.2rem; }
    .review-invitation p, .eligibility-note p { margin: 0; font-size: .78rem; line-height: 1.5; opacity: .85; }
    .eyebrow { display: block; color: var(--text-muted); font-size: .66rem; font-weight: 900; letter-spacing: .08em; text-transform: uppercase; }
    .review-invitation .eyebrow { color: rgba(255,255,255,.72); }
    .eligibility-note { display: flex; align-items: flex-start; gap: 12px; padding: 16px; background: #fff8e8; color: #77581b; border: 1px solid #f1dfb3; }
    .eligibility-note strong { display: block; margin-bottom: 3px; font-size: .84rem; }
    .success-note { background: #edf8ef; border-color: #cfe6d4; color: #2e6940; }
    .primary-button, .secondary-button { min-height: 44px; border: 0; border-radius: 999px; padding: 0 20px; font-weight: 900; cursor: pointer; display: inline-flex; align-items: center; justify-content: center; gap: 7px; }
    .primary-button { background: var(--secondary); color: #fff; }
    .review-invitation .primary-button { flex-shrink: 0; background: #fff; color: var(--primary); }
    .primary-button:disabled, .secondary-button:disabled { opacity: .55; cursor: not-allowed; }
    .secondary-button { color: var(--text-primary); background: var(--surface-raised); border: 1px solid var(--border); }
    .review-form { padding: 22px; background: var(--surface-raised); border: 1px solid var(--border); box-shadow: 0 14px 34px rgba(20, 53, 38, .08); }
    .form-heading { display: flex; align-items: flex-start; justify-content: space-between; gap: 16px; }
    .form-heading h2 { color: var(--text-primary); }
    .icon-button { width: 36px; height: 36px; display: grid; place-items: center; border: 0; border-radius: 50%; background: var(--surface); cursor: pointer; }
    .rating-label, .review-form > label { display: block; margin: 20px 0 8px; color: var(--text-primary); font-size: .78rem; font-weight: 900; }
    .rating-picker { display: flex; align-items: center; gap: 2px; }
    .rating-picker button { width: 44px; height: 44px; display: grid; place-items: center; border: 0; padding: 0; background: transparent; cursor: pointer; transition: transform .15s; }
    .rating-picker button:hover, .rating-picker button.selected { transform: translateY(-2px); }
    .rating-picker > span { margin-left: 8px; color: var(--text-secondary); font-size: .8rem; font-weight: 800; }
    textarea { width: 100%; resize: vertical; min-height: 120px; padding: 14px; border: 1.5px solid var(--border); border-radius: 14px; outline: none; background: var(--surface); color: var(--text-primary); font: inherit; font-size: .88rem; line-height: 1.55; }
    textarea:focus { border-color: var(--primary); box-shadow: 0 0 0 3px rgba(43, 108, 75, .11); }
    .comment-meta { display: flex; justify-content: space-between; margin-top: 5px; color: var(--text-muted); font-size: .67rem; }
    .form-actions { display: flex; justify-content: flex-end; gap: 10px; margin-top: 18px; }
    .reviews-section { margin-top: 30px; }
    .list-heading { display: flex; align-items: center; justify-content: space-between; margin-bottom: 14px; padding: 0 3px; }
    .list-heading h2 { margin-bottom: 0; color: var(--text-primary); }
    .review-total { min-width: 34px; height: 34px; display: grid; place-items: center; padding: 0 8px; border-radius: 99px; background: var(--surface-raised); color: var(--text-secondary); font-size: .78rem; font-weight: 900; }
    .reviews-list { display: grid; gap: 12px; }
    .review-card { position: relative; padding: 18px; background: var(--surface-raised); border: 1px solid var(--border); border-radius: 18px; }
    .review-card.own-review { border-color: color-mix(in srgb, var(--primary) 45%, var(--border)); box-shadow: inset 3px 0 0 var(--primary); }
    .review-header { display: flex; align-items: center; gap: 11px; }
    .reviewer-avatar { width: 40px; height: 40px; flex: 0 0 40px; border-radius: 50%; background: var(--primary); color: #fff; display: grid; place-items: center; font-weight: 900; text-transform: uppercase; }
    .reviewer-details { min-width: 0; flex: 1; }
    .reviewer-line { display: flex; align-items: center; gap: 7px; }
    .reviewer-line strong { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; color: var(--text-primary); font-size: .86rem; }
    .own-badge { flex-shrink: 0; padding: 3px 7px; border-radius: 99px; background: var(--primary); color: #fff; font-size: .58rem; font-weight: 900; text-transform: uppercase; }
    .review-header time { color: var(--text-muted); font-size: .68rem; white-space: nowrap; }
    .verified-badge { display: inline-flex; align-items: center; gap: 4px; margin: 12px 0 0 51px; color: var(--success); font-size: .68rem; font-weight: 900; }
    .review-comment { margin: 13px 0 0; color: var(--text-primary); font-size: .86rem; line-height: 1.65; overflow-wrap: anywhere; white-space: pre-line; }
    .edited-label { display: inline-block; margin-top: 7px; color: var(--text-muted); font-size: .64rem; font-style: italic; }
    .review-actions { display: flex; justify-content: flex-end; gap: 8px; margin-top: 13px; padding-top: 11px; border-top: 1px solid var(--border); }
    .review-actions button { display: inline-flex; align-items: center; gap: 5px; border: 0; border-radius: 9px; padding: 7px 10px; background: var(--surface); color: var(--text-secondary); font-size: .7rem; font-weight: 800; cursor: pointer; }
    .review-actions .danger-action { color: var(--danger); }
    .review-actions button:disabled { opacity: .55; cursor: wait; }
    .empty-state { padding: 48px 24px; display: grid; place-items: center; text-align: center; border: 1px dashed var(--border); border-radius: 20px; background: var(--surface-raised); }
    .empty-icon { width: 66px; height: 66px; display: grid; place-items: center; border-radius: 50%; background: #fff7dc; color: var(--warning); }
    .empty-state h3 { margin: 14px 0 5px; color: var(--text-primary); font-size: 1rem; }
    .empty-state p { max-width: 350px; margin: 0; color: var(--text-secondary); font-size: .8rem; line-height: 1.5; }

    @media (min-width: 1024px) {
      :host { background: var(--bg); }
      .reviews-page { width: min(1180px, 100%); padding: 36px 28px 110px; }
      .reviews-layout { display: grid; grid-template-columns: minmax(320px, 360px) minmax(0, 760px); justify-content: center; align-items: start; gap: 32px; }
      .reviews-sidebar { display: flex; flex-direction: column; min-width: 0; }
      .reviews-summary { grid-template-columns: 112px minmax(0, 1fr); gap: 18px; padding: 22px 18px; border-radius: 20px; box-shadow: var(--shadow-sm, 0 8px 24px rgba(25, 58, 43, .06)); }
      .average-block > strong { font-size: 2.6rem; }
      .review-filters { margin-top: 14px; }
      .review-invitation { align-items: stretch; flex-direction: column; margin-top: 14px; }
      .review-invitation .primary-button { width: 100%; }
      .eligibility-note, .review-form { margin-top: 14px; }
      .review-form { padding: 20px; }
      .rating-picker { flex-wrap: wrap; }
      .rating-picker button { width: 40px; }
      .rating-picker > span { flex-basis: 100%; margin: 4px 0 0; }
      .form-actions { display: grid; grid-template-columns: 1fr 1fr; }
      .reviews-content { min-width: 0; }
      .reviews-section { margin-top: 0; }
      .feedback { margin: 0 0 14px; }
      .review-card { padding: 22px; }
    }

    @media (max-width: 560px) {
      .reviews-page { padding-inline: 12px; }
      .reviews-summary { grid-template-columns: 112px 1fr; gap: 16px; padding: 18px 14px; border-radius: 18px; }
      .average-block > strong { font-size: 2.45rem; }
      .review-invitation { align-items: stretch; flex-direction: column; }
      .review-invitation .primary-button { width: 100%; }
      .form-actions { display: grid; grid-template-columns: 1fr 1fr; }
      .review-form { padding: 18px 14px; }
      .rating-picker button { width: 39px; }
      .rating-picker > span { display: none; }
      .review-card { padding: 15px; }
      .review-header time { align-self: flex-start; }
    }
  `],
})
export class ProductReviews implements OnInit {
  private route = inject(ActivatedRoute);
  private productService = inject(ProductService);
  private authService = inject(AuthService);
  private alerts = inject(AlertService);
  private changeDetector = inject(ChangeDetectorRef);

  readonly stars = [1, 2, 3, 4, 5];
  readonly ratingLevels = [5, 4, 3, 2, 1] as const;

  productId = '';
  reviews: ProductReview[] = [];
  summary: ReviewSummary = EMPTY_SUMMARY;
  eligibility: ReviewEligibility | null = null;
  loading = true;
  saving = false;
  deletingId: string | null = null;
  errorMessage = '';

  formOpen = false;
  editingReviewId: string | null = null;
  rating = 5;
  hoveredRating = 0;
  comment = '';
  ratingFilter: 1 | 2 | 3 | 4 | 5 | null = null;

  get roundedAverage(): number {
    return Math.round(this.summary.average);
  }

  get canModerate(): boolean {
    return ['admin', 'manager'].includes(this.authService.user()?.role ?? '');
  }

  get ratingLabel(): string {
    return ['', 'Muy malo', 'Malo', 'Regular', 'Bueno', 'Excelente'][this.rating] ?? '';
  }

  get filteredReviews(): ProductReview[] {
    return this.ratingFilter === null
      ? this.reviews
      : this.reviews.filter((review) => review.rating === this.ratingFilter);
  }

  ngOnInit(): void {
    this.route.params.subscribe((params) => {
      this.productId = params['id'];
      this.cancelForm();
      this.loadReviews();
    });
  }

  distributionPercent(level: 1 | 2 | 3 | 4 | 5): number {
    if (!this.summary.total) return 0;
    return (this.summary.distribution[level] / this.summary.total) * 100;
  }

  reviewerInitial(review: ProductReview): string {
    return review.userName.trim().charAt(0) || 'C';
  }

  wasEdited(review: ProductReview): boolean {
    return review.updatedAt.getTime() - review.date.getTime() > 1000;
  }

  startCreate(): void {
    this.editingReviewId = null;
    this.rating = 5;
    this.comment = '';
    this.errorMessage = '';
    this.formOpen = true;
  }

  startEdit(review: ProductReview): void {
    this.editingReviewId = review.id;
    this.rating = review.rating;
    this.comment = review.comment;
    this.errorMessage = '';
    this.formOpen = true;
  }

  cancelForm(): void {
    this.formOpen = false;
    this.editingReviewId = null;
    this.rating = 5;
    this.hoveredRating = 0;
    this.comment = '';
  }

  submitReview(): void {
    const comment = this.comment.trim();
    if (this.saving || this.rating < 1 || comment.length < 10) return;

    this.saving = true;
    this.errorMessage = '';
    const request = this.editingReviewId
      ? this.productService.updateReview(this.editingReviewId, { rating: this.rating, comment })
      : this.productService.createReview(this.productId, { rating: this.rating, comment });

    request.subscribe({
      next: () => {
        this.saving = false;
        this.alerts.show('success', 'Reseña guardada', this.editingReviewId
          ? 'Tus cambios se publicaron correctamente.'
          : 'Gracias por compartir tu experiencia.');
        this.cancelForm();
        this.loadReviews(false);
        this.changeDetector.markForCheck();
      },
      error: (error) => {
        this.saving = false;
        this.errorMessage = error.error?.error || 'No se pudo guardar la reseña.';
        this.changeDetector.markForCheck();
      },
    });
  }

  deleteReview(review: ProductReview): void {
    if (this.deletingId || !window.confirm('¿Quieres eliminar esta reseña? Esta acción no se puede deshacer.')) return;

    this.deletingId = review.id;
    this.errorMessage = '';
    this.productService.deleteReview(review.id).subscribe({
      next: () => {
        this.deletingId = null;
        this.alerts.show('success', 'Reseña eliminada', 'La reseña dejó de mostrarse en el producto.');
        this.cancelForm();
        this.loadReviews(false);
        this.changeDetector.markForCheck();
      },
      error: (error) => {
        this.deletingId = null;
        this.errorMessage = error.error?.error || 'No se pudo eliminar la reseña.';
        this.changeDetector.markForCheck();
      },
    });
  }

  private loadReviews(showLoader = true): void {
    if (showLoader) this.loading = true;
    this.errorMessage = '';
    this.productService.getReviews(this.productId).subscribe({
      next: (result) => {
        this.reviews = result.reviews;
        this.summary = result.summary;
        this.eligibility = result.eligibility;
        this.loading = false;
        this.changeDetector.markForCheck();
      },
      error: (error) => {
        this.loading = false;
        this.errorMessage = error.error?.error || 'No se pudieron cargar las reseñas.';
        this.changeDetector.markForCheck();
      },
    });
  }
}
