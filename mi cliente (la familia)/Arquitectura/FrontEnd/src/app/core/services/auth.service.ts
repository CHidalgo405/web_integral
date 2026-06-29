import { Injectable, signal, computed } from '@angular/core';
import { Router } from '@angular/router';
import { User, LoginRequest, RegisterRequest, ForgotPasswordRequest, VerifyOtpRequest } from '../models/user.model';

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
    // Mock login
    const isAdmin = request.email.toLowerCase().includes('admin');
    const mockUser: User = {
      id: isAdmin ? '1' : '2',
      firstName: isAdmin ? 'Carlos' : 'María',
      lastName: isAdmin ? 'Hernández' : 'López',
      email: request.email,
      phone: '+52 555 123 4567',
      isVerified: true,
      createdAt: new Date(),
      role: isAdmin ? 'admin' : 'user',
    };
    const mockToken = 'mock-jwt-token-' + Date.now();

    this.currentUser.set(mockUser);
    this.token.set(mockToken);
    localStorage.setItem('auth_token', mockToken);
    localStorage.setItem('auth_user', JSON.stringify(mockUser));
    return true;
  }

  register(request: RegisterRequest): boolean {
    const mockUser: User = {
      id: '2',
      firstName: request.firstName,
      lastName: request.lastName,
      email: request.email,
      phone: request.phone,
      isVerified: false,
      createdAt: new Date(),
      role: 'user',
    };
    this.currentUser.set(mockUser);
    return true;
  }

  forgotPassword(request: ForgotPasswordRequest): boolean {
    // Mock: always succeeds
    return true;
  }

  verifyOtp(request: VerifyOtpRequest): boolean {
    // Mock: code "123456" is valid
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
