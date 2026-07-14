import { AfterViewInit, Component, EventEmitter, Input, OnDestroy, Output, inject, signal } from '@angular/core';
import { CurrencyPipe } from '@angular/common';
import * as L from 'leaflet';
import { forkJoin } from 'rxjs';
import { AdminOperationsService, DeliveryQuote } from '../../../core/services/admin-operations.service';
import { IconComponent } from '../icon/icon';

@Component({selector:'app-location-picker',standalone:true,imports:[IconComponent,CurrencyPipe],templateUrl:'./location-picker.html',styleUrl:'./location-picker.css'})
export class LocationPicker implements AfterViewInit,OnDestroy {
  private api=inject(AdminOperationsService); private map?:L.Map; private marker?:L.Marker; private circles:L.Circle[]=[];
  @Input() latitude?:number; @Input() longitude?:number; @Input() subtotal=0;
  @Output() locationChange=new EventEmitter<{latitude:number;longitude:number}>(); @Output() quoteChange=new EventEmitter<DeliveryQuote>();
  quote=signal<DeliveryQuote|null>(null); locating=signal(false); error=signal('');
  ngAfterViewInit(){forkJoin({config:this.api.shopConfig(),zones:this.api.zones()}).subscribe({next:value=>{const center:L.LatLngExpression=[Number(value.config.latitude)||19.4326,Number(value.config.longitude)||-99.1332];this.map=L.map('address-location-'+this.instanceId()).setView(this.latitude!=null&&this.longitude!=null?[this.latitude,this.longitude]:center,13);L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png',{maxZoom:19,attribution:'&copy; OpenStreetMap contributors'}).addTo(this.map);[...value.zones].sort((a,b)=>Number(b.max_km)-Number(a.max_km)).forEach((zone,index)=>this.circles.push(L.circle(center,{radius:Number(zone.max_km)*1000,color:['#2f8f65','#d69b2d','#c85848'][index%3],fillOpacity:.05,weight:1.5}).addTo(this.map!)));this.map.on('click',event=>this.setPoint(event.latlng.lat,event.latlng.lng));if(this.latitude!=null&&this.longitude!=null)this.setPoint(this.latitude,this.longitude,false);setTimeout(()=>this.map?.invalidateSize(),0);},error:()=>this.error.set('No se pudo cargar el mapa de cobertura.')});}
  private id='lp-'+Math.random().toString(36).slice(2); instanceId(){return this.id;}
  setPoint(latitude:number,longitude:number,emit=true){this.latitude=Number(latitude.toFixed(6));this.longitude=Number(longitude.toFixed(6));this.marker?.remove();const icon=L.divIcon({className:'customer-pin',html:'<span></span>',iconSize:[24,32],iconAnchor:[12,30]});this.marker=L.marker([this.latitude,this.longitude],{draggable:true,icon}).addTo(this.map!);this.marker.on('dragend',()=>{const p=this.marker!.getLatLng();this.setPoint(p.lat,p.lng);});if(emit)this.locationChange.emit({latitude:this.latitude,longitude:this.longitude});this.api.quote({latitude:this.latitude,longitude:this.longitude,subtotal:this.subtotal,shipping_method:'standard'}).subscribe({next:value=>{this.quote.set(value);this.quoteChange.emit(value);},error:()=>this.error.set('No fue posible validar esta ubicación.')});}
  locate(){if(!navigator.geolocation){this.error.set('Tu navegador no permite obtener ubicación.');return;}this.locating.set(true);navigator.geolocation.getCurrentPosition(p=>{this.locating.set(false);this.map?.setView([p.coords.latitude,p.coords.longitude],15);this.setPoint(p.coords.latitude,p.coords.longitude);},()=>{this.locating.set(false);this.error.set('No se pudo obtener tu ubicación.');},{enableHighAccuracy:true,timeout:10000});}
  ngOnDestroy(){this.map?.remove();}
}
