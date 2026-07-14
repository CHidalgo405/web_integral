import { Component, inject } from '@angular/core';
import { UserService } from '../../../core/services/user.service';
import { Header } from '../../../shared/components/header/header';
import { IconComponent } from '../../../shared/components/icon/icon';
import { FormsModule, NgForm } from '@angular/forms';
import { SavedPaymentMethod, PaymentMethod } from '../../../core/models/order.model';

@Component({
  selector: 'app-payment-methods',
  standalone: true,
  imports: [Header, IconComponent, FormsModule],
  template: `
    <app-header title="Métodos de Pago" [showBack]="true"></app-header>
    
    <main class="payments-page profile-workspace" id="payment-methods-page">
      <div class="profile-section-intro">
        <span class="profile-section-icon"><app-icon name="credit-card" size="24" /></span>
        <div class="profile-section-copy">
          <p class="profile-section-eyebrow">Mi cuenta</p>
          <h1 class="profile-section-title">Métodos de pago</h1>
          <p class="profile-section-description">Organiza tus opciones de pago guardadas y selecciona cuál quieres usar de forma predeterminada.</p>
        </div>
      </div>

      <section class="profile-content-surface payments-content">
      
      <!-- Dashed Add Button -->
      <button class="add-payment-dashed-btn" (click)="openAddModal()" id="add-payment-btn">
        <app-icon name="plus" size="18" />
        <span>Agregar nuevo método de pago</span>
      </button>

      <!-- Payment Methods List -->
      @for (pm of userService.getPaymentMethods(); track pm.id) {
        <div class="payment-method-card" [class.is-default]="pm.isDefault" [class.card-type]="pm.type === 'card'" [id]="'pm-card-' + pm.id">
          
          <div class="card-chip-brand">
            @if (pm.type === 'card') {
              <div class="card-chip"></div>
              <div class="card-brand-logo">{{ getCardBrand(pm.label) }}</div>
            } @else {
              <div class="wallet-icon-wrapper">
                <app-icon [name]="pm.type === 'cash' ? 'dollar-sign' : 'landmark'" size="22" color="#fff" />
              </div>
            }
          </div>

          <div class="card-number-display">
            @if (pm.type === 'card') {
              <span>••••  ••••  ••••  {{ pm.last4 }}</span>
            } @else {
              <span>{{ pm.label }}</span>
            }
          </div>

          <div class="card-details-row">
            <div class="card-holder">
              <span class="detail-label">Método / Titular</span>
              <span class="detail-val">
                {{ pm.type === 'card' ? 'Carlos Hernández' : pm.type === 'cash' ? 'Efectivo en mano' : 'Transferencia Bancaria' }}
              </span>
            </div>
            @if (pm.type === 'card') {
              <div class="card-expiry">
                <span class="detail-label">Vence</span>
                <span class="detail-val">12/29</span>
              </div>
            }
          </div>

          <!-- Overlay Actions -->
          <div class="card-actions-overlay">
            @if (pm.isDefault) {
              <span class="default-badge">Principal</span>
            } @else {
              <button class="set-default-btn" (click)="setDefaultPayment(pm)" [id]="'set-default-pm-' + pm.id">
                Hacer principal
              </button>
            }
            
            <button class="delete-pm-btn" (click)="deletePayment(pm)" [disabled]="pm.isDefault" [id]="'delete-pm-' + pm.id">
              <app-icon name="trash" size="16" color="#fff" />
            </button>
          </div>

        </div>
      }
      </section>
    </main>

    <!-- Slide-up Add Drawer Modal -->
    @if (showFormModal) {
      <div class="modal-backdrop">
        <div class="modal-drawer">
          <div class="modal-header">
            <h2>Nuevo Método de Pago</h2>
            <button class="modal-close-btn" (click)="showFormModal = false" id="close-modal-btn">&times;</button>
          </div>

          <div class="modal-content-scroll" [class.no-card-preview]="formModel.type !== 'card'">
            
            <!-- Interactive Credit Card Preview -->
            @if (formModel.type === 'card') {
              <div class="card-preview-container">
                <div class="virtual-card" [class.flipped]="cardFlipped">
                  
                  <!-- Front of the Card -->
                  <div class="card-face card-front">
                    <div class="card-glow"></div>
                    <div class="card-header-row">
                      <div class="card-chip"></div>
                      <div class="card-brand-preview">{{ detectedBrand }}</div>
                    </div>
                    <div class="card-number-preview">
                      {{ formatCardNumberPreview(formModel.cardNumber) }}
                    </div>
                    <div class="card-footer-preview">
                      <div class="holder-sec">
                        <span class="lbl">Titular</span>
                        <span class="val">{{ formModel.holderName || 'NOMBRE COMPLETO' }}</span>
                      </div>
                      <div class="expiry-sec">
                        <span class="lbl">Vence</span>
                        <span class="val">{{ formModel.expiry || 'MM/YY' }}</span>
                      </div>
                    </div>
                  </div>

                  <!-- Back of the Card -->
                  <div class="card-face card-back">
                    <div class="card-magnetic-strip"></div>
                    <div class="card-signature-area">
                      <span class="signature-text">{{ formModel.holderName || 'Carlos Hernández' }}</span>
                      <span class="cvv-preview">{{ formModel.cvv || '***' }}</span>
                    </div>
                    <div class="card-back-info">
                      Tiendita Maday PWA — Pagos 100% Seguros
                    </div>
                  </div>

                </div>
              </div>
            }

            <!-- Tab Selector: Card / Cash / Transfer -->
            <div class="tabs-selector">
              <button type="button" class="tab-btn" [class.active]="formModel.type === 'card'" (click)="selectType('card')">
                <app-icon name="credit-card" size="16" />
                <span>Tarjeta</span>
              </button>
              <button type="button" class="tab-btn" [class.active]="formModel.type === 'cash'" (click)="selectType('cash')">
                <app-icon name="dollar-sign" size="16" />
                <span>Efectivo</span>
              </button>
              <button type="button" class="tab-btn" [class.active]="formModel.type === 'transfer'" (click)="selectType('transfer')">
                <app-icon name="landmark" size="16" />
                <span>Transferencia</span>
              </button>
            </div>

            <form #pmForm="ngForm" (ngSubmit)="savePayment(pmForm)" class="modal-form" id="pm-editor-form">
              
              @if (formModel.type === 'card') {
                <!-- Card Details Form -->
                <div class="form-group">
                  <label class="label-control">Número de Tarjeta</label>
                  <input type="text" name="cardNumber" [(ngModel)]="formModel.cardNumber" 
                         (input)="onCardNumberInput()" (focus)="cardFlipped = false" 
                         required maxlength="19" placeholder="4000 1234 5678 9010" class="form-control" />
                </div>

                <div class="form-group">
                  <label class="label-control">Nombre del Titular</label>
                  <input type="text" name="holderName" [(ngModel)]="formModel.holderName" 
                         (focus)="cardFlipped = false" 
                         required placeholder="Ej. Carlos Hernández" class="form-control" />
                </div>

                <div class="form-row-2">
                  <div class="form-group">
                    <label class="label-control">Vencimiento (MM/AA)</label>
                    <input type="text" name="expiry" [(ngModel)]="formModel.expiry" 
                           (input)="onExpiryInput()" (focus)="cardFlipped = false" 
                           required maxlength="5" placeholder="12/29" class="form-control" />
                  </div>
                  <div class="form-group">
                    <label class="label-control">CVV</label>
                    <input type="password" name="cvv" [(ngModel)]="formModel.cvv" 
                           (focus)="cardFlipped = true" (blur)="cardFlipped = false" 
                           required maxlength="4" placeholder="***" class="form-control" />
                  </div>
                </div>
              } @else {
                <!-- Simple inputs for cash/transfer -->
                <div class="form-group">
                  <label class="label-control">Nombre del Método / Banco</label>
                  <input type="text" name="label" [(ngModel)]="formModel.label" 
                         required placeholder="Ej. Pago en efectivo OXXO, Transferencia BBVA" class="form-control" />
                </div>
                
                <div class="info-alert-box">
                  <app-icon name="clipboard" size="16" />
                  <p>Puedes usar este método de pago al finalizar tu pedido de forma rápida sin ingresar tarjetas.</p>
                </div>
              }

              <!-- Default Selector Switch -->
              <div class="form-group" style="padding: 4px 0; margin-top: 8px;">
                <label class="switch-label">
                  <input type="checkbox" name="isDefault" [(ngModel)]="formModel.isDefault" class="switch-input" />
                  <span class="switch-slider"></span>
                  <span class="status-text">Establecer como principal</span>
                </label>
              </div>

              <!-- Buttons -->
              <div class="modal-footer">
                <button type="button" (click)="showFormModal = false" class="btn btn-secondary btn-full">Cancelar</button>
                <button type="submit" [disabled]="pmForm.invalid" class="btn btn-primary btn-full">Guardar Método</button>
              </div>

            </form>
          </div>
        </div>
      </div>
    }

    <!-- Toast Notifications -->
    @if (toastMessage) {
      <div class="toast-notification" [class.toast-error]="isToastError">
        <app-icon [name]="isToastError ? 'alert-triangle' : 'check'" size="16" color="#fff" />
        <span>{{ toastMessage }}</span>
      </div>
    }
  `,
  styleUrls: ['../profile-forms-shared.css'],
  styles: [`
    .payments-page {
      padding: 16px;
      padding-bottom: 80px;
      background-color: var(--bg);
      min-height: 100dvh;
      display: flex;
      flex-direction: column;
      gap: 16px;
    }
    
    /* Dashed add button */
    .add-payment-dashed-btn {
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
      margin-bottom: 8px;
      transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
    }
    .add-payment-dashed-btn:hover {
      border-color: var(--primary);
      background: var(--primary-alpha);
      transform: translateY(-1px);
    }
    .add-payment-dashed-btn app-icon {
      color: var(--primary);
    }
    
    /* Payment Method Card */
    .payment-method-card {
      position: relative;
      border-radius: 24px;
      padding: 22px;
      height: 190px;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      color: rgba(255, 255, 255, 0.9);
      box-shadow: 0 8px 24px rgba(0, 0, 0, 0.08);
      overflow: hidden;
      transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
      border: 1px solid rgba(255, 255, 255, 0.05);
      
      /* Default Gradients */
      background: linear-gradient(135deg, #2D3748 0%, #1A202C 100%);
    }
    
    .payment-method-card.card-type {
      background: linear-gradient(135deg, #1C2636 0%, #0F172A 100%);
    }
    .payment-method-card.card-type.is-default {
      background: linear-gradient(135deg, #1C5442 0%, #0F2A20 100%);
    }
    
    /* Cash/Transfer card gradient */
    .payment-method-card:not(.card-type) {
      background: linear-gradient(135deg, #4A5568 0%, #2D3748 100%);
    }
    .payment-method-card:not(.card-type).is-default {
      background: linear-gradient(135deg, #1C5442 0%, #0F2A20 100%);
    }
    
    .payment-method-card:hover {
      transform: translateY(-4px) scale(1.01);
      box-shadow: 0 12px 30px rgba(0, 0, 0, 0.15);
    }
    
    .card-chip-brand {
      display: flex;
      justify-content: space-between;
      align-items: center;
      height: 32px;
    }
    .card-chip {
      width: 40px;
      height: 28px;
      background: linear-gradient(135deg, #E2A74E 0%, #C78D2B 100%);
      border-radius: 6px;
      position: relative;
      overflow: hidden;
    }
    .card-chip::before {
      content: '';
      position: absolute;
      top: 0; left: 10px; right: 10px; bottom: 0;
      border-left: 1px solid rgba(0,0,0,0.15);
      border-right: 1px solid rgba(0,0,0,0.15);
    }
    .card-chip::after {
      content: '';
      position: absolute;
      top: 6px; bottom: 6px; left: 0; right: 0;
      border-top: 1px solid rgba(0,0,0,0.15);
      border-bottom: 1px solid rgba(0,0,0,0.15);
    }
    
    .card-brand-logo {
      font-size: 1.15rem;
      font-weight: 800;
      font-style: italic;
      letter-spacing: 0.5px;
      color: rgba(255, 255, 255, 0.95);
    }
    
    .wallet-icon-wrapper {
      background: rgba(255, 255, 255, 0.15);
      width: 40px;
      height: 40px;
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    
    .card-number-display {
      font-size: 1.25rem;
      font-weight: 700;
      letter-spacing: 2px;
      color: #FFFFFF;
      margin: 12px 0;
      text-shadow: 1px 1px 2px rgba(0,0,0,0.2);
    }
    
    .card-details-row {
      display: flex;
      justify-content: space-between;
      align-items: flex-end;
    }
    .card-holder, .card-expiry {
      display: flex;
      flex-direction: column;
      gap: 2px;
    }
    .detail-label {
      font-size: 0.6rem;
      text-transform: uppercase;
      letter-spacing: 0.8px;
      color: rgba(255, 255, 255, 0.5);
      font-weight: 700;
    }
    .detail-val {
      font-size: 0.8rem;
      font-weight: 700;
      color: #FFFFFF;
    }
    
    /* Overlay Actions */
    .card-actions-overlay {
      position: absolute;
      top: 16px;
      right: 16px;
      display: flex;
      align-items: center;
      gap: 10px;
    }
    
    .default-badge {
      background: var(--accent);
      color: #fff;
      font-size: 0.65rem;
      font-weight: 800;
      padding: 4px 10px;
      border-radius: 8px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      box-shadow: 0 2px 6px rgba(125, 175, 50, 0.3);
    }
    
    .set-default-btn {
      background: rgba(255, 255, 255, 0.15);
      color: #fff;
      border: none;
      font-size: 0.7rem;
      font-weight: 800;
      padding: 5px 12px;
      border-radius: 8px;
      cursor: pointer;
      backdrop-filter: blur(4px);
      transition: all 0.2s;
    }
    .set-default-btn:hover {
      background: rgba(255, 255, 255, 0.25);
    }
    
    .delete-pm-btn {
      background: rgba(225, 75, 50, 0.2);
      border: none;
      width: 28px;
      height: 28px;
      border-radius: 8px;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      transition: all 0.2s;
    }
    .delete-pm-btn:hover:not(:disabled) {
      background: rgba(225, 75, 50, 0.4);
    }
    .delete-pm-btn:disabled {
      opacity: 0.3;
      cursor: not-allowed;
    }
    
    /* Drawer Modal & Form styles */
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
      max-height: 92vh;
      animation: slideUp 0.35s cubic-bezier(0.16, 1, 0.3, 1) forwards;
    }
    .modal-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding-bottom: 16px;
      border-bottom: 1px solid var(--border);
      margin-bottom: 16px;
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
    
    .modal-content-scroll {
      flex: 1;
      overflow-y: auto;
      display: flex;
      flex-direction: column;
      padding-right: 4px;
    }
    
    /* Tabs selector */
    .tabs-selector {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 8px;
      background: var(--bg);
      padding: 4px;
      border-radius: 14px;
      margin-bottom: 20px;
    }
    .tab-btn {
      background: none;
      border: none;
      padding: 10px;
      font-size: 0.8rem;
      font-weight: 700;
      color: var(--text-secondary);
      border-radius: 10px;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 6px;
      transition: all 0.2s;
    }
    .tab-btn.active {
      background: var(--surface);
      color: var(--primary);
      box-shadow: 0 2px 8px rgba(0,0,0,0.05);
    }
    .tab-btn app-icon {
      color: inherit;
    }
    
    /* Card Preview 3D components */
    .card-preview-container {
      perspective: 1000px;
      width: 100%;
      margin-bottom: 24px;
      display: flex;
      justify-content: center;
    }
    .virtual-card {
      width: 100%;
      max-width: 320px;
      height: 180px;
      position: relative;
      transform-style: preserve-3d;
      transition: transform 0.6s cubic-bezier(0.175, 0.885, 0.32, 1.275);
    }
    .virtual-card.flipped {
      transform: rotateY(180deg);
    }
    .card-face {
      position: absolute;
      width: 100%;
      height: 100%;
      backface-visibility: hidden;
      border-radius: 20px;
      padding: 18px 20px;
      color: #fff;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      box-shadow: 0 8px 20px rgba(0,0,0,0.12);
      overflow: hidden;
    }
    .card-front {
      background: linear-gradient(135deg, #1c5442 0%, #0c261e 100%);
    }
    .card-glow {
      position: absolute;
      top: -50%; left: -50%; right: -50%; bottom: -50%;
      background: radial-gradient(circle, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0) 70%);
      transform: rotate(30deg);
      pointer-events: none;
    }
    
    .card-brand-preview {
      font-size: 1.1rem;
      font-weight: 800;
      font-style: italic;
      color: #fff;
    }
    
    .card-number-preview {
      font-size: 1.15rem;
      font-weight: 700;
      letter-spacing: 2px;
      text-align: center;
      margin: 16px 0;
      color: #fff;
      text-shadow: 1px 1px 2px rgba(0,0,0,0.3);
    }
    
    .card-footer-preview {
      display: flex;
      justify-content: space-between;
      align-items: flex-end;
    }
    .holder-sec, .expiry-sec {
      display: flex;
      flex-direction: column;
      gap: 1px;
    }
    .lbl {
      font-size: 0.55rem;
      text-transform: uppercase;
      color: rgba(255,255,255,0.5);
      font-weight: 700;
      letter-spacing: 0.5px;
    }
    .val {
      font-size: 0.75rem;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    
    .card-back {
      background: linear-gradient(135deg, #0c261e 0%, #051410 100%);
      transform: rotateY(180deg);
      padding: 0;
      justify-content: flex-start;
      gap: 15px;
    }
    .card-magnetic-strip {
      width: 100%;
      height: 38px;
      background: #111;
      margin-top: 15px;
    }
    .card-signature-area {
      margin: 0 20px;
      height: 34px;
      background: rgba(255, 255, 255, 0.8);
      border-radius: 4px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0 10px;
    }
    .signature-text {
      font-family: 'Playfair Display', serif;
      font-style: italic;
      color: #333;
      font-size: 0.8rem;
      max-width: 150px;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    .cvv-preview {
      color: #111;
      font-weight: 800;
      font-style: italic;
      font-size: 0.85rem;
      letter-spacing: 1px;
    }
    .card-back-info {
      font-size: 0.55rem;
      color: rgba(255,255,255,0.4);
      text-align: center;
      margin-top: 15px;
      padding: 0 20px;
    }
    
    /* Form fields */
    .modal-form {
      display: flex;
      flex-direction: column;
      gap: 14px;
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
    
    .form-row-2 {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 12px;
    }
    
    .info-alert-box {
      display: flex;
      align-items: flex-start;
      gap: 10px;
      background: var(--primary-alpha);
      border: 1px solid rgba(28, 84, 66, 0.15);
      border-radius: 14px;
      padding: 12px;
      color: var(--text-secondary);
    }
    .info-alert-box app-icon {
      color: var(--primary);
      margin-top: 2px;
    }
    .info-alert-box p {
      font-size: 0.75rem;
      font-weight: 600;
      line-height: 1.35;
      margin: 0;
    }
    
    /* Toggle switch */
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
    
    /* Toast notifications */
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
    .toast-notification.toast-error {
      background: rgba(225, 75, 50, 0.95);
      box-shadow: 0 8px 24px rgba(225, 75, 50, 0.2);
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

    @media (min-width: 900px) {
      .payments-page {
        display: block;
        background: var(--bg);
      }

      .payments-content {
        display: grid;
        grid-template-columns: repeat(2, minmax(0, 1fr));
        gap: 20px;
        padding: 28px;
      }

      .add-payment-dashed-btn {
        grid-column: 1 / -1;
        min-height: 64px;
        margin-bottom: 0;
        border-radius: 18px;
      }

      .payment-method-card {
        height: 220px;
        border-radius: 20px;
      }

      .modal-drawer {
        width: min(100%, 940px);
        max-width: 940px;
      }

      .modal-content-scroll {
        display: grid;
        grid-template-columns: minmax(280px, 0.85fr) minmax(360px, 1.15fr);
        gap: 24px 32px;
        align-items: start;
      }

      .card-preview-container {
        grid-column: 1;
        grid-row: 1 / span 2;
        position: sticky;
        top: 0;
        margin: 0;
        padding: 24px;
        border-radius: 20px;
        background: var(--bg);
      }

      .tabs-selector,
      .modal-form {
        grid-column: 2;
      }

      .tabs-selector {
        margin-bottom: 0;
      }

      .virtual-card {
        max-width: 340px;
        height: 192px;
      }

      .modal-content-scroll.no-card-preview .tabs-selector,
      .modal-content-scroll.no-card-preview .modal-form {
        grid-column: 1 / -1;
        width: min(100%, 640px);
        margin-inline: auto;
      }
    }
  `],
})
export class PaymentMethods {
  protected userService = inject(UserService);

  showFormModal = false;
  cardFlipped = false;
  toastMessage = '';
  isToastError = false;
  detectedBrand = 'Tarjeta';

  formModel = {
    type: 'card' as PaymentMethod,
    cardNumber: '',
    holderName: '',
    expiry: '',
    cvv: '',
    label: '',
    isDefault: false
  };

  getCardBrand(label: string): string {
    const lbl = label.toLowerCase();
    if (lbl.includes('visa')) return 'VISA';
    if (lbl.includes('mastercard')) return 'Mastercard';
    if (lbl.includes('amex') || lbl.includes('american')) return 'AMEX';
    return 'Tarjeta';
  }

  openAddModal() {
    this.cardFlipped = false;
    this.detectedBrand = 'Tarjeta';
    this.formModel = {
      type: 'card',
      cardNumber: '',
      holderName: '',
      expiry: '',
      cvv: '',
      label: '',
      isDefault: this.userService.getPaymentMethods().length === 0
    };
    this.showFormModal = true;
  }

  selectType(type: PaymentMethod) {
    this.formModel.type = type;
    if (type === 'card') {
      this.formModel.label = '';
    } else if (type === 'cash') {
      this.formModel.label = 'Pago en efectivo';
    } else {
      this.formModel.label = 'Transferencia SPEI';
    }
  }

  onCardNumberInput() {
    let val = this.formModel.cardNumber || '';
    val = val.replace(/\D/g, '');
    
    // Format card number as "xxxx xxxx xxxx xxxx"
    let formatted = '';
    for (let i = 0; i < val.length; i++) {
      if (i > 0 && i % 4 === 0) {
        formatted += ' ';
      }
      formatted += val[i];
    }
    this.formModel.cardNumber = formatted;

    // Brand detection
    if (val.startsWith('4')) {
      this.detectedBrand = 'VISA';
    } else if (val.startsWith('5') || val.startsWith('2')) {
      this.detectedBrand = 'Mastercard';
    } else if (val.startsWith('3')) {
      this.detectedBrand = 'AMEX';
    } else {
      this.detectedBrand = 'Tarjeta';
    }
  }

  onExpiryInput() {
    let val = this.formModel.expiry || '';
    val = val.replace(/\D/g, '');
    if (val.length >= 2) {
      this.formModel.expiry = val.slice(0, 2) + '/' + val.slice(2, 4);
    } else {
      this.formModel.expiry = val;
    }
  }

  formatCardNumberPreview(num: string | undefined): string {
    if (!num) return '••••  ••••  ••••  ••••';
    const digitsOnly = num.replace(/\s/g, '');
    const padded = digitsOnly.padEnd(16, '•');
    let result = '';
    for (let i = 0; i < 16; i++) {
      if (i > 0 && i % 4 === 0) {
        result += '  ';
      }
      result += padded[i];
    }
    return result;
  }

  savePayment(form: NgForm) {
    if (form.invalid) return;

    if (this.formModel.type === 'card') {
      const digits = this.formModel.cardNumber.replace(/\s/g, '');
      if (digits.length < 15) {
        this.showToast('El número de tarjeta debe tener al menos 15 dígitos', true);
        return;
      }
      
      const last4 = digits.slice(-4);
      const label = `${this.detectedBrand} terminada en`;
      this.userService.addPaymentMethod({
        type: 'card',
        label: label,
        last4: last4,
        isDefault: this.formModel.isDefault
      });
    } else {
      this.userService.addPaymentMethod({
        type: this.formModel.type,
        label: this.formModel.label || (this.formModel.type === 'cash' ? 'Pago en efectivo' : 'Transferencia SPEI'),
        isDefault: this.formModel.isDefault
      });
    }

    this.showToast('Método de pago agregado con éxito');
    this.showFormModal = false;
  }

  setDefaultPayment(pm: SavedPaymentMethod) {
    this.userService.updatePaymentMethod({ ...pm, isDefault: true });
    this.showToast('Método de pago principal actualizado');
  }

  deletePayment(pm: SavedPaymentMethod) {
    if (pm.isDefault) {
      this.showToast('No se puede eliminar el método de pago principal', true);
      return;
    }
    if (confirm(`¿Estás seguro de que deseas eliminar el método "${pm.label} ${pm.last4 || ''}"?`)) {
      this.userService.deletePaymentMethod(pm.id);
      this.showToast('Método de pago eliminado');
    }
  }

  showToast(msg: string, isError = false) {
    this.toastMessage = msg;
    this.isToastError = isError;
    setTimeout(() => {
      this.toastMessage = '';
      this.isToastError = false;
    }, 3000);
  }
}
