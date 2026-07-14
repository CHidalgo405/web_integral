import { Component, inject } from '@angular/core';
import { UserService } from '../../../core/services/user.service';
import { Header } from '../../../shared/components/header/header';
import { IconComponent } from '../../../shared/components/icon/icon';
import { FormsModule, NgForm } from '@angular/forms';
import { Address } from '../../../core/models/address.model';
import { LocationPicker } from '../../../shared/components/location-picker/location-picker';

@Component({
  selector: 'app-addresses',
  standalone: true,
  imports: [Header, IconComponent, FormsModule, LocationPicker],
  template: `
    <app-header title="Mis Direcciones" [showBack]="true"></app-header>
    
    <div class="addresses-page" id="addresses-page">
      
      <!-- Dashed Add Button -->
      <button class="add-address-dashed-btn" (click)="openAddModal()" id="add-address-btn">
        <app-icon name="plus" size="18" />
        <span>Agregar nueva dirección</span>
      </button>

      <!-- Addresses List -->
      @for (addr of userService.getAddresses(); track addr.id) {
        <div class="address-card" [class.is-default]="addr.isDefault" [id]="'addr-card-' + addr.id">
          <div class="card-header-row">
            <div class="label-badge-wrapper">
              <span class="label-icon"><app-icon [name]="getLabelIcon(addr.label)" size="18" /></span>
              <span class="label-title">{{ addr.label }}</span>
              @if (addr.isDefault) {
                <span class="default-pill">Principal</span>
              }
            </div>
            <div class="header-actions">
              @if (!addr.isDefault) {
                <button class="action-text-btn" (click)="setDefaultAddress(addr)" [id]="'set-default-' + addr.id">
                  Hacer principal
                </button>
              }
            </div>
          </div>
          
          <div class="card-body">
            <h4 class="recipient-name">{{ addr.fullName }}</h4>
            <p class="address-text">{{ addr.street }} {{ addr.exteriorNumber }}{{ addr.interiorNumber ? ', Int. ' + addr.interiorNumber : '' }}</p>
            <p class="neighborhood-text">{{ addr.neighborhood }}, {{ addr.city }}, {{ addr.state }}</p>
            <p class="zip-text">CP {{ addr.zipCode }}</p>
            @if (addr.phone) {
              <p class="phone-text">
                <app-icon name="phone" size="12" />
                <span>{{ addr.phone }}</span>
              </p>
            }
            @if (addr.notes) {
              <div class="notes-badge-wrapper">
                <app-icon name="clipboard" size="12" />
                <span>Indicaciones: {{ addr.notes }}</span>
              </div>
            }
          </div>
          
          <div class="card-footer-actions">
            <button class="footer-action-btn edit" (click)="openEditModal(addr)" [id]="'edit-addr-' + addr.id">
              <app-icon name="pencil" size="14" />
              <span>Editar</span>
            </button>
            <button class="footer-action-btn delete" (click)="deleteAddress(addr)" [disabled]="addr.isDefault" [id]="'delete-addr-' + addr.id">
              <app-icon name="trash" size="14" />
              <span>Eliminar</span>
            </button>
          </div>
        </div>
      }

    </div>

    <!-- Inline Add/Edit Drawer Modal -->
    @if (showFormModal) {
      <div class="modal-backdrop">
        <div class="modal-drawer">
          <div class="modal-header">
            <h2>{{ isEditing ? 'Editar Dirección' : 'Nueva Dirección' }}</h2>
            <button class="modal-close-btn" (click)="showFormModal = false" id="close-modal-btn">&times;</button>
          </div>
          
          <form #addressForm="ngForm" (ngSubmit)="saveAddress(addressForm)" class="modal-form" id="address-editor-form">
            
            <!-- Label selector grid -->
            <div class="form-group">
              <label class="label-control">Tipo de Dirección</label>
              <div class="label-selector-grid">
                <button type="button" class="label-opt" [class.selected]="formModel.label === 'Casa'" (click)="formModel.label = 'Casa'">
                  <app-icon name="house" size="16" />
                  <span>Casa</span>
                </button>
                <button type="button" class="label-opt" [class.selected]="formModel.label === 'Oficina'" (click)="formModel.label = 'Oficina'">
                  <app-icon name="landmark" size="16" />
                  <span>Oficina</span>
                </button>
                <button type="button" class="label-opt" [class.selected]="formModel.label === 'Otro'" (click)="formModel.label = 'Otro'">
                  <app-icon name="map-pin" size="16" />
                  <span>Otro</span>
                </button>
              </div>
            </div>

            <!-- Recipient Name -->
            <div class="form-group">
              <label class="label-control">Nombre Completo (Destinatario)</label>
              <input type="text" name="fullName" [(ngModel)]="formModel.fullName" required placeholder="Ej. Carlos Hernández" class="form-control" />
            </div>

            <!-- Phone -->
            <div class="form-group">
              <label class="label-control">Teléfono de Contacto</label>
              <input type="tel" name="phone" [(ngModel)]="formModel.phone" required placeholder="Ej. 555 123 4567" class="form-control" />
            </div>

            <!-- Street & Numbers -->
            <div class="form-row-2">
              <div class="form-group">
                <label class="label-control">Calle</label>
                <input type="text" name="street" [(ngModel)]="formModel.street" required placeholder="Ej. Av. Reforma" class="form-control" />
              </div>
              <div class="form-row-numbers">
                <div class="form-group">
                  <label class="label-control">Ext</label>
                  <input type="text" name="extNum" [(ngModel)]="formModel.exteriorNumber" required placeholder="123" class="form-control" />
                </div>
                <div class="form-group">
                  <label class="label-control">Int</label>
                  <input type="text" name="intNum" [(ngModel)]="formModel.interiorNumber" placeholder="Piso 2" class="form-control" />
                </div>
              </div>
            </div>

            <!-- Neighborhood & Zip -->
            <div class="form-row-2">
              <div class="form-group">
                <label class="label-control">Colonia / Barrio</label>
                <input type="text" name="neighborhood" [(ngModel)]="formModel.neighborhood" required placeholder="Ej. San Jose" class="form-control" />
              </div>
              <div class="form-group">
                <label class="label-control">Código Postal</label>
                <input type="text" name="zipCode" [(ngModel)]="formModel.zipCode" required placeholder="06000" class="form-control" />
              </div>
            </div>

            <!-- City & State -->
            <div class="form-row-2">
              <div class="form-group">
                <label class="label-control">Ciudad / Delegación</label>
                <input type="text" name="city" [(ngModel)]="formModel.city" required placeholder="Ej. CDMX" class="form-control" />
              </div>
              <div class="form-group">
                <label class="label-control">Estado</label>
                <input type="text" name="state" [(ngModel)]="formModel.state" required placeholder="Ej. CDMX" class="form-control" />
              </div>
            </div>

            <!-- Notes/Indications -->
            <app-location-picker
              [latitude]="formModel.latitude"
              [longitude]="formModel.longitude"
              (locationChange)="formModel.latitude = $event.latitude; formModel.longitude = $event.longitude"
            />

            <div class="form-group">
              <label class="label-control">Indicaciones de Entrega</label>
              <textarea name="notes" [(ngModel)]="formModel.notes" placeholder="Ej. Portón verde, casa verde turquesa..." class="form-control textarea-control" rows="2"></textarea>
            </div>

            <!-- Default selector switch -->
            <div class="form-group" style="padding: 4px 0;">
              <label class="switch-label">
                <input type="checkbox" name="isDefault" [(ngModel)]="formModel.isDefault" class="switch-input" [disabled]="!!(formModel.id && formModel.isDefault && isEditing)" />
                <span class="switch-slider"></span>
                <span class="status-text">Establecer como dirección principal</span>
              </label>
            </div>

            <!-- Modal footer buttons -->
            <div class="modal-footer">
              <button type="button" (click)="showFormModal = false" class="btn btn-secondary btn-full">Cancelar</button>
              <button type="submit" [disabled]="addressForm.invalid" class="btn btn-primary btn-full">Guardar Dirección</button>
            </div>

          </form>
        </div>
      </div>
    }

    <!-- Toast Notifications -->
    @if (toastMessage) {
      <div class="toast-notification">
        <app-icon name="check" size="16" color="#fff" />
        <span>{{ toastMessage }}</span>
      </div>
    }
  `,
  styles: [`
    .addresses-page { padding: 16px; padding-bottom: 80px; background-color: var(--bg); min-height: 100dvh; }
    
    /* Dashed add button */
    .add-address-dashed-btn {
      width: 100%;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      padding: 16px;
      background: var(--surface-raised);
      border: 2px dashed var(--primary-alpha);
      border-radius: 20px;
      color: var(--primary);
      font-weight: 700;
      font-size: 0.9rem;
      cursor: pointer;
      margin-bottom: 20px;
      transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
    }
    .add-address-dashed-btn:hover {
      border-color: var(--primary);
      background: var(--primary-alpha);
      transform: translateY(-1px);
    }
    .add-address-dashed-btn app-icon {
      color: var(--primary);
    }
    
    /* Address cards */
    .address-card {
      background: var(--surface-raised);
      border-radius: 24px;
      padding: 20px;
      margin-bottom: 14px;
      box-shadow: 0 6px 16px rgba(0,0,0,0.03);
      border: 1px solid var(--border);
      transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
      position: relative;
    }
    .address-card.is-default {
      border-color: var(--primary);
      box-shadow: 0 8px 24px rgba(28, 84, 66, 0.06);
    }
    .address-card:hover {
      transform: translateY(-2px);
      box-shadow: 0 8px 24px rgba(0, 0, 0, 0.06);
    }
    .address-card.is-default:hover {
      box-shadow: 0 10px 28px rgba(28, 84, 66, 0.1);
    }
    
    .card-header-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 12px;
    }
    .label-badge-wrapper {
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .label-icon {
      color: var(--primary);
      display: flex;
      align-items: center;
    }
    .label-title {
      font-size: 0.95rem;
      font-weight: 800;
      color: var(--text-primary);
    }
    .default-pill {
      font-size: 0.65rem;
      font-weight: 800;
      background: var(--primary-alpha);
      color: var(--primary);
      padding: 3px 10px;
      border-radius: 6px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    
    .action-text-btn {
      background: none;
      border: none;
      font-size: 0.8rem;
      font-weight: 700;
      color: var(--primary);
      cursor: pointer;
      padding: 4px 8px;
      border-radius: 6px;
      transition: background 0.2s;
    }
    .action-text-btn:hover {
      background: var(--primary-alpha);
    }
    
    .card-body {
      margin-bottom: 16px;
    }
    .recipient-name {
      font-size: 0.85rem;
      font-weight: 700;
      color: var(--text-primary);
      margin: 0 0 6px;
    }
    .address-text, .neighborhood-text, .zip-text {
      font-size: 0.8rem;
      color: var(--text-secondary);
      margin: 2px 0;
      line-height: 1.3;
    }
    .phone-text {
      display: flex;
      align-items: center;
      gap: 6px;
      font-size: 0.75rem;
      color: var(--text-muted);
      margin-top: 6px;
      font-weight: 600;
    }
    .phone-text app-icon {
      color: var(--text-muted);
    }
    
    .notes-badge-wrapper {
      display: inline-flex;
      align-items: flex-start;
      gap: 6px;
      background: var(--bg);
      border: 1px solid var(--border);
      padding: 6px 12px;
      border-radius: 8px;
      font-size: 0.75rem;
      color: var(--text-secondary);
      margin-top: 10px;
      line-height: 1.3;
    }
    .notes-badge-wrapper app-icon {
      color: var(--primary);
      margin-top: 2px;
    }
    
    .card-footer-actions {
      display: flex;
      gap: 12px;
      border-top: 1px dashed var(--border);
      padding-top: 12px;
    }
    .footer-action-btn {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      background: none;
      border: none;
      font-size: 0.8rem;
      font-weight: 700;
      cursor: pointer;
      padding: 6px 12px;
      border-radius: 8px;
      transition: background 0.2s;
    }
    .footer-action-btn.edit {
      color: var(--primary);
    }
    .footer-action-btn.edit:hover {
      background: var(--primary-alpha);
    }
    .footer-action-btn.delete {
      color: var(--danger);
    }
    .footer-action-btn.delete:hover:not(:disabled) {
      background: var(--danger-alpha);
    }
    .footer-action-btn:disabled {
      opacity: 0.4;
      cursor: not-allowed;
    }
    
    /* Modal / Drawer */
    .modal-backdrop {
      position: fixed;
      top: 0; left: 0; right: 0; bottom: 0;
      background: rgba(15, 42, 32, 0.4);
      backdrop-filter: blur(4px);
      z-index: 1000;
      display: flex;
      align-items: flex-end;
      justify-content: center;
      animation: fadeIn 0.25s forwards;
    }
    .modal-drawer {
      background: var(--surface);
      width: 100%;
      max-width: 500px;
      border-radius: 32px 32px 0 0;
      padding: 24px 20px;
      box-shadow: 0 -10px 30px rgba(0,0,0,0.1);
      display: flex;
      flex-direction: column;
      max-height: 90vh;
      animation: slideUp 0.35s cubic-bezier(0.16, 1, 0.3, 1) forwards;
    }
    .modal-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding-bottom: 16px;
      border-bottom: 1px solid var(--border);
      margin-bottom: 20px;
    }
    .modal-header h2 {
      font-family: var(--font-heading);
      font-size: 1.25rem;
      font-weight: 800;
      color: var(--text-primary);
      margin: 0;
    }
    .modal-close-btn {
      background: none;
      border: none;
      font-size: 1.8rem;
      color: var(--text-muted);
      cursor: pointer;
      line-height: 1;
      padding: 4px;
    }
    .modal-close-btn:hover {
      color: var(--text-primary);
    }
    
    .modal-form {
      flex: 1;
      overflow-y: auto;
      display: flex;
      flex-direction: column;
      gap: 16px;
      padding-right: 4px;
    }
    
    .form-group {
      display: flex;
      flex-direction: column;
      gap: 6px;
    }
    .label-control {
      font-size: 0.75rem;
      font-weight: 800;
      color: var(--text-secondary);
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    .form-control {
      width: 100%;
      padding: 12px 16px;
      border-radius: 12px;
      border: 1px solid var(--border);
      font-family: var(--font-body);
      font-weight: 600;
      font-size: 0.9rem;
      color: var(--text-primary);
      background: var(--surface);
      outline: none;
      transition: all 0.25s;
    }
    .form-control:focus {
      border-color: var(--primary);
      box-shadow: 0 0 0 3px var(--primary-alpha);
    }
    .textarea-control {
      resize: vertical;
    }
    
    .form-row-2 {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 12px;
    }
    
    .form-row-numbers {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 8px;
    }
    
    /* Label option selector grid */
    .label-selector-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 8px;
    }
    .label-opt {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 6px;
      padding: 12px;
      border: 1px solid var(--border);
      background: var(--surface);
      border-radius: 12px;
      cursor: pointer;
      font-family: var(--font-body);
      font-weight: 700;
      font-size: 0.85rem;
      color: var(--text-secondary);
      transition: all 0.2s;
    }
    .label-opt:hover {
      background: var(--hover);
      border-color: var(--text-muted);
    }
    .label-opt.selected {
      border-color: var(--primary);
      background: var(--primary-alpha);
      color: var(--primary);
    }
    
    /* Switch toggle slider */
    .switch-label {
      display: flex;
      align-items: center;
      gap: 10px;
      cursor: pointer;
    }
    .switch-input { display: none; }
    .switch-slider {
      width: 38px;
      height: 20px;
      background-color: var(--border);
      border-radius: 999px;
      position: relative;
      transition: background-color 0.3s;
    }
    .switch-slider::before {
      content: '';
      position: absolute;
      width: 14px;
      height: 14px;
      border-radius: 50%;
      background: #fff;
      top: 3px;
      left: 3px;
      transition: transform 0.3s;
    }
    .switch-input:checked + .switch-slider {
      background-color: var(--primary);
    }
    .switch-input:checked + .switch-slider::before {
      transform: translateX(18px);
    }
    .switch-input:disabled + .switch-slider {
      opacity: 0.5;
    }
    .status-text {
      font-size: 0.85rem;
      font-weight: 700;
      color: var(--text-primary);
    }
    
    .modal-footer {
      display: flex;
      gap: 12px;
      margin-top: 10px;
      padding-top: 16px;
      border-top: 1px solid var(--border);
    }
    .btn {
      padding: 12px 24px;
      border-radius: 12px;
      font-weight: 700;
      font-size: 0.9rem;
      border: none;
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      transition: all 0.2s;
    }
    .btn-secondary {
      background: var(--bg);
      color: var(--text-secondary);
      border: 1px solid var(--border);
    }
    .btn-secondary:hover {
      background: var(--hover);
    }
    .btn-primary {
      background: var(--primary);
      color: #fff;
    }
    .btn-primary:hover:not(:disabled) {
      background: var(--primary-dark);
      transform: translateY(-1px);
    }
    .btn-primary:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }
    .btn-full {
      flex: 1;
      width: 100%;
    }
    
    /* Toast Alert */
    .toast-notification {
      position: fixed;
      bottom: 24px;
      left: 20px;
      right: 20px;
      background: rgba(15, 42, 32, 0.95);
      color: #fff;
      padding: 14px 20px;
      border-radius: 12px;
      display: flex;
      align-items: center;
      gap: 10px;
      box-shadow: 0 8px 24px rgba(0,0,0,0.2);
      z-index: 1100;
      animation: slideUpToast 0.35s cubic-bezier(0.16, 1, 0.3, 1);
    }
    .toast-notification span {
      font-size: 0.8rem;
      font-weight: 700;
    }
    
    @keyframes fadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }
    
    @keyframes slideUp {
      from { transform: translateY(100%); }
      to { transform: translateY(0); }
    }
    
    @keyframes slideUpToast {
      from { transform: translateY(100%); opacity: 0; }
      to { transform: translateY(0); opacity: 1; }
    }
  `],
})
export class Addresses {
  protected userService = inject(UserService);

  showFormModal = false;
  isEditing = false;
  toastMessage = '';

  formModel: Partial<Address> = {
    label: 'Casa',
    fullName: '',
    phone: '',
    street: '',
    exteriorNumber: '',
    interiorNumber: '',
    neighborhood: '',
    zipCode: '',
    city: '',
    state: '',
    notes: '',
    isDefault: false,
    latitude: undefined,
    longitude: undefined
  };

  getLabelIcon(label: string): string {
    switch (label.toLowerCase()) {
      case 'casa': return 'house';
      case 'oficina': return 'landmark';
      default: return 'map-pin';
    }
  }

  openAddModal() {
    this.isEditing = false;
    this.formModel = {
      label: 'Casa',
      fullName: '',
      phone: '',
      street: '',
      exteriorNumber: '',
      interiorNumber: '',
      neighborhood: '',
      zipCode: '',
      city: '',
      state: '',
      notes: '',
      isDefault: this.userService.getAddresses().length === 0,
      latitude: undefined,
      longitude: undefined
    };
    this.showFormModal = true;
  }

  openEditModal(addr: Address) {
    this.isEditing = true;
    this.formModel = { ...addr };
    this.showFormModal = true;
  }

  saveAddress(form: NgForm) {
    if (form.invalid) return;
    
    const addressData = this.formModel as Address;
    
    if (this.isEditing) {
      this.userService.updateAddress(addressData);
      this.showToast('Dirección actualizada con éxito');
    } else {
      this.userService.addAddress(addressData);
      this.showToast('Dirección agregada con éxito');
    }
    this.showFormModal = false;
  }

  setDefaultAddress(addr: Address) {
    this.userService.updateAddress({ ...addr, isDefault: true });
    this.showToast('Dirección principal actualizada');
  }

  deleteAddress(addr: Address) {
    if (addr.isDefault) {
      this.showToast('No se puede eliminar la dirección principal');
      return;
    }
    if (confirm(`¿Estás seguro de que deseas eliminar la dirección "${addr.label}"?`)) {
      this.userService.deleteAddress(addr.id);
      this.showToast('Dirección eliminada');
    }
  }

  showToast(msg: string) {
    this.toastMessage = msg;
    setTimeout(() => this.toastMessage = '', 3000);
  }
}
