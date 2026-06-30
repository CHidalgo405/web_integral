import { HttpClient } from '@angular/common/http';
import { Injectable, computed, inject, signal } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { API_BASE_URL } from '../api.config';
import { Order, OrderStatus, PaymentMethod, ShippingMethod } from '../models/order.model';
import { CartItem } from '../models/cart.model';
import { Address } from '../models/address.model';
import { Product } from '../models/product.model';

interface ApiPurchase {
  id: string;
  customer_name?: string | null;
  delivery_method: 'on_spot' | 'home_delivery' | 'pickup';
  delivery_address?: string | null;
  payment_method: 'cash' | 'card';
  status: 'pending' | 'completed' | 'cancelled';
  subtotal: string | number;
  discount_total: string | number;
  delivery_fee: string | number;
  total: string | number;
  created_at: string;
}

interface ApiPurchaseItem {
  id: string;
  inventory_id: string;
  inventory_name: string;
  sku?: string | null;
  quantity: number;
  unit_price: string | number;
  line_total: string | number;
}

@Injectable({ providedIn: 'root' })
export class OrderService {
  private http = inject(HttpClient);
  private ordersSignal = signal<Order[]>([]);

  readonly allOrders = computed(() => this.ordersSignal());
  readonly lastError = signal<string | null>(null);
  readonly isLoading = signal(false);

  constructor() {
    this.refresh();
  }

  refresh(): void {
    this.isLoading.set(true);
    this.http.get<ApiPurchase[]>(`${API_BASE_URL}/purchases`).subscribe({
      next: (rows) => {
        const orders = rows.map((row) => this.mapPurchase(row));
        this.ordersSignal.set(orders);
        this.isLoading.set(false);
        this.lastError.set(null);
        orders.forEach((order) => this.loadItems(order.id));
      },
      error: () => {
        this.lastError.set('No se pudo cargar el historial de pedidos.');
        this.ordersSignal.set([]);
        this.isLoading.set(false);
      },
    });
  }

  getOrders(): Order[] {
    return this.ordersSignal();
  }

  getOrderById(id: string): Order | undefined {
    return this.ordersSignal().find((o) => o.id === id);
  }

  loadItems(orderId: string): void {
    this.http.get<ApiPurchaseItem[]>(`${API_BASE_URL}/purchases/${orderId}/items`).subscribe({
      next: (items) => {
        this.ordersSignal.set(
          this.ordersSignal().map((order) =>
            order.id === orderId ? { ...order, items: items.map((item) => this.mapPurchaseItem(item)) } : order,
          ),
        );
      },
      error: () => this.lastError.set('No se pudieron cargar los productos del pedido.'),
    });
  }

  async createOrder(
    items: CartItem[],
    address: Address,
    shippingMethod: ShippingMethod,
    paymentMethod: PaymentMethod,
    subtotal: number,
    discount: number,
    shippingCost: number,
    total: number,
  ): Promise<Order> {
    if (paymentMethod === 'transfer') {
      throw new Error('La transferencia bancaria aun no esta disponible para pedidos conectados al servidor.');
    }

    const payload = {
      delivery_method: this.toApiShippingMethod(shippingMethod),
      delivery_address: this.formatAddress(address),
      delivery_fee: shippingCost,
      payment_method: paymentMethod,
      status: 'completed',
      subtotal,
      discount_total: discount,
      total,
      notes: `Cliente: ${address.fullName}. Telefono: ${address.phone}`,
      items: items.map((item) => ({
        inventory_id: item.product.id,
        quantity: item.quantity,
        unit_price: item.product.price,
        discount_pct: 0,
        line_total: item.product.price * item.quantity,
      })),
    };

    const created = await firstValueFrom(this.http.post<ApiPurchase>(`${API_BASE_URL}/purchases`, payload));
    const order: Order = {
      ...this.mapPurchase(created),
      items,
      shippingAddress: address,
      shippingMethod,
      paymentMethod,
    };
    this.ordersSignal.set([order, ...this.ordersSignal()]);
    this.lastError.set(null);
    return order;
  }

  cancelOrder(orderId: string): boolean {
    this.updateOrderStatus(orderId, 'cancelled');
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

  updateOrderStatus(orderId: string, status: OrderStatus, trackingNumber?: string, estimatedDelivery?: Date): void {
    const apiStatus = this.toApiStatus(status);
    this.http.patch<ApiPurchase>(`${API_BASE_URL}/purchases/${orderId}/status`, { status: apiStatus }).subscribe({
      next: () => {
        const updated = this.ordersSignal().map((o) =>
          o.id === orderId
            ? { ...o, status, trackingNumber: trackingNumber ?? o.trackingNumber, estimatedDelivery: estimatedDelivery ?? o.estimatedDelivery, updatedAt: new Date() }
            : o,
        );
        this.ordersSignal.set(updated);
      },
      error: () => this.lastError.set('No se pudo actualizar el estado del pedido.'),
    });
  }

  updateOrder(order: Order): void {
    this.ordersSignal.set(this.ordersSignal().map((o) => (o.id === order.id ? order : o)));
  }

  private mapPurchase(row: ApiPurchase): Order {
    const createdAt = new Date(row.created_at);
    return {
      id: row.id,
      items: [],
      status: this.fromApiStatus(row.status),
      shippingAddress: this.addressFromPurchase(row),
      shippingMethod: this.fromApiShippingMethod(row.delivery_method),
      paymentMethod: row.payment_method,
      subtotal: Number(row.subtotal),
      discount: Number(row.discount_total),
      shippingCost: Number(row.delivery_fee),
      total: Number(row.total),
      createdAt,
      updatedAt: createdAt,
    };
  }

  private mapPurchaseItem(item: ApiPurchaseItem): CartItem {
    const product: Product = {
      id: item.inventory_id,
      name: item.inventory_name,
      description: item.sku ? `SKU ${item.sku}` : 'Producto del pedido',
      price: Number(item.unit_price),
      images: ['assets/images/productos/placeholder.png'],
      category: 'Pedido',
      categoryId: '',
      rating: 0,
      reviewCount: 0,
      inStock: true,
      stockQuantity: 0,
    };

    return {
      id: item.id,
      product,
      quantity: Number(item.quantity),
    };
  }

  private addressFromPurchase(row: ApiPurchase): Address {
    return {
      id: row.id,
      label: row.delivery_method === 'pickup' || row.delivery_method === 'on_spot' ? 'Tienda' : 'Entrega',
      fullName: row.customer_name ?? 'Cliente',
      street: row.delivery_address ?? '',
      exteriorNumber: '',
      neighborhood: '',
      city: '',
      state: '',
      zipCode: '',
      phone: '',
      isDefault: false,
    };
  }

  private toApiShippingMethod(method: ShippingMethod): 'home_delivery' | 'pickup' {
    return method === 'pickup' ? 'pickup' : 'home_delivery';
  }

  private fromApiShippingMethod(method: ApiPurchase['delivery_method']): ShippingMethod {
    return method === 'pickup' || method === 'on_spot' ? 'pickup' : 'standard';
  }

  private toApiStatus(status: OrderStatus): 'pending' | 'completed' | 'cancelled' {
    if (status === 'cancelled' || status === 'refunded') return 'cancelled';
    if (status === 'pending' || status === 'preparing' || status === 'shipped') return 'pending';
    return 'completed';
  }

  private fromApiStatus(status: ApiPurchase['status']): OrderStatus {
    if (status === 'cancelled') return 'cancelled';
    if (status === 'pending') return 'pending';
    return 'delivered';
  }

  private formatAddress(address: Address): string {
    return `${address.street} ${address.exteriorNumber}${address.interiorNumber ? ', ' + address.interiorNumber : ''}, ${address.neighborhood}, ${address.city}, ${address.state} ${address.zipCode}`;
  }
}
