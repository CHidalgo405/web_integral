import { CartItem } from './cart.model';
import { Address } from './address.model';

export type OrderStatus = 'pending' | 'preparing' | 'shipped' | 'delivered' | 'cancelled' | 'refunded';

export type PaymentMethod = 'card' | 'cash' | 'transfer';

export type ShippingMethod = 'standard' | 'express' | 'pickup';

export interface Order {
  id: string;
  items: CartItem[];
  status: OrderStatus;
  shippingAddress: Address;
  shippingMethod: ShippingMethod;
  paymentMethod: PaymentMethod;
  subtotal: number;
  discount: number;
  shippingCost: number;
  total: number;
  trackingNumber?: string;
  estimatedDelivery?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface CardDetails {
  number: string;
  holderName: string;
  expiry: string;
  cvv: string;
}

export interface SavedPaymentMethod {
  id: string;
  type: PaymentMethod;
  label: string;
  last4?: string;
  isDefault: boolean;
}
