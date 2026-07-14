import { Component, OnInit, inject, signal, computed, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { forkJoin } from 'rxjs';
import { AdminOperationsService, InventoryItem, Promotion } from '../../../core/services/admin-operations.service';
import { IconComponent } from '../../../shared/components/icon/icon';

// Importar Flatpickr
import flatpickr from 'flatpickr';
import 'flatpickr/dist/flatpickr.min.css';
// El tema se aplica mediante CSS, no mediante la propiedad 'theme'
// import 'flatpickr/dist/themes/material_blue.css';

@Component({ selector: 'app-admin-promotions', standalone: true, imports: [CommonModule, FormsModule, IconComponent], templateUrl: './promotions.html', styleUrl: '../admin-operations.css' })
export class AdminPromotions implements OnInit, AfterViewInit {
  private api = inject(AdminOperationsService); private route = inject(ActivatedRoute);
  promotions = signal<Promotion[]>([]); inventory = signal<InventoryItem[]>([]); filter = signal<'all' | 'active' | 'scheduled' | 'expired'>('all'); modal = signal(false); error = signal(''); mode: 'percent' | 'fixed' = 'percent';
  draft: Partial<Promotion> = {};
  visible = computed(() => this.promotions().filter(item => this.filter() === 'all' || this.state(item) === this.filter()));

  private flatpickrInstances: any[] = [];

  ngOnInit() { this.load(); }

  ngAfterViewInit() {
    // Esperar un poco para que el DOM esté completamente renderizado
    setTimeout(() => this.initDatePickers(), 0);
  }

  private initDatePickers() {
    // Limpiar instancias anteriores si existen
    this.flatpickrInstances.forEach(instance => instance.destroy());
    this.flatpickrInstances = [];

    // Inicializar date picker para "Desde"
    const fromInput = document.getElementById('dateFrom') as HTMLInputElement | null;
    if (fromInput) {
      const instance = flatpickr(fromInput, {
        dateFormat: "Y-m-d",
        locale: "es",
        allowInput: true,
        onChange: (selectedDates, dateStr) => {
          this.draft.valid_from = dateStr;
        }
      });
      this.flatpickrInstances.push(instance);
    }

    // Inicializar date picker para "Hasta"
    const untilInput = document.getElementById('dateUntil') as HTMLInputElement | null;
    if (untilInput) {
      const instance = flatpickr(untilInput, {
        dateFormat: "Y-m-d",
        locale: "es",
        allowInput: true,
        onChange: (selectedDates, dateStr) => {
          this.draft.valid_until = dateStr;
        }
      });
      this.flatpickrInstances.push(instance);
    }
  }

  load() { forkJoin({ promos: this.api.promotions(), inventory: this.api.inventory() }).subscribe({ next: value => { this.promotions.set(value.promos); this.inventory.set(value.inventory); const q = this.route.snapshot.queryParamMap; if (q.get('suggested')) this.open(undefined, q.get('inventoryId') || '', q.get('until') || ''); }, error: e => this.error.set(e.error?.error || 'No se pudieron cargar las promociones.') }); }

  state(item: Promotion): 'active' | 'scheduled' | 'expired' { const today = new Date().toISOString().slice(0, 10); if (!item.active || !!item.valid_until && item.valid_until < today) return 'expired'; if (!!item.valid_from && item.valid_from > today) return 'scheduled'; return 'active'; }

  stateLabel(item: Promotion) { return { active: 'Activa', scheduled: 'Programada', expired: 'Finalizada' }[this.state(item)]; }

  count(value: string) { return this.promotions().filter(item => this.state(item) === value).length; }

  product(id: string) { return this.inventory().find(item => item.id === id)?.name || 'Producto'; }

  open(value?: Promotion, inventoryId = '', until = '') {
    const today = new Date().toISOString().slice(0, 10);
    this.draft = value ? { ...value } : { name: '', description: '', inventory_id: inventoryId, discount_pct: 20, active: true, valid_from: today, valid_until: until };
    this.mode = this.draft.discount_fixed != null ? 'fixed' : 'percent';
    this.modal.set(true);
    // Reinicializar los date pickers después de abrir el modal
    setTimeout(() => this.initDatePickers(), 100);
  }

  save() { if (this.mode === 'percent') this.draft.discount_fixed = undefined; else this.draft.discount_pct = undefined; this.api.savePromotion(this.draft).subscribe({ next: () => { this.modal.set(false); this.load(); }, error: e => this.error.set(e.error?.error || 'No se pudo guardar la promoción.') }); }

  disable(item: Promotion) { this.api.disablePromotion(item.id).subscribe(() => this.load()); }

  money(value: number | undefined) { return Number(value || 0).toLocaleString('es-MX', { style: 'currency', currency: 'MXN' }); }
}