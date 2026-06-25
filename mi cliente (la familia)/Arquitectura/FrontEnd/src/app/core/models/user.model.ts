export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  avatarUrl?: string;
  isVerified: boolean;
  createdAt: Date;
  role?: 'admin' | 'user';
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  password: string;
  confirmPassword: string;
}

export interface ForgotPasswordRequest {
  email: string;
}

export interface VerifyOtpRequest {
  email: string;
  code: string;
}
