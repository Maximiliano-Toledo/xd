/**
 * @module services/emailService
 * @description Servicio para el envío de correos electrónicos
 */

const nodemailer = require('nodemailer');
const path = require('path');
const fs = require('fs');

// Configuración del transporter (reutilizable)
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: process.env.EMAIL_PORT,
  secure: true, // true para 465, false para otros puertos
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

/**
 * Envía un correo de recuperación de contraseña
 * @param {string} to - Correo electrónico del destinatario
 * @param {string} token - Token de recuperación
 * @param {string} resetUrl - URL para restablecer la contraseña
 * @returns {Promise} - Promesa con el resultado del envío
 * @throws {Error} - Si hay un error al enviar el correo
 */
const sendPasswordResetEmail = async (to, token, resetUrl) => {
  try {
    // Leer la plantilla HTML
    const templatePath = path.join(__dirname, '../templates/mail/passwordReset.html');
    let htmlTemplate = fs.readFileSync(templatePath, 'utf8');
    
    // Reemplazar las variables en la plantilla
    htmlTemplate = htmlTemplate.replace('{{reemplazar_url}}', `${resetUrl}?token=${token}`);
    
    const mailOptions = {
      from: `"OSSACRA - Cartilla" <${process.env.EMAIL_USER}>`,
      to,
      subject: 'Restablecer tu contraseña - OSSACRA Cartilla',
      html: htmlTemplate
    };

    return await transporter.sendMail(mailOptions);
  } catch (error) {
    console.error('Error al enviar correo de recuperación:', error);
    throw new Error('Error al enviar el correo de recuperación');
  }
};

/**
 * Servicio para el envío de correos electrónicos
 * @type {Object}
 */
const EmailService = {
  sendPasswordResetEmail
};

module.exports = {
  EmailService
};