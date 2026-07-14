import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { forkJoin } from 'rxjs';
import { AdminOperationsService, InventoryItem, PurchaseOrder, PurchaseOrderItem, Supplier } from '../../../core/services/admin-operations.service';
import { IconComponent } from '../../../shared/components/icon/icon';

@Component({
  selector: 'app-admin-supply', standalone: true,
  imports: [CommonModule, FormsModule, IconComponent],
  templateUrl: './supply.html', styleUrl: '../admin-operations.css',
})
export class AdminSupply implements OnInit {
  private api = inject(AdminOperationsService);
  tab = signal<'suppliers'|'orders'|'receipts'>('suppliers');
  suppliers = signal<Supplier[]>([]); orders = signal<PurchaseOrder[]>([]); inventory = signal<InventoryItem[]>([]);
  selectedOrder = signal<PurchaseOrder|null>(null); orderItems = signal<PurchaseOrderItem[]>([]);
  loading = signal(true); error = signal(''); modal = signal<'supplier'|'order'|'receive'|null>(null);
  supplierDraft: Partial<Supplier> = {}; orderDraft = { supplier_id:'', expected_date:'', notes:'' };
  draftItems: {inventory_id:string;quantity_ordered:number;unit_cost:number}[] = [{inventory_id:'',quantity_ordered:1,unit_cost:0}];
  receiptDates: Record<string,string> = {}; receiptNotes = '';

  ngOnInit() { this.reload(); }
  reload() {
    this.loading.set(true); this.error.set('');
    forkJoin({ suppliers:this.api.suppliers(), orders:this.api.orders(), inventory:this.api.inventory() }).subscribe({
      next: value => { this.suppliers.set(value.suppliers); this.orders.set(value.orders); this.inventory.set(value.inventory); this.loading.set(false); },
      error: err => { this.error.set(err.error?.error || 'No se pudo cargar abastecimiento.'); this.loading.set(false); }
    });
  }
  openSupplier(value?: Supplier) { this.supplierDraft = value ? {...value} : {active:true}; this.modal.set('supplier'); }
  saveSupplier() { this.api.saveSupplier(this.supplierDraft).subscribe({next:()=>{this.modal.set(null);this.reload();},error:e=>this.error.set(e.error?.error||'No se pudo guardar.')}); }
  openOrder() { this.orderDraft={supplier_id:this.suppliers()[0]?.id||'',expected_date:'',notes:''}; this.draftItems=[{inventory_id:'',quantity_ordered:1,unit_cost:0}]; this.modal.set('order'); }
  addDraftItem() { this.draftItems.push({inventory_id:'',quantity_ordered:1,unit_cost:0}); }
  removeDraftItem(index:number) { this.draftItems.splice(index,1); }
  saveOrder() {
    const items=this.draftItems.filter(item=>item.inventory_id&&item.quantity_ordered>0);
    if(!this.orderDraft.supplier_id||!items.length){this.error.set('Selecciona proveedor y al menos un producto.');return;}
    this.api.createOrder(this.orderDraft).subscribe({next:order=>forkJoin(items.map(item=>this.api.addOrderItem(order.id,item))).subscribe({next:()=>{this.modal.set(null);this.reload();},error:e=>this.error.set(e.error?.error||'No se pudieron guardar los productos.')}),error:e=>this.error.set(e.error?.error||'No se pudo crear la orden.')});
  }
  viewOrder(order:PurchaseOrder) { this.selectedOrder.set(order); this.api.orderItems(order.id).subscribe(items=>this.orderItems.set(items)); }
  sendOrder(order:PurchaseOrder) { this.api.updateOrder(order.id,{status:'sent',expected_date:order.expected_date,notes:order.notes}).subscribe(()=>this.reload()); }
  openReceive(order:PurchaseOrder) { this.selectedOrder.set(order); this.receiptDates={}; this.receiptNotes=''; this.api.orderItems(order.id).subscribe(items=>{this.orderItems.set(items);this.modal.set('receive');}); }
  receive() {
    const order=this.selectedOrder(); if(!order)return;
    const items=this.orderItems().map(item=>({inventory_id:item.inventory_id,expiration_date:this.receiptDates[item.inventory_id]||null}));
    this.api.receiveOrder(order.id,{items,notes:this.receiptNotes}).subscribe({next:()=>{this.modal.set(null);this.reload();},error:e=>this.error.set(e.error?.error||'No se pudo recibir la orden.')});
  }
  product(id:string){return this.inventory().find(item=>item.id===id);}
  money(value:number|string|undefined){return Number(value||0).toLocaleString('es-MX',{style:'currency',currency:'MXN'});}
}
