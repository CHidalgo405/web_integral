import { Component, inject, signal, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../../core/services/auth.service';
import { Header } from '../../../shared/components/header/header';
import { IconComponent } from '../../../shared/components/icon/icon';

@Component({
  selector: 'app-profile-edit',
  standalone: true,
  imports: [FormsModule, Header, IconComponent],
  template: `
    <app-header title="Editar perfil" [showBack]="true"></app-header>

    <div class="edit-page" id="profile-edit-page">

      <!-- Avatar -->
      <div class="avatar-section">
        <div class="avatar-wrapper">
          <div class="avatar-initials">
            {{ firstName()[0] }}{{ lastName()[0] }}
          </div>
          <button class="avatar-edit-btn" aria-label="Cambiar foto" type="button">
            <app-icon name="camera" size="16" color="#fff" />
          </button>
        </div>
        <p class="avatar-hint">Toca para cambiar tu foto</p>
      </div>

      <!-- Formulario -->
      <div class="form-card">

        <div class="field-group">
          <label class="field-label" for="firstName">Nombre</label>
          <div class="input-wrap">
            <app-icon name="user" size="16" color="var(--text-muted)" />
            <input
              id="firstName"
              class="field-input"
              type="text"
              placeholder="Tu nombre"
              [ngModel]="firstName()"
              (ngModelChange)="firstName.set($event)"
            />
          </div>
        </div>

        <div class="field-group">
          <label class="field-label" for="lastName">Apellido</label>
          <div class="input-wrap">
            <app-icon name="user" size="16" color="var(--text-muted)" />
            <input
              id="lastName"
              class="field-input"
              type="text"
              placeholder="Tu apellido"
              [ngModel]="lastName()"
              (ngModelChange)="lastName.set($event)"
            />
          </div>
        </div>

        <div class="field-group">
          <label class="field-label" for="phone">Teléfono</label>
          <div class="input-wrap">
            <app-icon name="phone" size="16" color="var(--text-muted)" />
            <input
              id="phone"
              class="field-input"
              type="tel"
              placeholder="+52 55 1234 5678"
              [ngModel]="phone()"
              (ngModelChange)="phone.set($event)"
            />
          </div>
        </div>

        <div class="field-group">
          <label class="field-label" for="email">
            Correo electrónico
            <span class="field-tag">No editable</span>
          </label>
          <div class="input-wrap input-wrap--disabled">
            <app-icon name="mail" size="16" color="var(--text-muted)" />
            <input
              id="email"
              class="field-input"
              type="email"
              [value]="email()"
              disabled
            />
          </div>
          <p class="field-hint">Para cambiar tu correo contacta a soporte.</p>
        </div>

      </div>

      <!-- Acciones -->
      <div class="actions">
        <button
          class="btn-save"
          type="button"
          [disabled]="!canSave()"
          (click)="save()"
          id="save-profile-btn"
        >
          @if (saved()) {
            <app-icon name="check" size="18" color="#fff" />
            Cambios guardados
          } @else {
            Guardar cambios
          }
        </button>

        <button class="btn-cancel" type="button" (click)="router.navigate(['/profile'])">
          Cancelar
        </button>
      </div>

    </div>
  `,
  styles: [`
    .edit-page {
      padding-bottom: 100px;
      background: var(--bg);
      min-height: 100dvh;
    }

    /* ---- Avatar ---- */
    .avatar-section {
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 32px 20px 20px;
      background: linear-gradient(135deg, var(--primary) 0%, #0d3323 100%);
    }

    .avatar-wrapper {
      position: relative;
      margin-bottom: 10px;
    }

    .avatar-initials {
      width: 88px;
      height: 88px;
      border-radius: 50%;
      background: var(--surface);
      color: var(--primary);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 2rem;
      font-weight: 800;
      font-family: var(--font-heading);
      border: 3px solid rgba(255,255,255,0.8);
      box-shadow: 0 8px 24px rgba(0,0,0,0.15);
      text-transform: uppercase;
    }

    .avatar-edit-btn {
      position: absolute;
      bottom: 2px;
      right: 2px;
      width: 30px;
      height: 30px;
      border-radius: 50%;
      background: var(--secondary);
      border: 2px solid #fff;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      transition: transform 0.2s;
    }
    .avatar-edit-btn:hover { transform: scale(1.1); }

    .avatar-hint {
      font-size: 0.78rem;
      color: rgba(255,255,255,0.7);
      margin: 0;
      font-weight: 500;
    }

    /* ---- Formulario ---- */
    .form-card {
      background: var(--surface);
      margin: 20px 16px;
      border-radius: 24px;
      padding: 20px;
      border: 1px solid var(--border);
      display: flex;
      flex-direction: column;
      gap: 18px;
    }

    .field-group {
      display: flex;
      flex-direction: column;
      gap: 6px;
    }

    .field-label {
      font-size: 0.78rem;
      font-weight: 800;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      color: var(--text-secondary);
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .field-tag {
      font-size: 0.65rem;
      font-weight: 700;
      color: var(--text-muted);
      background: var(--bg);
      border: 1px solid var(--border);
      border-radius: 6px;
      padding: 2px 7px;
      text-transform: none;
      letter-spacing: 0;
    }

    .input-wrap {
      display: flex;
      align-items: center;
      gap: 10px;
      background: var(--bg);
      border: 1.5px solid var(--border);
      border-radius: 14px;
      padding: 12px 16px;
      transition: border-color 0.2s;
    }
    .input-wrap:focus-within {
      border-color: var(--primary);
    }
    .input-wrap--disabled {
      opacity: 0.6;
    }

    .field-input {
      flex: 1;
      border: none;
      background: transparent;
      font-size: 0.95rem;
      font-weight: 600;
      color: var(--text-primary);
      outline: none;
      font-family: inherit;
    }
    .field-input::placeholder {
      color: var(--text-muted);
      font-weight: 400;
    }
    .field-input:disabled {
      cursor: not-allowed;
    }

    .field-hint {
      font-size: 0.75rem;
      color: var(--text-muted);
      margin: 0;
      padding-left: 4px;
    }

    /* ---- Acciones ---- */
    .actions {
      padding: 0 16px;
      display: flex;
      flex-direction: column;
      gap: 10px;
    }

    .btn-save {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      width: 100%;
      padding: 16px;
      background: var(--primary);
      color: #fff;
      border: none;
      border-radius: 9999px;
      font-weight: 800;
      font-size: 0.95rem;
      cursor: pointer;
      transition: background 0.2s, transform 0.2s;
      box-shadow: 0 4px 14px rgba(27,61,50,0.25);
    }
    .btn-save:hover:not(:disabled) { background: #0d3323; transform: translateY(-1px); }
    .btn-save:disabled { opacity: 0.5; cursor: not-allowed; }

    .btn-cancel {
      width: 100%;
      padding: 14px;
      background: none;
      border: none;
      font-size: 0.88rem;
      font-weight: 600;
      color: var(--text-muted);
      cursor: pointer;
      transition: color 0.2s;
    }
    .btn-cancel:hover { color: var(--text-secondary); }
  `],
})
export class ProfileEdit implements OnInit {
  protected authService = inject(AuthService);
  protected router = inject(Router);

  firstName = signal('');
  lastName  = signal('');
  phone     = signal('');
  email     = signal('');
  saved     = signal(false);

  ngOnInit(): void {
    const u = this.authService.user();
    if (u) {
      this.firstName.set(u.firstName);
      this.lastName.set(u.lastName);
      this.phone.set(u.phone);
      this.email.set(u.email);
    }
  }

  canSave(): boolean {
    return this.firstName().trim().length > 0 && this.lastName().trim().length > 0;
  }

  save(): void {
    if (!this.canSave()) return;
    this.authService.updateProfile({
      firstName: this.firstName().trim(),
      lastName:  this.lastName().trim(),
      phone:     this.phone().trim(),
    });
    this.saved.set(true);
    setTimeout(() => this.router.navigate(['/profile']), 1200);
  }
}
