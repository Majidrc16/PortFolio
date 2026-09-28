const express = require('express');
const path = require('path');
const cors = require('cors');
const nodemailer = require('nodemailer');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;
const HOST = process.env.HOST || '0.0.0.0';
const recipientEmail = 'majidrc16@gmail.com';
const emailConfigured = Boolean(process.env.EMAIL_USER && process.env.EMAIL_PASS);

const escapeHtml = (value) => String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');

const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465,
    secure: true,
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(express.static(path.join(__dirname, 'public')));

app.post('/api/contact', async (req, res) => {
    const { name, email, message } = req.body;

    console.log('--- New Contact Form Submission ---');
    console.log(`Name: ${name}`);
    console.log(`Email: ${email}`);
    console.log(`Message: ${message}`);
    console.log('-----------------------------------');

    if (!name || !email || !message) {
        return res.status(400).json({ success: false, message: 'Please fill in all fields.' });
    }

    try {
        if (!emailConfigured) {
            console.error('Email delivery is not configured. Add EMAIL_USER and EMAIL_PASS to .env.');
            return res.status(503).json({
                success: false,
                message: 'Email delivery is not configured yet. Please add EMAIL_USER and EMAIL_PASS to the server .env file.'
            });
        }

        const safeName = escapeHtml(name);
        const safeEmail = escapeHtml(email);
        const safeMessage = escapeHtml(message).replace(/\r?\n/g, '<br>');
        const submittedAt = new Intl.DateTimeFormat('en', {
            dateStyle: 'medium',
            timeStyle: 'short'
        }).format(new Date());

        await transporter.sendMail({
            from: `"Portfolio Contact" <${process.env.EMAIL_USER}>`,
            to: recipientEmail,
            replyTo: email,
            subject: `New portfolio inquiry from ${name}`,
            text: `Name: ${name}\nEmail: ${email}\n\nMessage:\n${message}`,
            html: `
                <!doctype html>
                <html lang="en">
                    <body style="margin:0;background:#eef2f5;color:#172033;font-family:Arial,Helvetica,sans-serif;">
                        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#eef2f5;padding:32px 16px;">
                            <tr>
                                <td align="center">
                                    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:620px;background:#ffffff;border:1px solid #dce3ea;border-radius:14px;overflow:hidden;">
                                        <tr>
                                            <td style="background:#172033;padding:28px 32px;">
                                                <p style="margin:0 0 8px;color:#60a5fa;font-size:12px;font-weight:bold;letter-spacing:2px;text-transform:uppercase;">Portfolio Contact</p>
                                                <h1 style="margin:0;color:#ffffff;font-size:26px;line-height:1.25;">New message received</h1>
                                                <p style="margin:10px 0 0;color:#b8c4d1;font-size:14px;">Someone reached out through your portfolio.</p>
                                            </td>
                                        </tr>
                                        <tr>
                                            <td style="padding:30px 32px 12px;">
                                                <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
                                                    <tr>
                                                        <td width="50%" style="padding:0 12px 20px 0;vertical-align:top;">
                                                            <p style="margin:0 0 6px;color:#64748b;font-size:11px;font-weight:bold;letter-spacing:1px;text-transform:uppercase;">From</p>
                                                            <p style="margin:0;color:#172033;font-size:17px;font-weight:bold;">${safeName}</p>
                                                        </td>
                                                        <td width="50%" style="padding:0 0 20px 12px;vertical-align:top;">
                                                            <p style="margin:0 0 6px;color:#64748b;font-size:11px;font-weight:bold;letter-spacing:1px;text-transform:uppercase;">Email</p>
                                                            <p style="margin:0;word-break:break-word;font-size:15px;"><a href="mailto:${safeEmail}" style="color:#2563eb;text-decoration:none;">${safeEmail}</a></p>
                                                        </td>
                                                    </tr>
                                                </table>
                                                <p style="margin:8px 0 8px;color:#64748b;font-size:11px;font-weight:bold;letter-spacing:1px;text-transform:uppercase;">Message</p>
                                                <div style="background:#f5f8fb;border-left:4px solid #60a5fa;border-radius:6px;padding:18px 20px;color:#334155;font-size:15px;line-height:1.7;">${safeMessage}</div>
                                                <p style="margin:18px 0 0;color:#94a3b8;font-size:12px;">Received ${submittedAt}</p>
                                            </td>
                                        </tr>
                                        <tr>
                                            <td style="padding:18px 32px 28px;">
                                                <a href="mailto:${safeEmail}?subject=Re:%20Your%20portfolio%20message" style="display:inline-block;background:#2563eb;border-radius:6px;color:#ffffff;font-size:14px;font-weight:bold;padding:12px 18px;text-decoration:none;">Reply to ${safeName}</a>
                                            </td>
                                        </tr>
                                        <tr>
                                            <td style="background:#f8fafc;border-top:1px solid #e2e8f0;padding:16px 32px;color:#94a3b8;font-size:12px;">Majid Razak &middot; Portfolio contact notification</td>
                                        </tr>
                                    </table>
                                </td>
                            </tr>
                        </table>
                    </body>
                </html>
            `
        });

        return res.status(200).json({
            success: true,
            message: 'Message received successfully! I will get back to you soon.'
        });
    } catch (error) {
        console.error('Email sending failed:', error);
        return res.status(500).json({
            success: false,
            message: 'Message was received, but email delivery failed. Please contact me directly at majidrc16@gmail.com.'
        });
    }
});

if (require.main === module) {
    app.listen(PORT, HOST, () => {
        console.log(`Server is running on http://localhost:${PORT}`);
        if (!emailConfigured) {
            console.warn('Email delivery is disabled. Copy .env.example to .env and add Gmail credentials.');
        }
    });
}

module.exports = app;
