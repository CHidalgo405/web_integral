import { Routes } from '@angular/router';

export const AUTH_ROUTES: Routes = [
  { path: '', redirectTo: 'onboarding', pathMatch: 'full' },
  { path: 'onboarding', loadComponent: () => import('./onboarding/onboarding').then(m => m.Onboarding) },
  { path: 'splash', loadComponent: () => import('./splash/splash').then(m => m.Splash) },
  { path: 'login', loadComponent: () => import('./login/login').then(m => m.Login) },
  { path: 'register', loadComponent: () => import('./register/register').then(m => m.Register) },
  { path: 'forgot-password', loadComponent: () => import('./forgot-password/forgot-password').then(m => m.ForgotPassword) },
  { path: 'email-sent', loadComponent: () => import('./email-sent/email-sent').then(m => m.EmailSent) },
  { path: 'verify-otp', loadComponent: () => import('./verify-otp/verify-otp').then(m => m.VerifyOtp) },
  { path: 'reset-password', loadComponent: () => import('./reset-password/reset-password').then(m => m.ResetPassword) },
];