import { Injectable, computed, effect, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { API_BASE_URL } from '../api.config';
import { Address } from '../models/address.model';
import { SavedPaymentMethod } from '../models/order.model';
import { AuthService } from './auth.service';

interface ApiAddress {
  id: string;
  label: string;
  full_name: string;
  phone: string | null;
  street: string;
  exterior_number: string | null;
  interior_number: string | null;
  neighborhood: string | null;
  city: string | null;
  state: string | null;
  zip_code: string | null;
  notes: string | null;
  is_default: boolean;
  latitude: number | null;
  longitude: number | null;
}

interface ApiPaymentMethod {
  id: string;
  type: 'card' | 'cash';
  label: string;
  brand: string | null;
  last4: string | null;
  holder_name: string | null;
  expiry: string | null;
  is_default: boolean;
}

@Injectable({ providedIn: 'root' })
export class UserService {
  private http = inject(HttpClient);
  private authService = inject(AuthService);

  private addresses = signal<Address[]>([]);
  private paymentMethods = signal<SavedPaymentMethod[]>([]);

  readonly allAddresses = computed(() => this.addresses());
  readonly defaultAddress = computed(() => this.addresses().find((a) => a.isDefault));
  readonly allPaymentMethods = computed(() => this.paymentMethods());
  readonly lastError = signal<string | null>(null);

  constructor() {
    // Carga/limpieza automática según el estado de sesión
    effect(() => {
      if (this.authService.isAuthenticated()) {
        this.loadAddresses();
        this.loadPaymentMethods();
      } else {
        this.addresses.set([]);
        this.paymentMethods.set([]);
      }
    });
  }

  // ---- Direcciones ----

  loadAddresses(): void {
    this.http.get<ApiAddress[]>(`${API_BASE_URL}/addresses`).subscribe({
      next: (rows) => {
        this.addresses.set(rows.map((r) => this.mapAddress(r)));
        this.lastError.set(null);
      },
      error: () => this.lastError.set('No se pudieron cargar tus direcciones.'),
    });
  }

  getAddresses(): Address[] {
    return this.addresses();
  }

  addAddress(address: Omit<Address, 'id'>): void {
    this.http.post<ApiAddress>(`${API_BASE_URL}/addresses`, this.toApiAddress(address)).subscribe({
      next: () => this.loadAddresses(),
      error: () => this.lastError.set('No se pudo guardar la dirección.'),
    });
  }

  updateAddress(address: Address): void {
    this.http.put<ApiAddress>(`${API_BASE_URL}/addresses/${address.id}`, this.toApiAddress(address)).subscribe({
      next: () => this.loadAddresses(),
      error: () => this.lastError.set('No se pudo actualizar la dirección.'),
    });
  }

  deleteAddress(id: string): void {
    this.http.delete<void>(`${API_BASE_URL}/addresses/${id}`).subscribe({
      next: () => this.addresses.set(this.addresses().filter((a) => a.id !== id)),
      error: () => this.lastError.set('No se pudo eliminar la dirección.'),
    });
  }

  // ---- Métodos de pago ----

  loadPaymentMethods(): void {
    this.http.get<ApiPaymentMethod[]>(`${API_BASE_URL}/payment-methods`).subscribe({
      next: (rows) => {
        this.paymentMethods.set(rows.map((r) => this.mapPaymentMethod(r)));
        this.lastError.set(null);
      },
      error: () => this.lastError.set('No se pudieron cargar tus métodos de pago.'),
    });
  }

  getPaymentMethods(): SavedPaymentMethod[] {
    return this.paymentMethods();
  }

  addPaymentMethod(pm: Omit<SavedPaymentMethod, 'id'>): void {
    this.http.post<ApiPaymentMethod>(`${API_BASE_URL}/payment-methods`, this.toApiPaymentMethod(pm)).subscribe({
      next: () => this.loadPaymentMethods(),
      error: () => this.lastError.set('No se pudo guardar el método de pago.'),
    });
  }

  updatePaymentMethod(pm: SavedPaymentMethod): void {
    this.http.put<ApiPaymentMethod>(`${API_BASE_URL}/payment-methods/${pm.id}`, this.toApiPaymentMethod(pm)).subscribe({
      next: () => this.loadPaymentMethods(),
      error: () => this.lastError.set('No se pudo actualizar el método de pago.'),
    });
  }

  deletePaymentMethod(id: string): void {
    this.http.delete<void>(`${API_BASE_URL}/payment-methods/${id}`).subscribe({
      next: () => this.paymentMethods.set(this.paymentMethods().filter((p) => p.id !== id)),
      error: () => this.lastError.set('No se pudo eliminar el método de pago.'),
    });
  }

  // ---- Mapeos API <-> modelo del front ----

  private mapAddress(r: ApiAddress): Address {
    return {
      id: r.id,
      label: r.label,
      fullName: r.full_name,
      phone: r.phone ?? '',
      street: r.street,
      exteriorNumber: r.exterior_number ?? '',
      interiorNumber: r.interior_number ?? undefined,
      neighborhood: r.neighborhood ?? '',
      city: r.city ?? '',
      state: r.state ?? '',
      zipCode: r.zip_code ?? '',
      notes: r.notes ?? undefined,
      isDefault: r.is_default,
      latitude: r.latitude == null ? undefined : Number(r.latitude),
      longitude: r.longitude == null ? undefined : Number(r.longitude),
    };
  }

  private toApiAddress(a: Omit<Address, 'id'> | Address): Record<string, unknown> {
    return {
      label: a.label,
      full_name: a.fullName,
      phone: a.phone || null,
      street: a.street,
      exterior_number: a.exteriorNumber || null,
      interior_number: a.interiorNumber || null,
      neighborhood: a.neighborhood || null,
      city: a.city || null,
      state: a.state || null,
      zip_code: a.zipCode || null,
      notes: a.notes || null,
      is_default: a.isDefault,
      latitude: a.latitude ?? null,
      longitude: a.longitude ?? null,
    };
  }

  private mapPaymentMethod(r: ApiPaymentMethod): SavedPaymentMethod {
    return {
      id: r.id,
      type: r.type,
      label: r.label,
      last4: r.last4 ?? undefined,
      isDefault: r.is_default,
    };
  }

  private toApiPaymentMethod(p: Omit<SavedPaymentMethod, 'id'> | SavedPaymentMethod): Record<string, unknown> {
    return {
      type: p.type,
      label: p.label,
      last4: p.last4 || null,
      is_default: p.isDefault,
    };
  }
}
