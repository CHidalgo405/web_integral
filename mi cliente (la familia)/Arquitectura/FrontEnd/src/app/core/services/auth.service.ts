import { Injectable, signal, computed } from '@angular/core';
import { Router } from '@angular/router';
import { User, LoginRequest, RegisterRequest, ForgotPasswordRequest, VerifyOtpRequest } from '../models/user.model';

const DEMO_ACCOUNTS: Record<string, { password: string; user: User }> = {
  'admin@tienditamaday.test': {
    password: 'Admin123!',
    user: {
      id: 'demo-admin',
      firstName: 'Admin',
      lastName: 'Maday',
      email: 'admin@tienditamaday.test',
      phone: '+52 555 000 0001',
      isVerified: true,
      createdAt: new Date('2026-01-01T00:00:00'),
      role: 'admin',
    },
  },
  'cliente@tienditamaday.test': {
    password: 'Cliente123!',
    user: {
      id: 'demo-client',
      firstName: 'Cliente',
      lastName: 'Maday',
      email: 'cliente@tienditamaday.test',
      phone: '+52 555 000 0002',
      isVerified: true,
      createdAt: new Date('2026-01-01T00:00:00'),
      role: 'user',
    },
  },
};

@Injectable({ providedIn: 'root' })
export class AuthService {
  private currentUser = signal<User | null>(null);
  private token = signal<string | null>(null);

  readonly isAuthenticated = computed(() => !!this.token());
  readonly user = computed(() => this.currentUser());

  constructor(private router: Router) {
    this.loadFromStorage();
  }

  private loadFromStorage(): void {
    const storedToken = localStorage.getItem('auth_token');
    const storedUser = localStorage.getItem('auth_user');
    if (storedToken && storedUser) {
      this.token.set(storedToken);
      this.currentUser.set(JSON.parse(storedUser));
    }
  }

  login(request: LoginRequest): boolean {
    const email = request.email.trim().toLowerCase();
    const account = DEMO_ACCOUNTS[email];
    if (!account || account.password !== request.password) return false;

    const user: User = { ...account.user, createdAt: new Date(account.user.createdAt) };
    const token = `demo-token-${user.role}-${Date.now()}`;

    this.currentUser.set(user);
    this.token.set(token);
    localStorage.setItem('auth_token', token);
    localStorage.setItem('auth_user', JSON.stringify(user));
    return true;
  }

  register(request: RegisterRequest): boolean {
    const registeredUser: User = {
      id: `registered-${Date.now()}`,
      firstName: request.firstName,
      lastName: request.lastName,
      email: request.email,
      phone: request.phone,
      isVerified: false,
      createdAt: new Date(),
      role: 'user',
    };
    this.currentUser.set(registeredUser);
    return true;
  }

  forgotPassword(request: ForgotPasswordRequest): boolean {
    return true;
  }

  verifyOtp(request: VerifyOtpRequest): boolean {
    if (request.code === '123456') {
      const user = this.currentUser();
      if (user) {
        this.currentUser.set({ ...user, isVerified: true });
      }
      return true;
    }
    return false;
  }

  updateProfile(data: Partial<User>): void {
    const user = this.currentUser();
    if (!user) return;
    const updated = { ...user, ...data };
    this.currentUser.set(updated);
    localStorage.setItem('auth_user', JSON.stringify(updated));
  }

  logout(): void {
    this.currentUser.set(null);
    this.token.set(null);
    localStorage.removeItem('auth_token');
    localStorage.removeItem('auth_user');
    this.router.navigate(['/auth/login']);
  }
}
