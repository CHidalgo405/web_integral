// core/services/auth.service.ts
import { Injectable, signal, computed, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { User, LoginRequest, RegisterRequest, ForgotPasswordRequest, VerifyOtpRequest, AuthResponse, ResetPasswordRequest } from '../models/user.model';
import { Observable, tap, from } from 'rxjs';
import { API_BASE_URL } from '../api.config';
import { EmailService } from './email.service';

export interface RegisterResponse {
  message: string;
  email: string;
  requiresVerification: boolean;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private currentUser = signal<User | null>(null);
  private accessToken = signal<string | null>(null);

  readonly isAuthenticated = computed(() => !!this.accessToken());
  readonly user = computed(() => this.currentUser());

  private http = inject(HttpClient);
  private router = inject(Router);
  private emailService = inject(EmailService);

  constructor() {
    this.loadFromStorage();
  }

  private loadFromStorage(): void {
    const storedToken = localStorage.getItem('access_token');
    const storedUser = localStorage.getItem('auth_user');
    if (storedToken && storedUser) {
      this.accessToken.set(storedToken);
      this.currentUser.set(JSON.parse(storedUser));
    }
  }

  private handleAuthSuccess(res: any): void {
    const mappedUser: User = {
      id: res.user.id,
      firstName: res.user.first_name || '',
      lastName: res.user.last_name || '',
      email: res.user.username,
      phone: res.user.phone,
      role: res.user.role,
      active: res.user.active,
      createdAt: res.user.created_at,
    };

    this.currentUser.set(mappedUser);
    this.accessToken.set(res.accessToken);
    localStorage.setItem('access_token', res.accessToken);
    localStorage.setItem('refresh_token', res.refreshToken);
    localStorage.setItem('auth_user', JSON.stringify(mappedUser));
  }

  login(request: LoginRequest): Observable<AuthResponse> {
    return this.http.post<any>(`${API_BASE_URL}/auth/login`, request).pipe(
      tap(res => this.handleAuthSuccess(res))
    );
  }

  loginWithGoogle(idToken: string, rememberMe = false): Observable<AuthResponse> {
    return this.http.post<any>(`${API_BASE_URL}/auth/google`, { id_token: idToken, remember_me: rememberMe }).pipe(
      tap(res => this.handleAuthSuccess(res))
    );
  }

  register(request: RegisterRequest): Observable<RegisterResponse> {
    const payload = {
      first_name: request.firstName,
      last_name: request.lastName,
      email: request.email,
      phone: request.phone,
      password: request.password
    };
    return this.http.post<RegisterResponse>(`${API_BASE_URL}/auth/register`, payload);
  }

  verifyOtp(request: VerifyOtpRequest): Observable<AuthResponse> {
    return this.http.post<any>(`${API_BASE_URL}/auth/verify-otp`, request).pipe(
      tap(res => this.handleAuthSuccess(res))
    );
  }

  resendVerificationCode(email: string): Observable<any> {
    return this.http.post<any>(`${API_BASE_URL}/auth/resend-verification`, { email });
  }

  landingRoute(): string {
    const role = this.currentUser()?.role;
    if (role === 'admin') return '/admin';
    if (role === 'cashier') return '/cashier';
    return '/home';
  }

  refreshToken(): Observable<{ accessToken: string, refreshToken: string }> {
    const refreshToken = localStorage.getItem('refresh_token');
    return this.http.post<{ accessToken: string, refreshToken: string }>(`${API_BASE_URL}/auth/refresh`, { refreshToken }).pipe(
      tap(res => {
        this.accessToken.set(res.accessToken);
        localStorage.setItem('access_token', res.accessToken);
        localStorage.setItem('refresh_token', res.refreshToken);
      })
    );
  }

  forgotPassword(request: ForgotPasswordRequest): Observable<any> {
    return this.http.post<any>(`${API_BASE_URL}/auth/forgot-password`, request);
  }

  resetPassword(request: ResetPasswordRequest): Observable<any> {
    return this.http.post<any>(`${API_BASE_URL}/auth/reset-password`, request);
  }

  updateProfile(data: Partial<User>): Observable<{ user: any }> {
    const payload = {
      first_name: data.firstName,
      last_name: data.lastName,
      phone: data.phone,
    };
    return this.http.put<{ user: any }>(`${API_BASE_URL}/auth/me`, payload).pipe(
      tap((res) => {
        const current = this.currentUser();
        if (!current) return;
        const updated: User = {
          ...current,
          firstName: res.user.first_name ?? current.firstName,
          lastName: res.user.last_name ?? current.lastName,
          phone: res.user.phone ?? current.phone,
        };
        this.currentUser.set(updated);
        localStorage.setItem('auth_user', JSON.stringify(updated));
      })
    );
  }

  logout(): void {
    const refreshToken = localStorage.getItem('refresh_token');
    if (refreshToken) {
      this.http.post(`${API_BASE_URL}/auth/logout`, { refreshToken }).subscribe({
        next: () => this.clearSession(),
        error: () => this.clearSession()
      });
    } else {
      this.clearSession();
    }
  }

  private clearSession(): void {
    this.currentUser.set(null);
    this.accessToken.set(null);
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('auth_user');
    this.router.navigate(['/auth/login']);
  }

  testEmail(email: string): Promise<any> {
    return this.emailService.sendVerificationEmail(email, '123456');
  }
}