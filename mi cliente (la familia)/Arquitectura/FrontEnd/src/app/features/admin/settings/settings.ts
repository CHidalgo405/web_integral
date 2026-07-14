import { AfterViewInit, Component, OnDestroy, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import * as L from 'leaflet';
import { forkJoin } from 'rxjs';
import { AdminOperationsService, DeliveryZone, ShopConfig } from '../../../core/services/admin-operations.service';
import { IconComponent } from '../../../shared/components/icon/icon';

@Component({selector:'app-admin-settings',standalone:true,imports:[CommonModule,FormsModule,IconComponent],templateUrl:'./settings.html',styleUrls:['../admin-operations.css','./settings.css']})
export class AdminSettings implements AfterViewInit,OnDestroy {
  private api=inject(AdminOperationsService); private map?:L.Map; private marker?:L.Marker; private circles:L.Circle[]=[];
  config=signal<ShopConfig>({shop_name:'Tiendita Maday',currency:'MXN',express_surcharge:40}); zones=signal<DeliveryZone[]>([]); modal=signal(false); error=signal(''); saved=signal('');
  zoneDraft:Partial<DeliveryZone>={};
  ngAfterViewInit(){forkJoin({config:this.api.shopConfig(),zones:this.api.zones()}).subscribe({next:value=>{this.config.set({...value.config,latitude:Number(value.config.latitude),longitude:Number(value.config.longitude),express_surcharge:Number(value.config.express_surcharge),free_shipping_threshold:value.config.free_shipping_threshold==null?undefined:Number(value.config.free_shipping_threshold)});this.zones.set(value.zones.map(z=>({...z,min_km:Number(z.min_km),max_km:Number(z.max_km),base_fee:Number(z.base_fee),fee_per_km:Number(z.fee_per_km)})));this.initMap();},error:e=>this.error.set(e.error?.error||'No se pudo cargar la configuración.')});}
  ngOnDestroy(){this.map?.remove();}
  initMap(){const c=this.config();const center:L.LatLngExpression=[c.latitude||19.4326,c.longitude||-99.1332];this.map=L.map('delivery-map',{zoomControl:true}).setView(center,12);L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png',{maxZoom:19,attribution:'&copy; OpenStreetMap contributors'}).addTo(this.map);this.map.on('click',event=>this.setStore(event.latlng.lat,event.latlng.lng));this.renderCoverage();setTimeout(()=>this.map?.invalidateSize(),0);}
  setStore(latitude:number,longitude:number){this.config.update(value=>({...value,latitude:Number(latitude.toFixed(6)),longitude:Number(longitude.toFixed(6))}));this.renderCoverage();}
  renderCoverage(){if(!this.map)return;this.marker?.remove();this.circles.forEach(circle=>circle.remove());this.circles=[];const c=this.config();if(c.latitude==null||c.longitude==null)return;const center:L.LatLngExpression=[c.latitude,c.longitude];this.marker=L.marker(center,{draggable:true}).addTo(this.map).bindPopup('Tiendita Maday');this.marker.on('dragend',()=>{const p=this.marker!.getLatLng();this.setStore(p.lat,p.lng);});const colors=['#2f8f65','#d69b2d','#c85848','#5b7db1'];[...this.zones()].sort((a,b)=>b.max_km-a.max_km).forEach((zone,index)=>this.circles.push(L.circle(center,{radius:zone.max_km*1000,color:colors[index%colors.length],fillOpacity:.08,weight:2}).addTo(this.map!)));}
  saveConfig(){this.api.saveShopConfig(this.config()).subscribe({next:value=>{this.config.set(value);this.saved.set('Configuración guardada.');setTimeout(()=>this.saved.set(''),2500);},error:e=>this.error.set(e.error?.error||'No se pudo guardar.')});}
  openZone(value?:DeliveryZone){const sorted=[...this.zones()].sort((a,b)=>a.max_km-b.max_km);this.zoneDraft=value?{...value}:{name:'',min_km:sorted.at(-1)?.max_km||0,max_km:(sorted.at(-1)?.max_km||0)+3,base_fee:40,fee_per_km:2,active:true};this.modal.set(true);}
  saveZone(){if(Number(this.zoneDraft.max_km)<=Number(this.zoneDraft.min_km)){this.error.set('El radio máximo debe ser mayor al mínimo.');return;}this.api.saveZone(this.zoneDraft).subscribe({next:()=>{this.modal.set(false);this.api.zones().subscribe(value=>{this.zones.set(value.map(z=>({...z,min_km:Number(z.min_km),max_km:Number(z.max_km),base_fee:Number(z.base_fee),fee_per_km:Number(z.fee_per_km)})));this.renderCoverage();});},error:e=>this.error.set(e.error?.error||'No se pudo guardar la zona.')});}
  disable(zone:DeliveryZone){this.api.disableZone(zone.id).subscribe(()=>{this.zones.update(items=>items.filter(item=>item.id!==zone.id));this.renderCoverage();});}
  money(value:number){return value.toLocaleString('es-MX',{style:'currency',currency:'MXN'});}
}
