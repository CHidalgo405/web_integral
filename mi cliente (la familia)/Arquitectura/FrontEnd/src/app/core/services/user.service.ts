import { Injectable, signal, computed } from '@angular/core';
import { User } from '../models/user.model';
import { Address } from '../models/address.model';
import { SavedPaymentMethod } from '../models/order.model';
import { AuthService } from './auth.service';

@Injectable({ providedIn: 'root' })
export class UserService {
  private addresses = signal<Address[]>([
    {
      id: 'addr-1', label: 'Casa', fullName: 'Carlos Hernández', street: 'Av. Reforma',
      exteriorNumber: '123', neighborhood: 'Centro', city: 'CDMX', state: 'CDMX',
      zipCode: '06000', phone: '+52 555 123 4567', isDefault: true,
    },
    {
      id: 'addr-2', label: 'Oficina', fullName: 'Carlos Hernández', street: 'Calle Madero',
      exteriorNumber: '456', interiorNumber: 'Piso 3', neighborhood: 'Juárez', city: 'CDMX', state: 'CDMX',
      zipCode: '06600', phone: '+52 555 987 6543', isDefault: false,
    },
  ]);

  private paymentMethods = signal<SavedPaymentMethod[]>([
    { id: 'pm-1', type: 'card', label: 'Visa terminada en', last4: '4532', isDefault: true },
    { id: 'pm-2', type: 'card', label: 'Mastercard terminada en', last4: '8901', isDefault: false },
    { id: 'pm-3', type: 'cash', label: 'Pago en efectivo', isDefault: false },
  ]);

  readonly allAddresses = computed(() => this.addresses());
  readonly defaultAddress = computed(() => this.addresses().find((a) => a.isDefault));
  readonly allPaymentMethods = computed(() => this.paymentMethods());

  constructor(private authService: AuthService) {}

  getAddresses(): Address[] {
    return this.addresses();
  }

  addAddress(address: Omit<Address, 'id'>): void {
    const newAddress: Address = { ...address, id: `addr-${Date.now()}` };
    if (newAddress.isDefault) {
      this.addresses.set(this.addresses().map((a) => ({ ...a, isDefault: false })));
    }
    this.addresses.set([...this.addresses(), newAddress]);
  }

  updateAddress(address: Address): void {
    if (address.isDefault) {
      this.addresses.set(this.addresses().map((a) => (a.id === address.id ? address : { ...a, isDefault: false })));
    } else {
      this.addresses.set(this.addresses().map((a) => (a.id === address.id ? address : a)));
    }
  }

  deleteAddress(id: string): void {
    this.addresses.set(this.addresses().filter((a) => a.id !== id));
  }

  getPaymentMethods(): SavedPaymentMethod[] {
    return this.paymentMethods();
  }

  addPaymentMethod(pm: Omit<SavedPaymentMethod, 'id'>): void {
    const newPm: SavedPaymentMethod = { ...pm, id: `pm-${Date.now()}` };
    if (newPm.isDefault) {
      this.paymentMethods.set(this.paymentMethods().map((p) => ({ ...p, isDefault: false })));
    }
    this.paymentMethods.set([...this.paymentMethods(), newPm]);
  }

  updatePaymentMethod(pm: SavedPaymentMethod): void {
    if (pm.isDefault) {
      this.paymentMethods.set(this.paymentMethods().map((p) => (p.id === pm.id ? pm : { ...p, isDefault: false })));
    } else {
      this.paymentMethods.set(this.paymentMethods().map((p) => (p.id === pm.id ? pm : p)));
    }
  }

  deletePaymentMethod(id: string): void {
    this.paymentMethods.set(this.paymentMethods().filter((p) => p.id !== id));
  }
}
