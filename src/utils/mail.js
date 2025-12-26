import Mailgen from "mailgen";
import nodemailer from "nodemailer";


/**
 * Sends an email using Nodemailer and Mailgen templates.
 *
 * - Generates both HTML and plaintext email bodies
 * - Uses SMTP credentials from environment variables
 * - Fails silently with console logging if email sending fails
 *
 * @async
 * @function sendEmail
 * @param {Object} options - Email configuration options
 * @param {string} options.email - Recipient email address
 * @param {string} options.subject - Email subject line
 * @param {Object} options.mailgenContent - Mailgen-compatible email body content
 * @returns {Promise<void>} Resolves when email is sent or fails silently
 */
const sendEmail = async (options) => {
    const mailGenerator = new Mailgen({
        theme: "default",
        product: {
            name: "Project Manager",
            link: "http:/localhost:3000",
        },
    });

    const emailTextual = mailGenerator.generatePlaintext(
        options.mailgenContent,
    );
    const emailHtml = mailGenerator.generate(options.mailgenContent);
    const transporter = nodemailer.createTransport({
        host: process.env.MAILTRAP_SMTP_HOST,
        PORT: process.env.MAILTRAP_SMTP_PORT,
        auth: {
            user: process.env.MAILTRAP_SMTP_USER,
            pass: process.env.MAILTRAP_SMTP_PASS,
        },
    });

    const mail = {
        from: "mail.taskmanager@example.com",
        to: options.email,
        subject: options.subject,
        text: emailTextual,
        html: emailHtml,
    };

    try {
        await transporter.sendMail(mail);
    } catch (error) {
        console.error(
            "Email service failed silently. Make sure that you have provided your MAILTRAP credentials in the .env file ",
        );
        console.error(error);
    }
};

/**
 * Generates Mailgen content for email verification emails.
 *
 * @function emailVerificationMailgenContent
 * @param {string} username - Recipient's username
 * @param {string} verificationUrl - Email verification URL
 * @returns {Object} Mailgen email body configuration
 */
const emailVerificationMailgenContent = (username, verificationUrl) => {
    return {
        body: {
            name: username,
            intro: "Welcome to our App! we're excited to have you on board.",
            action: {
                instructions:
                    "To verify the your email please click on the following button",
                button: {
                    color: "#22BC66",
                    text: "Verify your email",
                    link: verificationUrl,
                },
            },
            outro: "Need help, or have questions? Just reply to this email we will love to help.",
        },
    };
};

/**
 * Generates Mailgen content for forgot-password emails.
 *
 * @function forgotPasswordMailgenContent
 * @param {string} username - Recipient's username
 * @param {string} passwordResetUrl - Password reset URL
 * @returns {Object} Mailgen email body configuration
 */
const forgotPasswordMailgenContent = (username, passwordResetUrl) => {
    return {
        body: {
            name: username,
            intro: "We got a request to reset the password of your account",
            action: {
                instructions:
                    "To reset your password click on the following button or link",
                button: {
                    color: "#22BC66",
                    text: "Reset password",
                    link: passwordResetUrl,
                },
            },
            outro: "Need help, or have questions? Just reply to this email we will love to help.",
        },
    };
};

export {
    emailVerificationMailgenContent,
    forgotPasswordMailgenContent,
    sendEmail,
};
