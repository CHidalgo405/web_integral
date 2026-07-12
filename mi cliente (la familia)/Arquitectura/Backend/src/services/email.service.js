const { Resend } = require('resend');

// ============================================================
// CONFIGURACIÓN - RESEND
// ============================================================
const RESEND_API_KEY = process.env.RESEND_API_KEY;
const FROM_EMAIL = process.env.FROM_EMAIL || 'onboarding@resend.dev';
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:4200';

// ============================================================
// INICIALIZAR RESEND
// ============================================================
let resend = null;
let isResendConfigured = false;

if (RESEND_API_KEY) {
  try {
    resend = new Resend(RESEND_API_KEY);
    isResendConfigured = true;
    console.log('[EMAIL] Resend inicializado correctamente');
  } catch (error) {
    console.error('[EMAIL ERROR] Error al inicializar Resend:', error);
  }
} else {
  console.log('[EMAIL] RESEND_API_KEY no configurada. Modo desarrollo (emails en consola).');
}

// ============================================================
// FUNCIONES DE LOG (se mantienen igual)
// ============================================================
const logToConsole = (email, resetLink) => {
  console.log('\n' + '='.repeat(80));
  console.log(' SIMULACIÓN DE ENVÍO DE CORREO (RESEND NO CONFIGURADO) '.padStart(70, ' ').padEnd(80, ' '));
  console.log('='.repeat(80));
  console.log(`Para: ${email}`);
  console.log(`Asunto: Restablecer Contraseña - Tiendita Maday`);
  console.log(`Enlace de restablecimiento:\n--> ${resetLink}`);
  console.log('='.repeat(80) + '\n');
};

const logVerificationToConsole = (email, code) => {
  console.log('\n' + '='.repeat(80));
  console.log(' SIMULACIÓN DE CORREO DE VERIFICACIÓN (RESEND NO CONFIGURADO) '.padStart(75, ' ').padEnd(80, ' '));
  console.log('='.repeat(80));
  console.log(`Para: ${email}`);
  console.log(`Asunto: Código de Verificación - Tiendita Maday`);
  console.log(`Código de verificación: ${code}`);
  console.log('='.repeat(80) + '\n');
};

// ============================================================
// FUNCIONES PRINCIPALES (se mantienen con la misma firma)
// ============================================================

/**
 * Envía el correo de restablecimiento de contraseña.
 * Si no está configurado Resend, imprime el token en la consola.
 */
const sendResetPasswordEmail = async (email, token) => {
  const resetLink = `${FRONTEND_URL}/auth/reset-password?token=${token}&email=${encodeURIComponent(email)}`;

  const htmlContent = `
    <div style="font-family: 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 12px; background-color: #ffffff;">
      <div style="text-align: center; padding-bottom: 20px; border-bottom: 1px solid #edf2f7;">
        <h2 style="color: #1b3d32; margin: 0; font-size: 24px; font-weight: 800;">Tiendita Maday</h2>
      </div>
      <div style="padding: 20px 0;">
        <p style="font-size: 16px; color: #2d3748; line-height: 1.6;">Hola,</p>
        <p style="font-size: 16px; color: #2d3748; line-height: 1.6;">Has solicitado restablecer tu contraseña. Haz clic en el botón de abajo para continuar con el proceso:</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${resetLink}" target="_blank" style="background-color: #1b3d32; color: #ffffff; padding: 12px 24px; border-radius: 9999px; text-decoration: none; font-weight: bold; display: inline-block; box-shadow: 0 4px 6px rgba(27,61,50,0.1);">Restablecer Contraseña</a>
        </div>
        <p style="font-size: 14px; color: #718096; line-height: 1.6;">Este enlace expirará en 1 hora y solo se puede utilizar una vez.</p>
        <p style="font-size: 14px; color: #718096; line-height: 1.6;">Si tú no solicitaste este cambio, puedes ignorar este correo de forma segura.</p>
      </div>
      <div style="padding-top: 20px; border-top: 1px solid #edf2f7; text-align: center; font-size: 12px; color: #a0aec0;">
        <p>&copy; ${new Date().getFullYear()} Tiendita Maday. Todos los derechos reservados.</p>
      </div>
    </div>
  `;

  // Usar Resend si está configurado
  if (isResendConfigured && resend) {
    try {
      const { data, error } = await resend.emails.send({
        from: FROM_EMAIL,
        to: [email],
        subject: 'Restablecer Contraseña - Tiendita Maday',
        html: htmlContent,
      });

      if (error) {
        console.error('[EMAIL ERROR] Error al enviar correo de restablecimiento:', error);
        logToConsole(email, resetLink);
        return;
      }

      console.log(`[EMAIL] Correo de restablecimiento enviado exitosamente a ${email}`);
      console.log(`[EMAIL] ID del email: ${data?.id || 'N/A'}`);
    } catch (error) {
      console.error('[EMAIL ERROR] Error al enviar correo de restablecimiento:', error);
      logToConsole(email, resetLink);
    }
  } else {
    // Fallback a consola si Resend no está configurado
    logToConsole(email, resetLink);
  }
};

/**
 * Envía el correo con el código OTP de 6 dígitos de verificación de cuenta.
 */
const sendVerificationEmail = async (email, code) => {
  const htmlContent = `
    <div style="font-family: 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 12px; background-color: #ffffff;">
      <div style="text-align: center; padding-bottom: 20px; border-bottom: 1px solid #edf2f7;">
        <h2 style="color: #1b3d32; margin: 0; font-size: 24px; font-weight: 800;">Tiendita Maday</h2>
      </div>
      <div style="padding: 20px 0;">
        <p style="font-size: 16px; color: #2d3748; line-height: 1.6;">Hola,</p>
        <p style="font-size: 16px; color: #2d3748; line-height: 1.6;">Gracias por registrarte. Ingresa el siguiente código en la aplicación para verificar tu cuenta:</p>
        <div style="text-align: center; margin: 30px 0;">
          <div style="display: inline-block; background: #f7f9f8; border: 2px dashed #1b3d32; border-radius: 16px; padding: 20px 40px;">
            <span style="font-size: 42px; font-weight: 900; letter-spacing: 12px; color: #1b3d32; font-family: monospace;">${code}</span>
          </div>
        </div>
        <p style="font-size: 14px; color: #718096; line-height: 1.6;">Este código es válido por <strong>1 hora</strong> y tienes <strong>3 intentos</strong> para ingresarlo correctamente.</p>
        <p style="font-size: 14px; color: #718096; line-height: 1.6;">Si tú no creaste esta cuenta, puedes ignorar este correo de forma segura.</p>
      </div>
      <div style="padding-top: 20px; border-top: 1px solid #edf2f7; text-align: center; font-size: 12px; color: #a0aec0;">
        <p>&copy; ${new Date().getFullYear()} Tiendita Maday. Todos los derechos reservados.</p>
      </div>
    </div>
  `;

  // Usar Resend si está configurado
  if (isResendConfigured && resend) {
    try {
      const { data, error } = await resend.emails.send({
        from: FROM_EMAIL,
        to: [email],
        subject: 'Código de Verificación - Tiendita Maday',
        html: htmlContent,
      });

      if (error) {
        console.error('[EMAIL ERROR] Error al enviar código de verificación:', error);
        logVerificationToConsole(email, code);
        return;
      }

      console.log(`[EMAIL] Código de verificación enviado a ${email}`);
      console.log(`[EMAIL] ID del email: ${data?.id || 'N/A'}`);
    } catch (error) {
      console.error('[EMAIL ERROR] Error al enviar código de verificación:', error);
      logVerificationToConsole(email, code);
    }
  } else {
    // Fallback a consola si Resend no está configurado
    logVerificationToConsole(email, code);
  }
};

module.exports = {
  sendResetPasswordEmail,
  sendVerificationEmail,
};