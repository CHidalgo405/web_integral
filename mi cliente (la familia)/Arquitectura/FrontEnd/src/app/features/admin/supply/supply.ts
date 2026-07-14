import { Component, OnInit, inject, signal, computed, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { forkJoin } from 'rxjs';
import { AdminOperationsService, InventoryItem, PurchaseOrder, PurchaseOrderItem, Supplier } from '../../../core/services/admin-operations.service';
import { IconComponent } from '../../../shared/components/icon/icon';

// Importar Flatpickr
import flatpickr from 'flatpickr';
import 'flatpickr/dist/flatpickr.min.css';

@Component({
  selector: 'app-admin-supply', standalone: true,
  imports: [CommonModule, FormsModule, IconComponent],
  templateUrl: './supply.html', styleUrl: '../admin-operations.css',
})
export class AdminSupply implements OnInit, AfterViewInit {
  private api = inject(AdminOperationsService);
  tab = signal<'suppliers' | 'orders' | 'receipts'>('suppliers');
  suppliers = signal<Supplier[]>([]);
  orders = signal<PurchaseOrder[]>([]);
  inventory = signal<InventoryItem[]>([]);
  selectedOrder = signal<PurchaseOrder | null>(null);
  orderItems = signal<PurchaseOrderItem[]>([]);
  loading = signal(true);
  error = signal('');
  success = signal('');
  modal = signal<'supplier' | 'order' | 'receive' | null>(null);
  supplierDraft: Partial<Supplier> = {};
  orderDraft = { supplier_id: '', expected_date: '', notes: '' };
  draftItems: { inventory_id: string; quantity_ordered: number; unit_cost: number }[] = [
    { inventory_id: '', quantity_ordered: 1, unit_cost: 0 }
  ];
  receiptDates: Record<string, string> = {};
  receiptNotes = '';

  private flatpickrInstances: any[] = [];
  confirmModal = signal(false);
  confirmMessage = signal('');
  private confirmCallback: (() => void) | null = null;


  // Computed: Filtrar órdenes según la pestaña activa
  filteredOrders = computed(() => {
    const allOrders = this.orders();
    if (this.tab() === 'orders') {
      return allOrders;
    } else if (this.tab() === 'receipts') {
      // Mostrar solo órdenes en estado 'sent' o 'partial' (pendientes de recibir)
      return allOrders.filter(order =>
        order.status === 'sent' || order.status === 'partial'
      );
    }
    return allOrders;
  });

  ngOnInit() { this.reload(); }

  ngAfterViewInit() {
    setTimeout(() => this.initDatePickers(), 100);
  }

  private initDatePickers() {
    this.flatpickrInstances.forEach(instance => instance.destroy());
    this.flatpickrInstances = [];

    // Fecha de orden
    const orderDateInput = document.getElementById('orderDate') as HTMLInputElement | null;
    if (orderDateInput) {
      const instance = flatpickr(orderDateInput, {
        dateFormat: "Y-m-d",
        locale: "es",
        allowInput: true,
        onChange: (selectedDates, dateStr) => {
          this.orderDraft.expected_date = dateStr;
        }
      });
      this.flatpickrInstances.push(instance);
    }

    // Fechas de caducidad
    document.querySelectorAll('[id^="expiry"]').forEach(el => {
      const input = el as HTMLInputElement;
      const instance = flatpickr(input, {
        dateFormat: "Y-m-d",
        locale: "es",
        allowInput: true,
        onChange: (selectedDates, dateStr) => {
          const productId = input.id.replace('expiry', '');
          this.receiptDates[productId] = dateStr;
        }
      });
      this.flatpickrInstances.push(instance);
    });
  }

  reload() {
    this.loading.set(true);
    this.error.set('');
    this.success.set('');
    forkJoin({
      suppliers: this.api.suppliers(),
      orders: this.api.orders(),
      inventory: this.api.inventory()
    }).subscribe({
      next: value => {
        this.suppliers.set(value.suppliers);
        this.orders.set(value.orders);
        this.inventory.set(value.inventory);
        this.loading.set(false);
      },
      error: err => {
        this.error.set(err.error?.error || 'No se pudo cargar abastecimiento.');
        this.loading.set(false);
      }
    });
  }

  openSupplier(value?: Supplier) {
    this.supplierDraft = value ? { ...value } : { active: true };
    this.modal.set('supplier');
  }

  saveSupplier() {
    this.api.saveSupplier(this.supplierDraft).subscribe({
      next: () => {
        this.success.set('Proveedor guardado correctamente');
        this.modal.set(null);
        this.reload();
        setTimeout(() => this.success.set(''), 3000);
      },
      error: e => this.error.set(e.error?.error || 'No se pudo guardar.')
    });
  }

  openOrder() {
    this.orderDraft = {
      supplier_id: this.suppliers()[0]?.id || '',
      expected_date: '',
      notes: ''
    };
    this.draftItems = [{ inventory_id: '', quantity_ordered: 1, unit_cost: 0 }];
    this.modal.set('order');
    setTimeout(() => this.initDatePickers(), 200);
  }

  addDraftItem() {
    this.draftItems.push({ inventory_id: '', quantity_ordered: 1, unit_cost: 0 });
  }

  removeDraftItem(index: number) {
    this.draftItems.splice(index, 1);
    if (this.draftItems.length === 0) {
      this.addDraftItem();
    }
  }

  saveOrder() {
    const items = this.draftItems.filter(item => item.inventory_id && item.quantity_ordered > 0);
    if (!this.orderDraft.supplier_id) {
      this.error.set('Selecciona un proveedor.');
      setTimeout(() => this.error.set(''), 3000);
      return;
    }
    if (!items.length) {
      this.error.set('Agrega al menos un producto.');
      setTimeout(() => this.error.set(''), 3000);
      return;
    }

    this.api.createOrder(this.orderDraft).subscribe({
      next: order => {
        forkJoin(items.map(item => this.api.addOrderItem(order.id, item))).subscribe({
          next: () => {
            this.success.set('Orden creada correctamente');
            this.modal.set(null);
            this.reload();
            setTimeout(() => this.success.set(''), 3000);
          },
          error: e => this.error.set(e.error?.error || 'No se pudieron guardar los productos.')
        });
      },
      error: e => this.error.set(e.error?.error || 'No se pudo crear la orden.')
    });
  }

  viewOrder(order: PurchaseOrder) {
    this.selectedOrder.set(order);
    this.api.orderItems(order.id).subscribe(items => this.orderItems.set(items));
  }

  closeDetail() {
    this.selectedOrder.set(null);
    this.orderItems.set([]);
  }

  openReceive(order: PurchaseOrder) {
    this.selectedOrder.set(order);
    this.receiptDates = {};
    this.receiptNotes = '';
    this.api.orderItems(order.id).subscribe(items => {
      this.orderItems.set(items);
      this.modal.set('receive');
      setTimeout(() => this.initDatePickers(), 200);
    });
  }

  receive() {
    const order = this.selectedOrder();
    if (!order) return;

    // Verificar que todas las fechas de caducidad estén llenas para productos que lo requieren
    const itemsWithExpiry = this.orderItems().filter(item =>
      this.product(item.inventory_id)?.has_expiration
    );

    const missingExpiry = itemsWithExpiry.some(item =>
      !this.receiptDates[item.inventory_id]
    );

    if (missingExpiry) {
      this.error.set('Todos los productos con caducidad requieren una fecha.');
      setTimeout(() => this.error.set(''), 3000);
      return;
    }

    const items = this.orderItems().map(item => ({
      inventory_id: item.inventory_id,
      expiration_date: this.receiptDates[item.inventory_id] || null
    }));

    this.api.receiveOrder(order.id, {
      items,
      notes: this.receiptNotes
    }).subscribe({
      next: () => {
        this.success.set('Orden recibida correctamente. Inventario actualizado.');
        this.modal.set(null);
        this.selectedOrder.set(null);
        this.orderItems.set([]);
        this.reload();
        setTimeout(() => this.success.set(''), 4000);
      },
      error: e => this.error.set(e.error?.error || 'No se pudo recibir la orden.')
    });
  }

  closeModal() {
    this.modal.set(null);
    this.success.set('');
    this.error.set('');
  }

  product(id: string) {
    return this.inventory().find(item => item.id === id);
  }

  statusLabel(status: string) {
    const labels: Record<string, string> = {
      draft: 'Borrador',
      sent: 'Entregar',
      partial: 'Recibiendo',
      received: 'Recibida',
      cancelled: 'Cancelada'
    };
    return labels[status] || status;
  }

  // Formatear fecha para mostrar en formato legible
  formatDate(date: string | null | undefined): string {
    if (!date) return 'Sin fecha';
    try {
      const d = new Date(date);
      if (isNaN(d.getTime())) return 'Sin fecha';
      return d.toLocaleDateString('es-MX', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch {
      return 'Sin fecha';
    }
  }

  money(value: number | string | undefined) {
    return Number(value || 0).toLocaleString('es-MX', {
      style: 'currency',
      currency: 'MXN'
    });
  }

  // Método para mostrar el modal de confirmación
  showConfirm(message: string, callback: () => void) {
    this.confirmMessage.set(message);
    this.confirmCallback = callback;
    this.confirmModal.set(true);
  }

  // Método para cerrar el modal sin confirmar
  closeConfirm() {
    this.confirmModal.set(false);
    this.confirmMessage.set('');
    this.confirmCallback = null;
  }

  // Método para ejecutar la acción confirmada
  confirmAction() {
    if (this.confirmCallback) {
      this.confirmCallback();
    }
    this.closeConfirm();
  }

  // Modificar el método sendOrder
  sendOrder(order: PurchaseOrder) {
    this.showConfirm(
      `¿Entregar la orden ${order.id.slice(0, 8)} al proveedor?`,
      () => {
        this.api.updateOrder(order.id, {
          status: 'sent',
          expected_date: order.expected_date,
          notes: order.notes
        }).subscribe({
          next: () => {
            this.success.set('Orden entregada al proveedor');
            this.reload();
            setTimeout(() => this.success.set(''), 3000);
          },
          error: e => this.error.set(e.error?.error || 'No se pudo entregar la orden.')
        });
      }
    );
  }
}