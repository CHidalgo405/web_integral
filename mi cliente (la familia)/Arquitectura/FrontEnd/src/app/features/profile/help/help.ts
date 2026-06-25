import { Component, inject } from '@angular/core';
import { Header } from '../../../shared/components/header/header';
import { IconComponent } from '../../../shared/components/icon/icon';
import { FormsModule, NgForm } from '@angular/forms';

interface FAQ {
  q: string;
  a: string;
  category: 'orders' | 'payments' | 'shipping' | 'account';
  icon: string;
}

@Component({
  selector: 'app-help',
  standalone: true,
  imports: [Header, IconComponent, FormsModule],
  template: `
    <app-header title="Centro de Ayuda" [showBack]="true"></app-header>
    
    <div class="help-page-container" id="help-page">
      
      <!-- Hero Banner & Search -->
      <div class="help-hero">
        <h1 class="hero-title">¿Cómo podemos ayudarte hoy?</h1>
        <p class="hero-subtitle">Encuentra respuestas rápidas o contacta a soporte</p>
        
        <div class="search-box-wrapper">
          <app-icon name="search" size="18" class="search-icon" />
          <input 
            type="text" 
            [(ngModel)]="searchTerm" 
            placeholder="Busca preguntas, temas o palabras clave..." 
            class="search-input"
            id="faq-search-input" 
          />
          @if (searchTerm) {
            <button class="clear-search-btn" (click)="searchTerm = ''">
              <app-icon name="x" size="16" />
            </button>
          }
        </div>
      </div>

      <!-- Main Contents Padding wrapper -->
      <div class="help-content-wrapper">
        
        <!-- Category Filter Pills -->
        <h3 class="section-title">Preguntas Frecuentes</h3>
        <div class="category-pills-row">
          <button 
            type="button" 
            class="pill-btn" 
            [class.active]="selectedCategory === 'all'" 
            (click)="selectedCategory = 'all'"
          >
            <span>Todas</span>
          </button>
          <button 
            type="button" 
            class="pill-btn" 
            [class.active]="selectedCategory === 'orders'" 
            (click)="selectedCategory = 'orders'"
          >
            <app-icon name="shopping-cart" size="14" />
            <span>Pedidos</span>
          </button>
          <button 
            type="button" 
            class="pill-btn" 
            [class.active]="selectedCategory === 'payments'" 
            (click)="selectedCategory = 'payments'"
          >
            <app-icon name="credit-card" size="14" />
            <span>Pagos</span>
          </button>
          <button 
            type="button" 
            class="pill-btn" 
            [class.active]="selectedCategory === 'shipping'" 
            (click)="selectedCategory = 'shipping'"
          >
            <app-icon name="truck" size="14" />
            <span>Envíos</span>
          </button>
          <button 
            type="button" 
            class="pill-btn" 
            [class.active]="selectedCategory === 'account'" 
            (click)="selectedCategory = 'account'"
          >
            <app-icon name="user" size="14" />
            <span>Cuenta</span>
          </button>
        </div>

        <!-- FAQ Accordions List -->
        <div class="faq-accordion-list">
          @for (faq of filteredFaqs; track faq.q; let idx = $index) {
            <div class="faq-card" [class.is-open]="openFaqIndex === idx">
              <div class="faq-question-row" (click)="toggleFaq(idx)">
                <div class="faq-title-wrapper">
                  <app-icon [name]="faq.icon" size="16" class="faq-category-icon" />
                  <span class="faq-question">{{ faq.q }}</span>
                </div>
                <app-icon 
                  name="plus" 
                  size="16" 
                  [className]="openFaqIndex === idx ? 'chevron-indicator rotate-45' : 'chevron-indicator'" 
                />
              </div>
              <div class="faq-answer-container" [class.expanded]="openFaqIndex === idx">
                <div class="faq-answer-inner">
                  <p>{{ faq.a }}</p>
                </div>
              </div>
            </div>
          } @empty {
            <div class="no-results-card">
              <app-icon name="alert-triangle" size="32" />
              <h4>No encontramos resultados</h4>
              <p>Prueba buscando con palabras clave diferentes o envía un ticket de soporte abajo.</p>
            </div>
          }
        </div>

        <!-- Support Channels Section -->
        <h3 class="section-title" style="margin-top: 28px;">Soporte Directo</h3>
        <div class="support-channels-grid">
          <a href="tel:5553264542" class="support-channel-card">
            <div class="channel-icon-wrapper call">
              <app-icon name="phone" size="20" color="#fff" />
            </div>
            <div class="channel-info">
              <h4>Llamar a Soporte</h4>
              <p>555-MADAY (62329)</p>
            </div>
          </a>
          
          <a href="mailto:soporte@tienditamaday.com?subject=Ayuda con la app" class="support-channel-card">
            <div class="channel-icon-wrapper email">
              <app-icon name="mail" size="20" color="#fff" />
            </div>
            <div class="channel-info">
              <h4>Enviar Correo</h4>
              <p>soporte&#64;maday.com</p>
            </div>
          </a>
        </div>

        <!-- Ticket Message Form -->
        <div class="support-ticket-card">
          <h4 class="form-title">¿Aún tienes dudas? Escríbenos</h4>
          <p class="form-subtitle">Enviaremos tu duda a nuestro equipo y te responderemos a la brevedad.</p>
          
          <form #ticketForm="ngForm" (ngSubmit)="submitTicket(ticketForm)" class="ticket-form" id="support-ticket-form">
            <div class="form-group">
              <label class="label-control">Nombre Completo</label>
              <input 
                type="text" 
                name="userName" 
                [(ngModel)]="formModel.name" 
                required 
                placeholder="Ej. Carlos Hernández" 
                class="form-control" 
              />
            </div>
            
            <div class="form-group">
              <label class="label-control">Correo Electrónico</label>
              <input 
                type="email" 
                name="userEmail" 
                [(ngModel)]="formModel.email" 
                required 
                email 
                placeholder="Ej. carlos&#64;email.com" 
                class="form-control" 
              />
            </div>
            
            <div class="form-group">
              <label class="label-control">Tu Mensaje o Duda</label>
              <textarea 
                name="userMessage" 
                [(ngModel)]="formModel.message" 
                required 
                rows="3" 
                placeholder="Describe a detalle en qué podemos ayudarte..." 
                class="form-control textarea-control"
              ></textarea>
            </div>

            <button 
              type="submit" 
              [disabled]="ticketForm.invalid || isSubmitting" 
              class="btn btn-primary btn-full btn-submit"
            >
              @if (isSubmitting) {
                <app-icon name="loader" size="18" className="app-icon-spin" color="#fff" />
                <span style="margin-left: 8px;">Enviando...</span>
              } @else {
                <span>Enviar Mensaje</span>
              }
            </button>
          </form>
        </div>

      </div>

    </div>

    <!-- Toast Notifications -->
    @if (toastMessage) {
      <div class="toast-notification">
        <app-icon name="check" size="16" color="#fff" />
        <span>{{ toastMessage }}</span>
      </div>
    }
  `,
  styles: [`
    .help-page-container {
      background-color: var(--bg);
      min-height: 100dvh;
      padding-bottom: 80px;
    }

    /* Hero Banner */
    .help-hero {
      background: linear-gradient(135deg, var(--primary) 0%, var(--primary-dark) 100%);
      color: #fff;
      padding: 32px 20px 40px;
      text-align: center;
      border-radius: 0 0 32px 32px;
      box-shadow: 0 8px 24px rgba(15, 42, 32, 0.15);
    }
    .hero-title {
      font-family: var(--font-heading);
      font-size: 1.5rem;
      font-weight: 800;
      color: #fff;
      margin: 0 0 6px;
    }
    .hero-subtitle {
      font-size: 0.85rem;
      color: rgba(255, 255, 255, 0.7);
      margin: 0 0 24px;
      font-weight: 500;
    }

    /* Search Box styling */
    .search-box-wrapper {
      position: relative;
      width: 100%;
      max-width: 420px;
      margin: 0 auto;
    }
    .search-icon {
      position: absolute;
      left: 16px;
      top: 50%;
      transform: translateY(-50%);
      color: var(--primary);
    }
    .search-input {
      width: 100%;
      padding: 14px 44px 14px 48px;
      border-radius: 99px;
      border: none;
      outline: none;
      font-family: var(--font-body);
      font-size: 0.9rem;
      font-weight: 600;
      color: var(--text-primary);
      background: var(--surface);
      box-shadow: 0 8px 20px rgba(0,0,0,0.08);
      transition: all 0.25s;
    }
    .search-input:focus {
      box-shadow: 0 8px 24px rgba(125, 175, 50, 0.25);
    }
    .clear-search-btn {
      position: absolute;
      right: 14px;
      top: 50%;
      transform: translateY(-50%);
      background: none;
      border: none;
      color: var(--text-muted);
      cursor: pointer;
      padding: 4px;
      display: flex;
      align-items: center;
    }
    .clear-search-btn:hover {
      color: var(--text-primary);
    }

    .help-content-wrapper {
      padding: 24px 16px;
      max-width: 500px;
      margin: 0 auto;
    }

    .section-title {
      font-family: var(--font-heading);
      font-size: 1.15rem;
      font-weight: 800;
      color: var(--text-primary);
      margin: 0 0 12px;
    }

    /* Category scroll pills */
    .category-pills-row {
      display: flex;
      gap: 8px;
      overflow-x: auto;
      padding-bottom: 14px;
      margin-bottom: 12px;
      -webkit-overflow-scrolling: touch;
    }
    .pill-btn {
      flex-shrink: 0;
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 8px 16px;
      border-radius: 99px;
      border: 1px solid var(--border);
      background: var(--surface);
      color: var(--text-secondary);
      font-size: 0.8rem;
      font-weight: 700;
      cursor: pointer;
      transition: all 0.2s;
    }
    .pill-btn:hover {
      background: var(--hover);
      border-color: var(--text-muted);
    }
    .pill-btn.active {
      background: var(--primary);
      border-color: var(--primary);
      color: #fff;
      box-shadow: 0 4px 10px rgba(28, 84, 66, 0.2);
    }
    .pill-btn app-icon {
      color: inherit;
    }

    /* FAQ accordion cards */
    .faq-accordion-list {
      display: flex;
      flex-direction: column;
      gap: 10px;
    }
    .faq-card {
      background: var(--surface-raised);
      border-radius: 16px;
      border: 1px solid var(--border);
      overflow: hidden;
      transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
      box-shadow: 0 4px 12px rgba(0,0,0,0.02);
    }
    .faq-card.is-open {
      border-color: var(--primary-alpha);
      box-shadow: 0 8px 20px rgba(28, 84, 66, 0.05);
    }
    .faq-question-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 16px;
      cursor: pointer;
      user-select: none;
    }
    .faq-title-wrapper {
      display: flex;
      align-items: center;
      gap: 10px;
      flex: 1;
      padding-right: 8px;
    }
    .faq-category-icon {
      color: var(--primary);
    }
    .faq-question {
      font-size: 0.85rem;
      font-weight: 700;
      color: var(--text-primary);
      line-height: 1.35;
    }
    
    .chevron-indicator {
      color: var(--text-muted);
      transition: transform 0.3s cubic-bezier(0.16, 1, 0.3, 1);
    }
    .rotate-45 {
      transform: rotate(45deg);
      color: var(--primary);
    }

    /* Expanding Container */
    .faq-answer-container {
      max-height: 0;
      opacity: 0;
      overflow: hidden;
      transition: max-height 0.35s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.35s ease;
    }
    .faq-answer-container.expanded {
      max-height: 400px;
      opacity: 1;
    }
    .faq-answer-inner {
      padding: 0 16px 16px 42px;
    }
    .faq-answer-inner p {
      font-size: 0.8rem;
      color: var(--text-secondary);
      line-height: 1.45;
      margin: 0;
    }

    /* No results styling */
    .no-results-card {
      text-align: center;
      padding: 30px 20px;
      background: var(--surface);
      border-radius: 16px;
      border: 1px dashed var(--border);
      color: var(--text-muted);
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 8px;
    }
    .no-results-card h4 {
      margin: 4px 0 0;
      font-size: 0.95rem;
      font-weight: 800;
      color: var(--text-primary);
    }
    .no-results-card p {
      font-size: 0.75rem;
      color: var(--text-secondary);
      max-width: 300px;
      line-height: 1.4;
      margin: 0;
    }

    /* Support direct channels grid */
    .support-channels-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 12px;
      margin-bottom: 24px;
    }
    .support-channel-card {
      background: var(--surface-raised);
      border: 1px solid var(--border);
      border-radius: 18px;
      padding: 14px;
      display: flex;
      align-items: center;
      gap: 12px;
      text-decoration: none;
      box-shadow: 0 4px 12px rgba(0,0,0,0.02);
      transition: all 0.2s;
    }
    .support-channel-card:hover {
      transform: translateY(-2px);
      border-color: var(--primary);
      box-shadow: 0 6px 16px rgba(28, 84, 66, 0.08);
    }
    .channel-icon-wrapper {
      width: 38px;
      height: 38px;
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }
    .channel-icon-wrapper.call {
      background: var(--primary);
    }
    .channel-icon-wrapper.email {
      background: var(--accent);
    }
    
    .channel-info {
      overflow: hidden;
    }
    .channel-info h4 {
      font-family: var(--font-heading);
      font-size: 0.8rem;
      font-weight: 800;
      color: var(--text-primary);
      margin: 0;
    }
    .channel-info p {
      font-size: 0.65rem;
      color: var(--text-secondary);
      margin: 2px 0 0;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    /* Ticket Message Form Card */
    .support-ticket-card {
      background: var(--surface-raised);
      border: 1px solid var(--border);
      border-radius: 24px;
      padding: 20px;
      box-shadow: 0 6px 18px rgba(0,0,0,0.03);
    }
    .form-title {
      font-family: var(--font-heading);
      font-size: 0.95rem;
      font-weight: 800;
      color: var(--text-primary);
      margin: 0 0 4px;
    }
    .form-subtitle {
      font-size: 0.75rem;
      color: var(--text-secondary);
      line-height: 1.35;
      margin: 0 0 16px;
    }

    .ticket-form {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }
    .form-group {
      display: flex;
      flex-direction: column;
      gap: 4px;
    }
    .label-control {
      font-size: 0.7rem;
      font-weight: 800;
      color: var(--text-secondary);
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    .form-control {
      width: 100%;
      padding: 10px 14px;
      border-radius: 10px;
      border: 1px solid var(--border);
      font-family: var(--font-body);
      font-weight: 600;
      font-size: 0.85rem;
      color: var(--text-primary);
      background: var(--surface);
      outline: none;
      transition: all 0.25s;
    }
    .form-control:focus {
      border-color: var(--primary);
      box-shadow: 0 0 0 2px var(--primary-alpha);
    }
    .textarea-control {
      resize: vertical;
    }

    .btn {
      padding: 12px 24px;
      border-radius: 12px;
      font-weight: 700;
      font-size: 0.85rem;
      border: none;
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      transition: all 0.2s;
    }
    .btn-primary {
      background: var(--primary);
      color: #fff;
    }
    .btn-primary:hover:not(:disabled) {
      background: var(--primary-dark);
    }
    .btn-primary:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }
    .btn-full {
      width: 100%;
    }
    .btn-submit {
      margin-top: 6px;
      height: 44px;
    }

    /* Toast styling */
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

    @keyframes slideUpToast {
      from { transform: translateY(100%); opacity: 0; }
      to { transform: translateY(0); opacity: 1; }
    }
  `],
})
export class Help {
  searchTerm = '';
  selectedCategory = 'all';
  openFaqIndex: number | null = null;
  
  isSubmitting = false;
  toastMessage = '';
  
  formModel = {
    name: '',
    email: '',
    message: ''
  };

  faqs: FAQ[] = [
    { 
      q: '¿Cómo puedo hacer un pedido en la app?', 
      a: 'Es muy sencillo. Explora nuestro catálogo de productos frescos, agrégalos a tu carrito de compras, define tu dirección de entrega y método de pago favorito, y confirma la compra. ¡Nosotros nos encargamos del resto!', 
      category: 'orders',
      icon: 'shopping-cart'
    },
    { 
      q: '¿Puedo cancelar o modificar un pedido?', 
      a: 'Sí, puedes cancelar tu pedido directamente desde "Mis Pedidos" en tu perfil siempre y cuando esté en estado "Pendiente" o "Preparando". Si ya fue despachado, contáctanos de inmediato vía WhatsApp para darte una solución.', 
      category: 'orders',
      icon: 'shopping-cart'
    },
    { 
      q: '¿Cuáles son los métodos de pago disponibles?', 
      a: 'Ofrecemos múltiples alternativas seguras: tarjetas de débito/crédito (Visa, Mastercard, AMEX), pago en efectivo contra entrega y transferencias bancarias directas (SPEI).', 
      category: 'payments',
      icon: 'credit-card'
    },
    { 
      q: '¿Tienen cargos adicionales o comisiones por pago?', 
      a: 'No cobramos ninguna comisión por pagar con tarjeta o transferencia. El total que ves en tu carrito es exactamente el total a pagar.', 
      category: 'payments',
      icon: 'credit-card'
    },
    { 
      q: '¿Cuánto tiempo tarda en llegar mi pedido?', 
      a: 'El envío estándar tarda de 3 a 5 días hábiles, mientras que nuestro servicio Express entrega en 1 o 2 días hábiles. Si tu pedido es con entrega "Rapidito", te llegará el mismo día en cuestión de minutos.', 
      category: 'shipping',
      icon: 'truck'
    },
    { 
      q: '¿Cómo puedo rastrear la ubicación de mi entrega?', 
      a: 'Al ingresar a "Mis Pedidos" en tu perfil y seleccionar un pedido, verás un mapa y barra de progreso interactiva (stepper) con el estado de tu envío en tiempo real y notas de entrega del chofer.', 
      category: 'shipping',
      icon: 'truck'
    },
    { 
      q: '¿Cómo puedo actualizar mi dirección principal?', 
      a: 'Dirígete a tu Perfil, selecciona "Mis Direcciones", y haz clic en "Hacer principal" en la dirección deseada. También puedes agregar nuevas ubicaciones o editar las existentes con nuestro formulario rápido.', 
      category: 'account',
      icon: 'user'
    },
    { 
      q: '¿Mis datos de pago están seguros?', 
      a: 'Absolutamente. No almacenamos datos sensibles de tarjetas en nuestros servidores locales. Procesamos todos los pagos con encriptación SSL de nivel bancario y a través de pasarelas de pago certificadas.', 
      category: 'account',
      icon: 'lock'
    }
  ];

  get filteredFaqs() {
    return this.faqs.filter(faq => {
      const matchesCategory = this.selectedCategory === 'all' || faq.category === this.selectedCategory;
      const matchesSearch = !this.searchTerm ? true : 
        faq.q.toLowerCase().includes(this.searchTerm.toLowerCase()) || 
        faq.a.toLowerCase().includes(this.searchTerm.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }

  toggleFaq(index: number) {
    if (this.openFaqIndex === index) {
      this.openFaqIndex = null;
    } else {
      this.openFaqIndex = index;
    }
  }

  submitTicket(form: NgForm) {
    if (form.invalid || this.isSubmitting) return;
    
    this.isSubmitting = true;
    
    // Simulate submission delay
    setTimeout(() => {
      this.isSubmitting = false;
      this.toastMessage = '¡Mensaje enviado con éxito!';
      
      // Reset form
      this.formModel = {
        name: '',
        email: '',
        message: ''
      };
      form.resetForm();

      // Clear toast
      setTimeout(() => this.toastMessage = '', 3000);
    }, 1500);
  }
}
