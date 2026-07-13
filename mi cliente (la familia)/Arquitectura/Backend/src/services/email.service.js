// services/email.service.js
const EmailJS = require('@emailjs/nodejs');

// ============================================================
// CONFIGURACIÓN - EMAILJS
// ============================================================
const EMAILJS_PUBLIC_KEY = process.env.EMAILJS_PUBLIC_KEY;
const EMAILJS_PRIVATE_KEY = process.env.EMAILJS_PRIVATE_KEY;
const EMAILJS_SERVICE_ID = process.env.EMAILJS_SERVICE_ID;
const EMAILJS_TEMPLATE_VERIFICATION = process.env.EMAILJS_TEMPLATE_VERIFICATION;
const EMAILJS_TEMPLATE_RESET = process.env.EMAILJS_TEMPLATE_RESET;
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:4200';

// ============================================================
// INICIALIZAR EMAILJS
// ============================================================
let isEmailJSConfigured = false;

if (EMAILJS_PUBLIC_KEY && EMAILJS_PRIVATE_KEY && EMAILJS_SERVICE_ID) {
  try {
    EmailJS.init({
      publicKey: EMAILJS_PUBLIC_KEY,
      privateKey: EMAILJS_PRIVATE_KEY,
    });
    isEmailJSConfigured = true;
    console.log('[EMAIL] EmailJS inicializado correctamente');
  } catch (error) {
    console.error('[EMAIL ERROR] Error al inicializar EmailJS:', error);
  }
} else {
  console.log('[EMAIL] EmailJS no configurado. Modo desarrollo (emails en consola).');
}

// ============================================================
// FUNCIONES DE LOG (fallback)
// ============================================================
const logToConsole = (email, resetLink) => {
  console.log('\n' + '='.repeat(80));
  console.log(' SIMULACIÓN DE ENVÍO DE CORREO (EMAILJS NO CONFIGURADO) '.padStart(70, ' ').padEnd(80, ' '));
  console.log('='.repeat(80));
  console.log(`Para: ${email}`);
  console.log(`Asunto: Restablecer Contraseña - Tiendita Maday`);
  console.log(`Enlace:\n--> ${resetLink}`);
  console.log('='.repeat(80) + '\n');
};

const logVerificationToConsole = (email, code) => {
  console.log('\n' + '='.repeat(80));
  console.log(' SIMULACIÓN DE CORREO DE VERIFICACIÓN (EMAILJS NO CONFIGURADO) '.padStart(75, ' ').padEnd(80, ' '));
  console.log('='.repeat(80));
  console.log(`Para: ${email}`);
  console.log(`Asunto: Código de Verificación - Tiendita Maday`);
  console.log(`Código: ${code}`);
  console.log('='.repeat(80) + '\n');
};

// ============================================================
// FUNCIONES PRINCIPALES CON EMAILJS
// ============================================================

/**
 * Envía el correo de restablecimiento de contraseña.
 */
const sendResetPasswordEmail = async (email, token) => {
  const resetLink = `${FRONTEND_URL}/auth/reset-password?token=${token}&email=${encodeURIComponent(email)}`;

  if (isEmailJSConfigured && EMAILJS_TEMPLATE_RESET) {
    try {
      const templateParams = {
        to_email: email,
        reset_link: resetLink,
        to_name: email.split('@')[0],
        app_name: 'Tiendita Maday',
      };

      const response = await EmailJS.send(
        EMAILJS_SERVICE_ID,
        EMAILJS_TEMPLATE_RESET,
        templateParams
      );

      console.log(`[EMAIL] Correo de restablecimiento enviado a ${email}`);
      console.log(`[EMAIL] ID: ${response?.id || 'N/A'}`);
      return { success: true, provider: 'emailjs', data: response };
    } catch (error) {
      console.error('[EMAIL ERROR] Error al enviar restablecimiento:', error);
      logToConsole(email, resetLink);
      return { success: false, error: error.message };
    }
  } else {
    logToConsole(email, resetLink);
    return { success: true, simulated: true };
  }
};

/**
 * Envía el correo con el código OTP de 6 dígitos de verificación de cuenta.
 */
const sendVerificationEmail = async (email, code) => {
  if (isEmailJSConfigured && EMAILJS_TEMPLATE_VERIFICATION) {
    try {
      const templateParams = {
        to_email: email,
        otp_code: code,
        to_name: email.split('@')[0],
        app_name: 'Tiendita Maday',
        expiry_time: '1 hora',
        max_attempts: '3',
      };

      console.log('[EMAIL] Enviando verificación a:', email);
      console.log('[EMAIL] Código:', code);

      const response = await EmailJS.send(
        EMAILJS_SERVICE_ID,
        EMAILJS_TEMPLATE_VERIFICATION,
        templateParams
      );

      console.log(`[EMAIL] Código de verificación enviado a ${email}`);
      console.log(`[EMAIL] ID: ${response?.id || 'N/A'}`);
      return { success: true, provider: 'emailjs', data: response };
    } catch (error) {
      console.error('[EMAIL ERROR] Error al enviar verificación:', error);
      logVerificationToConsole(email, code);
      return { success: false, error: error.message };
    }
  } else {
    logVerificationToConsole(email, code);
    return { success: true, simulated: true };
  }
};

module.exports = {
  sendResetPasswordEmail,
  sendVerificationEmail,
};