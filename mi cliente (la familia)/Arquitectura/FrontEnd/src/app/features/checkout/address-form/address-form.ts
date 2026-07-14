import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { UserService } from '../../../core/services/user.service';
import { Header } from '../../../shared/components/header/header';
import { IconComponent } from '../../../shared/components/icon/icon';
import { signal } from '@angular/core';
import { LocationPicker } from '../../../shared/components/location-picker/location-picker';
import { CartService } from '../../../core/services/cart.service';

@Component({
  selector: 'app-address-form',
  standalone: true,
  imports: [ReactiveFormsModule, Header, IconComponent, LocationPicker],
  template: `
    <app-header title="Nueva Dirección" [showBack]="true"></app-header>
    <div class="checkout-page" id="address-form-page">
      <form [formGroup]="form" (ngSubmit)="onSubmit()" class="form-layout">
        <div class="form-group">
          <label for="label">Etiqueta</label>
          <input id="label" formControlName="label" placeholder="Ej: Casa, Oficina" [class.input-error]="form.get('label')?.invalid && form.get('label')?.touched" />
          @if (form.get('label')?.invalid && form.get('label')?.touched) { <span class="error-text">Requerido</span> }
        </div>
        <div class="form-group">
          <label for="fullName">Nombre completo</label>
          <input id="fullName" formControlName="fullName" placeholder="Nombre y apellido" [class.input-error]="form.get('fullName')?.invalid && form.get('fullName')?.touched" />
          @if (form.get('fullName')?.invalid && form.get('fullName')?.touched) { <span class="error-text">Requerido</span> }
        </div>
        <div class="form-group">
          <label for="street">Calle</label>
          <input id="street" formControlName="street" placeholder="Calle" [class.input-error]="form.get('street')?.invalid && form.get('street')?.touched" />
          @if (form.get('street')?.invalid && form.get('street')?.touched) { <span class="error-text">Requerido</span> }
        </div>
        <div class="form-row">
          <div class="form-group">
            <label for="exteriorNumber">Nº Ext.</label>
            <input id="exteriorNumber" formControlName="exteriorNumber" placeholder="123" [class.input-error]="form.get('exteriorNumber')?.invalid && form.get('exteriorNumber')?.touched" />
            @if (form.get('exteriorNumber')?.invalid && form.get('exteriorNumber')?.touched) { <span class="error-text">Requerido</span> }
          </div>
          <div class="form-group">
            <label for="interiorNumber">Nº Int. (opc.)</label>
            <input id="interiorNumber" formControlName="interiorNumber" placeholder="4B" />
          </div>
        </div>
        <div class="form-group">
          <label for="neighborhood">Colonia</label>
          <input id="neighborhood" formControlName="neighborhood" placeholder="Colonia" [class.input-error]="form.get('neighborhood')?.invalid && form.get('neighborhood')?.touched" />
          @if (form.get('neighborhood')?.invalid && form.get('neighborhood')?.touched) { <span class="error-text">Requerido</span> }
        </div>
        <div class="form-row">
          <div class="form-group">
            <label for="city">Ciudad</label>
            <input id="city" formControlName="city" placeholder="Ciudad" [class.input-error]="form.get('city')?.invalid && form.get('city')?.touched" />
            @if (form.get('city')?.invalid && form.get('city')?.touched) { <span class="error-text">Requerido</span> }
          </div>
          <div class="form-group">
            <label for="state">Estado</label>
            <input id="state" formControlName="state" placeholder="Estado" [class.input-error]="form.get('state')?.invalid && form.get('state')?.touched" />
            @if (form.get('state')?.invalid && form.get('state')?.touched) { <span class="error-text">Requerido</span> }
          </div>
        </div>
        <div class="form-row">
          <div class="form-group">
            <label for="zipCode">C.P.</label>
            <input id="zipCode" formControlName="zipCode" placeholder="06000" [class.input-error]="form.get('zipCode')?.invalid && form.get('zipCode')?.touched" />
            @if (form.get('zipCode')?.invalid && form.get('zipCode')?.touched) { <span class="error-text">Requerido</span> }
          </div>
          <div class="form-group">
            <label for="phone">Teléfono</label>
            <input id="phone" formControlName="phone" placeholder="+52 555..." [class.input-error]="form.get('phone')?.invalid && form.get('phone')?.touched" />
            @if (form.get('phone')?.invalid && form.get('phone')?.touched) { <span class="error-text">Requerido</span> }
          </div>
        </div>
        <div class="form-group">
          <label for="notes">Notas (opc.)</label>
          <input id="notes" formControlName="notes" placeholder="Referencias de entrega" />
        </div>
        <div class="form-group location-group">
          <app-location-picker
            [latitude]="form.controls.latitude.value ?? undefined"
            [longitude]="form.controls.longitude.value ?? undefined"
            [subtotal]="cartService.cart().subtotal"
            (locationChange)="setLocation($event)"
          />
          @if ((form.controls.latitude.invalid || form.controls.longitude.invalid) && locationTouched()) {
            <span class="error-text">Selecciona en el mapa la entrada del domicilio.</span>
          }
        </div>
        <label class="checkbox-row"><input type="checkbox" formControlName="isDefault" /> Usar como dirección principal</label>
        
        <button type="submit" class="btn-continue" [disabled]="form.invalid || isSaving()" id="save-address-btn">
          @if (isSaving()) {
            <app-icon name="loader" size="18" className="app-icon-spin" style="margin-right: 8px;" />
            Guardando...
          } @else {
            Guardar dirección
          }
        </button>
      </form>
    </div>
  `,
  styleUrl: '../checkout-shared.css',
})
export class AddressForm {
  private fb = inject(FormBuilder);
  private userService = inject(UserService);
  private router = inject(Router);

  isSaving = signal(false);

  form = this.fb.group({
    label: ['', Validators.required], fullName: ['', Validators.required], street: ['', Validators.required],
    exteriorNumber: ['', Validators.required], interiorNumber: [''], neighborhood: ['', Validators.required],
    city: ['', Validators.required], state: ['', Validators.required], zipCode: ['', Validators.required],
    phone: ['', Validators.required], notes: [''], isDefault: [false],
  });

  onSubmit(): void {
    if (this.form.valid && !this.isSaving()) {
      this.isSaving.set(true);
      setTimeout(() => {
        this.userService.addAddress(this.form.value as any);
        this.router.navigate(['/checkout/address']);
        this.isSaving.set(false);
      }, 1500);
    }
  }
}
