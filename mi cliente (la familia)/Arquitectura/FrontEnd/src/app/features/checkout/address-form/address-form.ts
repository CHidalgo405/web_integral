import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { UserService } from '../../../core/services/user.service';
import { Header } from '../../../shared/components/header/header';

@Component({
  selector: 'app-address-form',
  standalone: true,
  imports: [ReactiveFormsModule, Header],
  template: `
    <app-header title="Nueva Dirección" [showBack]="true"></app-header>
    <div class="checkout-page" id="address-form-page">
      <form [formGroup]="form" (ngSubmit)="onSubmit()" class="form-layout">
        <div class="form-group"><label>Etiqueta</label><input formControlName="label" placeholder="Ej: Casa, Oficina" /></div>
        <div class="form-group"><label>Nombre completo</label><input formControlName="fullName" placeholder="Nombre y apellido" /></div>
        <div class="form-group"><label>Calle</label><input formControlName="street" placeholder="Calle" /></div>
        <div class="form-row">
          <div class="form-group"><label>Nº Ext.</label><input formControlName="exteriorNumber" placeholder="123" /></div>
          <div class="form-group"><label>Nº Int. (opc.)</label><input formControlName="interiorNumber" placeholder="4B" /></div>
        </div>
        <div class="form-group"><label>Colonia</label><input formControlName="neighborhood" placeholder="Colonia" /></div>
        <div class="form-row">
          <div class="form-group"><label>Ciudad</label><input formControlName="city" placeholder="Ciudad" /></div>
          <div class="form-group"><label>Estado</label><input formControlName="state" placeholder="Estado" /></div>
        </div>
        <div class="form-row">
          <div class="form-group"><label>C.P.</label><input formControlName="zipCode" placeholder="06000" /></div>
          <div class="form-group"><label>Teléfono</label><input formControlName="phone" placeholder="+52 555..." /></div>
        </div>
        <div class="form-group"><label>Notas (opc.)</label><input formControlName="notes" placeholder="Referencias de entrega" /></div>
        <label class="checkbox-row"><input type="checkbox" formControlName="isDefault" /> Usar como dirección principal</label>
        <button type="submit" class="btn-continue" [disabled]="form.invalid" id="save-address-btn">Guardar dirección</button>
      </form>
    </div>
  `,
  styleUrl: '../checkout-shared.css',
})
export class AddressForm {
  private fb = inject(FormBuilder);
  private userService = inject(UserService);
  private router = inject(Router);

  form = this.fb.group({
    label: ['', Validators.required], fullName: ['', Validators.required], street: ['', Validators.required],
    exteriorNumber: ['', Validators.required], interiorNumber: [''], neighborhood: ['', Validators.required],
    city: ['', Validators.required], state: ['', Validators.required], zipCode: ['', Validators.required],
    phone: ['', Validators.required], notes: [''], isDefault: [false],
  });

  onSubmit(): void {
    if (this.form.valid) {
      this.userService.addAddress(this.form.value as any);
      this.router.navigate(['/checkout/address']);
    }
  }
}
