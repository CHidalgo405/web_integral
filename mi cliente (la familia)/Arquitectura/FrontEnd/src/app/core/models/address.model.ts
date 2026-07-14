export interface Address {
  id: string;
  label: string; // 'Casa', 'Oficina', etc.
  fullName: string;
  street: string;
  exteriorNumber: string;
  interiorNumber?: string;
  neighborhood: string; // Colonia
  city: string;
  state: string;
  zipCode: string;
  phone: string;
  isDefault: boolean;
  notes?: string;
  latitude?: number;
  longitude?: number;
}
