import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { API_BASE_URL } from '../api.config';

export interface Supplier { id: string; name: string; contact_name?: string; phone?: string; email?: string; address?: string; notes?: string; active: boolean; }
export interface InventoryItem { id: string; name: string; sku?: string; stock: number; cost?: number; has_expiration?: boolean; }
export interface PurchaseOrder { id: string; supplier_id: string; supplier_name: string; status: 'draft'|'sent'|'partial'|'received'|'cancelled'; expected_date?: string; notes?: string; created_at: string; }
export interface PurchaseOrderItem { id: string; order_id: string; inventory_id: string; inventory_name: string; sku?: string; quantity_ordered: number; quantity_received: number; unit_cost: number; }
export interface ExpirationBatch { id: string; inventory_id: string; inventory_name: string; quantity: number; expiration_date: string; removed: boolean; }
export interface ExpenseCategory { id: string; name: string; }
export interface Expense { id: string; description: string; amount: number; payment_method: string; expense_date: string; category_id?: string; category_name?: string; entry_type: 'expense'|'reversal'; reverses_expense_id?: string; reversal_reason?: string; }
export interface CashAudit { id: string; first_name?: string; last_name?: string; shift?: string; audit_type: string; expected_amount?: number; counted_amount: number; difference: number; created_at: string; }
export interface Promotion { id: string; name: string; description?: string; discount_pct?: number; discount_fixed?: number; inventory_id: string; active: boolean; valid_from?: string; valid_until?: string; auto_generated?: boolean; }
export interface DeliveryZone { id: string; name: string; min_km: number; max_km: number; base_fee: number; fee_per_km: number; active: boolean; }
export interface ShopConfig { shop_name: string; address?: string; latitude?: number; longitude?: number; currency: string; express_surcharge: number; free_shipping_threshold?: number; }
export interface DeliveryQuote { eligible: boolean; distance_km: number; zone: DeliveryZone | null; fee: number | null; }

@Injectable({ providedIn: 'root' })
export class AdminOperationsService {
  private http = inject(HttpClient);
  private url(path: string): string { return API_BASE_URL + path; }

  suppliers() { return this.http.get<Supplier[]>(this.url('/suppliers')); }
  saveSupplier(value: Partial<Supplier>) { return value.id ? this.http.put<Supplier>(this.url('/suppliers/' + value.id), value) : this.http.post<Supplier>(this.url('/suppliers'), value); }
  supplierItems(id: string) { return this.http.get<any[]>(this.url('/suppliers/' + id + '/items')); }
  addSupplierItem(id: string, value: object) { return this.http.post(this.url('/suppliers/' + id + '/items'), value); }
  orders() { return this.http.get<PurchaseOrder[]>(this.url('/purchase-orders')); }
  createOrder(value: object) { return this.http.post<PurchaseOrder>(this.url('/purchase-orders'), value); }
  updateOrder(id: string, value: object) { return this.http.put<PurchaseOrder>(this.url('/purchase-orders/' + id), value); }
  orderItems(id: string) { return this.http.get<PurchaseOrderItem[]>(this.url('/purchase-orders/' + id + '/items')); }
  addOrderItem(id: string, value: object) { return this.http.post(this.url('/purchase-orders/' + id + '/items'), value); }
  receiveOrder(id: string, value: object) { return this.http.post(this.url('/purchase-orders/' + id + '/receive'), value); }
  inventory() { return this.http.get<InventoryItem[]>(this.url('/inventory')); }
  batches(includeRemoved = false) { return this.http.get<ExpirationBatch[]>(this.url('/expiration-batches?include_removed=' + includeRemoved)); }
  removeBatch(id: string, reason: string) { return this.http.post(this.url('/expiration-batches/' + id + '/remove'), { reason }); }
  expenses() { return this.http.get<Expense[]>(this.url('/expenses')); }
  createExpense(value: object) { return this.http.post<Expense>(this.url('/expenses'), value); }
  reverseExpense(id: string, reason: string) { return this.http.post<Expense>(this.url('/expenses/' + id + '/reverse'), { reason }); }
  expenseCategories() { return this.http.get<ExpenseCategory[]>(this.url('/expense-categories')); }
  createExpenseCategory(name: string) { return this.http.post<ExpenseCategory>(this.url('/expense-categories'), { name }); }
  audits() { return this.http.get<CashAudit[]>(this.url('/cash-audit')); }
  promotions() { return this.http.get<Promotion[]>(this.url('/promotions?include_inactive=true')); }
  savePromotion(value: Partial<Promotion>) { return value.id ? this.http.put<Promotion>(this.url('/promotions/' + value.id), value) : this.http.post<Promotion>(this.url('/promotions'), value); }
  disablePromotion(id: string) { return this.http.delete<void>(this.url('/promotions/' + id)); }
  shopConfig() { return this.http.get<ShopConfig>(this.url('/shop-config')); }
  saveShopConfig(value: ShopConfig) { return this.http.put<ShopConfig>(this.url('/shop-config'), value); }
  zones() { return this.http.get<DeliveryZone[]>(this.url('/delivery-zones')); }
  saveZone(value: Partial<DeliveryZone>) { return value.id ? this.http.put<DeliveryZone>(this.url('/delivery-zones/' + value.id), value) : this.http.post<DeliveryZone>(this.url('/delivery-zones'), value); }
  disableZone(id: string) { return this.http.delete<void>(this.url('/delivery-zones/' + id)); }
  quote(value: object) { return this.http.post<DeliveryQuote>(this.url('/delivery-zones/quote'), value); }
}
