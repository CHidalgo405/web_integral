import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject, signal } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { API_BASE_URL } from '../api.config';

export interface CashierProduct {
  id: string;
  name: string;
  sku?: string | null;
  description?: string | null;
  category_id?: string | null;
  category?: string | null;
  price: number;
  stock: number;
  active: boolean;
}

export interface CashierCustomer {
  id: string;
  name: string;
  phone?: string | null;
  email?: string | null;
  address?: string | null;
}

export interface RegisterStatus {
  is_open: boolean;
  shift: 'morning' | 'afternoon' | null;
  opened_at: string | null;
  opening_amount: number;
  expected_cash: number;
  sales_count: number;
  sales_total: number;
  last_close?: {
    expected_amount: string | number;
    counted_amount: string | number;
    difference: string | number;
    created_at: string;
  } | null;
}

export interface PosSaleItem {
  id: string;
  inventory_id: string;
  inventory_name: string;
  sku?: string | null;
  quantity: number;
  unit_price: number;
  line_total: number;
}

export interface PosSale {
  id: string;
  customer_id?: string | null;
  customer_name?: string | null;
  employee_id: string;
  payment_method: 'cash' | 'card';
  status: string;
  subtotal: number;
  total: number;
  cash_tendered?: number | null;
  change_given?: number | null;
  created_at: string;
  items?: PosSaleItem[];
}

@Injectable({ providedIn: 'root' })
export class CashierService {
  private http = inject(HttpClient);

  readonly status = signal<RegisterStatus | null>(null);
  readonly products = signal<CashierProduct[]>([]);
  readonly customers = signal<CashierCustomer[]>([]);
  readonly sales = signal<PosSale[]>([]);
  readonly loading = signal(false);
  readonly error = signal('');

  async loadWorkspace(date = this.today()): Promise<void> {
    this.loading.set(true);
    this.error.set('');
    try {
      const [status, products, customers, sales] = await Promise.all([
        firstValueFrom(this.http.get<RegisterStatus>(`${API_BASE_URL}/cash-register/status`)),
        firstValueFrom(this.http.get<CashierProduct[]>(`${API_BASE_URL}/inventory`, { params: { active: 'true' } })),
        firstValueFrom(this.http.get<CashierCustomer[]>(`${API_BASE_URL}/customers`)),
        firstValueFrom(this.http.get<PosSale[]>(`${API_BASE_URL}/purchases`, { params: { date } })),
      ]);
      this.status.set(status);
      this.products.set(products.map((product) => this.normalizeProduct(product)));
      this.customers.set(customers);
      this.sales.set(sales.map((sale) => this.normalizeSale(sale)));
    } catch (err: any) {
      this.error.set(err?.error?.error || 'No se pudo cargar el espacio de caja.');
    } finally {
      this.loading.set(false);
    }
  }

  async refreshStatus(): Promise<void> {
    this.status.set(await firstValueFrom(this.http.get<RegisterStatus>(`${API_BASE_URL}/cash-register/status`)));
  }

  async loadProducts(): Promise<void> {
    const products = await firstValueFrom(
      this.http.get<CashierProduct[]>(`${API_BASE_URL}/inventory`, { params: { active: 'true' } }),
    );
    this.products.set(products.map((product) => this.normalizeProduct(product)));
  }

  async loadSales(date = this.today()): Promise<void> {
    const params = new HttpParams().set('date', date);
    const sales = await firstValueFrom(this.http.get<PosSale[]>(`${API_BASE_URL}/purchases`, { params }));
    this.sales.set(sales.map((sale) => this.normalizeSale(sale)));
  }

  async openRegister(openingAmount: number, shift: 'morning' | 'afternoon'): Promise<void> {
    await firstValueFrom(
      this.http.post(`${API_BASE_URL}/cash-register/open`, { opening_amount: openingAmount, shift }),
    );
    await this.refreshStatus();
  }

  async closeRegister(countedAmount: number): Promise<any> {
    const result = await firstValueFrom(
      this.http.post(`${API_BASE_URL}/cash-register/close`, { counted_amount: countedAmount }),
    );
    await this.refreshStatus();
    return result;
  }

  async findByBarcode(barcode: string): Promise<CashierProduct> {
    const product = await firstValueFrom(
      this.http.get<CashierProduct>(`${API_BASE_URL}/inventory/barcode/${encodeURIComponent(barcode)}`),
    );
    return this.normalizeProduct(product);
  }

  async createCustomer(customer: Omit<CashierCustomer, 'id'>): Promise<CashierCustomer> {
    const created = await firstValueFrom(this.http.post<CashierCustomer>(`${API_BASE_URL}/customers`, customer));
    this.customers.update((customers) => [...customers, created].sort((a, b) => a.name.localeCompare(b.name)));
    return created;
  }

  async createSale(payload: {
    items: { inventory_id: string; quantity: number }[];
    customer_id?: string | null;
    payment_method: 'cash' | 'card';
    cash_tendered?: number | null;
    notes?: string;
  }): Promise<PosSale> {
    const response = await firstValueFrom(this.http.post<PosSale>(`${API_BASE_URL}/purchases/pos`, payload));
    const sale = this.normalizeSale(response);
    await Promise.all([this.refreshStatus(), this.loadProducts(), this.loadSales()]);
    return sale;
  }

  today(): string {
    const now = new Date();
    const offset = now.getTimezoneOffset() * 60000;
    return new Date(now.getTime() - offset).toISOString().slice(0, 10);
  }

  private normalizeProduct(product: CashierProduct): CashierProduct {
    return { ...product, price: Number(product.price), stock: Number(product.stock) };
  }

  private normalizeSale(sale: PosSale): PosSale {
    return {
      ...sale,
      subtotal: Number(sale.subtotal),
      total: Number(sale.total),
      cash_tendered: sale.cash_tendered == null ? null : Number(sale.cash_tendered),
      change_given: sale.change_given == null ? null : Number(sale.change_given),
      items: sale.items?.map((item) => ({
        ...item,
        unit_price: Number(item.unit_price),
        line_total: Number(item.line_total),
      })),
    };
  }
}
