import { HttpClient } from '@angular/common/http';
import { Injectable, signal, computed, inject } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { API_BASE_URL } from '../api.config';
import { Cart, CartItem, CouponValidation } from '../models/cart.model';
import { Product, ProductVariant } from '../models/product.model';
import { AlertService } from './alert.service';

interface ApiPromotion {
  id: string;
  name: string;
  description?: string | null;
  discount_pct?: string | number | null;
  discount_fixed?: string | number | null;
  valid_from?: string | null;
  valid_until?: string | null;
  active?: boolean | null;
}

@Injectable({ providedIn: 'root' })
export class CartService {
  private http = inject(HttpClient);
  private cartItems = signal<CartItem[]>([]);
  private appliedCoupon = signal<CouponValidation | null>(null);
  private shippingQuote = signal(0);
  private alertService = inject(AlertService);

  readonly items = computed(() => this.cartItems());
  readonly itemCount = computed(() => this.cartItems().reduce((sum, item) => sum + item.quantity, 0));
  readonly coupon = computed(() => this.appliedCoupon());

  readonly cart = computed<Cart>(() => {
    const items = this.cartItems();
    const subtotal = items.reduce((sum, item) => {
      const price = item.selectedVariant?.priceModifier
        ? item.product.price + item.selectedVariant.priceModifier
        : item.product.price;
      return sum + price * item.quantity;
    }, 0);

    const coupon = this.appliedCoupon();
    const discount = coupon?.valid
      ? coupon.discountPercent
        ? subtotal * (coupon.discountPercent / 100)
        : coupon.discountAmount ?? 0
      : 0;

    const shipping = this.shippingQuote();
    const total = subtotal - discount + shipping;

    return {
      items,
      subtotal,
      discount,
      shipping,
      total: Math.max(0, total),
      couponCode: coupon?.code,
      couponValid: coupon?.valid,
    };
  });

  addItem(product: Product, quantity: number = 1, variant?: ProductVariant): void {
    const current = this.cartItems();
    const existingIndex = current.findIndex(
      (item) => item.product.id === product.id && item.selectedVariant?.id === variant?.id
    );

    if (existingIndex >= 0) {
      const updated = [...current];
      updated[existingIndex] = { ...updated[existingIndex], quantity: updated[existingIndex].quantity + quantity };
      this.cartItems.set(updated);
    } else {
      const newItem: CartItem = {
        id: `cart-${Date.now()}`,
        product,
        selectedVariant: variant,
        quantity,
      };
      this.cartItems.set([...current, newItem]);
    }

    this.alertService.show('success', 'Producto Agregado', `${product.name} se agrego a tu carrito.`);
  }

  removeItem(itemId: string, silent: boolean = false): void {
    const currentItems = this.cartItems();
    const itemToRemove = currentItems.find(i => i.id === itemId);

    this.cartItems.set(currentItems.filter((item) => item.id !== itemId));

    if (!silent && itemToRemove) {
      this.alertService.show('info', 'Producto Eliminado', `${itemToRemove.product.name} fue retirado del carrito.`);
    }
  }

  updateQuantity(itemId: string, quantity: number): void {
    if (quantity <= 0) {
      this.removeItem(itemId);
      return;
    }
    const updated = this.cartItems().map((item) => (item.id === itemId ? { ...item, quantity } : item));
    this.cartItems.set(updated);
  }

  async applyCoupon(code: string): Promise<CouponValidation> {
    const normalizedCode = code.trim().toUpperCase();
    const invalid = (message = 'Cupon invalido o expirado'): CouponValidation => ({
      code: normalizedCode,
      valid: false,
      message,
    });

    try {
      const promotions = await firstValueFrom(this.http.get<ApiPromotion[]>(`${API_BASE_URL}/promotions`));
      const promotion = promotions.find((promo) => promo.name.trim().toUpperCase() === normalizedCode);
      const result = promotion && this.isPromotionValid(promotion)
        ? this.mapPromotionToCoupon(promotion, normalizedCode)
        : invalid();

      this.appliedCoupon.set(result.valid ? result : null);
      this.alertService.show(result.valid ? 'success' : 'error', result.valid ? 'Cupon Aplicado' : 'Error de Cupon', result.message);
      return result;
    } catch {
      const result = invalid('No se pudo validar el cupon con el servidor.');
      this.appliedCoupon.set(null);
      this.alertService.show('error', 'Error de Cupon', result.message);
      return result;
    }
  }

  removeCoupon(): void {
    this.appliedCoupon.set(null);
    this.alertService.show('warning', 'Cupon Removido', 'Se ha eliminado el cupon de tu carrito.');
  }

  clearCart(): void {
    this.cartItems.set([]);
    this.appliedCoupon.set(null);
    this.shippingQuote.set(0);
    this.alertService.show('info', 'Carrito Vaciado', 'Se han eliminado todos los productos.');
  }

  setShipping(amount: number): void {
    this.shippingQuote.set(Math.max(0, Number(amount) || 0));
  }

  private isPromotionValid(promotion: ApiPromotion): boolean {
    const now = new Date();
    const startsOk = !promotion.valid_from || new Date(promotion.valid_from) <= now;
    const endsOk = !promotion.valid_until || new Date(promotion.valid_until) >= now;
    return promotion.active !== false && startsOk && endsOk;
  }

  private mapPromotionToCoupon(promotion: ApiPromotion, code: string): CouponValidation {
    const discountPercent = promotion.discount_pct == null ? undefined : Number(promotion.discount_pct);
    const discountAmount = promotion.discount_fixed == null ? undefined : Number(promotion.discount_fixed);
    return {
      code,
      valid: true,
      discountPercent: discountPercent && discountPercent > 0 ? discountPercent : undefined,
      discountAmount: discountAmount && discountAmount > 0 ? discountAmount : undefined,
      message: promotion.description || 'Promocion aplicada correctamente.',
    };
  }
}
