import { Product, ProductVariant } from './product.model';

export interface CartItem {
  id: string;
  product: Product;
  selectedVariant?: ProductVariant;
  quantity: number;
}

export interface Cart {
  items: CartItem[];
  subtotal: number;
  discount: number;
  shipping: number;
  total: number;
  couponCode?: string;
  couponValid?: boolean;
}

export interface CouponValidation {
  code: string;
  valid: boolean;
  discountPercent?: number;
  discountAmount?: number;
  message: string;
}
