import { Injectable, signal, computed } from '@angular/core';
import { Order, OrderStatus, PaymentMethod, ShippingMethod, SavedPaymentMethod } from '../models/order.model';
import { CartItem } from '../models/cart.model';
import { Address } from '../models/address.model';

const MOCK_PRODUCTS = {
  manzana: {
    id: 'prod-1', name: 'Manzana Roja (kg)', description: 'Manzanas rojas frescas de temporada, ideales para toda la familia.',
    price: 45.90, originalPrice: 54.90, images: [], category: 'Frutas y Verduras', categoryId: 'cat-1',
    rating: 4.5, reviewCount: 28, inStock: true, stockQuantity: 50, tags: ['oferta', 'fresco']
  },
  leche: {
    id: 'prod-2', name: 'Leche Entera 1L', description: 'Leche fresca pasteurizada, rica en calcio y vitaminas.',
    price: 28.50, images: [], category: 'Lácteos', categoryId: 'cat-2',
    rating: 4.8, reviewCount: 45, inStock: true, stockQuantity: 100
  },
  pollo: {
    id: 'prod-3', name: 'Pechuga de Pollo (kg)', description: 'Pechuga de pollo sin hueso, fresca y de la mejor calidad.',
    price: 129.90, images: [], category: 'Carnes', categoryId: 'cat-3',
    rating: 4.3, reviewCount: 19, inStock: true, stockQuantity: 30
  },
  pan: {
    id: 'prod-4', name: 'Pan Bimbo Grande', description: 'Pan de caja blanco, suave y fresco para toda la familia.',
    price: 62.00, images: [], category: 'Panadería', categoryId: 'cat-4',
    rating: 4.1, reviewCount: 33, inStock: true, stockQuantity: 40
  },
  coca: {
    id: 'prod-5', name: 'Coca-Cola 2L', description: 'Refresco de cola, perfecto para acompañar tus comidas.',
    price: 35.00, originalPrice: 39.00, images: [], category: 'Bebidas', categoryId: 'cat-5',
    rating: 4.7, reviewCount: 67, inStock: true, stockQuantity: 200
  },
  platano: {
    id: 'prod-8', name: 'Plátano (kg)', description: 'Plátanos maduros, ricos en potasio y fibra natural.',
    price: 22.90, images: [], category: 'Frutas y Verduras', categoryId: 'cat-1',
    rating: 4.2, reviewCount: 31, inStock: true, stockQuantity: 80
  }
};

const INITIAL_ORDERS: Order[] = [
  {
    id: 'ORD-001',
    items: [
      { id: 'ci1', product: MOCK_PRODUCTS.leche, quantity: 1 },
      { id: 'ci2', product: MOCK_PRODUCTS.pan, quantity: 2 },
      { id: 'ci3', product: MOCK_PRODUCTS.pollo, quantity: 1 }
    ],
    status: 'delivered',
    shippingAddress: { 
      id: 'a1', 
      label: 'Casa', 
      fullName: 'Carlos Hernández', 
      street: 'Calle Guillermo Prieto', 
      exteriorNumber: '7', 
      neighborhood: 'San Jose', 
      city: 'CDMX', 
      state: 'CDMX', 
      zipCode: '06000', 
      phone: '+52 555 123 4567', 
      isDefault: true,
      notes: 'Casa verde turquesa con enrejado blanco, de un piso.'
    },
    shippingMethod: 'standard',
    paymentMethod: 'card',
    subtotal: 282.40,
    discount: 28.24,
    shippingCost: 0,
    total: 254.16,
    trackingNumber: 'TRK-ABC123',
    createdAt: new Date('2026-05-10T12:00:00Z'),
    updatedAt: new Date('2026-05-12T14:30:00Z'),
  },
  {
    id: 'ORD-002',
    items: [
      { id: 'ci4', product: MOCK_PRODUCTS.manzana, quantity: 2 },
      { id: 'ci5', product: MOCK_PRODUCTS.platano, quantity: 3 },
      { id: 'ci6', product: MOCK_PRODUCTS.coca, quantity: 1 }
    ],
    status: 'shipped',
    shippingAddress: { 
      id: 'a1', 
      label: 'Casa', 
      fullName: 'Carlos Hernández', 
      street: 'Calle Guillermo Prieto', 
      exteriorNumber: '7', 
      neighborhood: 'San Jose', 
      city: 'CDMX', 
      state: 'CDMX', 
      zipCode: '06000', 
      phone: '+52 555 123 4567', 
      isDefault: true,
      notes: 'Casa verde turquesa con enrejado blanco, de un piso.'
    },
    shippingMethod: 'express',
    paymentMethod: 'transfer',
    subtotal: 175.50,
    discount: 0,
    shippingCost: 35.00,
    total: 210.50,
    trackingNumber: 'TRK-DEF456',
    estimatedDelivery: new Date('2026-06-10T18:00:00Z'),
    createdAt: new Date('2026-06-09T09:15:00Z'),
    updatedAt: new Date('2026-06-09T11:00:00Z'),
  },
];

@Injectable({ providedIn: 'root' })
export class OrderService {
  private ordersSignal = signal<Order[]>([]);

  readonly allOrders = computed(() => this.ordersSignal());

  constructor() {
    this.loadFromStorage();
  }

  private loadFromStorage(): void {
    const storedOrders = localStorage.getItem('admin_orders');
    if (storedOrders) {
      // Parse dates properly
      const parsed: Order[] = JSON.parse(storedOrders).map((o: any) => ({
        ...o,
        createdAt: new Date(o.createdAt),
        updatedAt: new Date(o.updatedAt),
        estimatedDelivery: o.estimatedDelivery ? new Date(o.estimatedDelivery) : undefined,
      }));
      // Reset to initial if they don't have items (older format)
      const hasEmptyItems = parsed.some((o: any) => !o.items || o.items.length === 0);
      if (hasEmptyItems) {
        this.ordersSignal.set(INITIAL_ORDERS);
        this.saveToStorage();
      } else {
        this.ordersSignal.set(parsed);
      }
    } else {
      this.ordersSignal.set(INITIAL_ORDERS);
      this.saveToStorage();
    }
  }

  private saveToStorage(): void {
    localStorage.setItem('admin_orders', JSON.stringify(this.ordersSignal()));
  }

  getOrders(): Order[] {
    return this.ordersSignal();
  }

  getOrderById(id: string): Order | undefined {
    return this.ordersSignal().find((o) => o.id === id);
  }

  createOrder(items: CartItem[], address: Address, shippingMethod: ShippingMethod, paymentMethod: PaymentMethod, subtotal: number, discount: number, shippingCost: number, total: number): Order {
    const order: Order = {
      id: `ORD-${String(this.ordersSignal().length + 1).padStart(3, '0')}`,
      items,
      status: 'pending',
      shippingAddress: address,
      shippingMethod,
      paymentMethod,
      subtotal,
      discount,
      shippingCost,
      total,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.ordersSignal.set([order, ...this.ordersSignal()]);
    this.saveToStorage();
    return order;
  }

  cancelOrder(orderId: string): boolean {
    const updated = this.ordersSignal().map((o) =>
      o.id === orderId ? { ...o, status: 'cancelled' as OrderStatus, updatedAt: new Date() } : o
    );
    this.ordersSignal.set(updated);
    this.saveToStorage();
    return true;
  }

  getStatusLabel(status: OrderStatus): string {
    const labels: Record<OrderStatus, string> = {
      pending: 'Pendiente',
      preparing: 'Preparando',
      shipped: 'En camino',
      delivered: 'Entregado',
      cancelled: 'Cancelado',
      refunded: 'Reembolsado',
    };
    return labels[status];
  }

  getStatusSteps(): { key: OrderStatus; label: string }[] {
    return [
      { key: 'pending', label: 'Pendiente' },
      { key: 'preparing', label: 'Preparando' },
      { key: 'shipped', label: 'En camino' },
      { key: 'delivered', label: 'Entregado' },
    ];
  }

  // --- Admin Methods ---

  updateOrderStatus(orderId: string, status: OrderStatus, trackingNumber?: string, estimatedDelivery?: Date): void {
    const updated = this.ordersSignal().map((o) => {
      if (o.id === orderId) {
        return {
          ...o,
          status,
          trackingNumber: trackingNumber !== undefined ? trackingNumber : o.trackingNumber,
          estimatedDelivery: estimatedDelivery !== undefined ? estimatedDelivery : o.estimatedDelivery,
          updatedAt: new Date(),
        };
      }
      return o;
    });
    this.ordersSignal.set(updated);
    this.saveToStorage();
  }

  updateOrder(order: Order): void {
    this.ordersSignal.set(this.ordersSignal().map((o) => (o.id === order.id ? order : o)));
    this.saveToStorage();
  }
}
