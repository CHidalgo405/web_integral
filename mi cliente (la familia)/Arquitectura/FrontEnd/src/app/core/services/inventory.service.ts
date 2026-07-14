import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject, signal } from '@angular/core';
import { Observable, finalize, forkJoin, map, tap } from 'rxjs';
import { API_BASE_URL } from '../api.config';

export interface InventoryItem {
  id: string;
  name: string;
  sku: string | null;
  description: string | null;
  category_id: string | null;
  category: string | null;
  unit: string | null;
  price: number;
  cost: number | null;
  stock: number;
  min_stock: number;
  low_stock: boolean;
  has_expiration: boolean;
  active: boolean;
  updated_at: string;
}

export interface InventoryMovement {
  id: string;
  inventory_id: string;
  inventory_name: string;
  sku: string | null;
  performed_by: string;
  movement_type: 'entry' | 'exit';
  quantity_delta: number;
  previous_stock: number;
  new_stock: number;
  reason: string;
  notes: string | null;
  created_at: string;
}

export interface InventoryAdjustment {
  quantity_delta: number;
  reason: string;
  notes?: string | null;
}

type ApiInventoryItem = Omit<InventoryItem, 'price' | 'cost' | 'stock' | 'min_stock' | 'low_stock'> & {
  price: number | string;
  cost: number | string | null;
  stock: number | string;
  min_stock: number | string;
  low_stock?: boolean;
};

type ApiInventoryMovement = Omit<InventoryMovement, 'quantity_delta' | 'previous_stock' | 'new_stock'> & {
  quantity_delta: number | string;
  previous_stock: number | string;
  new_stock: number | string;
};

@Injectable({ providedIn: 'root' })
export class InventoryService {
  private http = inject(HttpClient);

  readonly items = signal<InventoryItem[]>([]);
  readonly movements = signal<InventoryMovement[]>([]);
  readonly isLoading = signal(false);
  readonly error = signal<string | null>(null);

  loadWorkspace(): void {
    this.isLoading.set(true);
    this.error.set(null);

    forkJoin({
      items: this.http.get<ApiInventoryItem[]>(`${API_BASE_URL}/inventory`, { params: { active: 'true' } }),
      movements: this.http.get<ApiInventoryMovement[]>(`${API_BASE_URL}/inventory/movements`, {
        params: { limit: '150' },
      }),
    })
      .pipe(finalize(() => this.isLoading.set(false)))
      .subscribe({
        next: ({ items, movements }) => {
          this.items.set(items.map((item) => this.normalizeItem(item)));
          this.movements.set(movements.map((movement) => this.normalizeMovement(movement)));
        },
        error: (error) => this.error.set(error?.error?.error || 'No se pudo cargar el inventario.'),
      });
  }

  loadMovements(): void {
    this.http
      .get<ApiInventoryMovement[]>(`${API_BASE_URL}/inventory/movements`, { params: { limit: '250' } })
      .subscribe({
        next: (movements) => this.movements.set(movements.map((movement) => this.normalizeMovement(movement))),
        error: (error) => this.error.set(error?.error?.error || 'No se pudo cargar el historial.'),
      });
  }

  findByBarcode(barcode: string): Observable<InventoryItem> {
    return this.http
      .get<ApiInventoryItem>(`${API_BASE_URL}/inventory/barcode/${encodeURIComponent(barcode)}`)
      .pipe(
        map((item) => this.normalizeItem(item)),
        tap((item) => this.upsertItem(item)),
        tap({ error: () => this.error.set('No se encontró un producto con ese código.') }),
      );
  }

  adjustStock(itemId: string, adjustment: InventoryAdjustment): Observable<InventoryMovement> {
    this.error.set(null);
    return this.http
      .post<ApiInventoryMovement>(`${API_BASE_URL}/inventory/${itemId}/adjustments`, adjustment)
      .pipe(
        map((movement) => this.normalizeMovement(movement)),
        tap((movement) => {
          this.movements.set([movement, ...this.movements()]);
          this.items.update((items) =>
            items.map((item) =>
              item.id === itemId
                ? { ...item, stock: movement.new_stock, low_stock: movement.new_stock <= item.min_stock }
                : item,
            ),
          );
        }),
      );
  }

  clearError(): void {
    this.error.set(null);
  }

  private upsertItem(item: InventoryItem): void {
    this.items.update((items) => {
      const exists = items.some((current) => current.id === item.id);
      return exists ? items.map((current) => (current.id === item.id ? item : current)) : [...items, item];
    });
  }

  private normalizeItem(item: ApiInventoryItem): InventoryItem {
    const stock = Number(item.stock ?? 0);
    const minStock = Number(item.min_stock ?? 0);
    return {
      ...item,
      price: Number(item.price ?? 0),
      cost: item.cost == null ? null : Number(item.cost),
      stock,
      min_stock: minStock,
      low_stock: item.low_stock ?? stock <= minStock,
    };
  }

  private normalizeMovement(movement: ApiInventoryMovement): InventoryMovement {
    return {
      ...movement,
      quantity_delta: Number(movement.quantity_delta),
      previous_stock: Number(movement.previous_stock),
      new_stock: Number(movement.new_stock),
    };
  }
}
