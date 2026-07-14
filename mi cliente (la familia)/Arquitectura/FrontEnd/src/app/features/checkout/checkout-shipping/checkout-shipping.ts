import { Component, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { Header } from '../../../shared/components/header/header';
import { ShippingMethod } from '../../../core/models/order.model';
import { CheckoutStateService } from '../../../core/services/checkout-state.service';
import { AdminOperationsService } from '../../../core/services/admin-operations.service';
import { CartService } from '../../../core/services/cart.service';
import { IconComponent } from '../../../shared/components/icon/icon';

@Component({selector:'app-checkout-shipping',standalone:true,imports:[Header,IconComponent],templateUrl:'./checkout-shipping.html',styleUrl:'../checkout-shared.css'})
export class CheckoutShipping {
  private router=inject(Router); private checkoutState=inject(CheckoutStateService); private api=inject(AdminOperationsService); private cartService=inject(CartService);
  selected=signal<ShippingMethod|''>(this.checkoutState.selectedShipping()); loadingQuote=signal(false); deliveryError=signal('');
  shippingOptions=[
    {key:'standard' as ShippingMethod,icon:'package',label:'Envío estándar',description:'3-5 días hábiles'},
    {key:'express' as ShippingMethod,icon:'bolt',label:'Envío express',description:'1-2 días hábiles'},
    {key:'pickup' as ShippingMethod,icon:'store',label:'Recoger en tienda',description:'Disponible en 2 horas'},
  ];
  select(key:ShippingMethod){
    if(this.loadingQuote())return;this.deliveryError.set('');
    if(key==='pickup'){this.applySelection(key,0);return;}
    const address=this.checkoutState.selectedAddress();
    if(address?.latitude==null||address.longitude==null){this.selected.set('');this.deliveryError.set('Confirma el pin de tu dirección antes de solicitar entrega.');return;}
    this.loadingQuote.set(true);
    this.api.quote({latitude:address.latitude,longitude:address.longitude,subtotal:this.cartService.cart().subtotal,shipping_method:key}).subscribe({next:quote=>{this.loadingQuote.set(false);if(!quote.eligible){this.selected.set('');this.deliveryError.set('Esta dirección está fuera del área de entrega. Puedes recoger en tienda.');return;}this.applySelection(key,quote.fee||0);},error:error=>{this.loadingQuote.set(false);this.selected.set('');this.deliveryError.set(error.error?.error||'No se pudo calcular el envío.');}});
  }
  private applySelection(key:ShippingMethod,fee:number){this.selected.set(key);this.checkoutState.selectedShipping.set(key);this.checkoutState.shippingFee.set(fee);this.cartService.setShipping(fee);}
  price(key:ShippingMethod){if(key==='pickup')return'Gratis';return this.selected()===key?this.checkoutState.getShippingPrice(key):'Calcular';}
  next(){this.router.navigate(['/checkout/payment']);}
}
