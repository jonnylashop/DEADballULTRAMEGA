// ============================================
// CONFIGURACIÓN DE EMAILS - NODEMAILER
// ============================================
// Este archivo configura el servicio de envío de emails

const nodemailer = require('nodemailer');

// ============================================
// CREAR TRANSPORTER DE NODEMAILER
// ============================================
// El transporter es el objeto que se encarga de enviar los emails
// Aquí configuramos Gmail como proveedor

// NOTA: Para que funcione en producción, necesitas:
// 1. Una cuenta de Gmail
// 2. Activar "Acceso de apps menos seguras" O usar contraseñas de aplicación
// 3. Configurar las variables de entorno en .env

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER || 'tu-email@gmail.com',
        pass: process.env.EMAIL_PASSWORD || 'tu-contraseña-de-aplicacion'
    }
});

// ============================================
// FUNCIÓN: Enviar email de bienvenida
// ============================================
async function enviarEmailBienvenida(destinatario, nombreUsuario) {
    try {
        const mailOptions = {
            from: `"🎮 DEADBALL" <${process.env.EMAIL_USER || 'noreply@deadball.com'}>`,
            to: destinatario,
            subject: '🎉 ¡Bienvenido a DEADBALL!',
            html: `
                <!DOCTYPE html>
                <html>
                <head>
                    <style>
                        body {
                            font-family: 'Arial', sans-serif;
                            background-color: #f4f4f4;
                            margin: 0;
                            padding: 0;
                        }
                        .container {
                            max-width: 600px;
                            margin: 40px auto;
                            background: white;
                            border-radius: 10px;
                            overflow: hidden;
                            box-shadow: 0 4px 6px rgba(0,0,0,0.1);
                        }
                        .header {
                            background: linear-gradient(135deg, #1e3c72 0%, #2a5298 100%);
                            color: white;
                            padding: 40px 20px;
                            text-align: center;
                        }
                        .header h1 {
                            margin: 0;
                            font-size: 36px;
                            text-shadow: 2px 2px 4px rgba(0,0,0,0.3);
                        }
                        .content {
                            padding: 40px 30px;
                            color: #333;
                        }
                        .content h2 {
                            color: #1e3c72;
                            font-size: 24px;
                            margin-top: 0;
                        }
                        .content p {
                            line-height: 1.6;
                            font-size: 16px;
                            color: #555;
                        }
                        .features {
                            background: #f9f9f9;
                            border-left: 4px solid #ffd700;
                            padding: 20px;
                            margin: 20px 0;
                        }
                        .features ul {
                            margin: 10px 0;
                            padding-left: 20px;
                        }
                        .features li {
                            margin: 8px 0;
                            color: #333;
                        }
                        .cta-button {
                            display: inline-block;
                            background: linear-gradient(135deg, #ffd700, #ffed4e);
                            color: #1e3c72;
                            text-decoration: none;
                            padding: 15px 40px;
                            border-radius: 8px;
                            font-weight: bold;
                            font-size: 18px;
                            margin: 20px 0;
                            box-shadow: 0 4px 6px rgba(255,215,0,0.3);
                        }
                        .footer {
                            background: #f4f4f4;
                            padding: 20px;
                            text-align: center;
                            color: #999;
                            font-size: 12px;
                        }
                        .emoji {
                            font-size: 24px;
                        }
                    </style>
                </head>
                <body>
                    <div class="container">
                        <div class="header">
                            <h1>⚾ DEADBALL ⚾</h1>
                            <p style="margin: 10px 0 0 0; opacity: 0.9;">Simulador de Béisbol</p>
                        </div>
                        
                        <div class="content">
                            <h2>¡Hola, ${nombreUsuario}! 👋</h2>
                            
                            <p>
                                ¡Te damos la bienvenida a <strong>DEADBALL</strong>! Nos alegra que te unas a nuestra comunidad
                                de fanáticos del béisbol.
                            </p>
                            
                            <div class="features">
                                <p><strong>🎮 ¿Qué puedes hacer en DEADBALL?</strong></p>
                                <ul>
                                    <li>⚾ Jugar partidas completas de béisbol con dados</li>
                                    <li>💾 Guardar y cargar tus partidas en cualquier momento</li>
                                    <li>🏆 Competir en el Hall of Fame con otros jugadores</li>
                                    <li>💬 Chatear en tiempo real con la comunidad</li>
                                    <li>📊 Ver estadísticas detalladas de tus partidas</li>
                                </ul>
                            </div>
                            
                            <p>
                                Tu cuenta ha sido creada exitosamente. Ya puedes iniciar sesión y comenzar
                                a disfrutar de todas las funcionalidades del juego.
                            </p>
                            
                            <center>
                                <a href="http://localhost:3000" class="cta-button">
                                    🎮 Comenzar a Jugar
                                </a>
                            </center>
                            
                            <p style="margin-top: 30px; font-size: 14px; color: #999;">
                                Si no creaste esta cuenta, puedes ignorar este email.
                            </p>
                        </div>
                        
                        <div class="footer">
                            <p>© 2026 DEADBALL - Simulador de Béisbol</p>
                            <p>Este es un correo automático, por favor no respondas a este mensaje.</p>
                        </div>
                    </div>
                </body>
                </html>
            `
        };

        // Intentar enviar el email
        const info = await transporter.sendMail(mailOptions);
        console.log('✅ Email de bienvenida enviado:', info.messageId);
        return true;
    } catch (error) {
        // Si falla el envío, no bloqueamos el registro
        console.error('❌ Error al enviar email de bienvenida:', error.message);
        return false;
    }
}

// ============================================
// FUNCIÓN: Enviar email de recuperación
// ============================================
async function enviarEmailRecuperacion(destinatario, codigo) {
    try {
        const mailOptions = {
            from: `"🎮 DEADBALL" <${process.env.EMAIL_USER || 'noreply@deadball.com'}>`,
            to: destinatario,
            subject: '🔐 Código de Recuperación de Contraseña',
            html: `
                <!DOCTYPE html>
                <html>
                <head>
                    <style>
                        body {
                            font-family: 'Arial', sans-serif;
                            background-color: #f4f4f4;
                            margin: 0;
                            padding: 0;
                        }
                        .container {
                            max-width: 600px;
                            margin: 40px auto;
                            background: white;
                            border-radius: 10px;
                            overflow: hidden;
                            box-shadow: 0 4px 6px rgba(0,0,0,0.1);
                        }
                        .header {
                            background: linear-gradient(135deg, #EF5350 0%, #E53935 100%);
                            color: white;
                            padding: 40px 20px;
                            text-align: center;
                        }
                        .content {
                            padding: 40px 30px;
                            color: #333;
                        }
                        .code-box {
                            background: #f9f9f9;
                            border: 3px dashed #ffd700;
                            padding: 30px;
                            text-align: center;
                            margin: 30px 0;
                            border-radius: 10px;
                        }
                        .code {
                            font-size: 48px;
                            font-weight: bold;
                            color: #1e3c72;
                            letter-spacing: 8px;
                            font-family: 'Courier New', monospace;
                        }
                        .warning {
                            background: #fff3cd;
                            border-left: 4px solid #ffc107;
                            padding: 15px;
                            margin: 20px 0;
                            color: #856404;
                        }
                        .footer {
                            background: #f4f4f4;
                            padding: 20px;
                            text-align: center;
                            color: #999;
                            font-size: 12px;
                        }
                    </style>
                </head>
                <body>
                    <div class="container">
                        <div class="header">
                            <h1>🔐 Recuperación de Contraseña</h1>
                        </div>
                        
                        <div class="content">
                            <p>Has solicitado recuperar tu contraseña de DEADBALL.</p>
                            
                            <p>Usa el siguiente código para restablecer tu contraseña:</p>
                            
                            <div class="code-box">
                                <div class="code">${codigo}</div>
                                <p style="margin: 10px 0 0 0; color: #666;">Este código expira en 15 minutos</p>
                            </div>
                            
                            <div class="warning">
                                <strong>⚠️ Importante:</strong> Si no solicitaste este código, ignora este email.
                                Tu cuenta permanece segura.
                            </div>
                        </div>
                        
                        <div class="footer">
                            <p>© 2026 DEADBALL - Simulador de Béisbol</p>
                        </div>
                    </div>
                </body>
                </html>
            `
        };

        const info = await transporter.sendMail(mailOptions);
        console.log('✅ Email de recuperación enviado:', info.messageId);
        return true;
    } catch (error) {
        console.error('❌ Error al enviar email de recuperación:', error.message);
        return false;
    }
}

// ============================================
// EXPORTAR FUNCIONES
// ============================================
module.exports = {
    enviarEmailBienvenida,
    enviarEmailRecuperacion,
    transporter
};