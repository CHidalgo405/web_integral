const nodemailer = require('nodemailer');

const SMTP_HOST = process.env.SMTP_HOST || 'smtp.gmail.com';
const SMTP_PORT = process.env.SMTP_PORT || 587;
const SMTP_USER = process.env.SMTP_USER;
const SMTP_PASS = process.env.SMTP_PASS;
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:4200';
const SENDER_EMAIL = process.env.SENDER_EMAIL || (process.env.SMTP_USER ? `"Tiendita Maday" <${process.env.SMTP_USER}>` : '"Tiendita Maday" <noreply@tienditamaday.com>');

/**
 * Crea el transportador de correo si los datos de configuración SMTP están presentes.
 */
const getTransporter = () => {
  if (SMTP_HOST && SMTP_USER && SMTP_PASS) {
    return nodemailer.createTransport({
      host: SMTP_HOST,
      port: Number(SMTP_PORT),
      secure: Number(SMTP_PORT) === 465, // true para 465, false para otros puertos
      auth: {
        user: SMTP_USER,
        pass: SMTP_PASS,
      },
    });
  }
  return null;
};

/**
 * Envía el correo de restablecimiento de contraseña.
 * Si no está configurado el servidor SMTP, imprime el token en la consola.
 */
const sendResetPasswordEmail = async (email, token) => {
  const resetLink = `${FRONTEND_URL}/auth/reset-password?token=${token}&email=${encodeURIComponent(email)}`;
  const transporter = getTransporter();

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

  if (transporter) {
    try {
      await transporter.sendMail({
        from: SENDER_EMAIL,
        to: email,
        subject: 'Restablecer Contraseña - Tiendita Maday',
        html: htmlContent,
      });
      console.log(`[EMAIL] Correo de restablecimiento enviado exitosamente a ${email}`);
    } catch (error) {
      console.error('[EMAIL ERROR] Error al enviar correo de restablecimiento:', error);
      // Fallback a log en consola
      logToConsole(email, resetLink);
    }
  } else {
    logToConsole(email, resetLink);
  }
};

const logToConsole = (email, resetLink) => {
  console.log('\n' + '='.repeat(80));
  console.log(' SIMULACIÓN DE ENVÍO DE CORREO (SMTP NO CONFIGURADO) '.padStart(65, ' ').padEnd(80, ' '));
  console.log('='.repeat(80));
  console.log(`Para: ${email}`);
  console.log(`Asunto: Restablecer Contraseña - Tiendita Maday`);
  console.log(`Enlace de restablecimiento:\n--> ${resetLink}`);
  console.log('='.repeat(80) + '\n');
};

module.exports = {
  sendResetPasswordEmail,
};
