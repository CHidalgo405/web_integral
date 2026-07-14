import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AdminOperationsService, ExpirationBatch } from '../../../core/services/admin-operations.service';
import { IconComponent } from '../../../shared/components/icon/icon';

@Component({selector:'app-admin-expirations',standalone:true,imports:[CommonModule,FormsModule,IconComponent],templateUrl:'./expirations.html',styleUrl:'../admin-operations.css'})
export class AdminExpirations implements OnInit {
  private api=inject(AdminOperationsService); private router=inject(Router);
  batches=signal<ExpirationBatch[]>([]); filter=signal<'all'|'expired'|'critical'|'soon'>('all'); error=signal(''); selected=signal<ExpirationBatch|null>(null); reason='expired';
  visible=computed(()=>this.batches().filter(batch=>this.filter()==='all'||this.state(batch)===this.filter()));
  ngOnInit(){this.load();}
  load(){this.api.batches().subscribe({next:value=>this.batches.set(value),error:e=>this.error.set(e.error?.error||'No se pudieron cargar los lotes.')});}
  days(batch:ExpirationBatch){const today=new Date();today.setHours(0,0,0,0);return Math.ceil((new Date(batch.expiration_date+'T00:00:00').getTime()-today.getTime())/86400000);}
  state(batch:ExpirationBatch):'expired'|'critical'|'soon'|'ok'{const d=this.days(batch);return d<0?'expired':d<=3?'critical':d<=7?'soon':'ok';}
  count(state:string){return this.batches().filter(item=>this.state(item)===state).length;}
  remove(){const batch=this.selected();if(!batch)return;this.api.removeBatch(batch.id,this.reason).subscribe({next:()=>{this.selected.set(null);this.load();},error:e=>this.error.set(e.error?.error||'No se pudo retirar el lote.')});}
  suggest(batch:ExpirationBatch){this.router.navigate(['/admin/promotions'],{queryParams:{inventoryId:batch.inventory_id,until:batch.expiration_date,suggested:'1'}});}
}
