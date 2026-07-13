// core/services/email.service.ts
import { Injectable } from '@angular/core';
import emailjs from '@emailjs/browser';

@Injectable({
    providedIn: 'root'
})
export class EmailService {
    private readonly publicKey: string = '45KILZ8ktcLyWKJLK';
    private readonly serviceId: string = 'service_gba5fpk';
    private readonly templateVerification: string = 'template_d41cv35';
    private readonly templateReset: string = 'template_611oxwg';

    constructor() {
        emailjs.init(this.publicKey);
    }

    /**
     * Envía un código de verificación OTP
     */
    async sendVerificationEmail(email: string, code: string): Promise<any> {
        const templateParams = {
            to_email: email,
            otp_code: code,
            to_name: email.split('@')[0],
            app_name: 'Tiendita Maday',
            expiry_time: '1 hora',
            max_attempts: '3',
        };

        try {
            const response = await emailjs.send(
                this.serviceId,
                this.templateVerification,
                templateParams
            );
            console.log('[EMAIL] Código de verificación enviado:', response);
            return response;
        } catch (error) {
            console.error('[EMAIL ERROR] Error al enviar verificación:', error);
            throw error;
        }
    }

    /**
     * Envía un enlace de recuperación de contraseña
     */
    async sendResetPasswordEmail(email: string, token: string): Promise<any> {
        const resetLink = `${window.location.origin}/auth/reset-password?token=${token}&email=${encodeURIComponent(email)}`;

        const templateParams = {
            to_email: email,
            reset_link: resetLink,
            to_name: email.split('@')[0],
            app_name: 'Tiendita Maday',
        };

        try {
            const response = await emailjs.send(
                this.serviceId,
                this.templateReset,
                templateParams
            );
            console.log('[EMAIL] Enlace de recuperación enviado:', response);
            return response;
        } catch (error) {
            console.error('[EMAIL ERROR] Error al enviar recuperación:', error);
            throw error;
        }
    }
}